"""Basic health endpoint tests"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test basic health endpoint"""
    response = client.get("/api/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_health_detailed():
    """Test detailed health endpoint"""
    response = client.get("/api/health/detailed")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data["data"]
    assert "demo_mode" in data["data"]["status"]
    assert "services" in data["data"]["status"]


def test_root_endpoint():
    """Test root endpoint redirects to docs"""
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"