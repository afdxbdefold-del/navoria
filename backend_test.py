#!/usr/bin/env python3
"""
Backend API Test for Admin Analytics & Bots Auth Flow
Tests the 401 authentication flow for admin analytics endpoints
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient

# Configuration
BASE_URL = "https://arzt-suche.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@navoria.de"
ADMIN_PASSWORD = "one4all1"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "navoria_db"

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")
    if details:
        print(f"   {details}")

def test_login_correct_credentials():
    """Test 1.1: Login with correct credentials returns token"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        passed = (
            response.status_code == 200 and
            response.json().get("ok") == True and
            "token" in response.json() and
            "expires_at" in response.json()
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json(), indent=2)}"
        print_test("Login with correct credentials", passed, details)
        
        return response.json().get("token") if passed else None
    except Exception as e:
        print_test("Login with correct credentials", False, f"Exception: {str(e)}")
        return None

def test_login_incorrect_credentials():
    """Test 1.2: Login with incorrect credentials returns 401"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": "wrong_password"},
            timeout=10
        )
        
        passed = (
            response.status_code == 401 and
            "error" in response.json()
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json())}"
        print_test("Login with incorrect credentials returns 401", passed, details)
        
        return passed
    except Exception as e:
        print_test("Login with incorrect credentials returns 401", False, f"Exception: {str(e)}")
        return False

def test_analytics_live_no_auth():
    """Test 2.1: GET /api/admin/analytics/live without auth returns 401"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/analytics/live",
            timeout=10
        )
        
        passed = (
            response.status_code == 401 and
            response.json().get("error") == "Nicht autorisiert"
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json())}"
        print_test("Analytics/live without Authorization header returns 401", passed, details)
        
        return passed
    except Exception as e:
        print_test("Analytics/live without Authorization header returns 401", False, f"Exception: {str(e)}")
        return False

def test_analytics_live_invalid_token():
    """Test 2.2: GET /api/admin/analytics/live with invalid token returns 401"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/analytics/live",
            headers={"Authorization": "Bearer invalid-token-xxx"},
            timeout=10
        )
        
        passed = (
            response.status_code == 401 and
            response.json().get("error") == "Nicht autorisiert"
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json())}"
        print_test("Analytics/live with invalid token returns 401", passed, details)
        
        return passed
    except Exception as e:
        print_test("Analytics/live with invalid token returns 401", False, f"Exception: {str(e)}")
        return False

def test_analytics_live_valid_token(token):
    """Test 2.3: GET /api/admin/analytics/live with valid token returns 200"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/analytics/live",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        passed = (
            response.status_code == 200 and
            "active_sessions" in response.json() and
            "window_minutes" in response.json() and
            "users" in response.json()
        )
        
        details = f"Status: {response.status_code}, Keys: {list(response.json().keys())}"
        print_test("Analytics/live with valid token returns 200", passed, details)
        
        return passed
    except Exception as e:
        print_test("Analytics/live with valid token returns 200", False, f"Exception: {str(e)}")
        return False

def test_analytics_summary_ranges(token):
    """Test 2.4: GET /api/admin/analytics/summary with different ranges"""
    ranges = ["today", "yesterday", "7d", "30d"]
    all_passed = True
    
    for range_val in ranges:
        try:
            response = requests.get(
                f"{BASE_URL}/admin/analytics/summary?range={range_val}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            
            # The endpoint returns different data structures, but always includes 'generated_at'
            passed = (
                response.status_code == 200 and
                "generated_at" in response.json()
            )
            
            details = f"Status: {response.status_code}, Range: {range_val}, Keys: {list(response.json().keys())[:5]}"
            print_test(f"Analytics/summary with range={range_val}", passed, details)
            
            if not passed:
                all_passed = False
        except Exception as e:
            print_test(f"Analytics/summary with range={range_val}", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_bots_no_auth():
    """Test 3.1: GET /api/admin/bots without auth returns 401"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/bots",
            timeout=10
        )
        
        passed = (
            response.status_code == 401 and
            response.json().get("error") == "Nicht autorisiert"
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json())}"
        print_test("Bots endpoint without Authorization header returns 401", passed, details)
        
        return passed
    except Exception as e:
        print_test("Bots endpoint without Authorization header returns 401", False, f"Exception: {str(e)}")
        return False

def test_bots_invalid_token():
    """Test 3.2: GET /api/admin/bots with invalid token returns 401"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/bots",
            headers={"Authorization": "Bearer invalid-token-xxx"},
            timeout=10
        )
        
        passed = (
            response.status_code == 401 and
            response.json().get("error") == "Nicht autorisiert"
        )
        
        details = f"Status: {response.status_code}, Response: {json.dumps(response.json())}"
        print_test("Bots endpoint with invalid token returns 401", passed, details)
        
        return passed
    except Exception as e:
        print_test("Bots endpoint with invalid token returns 401", False, f"Exception: {str(e)}")
        return False

def test_bots_valid_token_ranges(token):
    """Test 3.3: GET /api/admin/bots with valid token and different ranges"""
    ranges = ["today", "7d", "30d"]
    all_passed = True
    
    for range_val in ranges:
        try:
            response = requests.get(
                f"{BASE_URL}/admin/bots?range={range_val}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            
            passed = (
                response.status_code == 200 and
                "range" in response.json() and
                "totals" in response.json() and
                "bots" in response.json() and
                "hourly_all" in response.json()
            )
            
            details = f"Status: {response.status_code}, Range: {range_val}, Keys: {list(response.json().keys())}"
            print_test(f"Bots endpoint with range={range_val}", passed, details)
            
            if not passed:
                all_passed = False
        except Exception as e:
            print_test(f"Bots endpoint with range={range_val}", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_expired_token():
    """Test 4: Expired token returns 401"""
    try:
        # Connect to MongoDB and create an expired session
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        sessions_col = db["admin_sessions"]
        
        # Create a token that expired 1 hour ago
        expired_token = "test-expired-token-12345678.abcdefgh"
        expired_at = datetime.utcnow() - timedelta(hours=1)
        
        # Insert expired session
        sessions_col.insert_one({
            "token": expired_token,
            "created_at": datetime.utcnow() - timedelta(hours=13),
            "expires_at": expired_at
        })
        
        print(f"   Created expired session: token={expired_token}, expires_at={expired_at}")
        
        # Test analytics/live with expired token
        response_live = requests.get(
            f"{BASE_URL}/admin/analytics/live",
            headers={"Authorization": f"Bearer {expired_token}"},
            timeout=10
        )
        
        passed_live = (
            response_live.status_code == 401 and
            response_live.json().get("error") == "Nicht autorisiert"
        )
        
        print_test("Analytics/live with expired token returns 401", passed_live, 
                   f"Status: {response_live.status_code}, Response: {json.dumps(response_live.json())}")
        
        # Test bots with expired token
        response_bots = requests.get(
            f"{BASE_URL}/admin/bots",
            headers={"Authorization": f"Bearer {expired_token}"},
            timeout=10
        )
        
        passed_bots = (
            response_bots.status_code == 401 and
            response_bots.json().get("error") == "Nicht autorisiert"
        )
        
        print_test("Bots endpoint with expired token returns 401", passed_bots,
                   f"Status: {response_bots.status_code}, Response: {json.dumps(response_bots.json())}")
        
        # Cleanup: remove test session
        sessions_col.delete_one({"token": expired_token})
        print(f"   Cleaned up expired session")
        
        client.close()
        
        return passed_live and passed_bots
        
    except Exception as e:
        print_test("Expired token test", False, f"Exception: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("Backend API Test: Admin Analytics & Bots Auth Flow (401 Verification)")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Credentials: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print("=" * 80)
    print()
    
    results = []
    
    # Test 1: Login Endpoint
    print("TEST 1 — Login Endpoint")
    print("-" * 80)
    token = test_login_correct_credentials()
    results.append(token is not None)
    results.append(test_login_incorrect_credentials())
    print()
    
    if not token:
        print("❌ CRITICAL: Cannot proceed without valid token. Login failed.")
        sys.exit(1)
    
    # Test 2: Analytics Endpoints Auth Guards
    print("TEST 2 — Analytics Endpoints Auth Guards")
    print("-" * 80)
    results.append(test_analytics_live_no_auth())
    results.append(test_analytics_live_invalid_token())
    results.append(test_analytics_live_valid_token(token))
    results.append(test_analytics_summary_ranges(token))
    print()
    
    # Test 3: Bots Endpoint Auth Guards
    print("TEST 3 — Bots Endpoint Auth Guards")
    print("-" * 80)
    results.append(test_bots_no_auth())
    results.append(test_bots_invalid_token())
    results.append(test_bots_valid_token_ranges(token))
    print()
    
    # Test 4: Expired Token
    print("TEST 4 — Expired Token Returns 401")
    print("-" * 80)
    results.append(test_expired_token())
    print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    passed_count = sum(results)
    total_count = len(results)
    print(f"Tests Passed: {passed_count}/{total_count}")
    
    if passed_count == total_count:
        print("✅ ALL TESTS PASSED - 401 Auth flow is working correctly")
        sys.exit(0)
    else:
        print(f"❌ {total_count - passed_count} TEST(S) FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
