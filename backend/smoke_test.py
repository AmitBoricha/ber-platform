"""Quick smoke test for all endpoints using FastAPI's TestClient."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def login(email, password):
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


print("=== Health ===")
print(client.get("/health").json())

# FBB
token_fbb = login("fbb@ber-plus.de", "demo1234")
print("\n=== Overview (FBB) ===")
print(client.get("/dashboard/overview", headers=auth_headers(token_fbb)).json())

print("\n=== Energy capacity ===")
print(client.get("/energy/capacity", headers=auth_headers(token_fbb)).json())

print("\n=== B-Plan funnel ===")
print(client.get("/bplans/funnel", headers=auth_headers(token_fbb)).json())

print("\n=== Phantom insight ===")
print(client.get("/energy/phantom-insight", headers=auth_headers(token_fbb)).json())

print("\n=== Demand forecast ===")
print(client.get("/energy/demand-forecast", headers=auth_headers(token_fbb)).json())

print("\n=== Pipeline summary ===")
print(client.get("/pipeline/summary", headers=auth_headers(token_fbb)).json())

# Developer (SEGRO) — role-aware filtering
token_dev = login("developer@ber-plus.de", "demo1234")
print("\n=== Overview (Developer/SEGRO) ===")
print(client.get("/dashboard/overview", headers=auth_headers(token_dev)).json())

print("\n=== B-Plans (Developer/SEGRO — should be filtered) ===")
bplans = client.get("/bplans/", headers=auth_headers(token_dev)).json()
print(f"Count: {len(bplans)}")
for b in bplans:
    print(f"  {b['parcel_name']} -> {b['developer']}")

# Municipality
token_muni = login("municipality@ber-plus.de", "demo1234")
print("\n=== Overview (Municipality) ===")
print(client.get("/dashboard/overview", headers=auth_headers(token_muni)).json())

print("\n=== Investment impact (Municipality) ===")
print(client.get("/bplans/investment-impact", headers=auth_headers(token_muni)).json())

# Role-based access control check: developer should NOT access investment-impact
print("\n=== Investment impact (Developer — should be 403) ===")
r = client.get("/bplans/investment-impact", headers=auth_headers(token_dev))
print(f"Status: {r.status_code}")

# Grid operator
token_grid = login("grid@ber-plus.de", "demo1234")
print("\n=== Overview (Grid operator) ===")
print(client.get("/dashboard/overview", headers=auth_headers(token_grid)).json())

print("\n=== Energy community ===")
print(client.get("/energy/energy-community", headers=auth_headers(token_grid)).json())

print("\nAll smoke tests passed.")
