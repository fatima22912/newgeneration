from tests.conftest import auth_headers


def test_owner_login_success(client, owner_user):
    response = client.post(
        "/api/v1/auth/owner/login",
        json={"email": owner_user.email, "password": "SuperSecret123!"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["role"] == "owner"
    assert "access_token" in body


def test_owner_login_wrong_password(client, owner_user):
    response = client.post(
        "/api/v1/auth/owner/login",
        json={"email": owner_user.email, "password": "wrong-password"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_account_locks_after_too_many_failed_attempts(client, owner_user):
    for _ in range(5):
        client.post(
            "/api/v1/auth/owner/login",
            json={"email": owner_user.email, "password": "wrong-password"},
        )

    response = client.post(
        "/api/v1/auth/owner/login",
        json={"email": owner_user.email, "password": "SuperSecret123!"},
    )
    assert response.status_code == 423
    assert response.json()["error"]["code"] == "account_locked"


def test_admin_cannot_login_via_owner_endpoint(client, admin_user):
    response = client.post(
        "/api/v1/auth/owner/login",
        json={"email": admin_user.email, "password": "SuperSecret123!"},
    )
    assert response.status_code == 401


def test_protected_route_requires_token(client):
    response = client.get("/api/v1/accounts/owners")
    assert response.status_code == 401


def test_change_password(client, owner_user):
    headers = auth_headers(client, owner_user.email, "SuperSecret123!", "owner")
    response = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "SuperSecret123!", "new_password": "AnotherSecret456!"},
        headers=headers,
    )
    assert response.status_code == 200

    relogin = client.post(
        "/api/v1/auth/owner/login",
        json={"email": owner_user.email, "password": "AnotherSecret456!"},
    )
    assert relogin.status_code == 200
