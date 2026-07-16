from tests.conftest import auth_headers


def _create_product_with_stock(client, headers, category_id, stock=5):
    payload = {
        "category_id": category_id,
        "name": "Maillot Domicile",
        "base_price": "15000.00",
        "is_active": True,
        "variants": [{"size": "M", "color": "Blanc", "stock_quantity": stock}],
    }
    response = client.post("/api/v1/products", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()["data"]


def _order_payload(variant_id, quantity=2):
    return {
        "customer_name": "Fatou Diop",
        "customer_phone": "770000000",
        "customer_address": "Sandaga, Dakar",
        "payment_method": "wave",
        "items": [{"product_variant_id": variant_id, "quantity": quantity}],
    }


def test_create_order_decrements_stock(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    product = _create_product_with_stock(client, headers, category.id, stock=5)
    variant_id = product["variants"][0]["id"]

    response = client.post("/api/v1/orders", json=_order_payload(variant_id, quantity=2))
    assert response.status_code == 201, response.text
    body = response.json()["data"]
    assert body["order_number"].startswith("NG-")
    assert body["total_amount"] == "30000.00"

    updated_product = client.get(f"/api/v1/products/{product['id']}", headers=headers).json()["data"]
    assert updated_product["variants"][0]["stock_quantity"] == 3


def test_create_order_fails_on_insufficient_stock(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    product = _create_product_with_stock(client, headers, category.id, stock=1)
    variant_id = product["variants"][0]["id"]

    response = client.post("/api/v1/orders", json=_order_payload(variant_id, quantity=5))
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "insufficient_stock"


def test_track_order_requires_matching_phone(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    product = _create_product_with_stock(client, headers, category.id, stock=5)
    variant_id = product["variants"][0]["id"]

    create_response = client.post("/api/v1/orders", json=_order_payload(variant_id))
    order_number = create_response.json()["data"]["order_number"]

    ok = client.get(
        "/api/v1/orders/track", params={"order_number": order_number, "phone": "770000000"}
    )
    assert ok.status_code == 200

    wrong_phone = client.get(
        "/api/v1/orders/track", params={"order_number": order_number, "phone": "999999999"}
    )
    assert wrong_phone.status_code == 404


def test_order_status_transition_flow(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    product = _create_product_with_stock(client, headers, category.id, stock=5)
    variant_id = product["variants"][0]["id"]

    order_id = client.post("/api/v1/orders", json=_order_payload(variant_id)).json()["data"]["id"]

    to_processing = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "processing"}, headers=headers
    )
    assert to_processing.status_code == 200

    invalid_jump = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "delivered"}, headers=headers
    )
    assert invalid_jump.status_code == 409
