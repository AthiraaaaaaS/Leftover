"""API integration tests."""
import pytest


@pytest.mark.asyncio
async def test_root(client):
    """GET / returns health info."""
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "LeftoverLink" in data["message"]
    assert "docs" in data


@pytest.mark.asyncio
async def test_list_donations(client):
    """GET /donations returns seeded donations."""
    r = await client.get("/donations")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    d = data[0]
    assert "id" in d
    assert "donorName" in d
    assert "status" in d
    assert "category" in d
    assert "pickupLocation" in d


@pytest.mark.asyncio
async def test_get_donation(client):
    """GET /donations/{id} returns a single donation."""
    r = await client.get("/donations")
    assert r.status_code == 200
    donations = r.json()
    assert len(donations) > 0
    donation_id = donations[0]["id"]

    r2 = await client.get(f"/donations/{donation_id}")
    assert r2.status_code == 200
    d = r2.json()
    assert d["id"] == donation_id
    assert "donorName" in d
    assert "items" in d


@pytest.mark.asyncio
async def test_register_and_login_volunteer(client):
    """Register volunteer, login, get /auth/me."""
    # Register
    r = await client.post(
        "/auth/register/volunteer",
        json={
            "username": "testvol",
            "password": "test1234",
            "fullName": "Test Volunteer",
            "phone": "+44 123 456",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert "user" in data
    user = data["user"]
    assert user["role"] == "VOLUNTEER"
    assert user["username"] == "testvol"
    assert "volunteer" in user
    token = data["token"]

    # Login
    r2 = await client.post(
        "/auth/login",
        json={"username": "testvol", "password": "test1234"},
    )
    assert r2.status_code == 200
    data2 = r2.json()
    assert "token" in data2
    assert "user" in data2

    # Me (with token)
    r3 = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r3.status_code == 200
    me = r3.json()
    assert me["username"] == "testvol"
    assert me["role"] == "VOLUNTEER"


@pytest.mark.asyncio
async def test_register_donor(client):
    """Register donor with required fields."""
    r = await client.post(
        "/auth/register/donor",
        json={
            "username": "testdonor",
            "password": "donor1234",
            "fullName": "Test Donor",
            "phone": "+44 987 654",
            "aadhaarConsent": True,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["role"] == "DONOR"
    assert data["user"]["username"] == "testdonor"


@pytest.mark.asyncio
async def test_login_invalid(client):
    """Login with wrong password returns 401."""
    r = await client.post(
        "/auth/login",
        json={"username": "nonexistent", "password": "wrong"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_create_donation(client):
    """POST /donations creates a donation."""
    r = await client.post(
        "/donations",
        json={
            "donorName": "Demo Donor",
            "donorPhoneMasked": "+44 *** *** 111",
            "pickupBy": "2026-03-01T14:00:00Z",
            "category": "Cooked Meals",
            "servingsEstimate": 20,
            "items": [{"name": "Biryani", "quantity": 10, "unit": "plates"}],
            "pickupLocation": {
                "label": "Test",
                "address": "1 Test St",
                "lat": 52.6,
                "lng": 1.3,
            },
        },
    )
    assert r.status_code == 200
    d = r.json()
    assert "id" in d
    assert d["donorName"] == "Demo Donor"
    assert d["status"] == "PENDING"
    assert d["category"] == "Cooked Meals"
    assert len(d["items"]) == 1
    assert d["items"][0]["name"] == "Biryani"


@pytest.mark.asyncio
async def test_accept_pickup(client):
    """Accept pickup creates task and updates donation status."""
    # Create donation
    r1 = await client.post(
        "/donations",
        json={
            "donorName": "Demo Donor",
            "donorPhoneMasked": "+44 *** *** 111",
            "pickupBy": "2026-03-01T14:00:00Z",
            "category": "Cooked Meals",
            "servingsEstimate": 20,
            "items": [{"name": "Biryani", "quantity": 10, "unit": "plates"}],
            "pickupLocation": {
                "label": "Test",
                "address": "1 Test St",
                "lat": 52.6,
                "lng": 1.3,
            },
        },
    )
    assert r1.status_code == 200
    donation_id = r1.json()["id"]

    # Accept pickup
    r2 = await client.post(
        f"/donations/{donation_id}/accept",
        json={
            "id": "V-TEST",
            "name": "Test Volunteer",
            "phoneMasked": "+44 *** *** 789",
        },
    )
    assert r2.status_code == 200
    data = r2.json()
    assert "donation" in data
    assert "task" in data
    assert data["donation"]["status"] == "ASSIGNED"
    assert data["donation"]["assignedVolunteer"]["id"] == "V-TEST"
    assert data["task"]["step"] == "READY"
    assert data["task"]["volunteerId"] == "V-TEST"


@pytest.mark.asyncio
async def test_list_tasks(client):
    """GET /tasks?volunteer_id=X returns tasks."""
    # Accept a pickup first
    r1 = await client.get("/donations")
    donations = [d for d in r1.json() if d["status"] == "PENDING"]
    if not donations:
        pytest.skip("No PENDING donations to accept")

    donation_id = donations[0]["id"]
    r2 = await client.post(
        f"/donations/{donation_id}/accept",
        json={
            "id": "V-TASKTEST",
            "name": "Task Test Volunteer",
            "phoneMasked": "+44 *** *** 999",
        },
    )
    assert r2.status_code == 200
    task = r2.json()["task"]

    r3 = await client.get("/tasks", params={"volunteer_id": "V-TASKTEST"})
    assert r3.status_code == 200
    tasks = r3.json()
    assert isinstance(tasks, list)
    assert any(t["id"] == task["id"] for t in tasks)


@pytest.mark.asyncio
async def test_advance_task(client):
    """PATCH /tasks/{id}/advance advances step."""
    # Accept pickup to create task
    r1 = await client.get("/donations")
    donations = [d for d in r1.json() if d["status"] == "PENDING"]
    if not donations:
        pytest.skip("No PENDING donations")

    r2 = await client.post(
        f"/donations/{donations[0]['id']}/accept",
        json={
            "id": "V-ADV",
            "name": "Advance Volunteer",
            "phoneMasked": "+44 *** *** 111",
        },
    )
    assert r2.status_code == 200
    task_id = r2.json()["task"]["id"]

    r3 = await client.patch(f"/tasks/{task_id}/advance")
    assert r3.status_code == 200
    t = r3.json()
    assert t["step"] == "STARTED"


@pytest.mark.asyncio
async def test_save_checklist(client):
    """PATCH /tasks/{id}/checklist updates checklist."""
    r1 = await client.get("/donations")
    donations = [d for d in r1.json() if d["status"] == "PENDING"]
    if not donations:
        pytest.skip("No PENDING donations")

    r2 = await client.post(
        f"/donations/{donations[0]['id']}/accept",
        json={
            "id": "V-CHK",
            "name": "Checklist Volunteer",
            "phoneMasked": "+44 *** *** 222",
        },
    )
    task_id = r2.json()["task"]["id"]

    r3 = await client.patch(
        f"/tasks/{task_id}/checklist",
        json={"sealed": True, "labelled": True},
    )
    assert r3.status_code == 200
    t = r3.json()
    assert t["checklist"]["sealed"] is True
    assert t["checklist"]["labelled"] is True


@pytest.mark.asyncio
async def test_demo_reset(client):
    """POST /demo/reset resets donations."""
    r = await client.post("/demo/reset")
    assert r.status_code == 200
    assert r.json().get("ok") is True

    r2 = await client.get("/donations")
    assert r2.status_code == 200
    # After reset, we should have seed data (3 donations)
    assert len(r2.json()) >= 1
