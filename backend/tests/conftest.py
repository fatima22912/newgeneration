import os

os.environ["RATE_LIMITING_ENABLED"] = "false"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.category import Category
from app.models.user import User, UserRole

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def _setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    from fastapi.testclient import TestClient

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    admin = User(
        role=UserRole.admin,
        full_name="Admin Test",
        email="admin@example.com",
        password_hash=hash_password("SuperSecret123!"),
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def owner_user(db_session, admin_user):
    owner = User(
        role=UserRole.owner,
        full_name="Owner Test",
        email="owner@example.com",
        password_hash=hash_password("SuperSecret123!"),
        is_active=True,
        created_by=admin_user.id,
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    return owner


@pytest.fixture
def category(db_session):
    cat = Category(name="T-shirts", slug="t-shirts", description="Catégorie de test")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)
    return cat


def auth_headers(client, email: str, password: str, role: str) -> dict:
    response = client.post(f"/api/v1/auth/{role}/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
