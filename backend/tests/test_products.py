from tests.conftest import auth_headers


def _create_product(client, headers, category_id, **overrides):
    payload = {
        "category_id": category_id,
        "name": "T-shirt Classic",
        "description": "Un t-shirt de base",
        "base_price": "9500.00",
        "is_active": True,
        "variants": [
            {"size": "M", "color": "Noir", "stock_quantity": 10},
            {"size": "L", "color": "Noir", "stock_quantity": 3},
        ],
    }
    payload.update(overrides)
    return client.post("/api/v1/products", json=payload, headers=headers)


def test_public_can_list_and_view_products(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    create_response = _create_product(client, headers, category.id)
    assert create_response.status_code == 201, create_response.text
    product_id = create_response.json()["data"]["id"]

    list_response = client.get("/api/v1/products")
    assert list_response.status_code == 200
    assert list_response.json()["meta"]["total"] == 1

    detail_response = client.get(f"/api/v1/products/{product_id}")
    assert detail_response.status_code == 200
    assert len(detail_response.json()["data"]["variants"]) == 2


def test_product_detail_accessible_by_slug(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    create_response = _create_product(client, headers, category.id)
    slug = create_response.json()["data"]["slug"]

    response = client.get(f"/api/v1/products/{slug}")
    assert response.status_code == 200
    assert response.json()["data"]["slug"] == slug


def test_visitor_cannot_create_product(client, category):
    response = _create_product(client, {}, category.id)
    assert response.status_code == 401


def test_product_filters_by_price_range(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    _create_product(client, headers, category.id, name="Bonnet Cheap", base_price="2000.00")
    _create_product(client, headers, category.id, name="Pull Expensive", base_price="25000.00")

    response = client.get("/api/v1/products", params={"min_price": 10000})
    assert response.status_code == 200
    names = [p["name"] for p in response.json()["data"]]
    assert names == ["Pull Expensive"]


def test_inactive_product_hidden_from_public_listing(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    create_response = _create_product(client, headers, category.id, is_active=False)
    product_id = create_response.json()["data"]["id"]

    public_detail = client.get(f"/api/v1/products/{product_id}")
    assert public_detail.status_code == 404

    owner_detail = client.get(f"/api/v1/products/{product_id}", headers=headers)
    assert owner_detail.status_code == 200


def test_deleting_product_without_orders_removes_it(client, owner_user, category):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    create_response = _create_product(client, headers, category.id)
    product_id = create_response.json()["data"]["id"]

    delete_response = client.delete(f"/api/v1/products/{product_id}", headers=headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/products/{product_id}", headers=headers)
    assert get_response.status_code == 404
