#!/usr/bin/env python3
"""
Check for MongoDB _id fields in responses
"""

import requests
import json

BASE_URL = "https://a041470a-db26-4142-b08e-bb68e52ca95a.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@navoria.de"
ADMIN_PASSWORD = "navoria2025"

def check_for_id(data, path="root"):
    """Recursively check for _id fields"""
    issues = []
    if isinstance(data, dict):
        if "_id" in data:
            issues.append(f"Found _id at {path}")
        for key, value in data.items():
            issues.extend(check_for_id(value, f"{path}.{key}"))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            issues.extend(check_for_id(item, f"{path}[{i}]"))
    return issues

print("="*80)
print("CHECKING FOR MONGODB _id FIELDS")
print("="*80)

# Get token
response = requests.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
token = response.json().get("token")

# Test endpoints
endpoints = [
    ("GET", "/search?q=Zahnarzt&ort=Hamburg", None),
    ("GET", "/doctor/alldent-zahnzentrum-hamburg-wUrT3o", None),
    ("GET", "/admin/stats", token),
    ("GET", "/admin/jobs", token),
    ("GET", "/admin/logs", token),
]

all_clean = True

for method, path, auth_token in endpoints:
    print(f"\nChecking {method} {path}")
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    response = requests.get(f"{BASE_URL}{path}", headers=headers)
    data = response.json()
    
    issues = check_for_id(data)
    
    if issues:
        print(f"  ❌ FOUND _id FIELDS:")
        for issue in issues:
            print(f"     - {issue}")
        all_clean = False
    else:
        print(f"  ✅ Clean (no _id fields)")

print("\n" + "="*80)
if all_clean:
    print("✅ ALL RESPONSES ARE CLEAN - NO MONGODB _id FIELDS")
else:
    print("❌ SOME RESPONSES CONTAIN MONGODB _id FIELDS")
print("="*80)
