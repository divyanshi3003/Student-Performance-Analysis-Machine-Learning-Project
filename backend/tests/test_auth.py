def test_signup(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "test@student.com", "password": "password123", "role": "student"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@student.com"
    assert "id" in data

def test_login(client):
    # First sign up
    client.post(
        "/api/v1/auth/signup",
        json={"email": "test@teacher.com", "password": "password123", "role": "teacher"}
    )
    
    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@teacher.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "teacher"

def test_read_users_me(client):
    # First sign up and login
    client.post(
        "/api/v1/auth/signup",
        json={"email": "test2@student.com", "password": "password123", "role": "student"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "test2@student.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test2@student.com"
    assert data["role"] == "student"
