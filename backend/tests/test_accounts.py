from tests.conftest import auth_headers


def test_admin_creates_owner_account(client, admin_user):
    headers = auth_headers(client, admin_user.email, "SuperSecret123!", "admin")
    response = client.post(
        "/api/v1/accounts/owners",
        json={"full_name": "Nouveau Propriétaire", "email": "new-owner@example.com", "phone": "770000000"},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["owner"]["role"] == "owner"
    assert len(body["temporary_password"]) >= 12

    login = client.post(
        "/api/v1/auth/owner/login",
        json={"email": "new-owner@example.com", "password": body["temporary_password"]},
    )
    assert login.status_code == 200


def test_owner_cannot_create_owner_accounts(client, owner_user):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    response = client.post(
        "/api/v1/accounts/owners",
        json={"full_name": "Autre", "email": "autre@example.com"},
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"


def test_disable_and_enable_owner_account(client, admin_user, owner_user):
    headers = auth_headers(client, admin_user.email, "SuperSecret123!", "admin")

    disable_response = client.patch(
        f"/api/v1/accounts/owners/{owner_user.id}/disable", headers=headers
    )
    assert disable_response.status_code == 200
    assert disable_response.json()["data"]["is_active"] is False

    blocked_login = client.post(
        "/api/v1/auth/owner/login",
        json={"email": owner_user.email, "password": "SuperSecret123!"},
    )
    assert blocked_login.status_code == 401

    enable_response = client.patch(f"/api/v1/accounts/owners/{owner_user.id}/enable", headers=headers)
    assert enable_response.status_code == 200
    assert enable_response.json()["data"]["is_active"] is True


def test_reset_owner_password(client, admin_user, owner_user):
    headers = auth_headers(client, admin_user.email, "SuperSecret123!", "admin")
    response = client.patch(
        f"/api/v1/accounts/owners/{owner_user.id}/reset-password", headers=headers
    )
    assert response.status_code == 200
    new_password = response.json()["temporary_password"]

    login = client.post(
        "/api/v1/auth/owner/login", json={"email": owner_user.email, "password": new_password}
    )
    assert login.status_code == 200


def test_list_owners_paginated(client, admin_user, owner_user):
    headers = auth_headers(client, admin_user.email, "SuperSecret123!", "admin")
    response = client.get("/api/v1/accounts/owners", headers=headers)
    assert response.status_code == 200
    assert response.json()["meta"]["total"] == 1
