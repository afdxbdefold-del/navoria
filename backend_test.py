#!/usr/bin/env python3
"""
Navoria.de Backend API Test Suite
Tests all backend endpoints with proper authentication and validation
"""

import requests
import json
import time
import sys
import os
from typing import Dict, Any, Optional

# Configuration from .env
BASE_URL = os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000') + '/api'
ADMIN_EMAIL = "admin@navoria.de"
ADMIN_PASSWORD = "one4all1"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_pass(test_name: str, details: str = ""):
    """Log a passed test"""
    msg = f"✅ PASS: {test_name}"
    if details:
        msg += f" - {details}"
    print(msg)
    test_results["passed"].append(test_name)

def log_fail(test_name: str, details: str):
    """Log a failed test"""
    msg = f"❌ FAIL: {test_name} - {details}"
    print(msg)
    test_results["failed"].append(f"{test_name}: {details}")

def log_warning(test_name: str, details: str):
    """Log a warning"""
    msg = f"⚠️  WARNING: {test_name} - {details}"
    print(msg)
    test_results["warnings"].append(f"{test_name}: {details}")

def check_no_mongodb_id(data: Any, path: str = "root") -> bool:
    """Recursively check for MongoDB _id fields"""
    if isinstance(data, dict):
        if "_id" in data:
            return False
        for key, value in data.items():
            if not check_no_mongodb_id(value, f"{path}.{key}"):
                return False
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if not check_no_mongodb_id(item, f"{path}[{i}]"):
                return False
    return True

def test_health_check():
    """Test 1: GET /api - Health Check"""
    print("\n" + "="*80)
    print("TEST 1: Health Check (GET /api)")
    print("="*80)
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        
        if response.status_code != 200:
            log_fail("Health Check", f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        
        if data.get("ok") == True and data.get("service") == "Navoria API":
            log_pass("Health Check", f"Response: {data}")
        else:
            log_fail("Health Check", f"Unexpected response: {data}")
            
    except Exception as e:
        log_fail("Health Check", f"Exception: {str(e)}")

def test_admin_login():
    """Test 2: POST /api/admin/login"""
    print("\n" + "="*80)
    print("TEST 2: Admin Login (POST /api/admin/login)")
    print("="*80)
    
    # Test 2a: Correct credentials
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if response.status_code != 200:
            log_fail("Admin Login (correct creds)", f"Expected 200, got {response.status_code}")
            return None
        
        data = response.json()
        
        if "token" in data and data.get("ok") == True:
            token = data["token"]
            log_pass("Admin Login (correct creds)", f"Token received: {token[:20]}...")
        else:
            log_fail("Admin Login (correct creds)", f"No token in response: {data}")
            return None
            
    except Exception as e:
        log_fail("Admin Login (correct creds)", f"Exception: {str(e)}")
        return None
    
    # Test 2b: Incorrect credentials
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": "wrong@email.com", "password": "wrongpass"},
            timeout=10
        )
        
        if response.status_code == 401:
            data = response.json()
            if "Falsche Zugangsdaten" in data.get("error", ""):
                log_pass("Admin Login (wrong creds)", "Correctly rejected with 401")
            else:
                log_fail("Admin Login (wrong creds)", f"Wrong error message: {data}")
        else:
            log_fail("Admin Login (wrong creds)", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        log_fail("Admin Login (wrong creds)", f"Exception: {str(e)}")
    
    return token

def test_admin_stats(token: Optional[str]):
    """Test 3: GET /api/admin/stats"""
    print("\n" + "="*80)
    print("TEST 3: Admin Stats (GET /api/admin/stats)")
    print("="*80)
    
    # Test 3a: Without Authorization
    try:
        response = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
        
        if response.status_code == 401:
            log_pass("Admin Stats (no auth)", "Correctly rejected with 401")
        else:
            log_fail("Admin Stats (no auth)", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        log_fail("Admin Stats (no auth)", f"Exception: {str(e)}")
    
    # Test 3b: With wrong token
    try:
        response = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": "Bearer invalid-token-12345"},
            timeout=10
        )
        
        if response.status_code == 401:
            log_pass("Admin Stats (wrong token)", "Correctly rejected with 401")
        else:
            log_fail("Admin Stats (wrong token)", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        log_fail("Admin Stats (wrong token)", f"Exception: {str(e)}")
    
    # Test 3c: With valid token
    if not token:
        log_fail("Admin Stats (valid token)", "No valid token available")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_fail("Admin Stats (valid token)", f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        
        required_fields = ["doctor_count", "city_count", "job_count", "last_job"]
        missing = [f for f in required_fields if f not in data]
        
        if missing:
            log_fail("Admin Stats (valid token)", f"Missing fields: {missing}")
        else:
            log_pass("Admin Stats (valid token)", 
                    f"doctor_count={data['doctor_count']}, city_count={data['city_count']}, job_count={data['job_count']}")
            
            # Check for MongoDB _id
            if not check_no_mongodb_id(data):
                log_fail("Admin Stats (valid token)", "Response contains MongoDB _id field")
            
    except Exception as e:
        log_fail("Admin Stats (valid token)", f"Exception: {str(e)}")

def test_admin_sync(token: Optional[str]):
    """Test 4: POST /api/admin/sync"""
    print("\n" + "="*80)
    print("TEST 4: Admin Sync (POST /api/admin/sync)")
    print("="*80)
    
    if not token:
        log_fail("Admin Sync", "No valid token available")
        return
    
    # Test sync with Hamburg Zahnarzt
    try:
        print("Starting sync for Hamburg Zahnarzt (this may take up to 30 seconds)...")
        
        response = requests.post(
            f"{BASE_URL}/admin/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "city": "Hamburg",
                "query": "Zahnarzt",
                "placeType": "dentist",
                "maxResults": 5
            },
            timeout=60
        )
        
        if response.status_code != 200:
            log_fail("Admin Sync (Hamburg)", f"Expected 200, got {response.status_code}: {response.text}")
            return
        
        data = response.json()
        
        if not data.get("ok"):
            log_fail("Admin Sync (Hamburg)", f"Response not ok: {data}")
            return
        
        job = data.get("job", {})
        
        if job.get("status") != "succeeded":
            log_fail("Admin Sync (Hamburg)", f"Job status is {job.get('status')}, expected 'succeeded'")
            return
        
        found = job.get("found", 0)
        inserted = job.get("inserted", 0)
        
        if found >= 1 and inserted >= 1:
            log_pass("Admin Sync (Hamburg)", 
                    f"Job succeeded: found={found}, inserted={inserted}, updated={job.get('updated', 0)}")
        else:
            log_fail("Admin Sync (Hamburg)", 
                    f"Expected found>=1 and inserted>=1, got found={found}, inserted={inserted}")
        
        # Check for MongoDB _id
        if not check_no_mongodb_id(data):
            log_fail("Admin Sync (Hamburg)", "Response contains MongoDB _id field")
        
        # Test second sync (should show deduplication)
        print("\nTesting deduplication with second sync...")
        time.sleep(2)
        
        response2 = requests.post(
            f"{BASE_URL}/admin/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "city": "Hamburg",
                "query": "Zahnarzt",
                "placeType": "dentist",
                "maxResults": 5
            },
            timeout=60
        )
        
        if response2.status_code == 200:
            data2 = response2.json()
            job2 = data2.get("job", {})
            updated = job2.get("updated", 0)
            inserted2 = job2.get("inserted", 0)
            
            if updated >= 1 or inserted2 == 0:
                log_pass("Admin Sync (deduplication)", 
                        f"Deduplication working: updated={updated}, inserted={inserted2}")
            else:
                log_warning("Admin Sync (deduplication)", 
                           f"Expected updated>=1 or inserted=0, got updated={updated}, inserted={inserted2}")
        
    except requests.exceptions.Timeout:
        log_fail("Admin Sync (Hamburg)", "Request timeout (>60s)")
    except Exception as e:
        log_fail("Admin Sync (Hamburg)", f"Exception: {str(e)}")

def test_search():
    """Test 5: GET /api/search"""
    print("\n" + "="*80)
    print("TEST 5: Search (GET /api/search)")
    print("="*80)
    
    # Test 5a: Search Zahnarzt in Hamburg
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"q": "Zahnarzt", "ort": "Hamburg"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_fail("Search (Zahnarzt Hamburg)", f"Expected 200, got {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get("total", 0) >= 1 and len(data.get("results", [])) >= 1:
            result = data["results"][0]
            required_fields = ["name", "slug", "city_slug", "specialty_guess", "rating", 
                             "phone_national", "website_url"]
            
            # Check if fields exist (can be null)
            present_fields = [f for f in required_fields if f in result]
            
            if len(present_fields) == len(required_fields):
                log_pass("Search (Zahnarzt Hamburg)", 
                        f"Found {data['total']} results, first: {result.get('name')}")
                
                # Check for MongoDB _id
                if not check_no_mongodb_id(data):
                    log_fail("Search (Zahnarzt Hamburg)", "Response contains MongoDB _id field")
                
                return result.get("slug")
            else:
                missing = [f for f in required_fields if f not in result]
                log_fail("Search (Zahnarzt Hamburg)", f"Missing fields in result: {missing}")
        else:
            log_fail("Search (Zahnarzt Hamburg)", 
                    f"Expected total>=1, got {data.get('total', 0)}")
            return None
            
    except Exception as e:
        log_fail("Search (Zahnarzt Hamburg)", f"Exception: {str(e)}")
        return None
    
    # Test 5b: Search Hausarzt in Berlin
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"q": "Hausarzt", "ort": "Berlin"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("total", 0) >= 1:
                log_pass("Search (Hausarzt Berlin)", f"Found {data['total']} results")
            else:
                log_warning("Search (Hausarzt Berlin)", "No results found (Berlin data may not be imported)")
        else:
            log_fail("Search (Hausarzt Berlin)", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Search (Hausarzt Berlin)", f"Exception: {str(e)}")
    
    # Test 5c: Search with website filter
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"q": "Zahnarzt", "ort": "Hamburg", "withWebsite": "1"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            
            # Check if all results have website
            all_have_website = all(r.get("website_url") for r in results)
            
            if all_have_website and len(results) > 0:
                log_pass("Search (with website filter)", f"All {len(results)} results have website")
            elif len(results) == 0:
                log_warning("Search (with website filter)", "No results with website found")
            else:
                log_fail("Search (with website filter)", "Some results don't have website")
        else:
            log_fail("Search (with website filter)", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Search (with website filter)", f"Exception: {str(e)}")
    
    # Test 5d: Search with rating sort
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"q": "Zahnarzt", "ort": "Hamburg", "sort": "rating"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            
            if len(results) >= 2:
                # Check if sorted by rating descending
                ratings = [r.get("rating", 0) for r in results]
                is_sorted = all(ratings[i] >= ratings[i+1] for i in range(len(ratings)-1))
                
                if is_sorted:
                    log_pass("Search (rating sort)", f"Results sorted by rating: {ratings[:3]}")
                else:
                    log_fail("Search (rating sort)", f"Results not sorted by rating: {ratings[:3]}")
            else:
                log_warning("Search (rating sort)", f"Not enough results to verify sorting ({len(results)})")
        else:
            log_fail("Search (rating sort)", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Search (rating sort)", f"Exception: {str(e)}")
    
    # Test 5e: Search with minRating filter
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"q": "Zahnarzt", "ort": "Hamburg", "minRating": "4"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            
            # Check if all results have rating >= 4
            all_above_4 = all(r.get("rating", 0) >= 4 for r in results if r.get("rating") is not None)
            
            if all_above_4 and len(results) > 0:
                log_pass("Search (minRating filter)", f"All {len(results)} results have rating>=4")
            elif len(results) == 0:
                log_warning("Search (minRating filter)", "No results with rating>=4 found")
            else:
                log_fail("Search (minRating filter)", "Some results have rating<4")
        else:
            log_fail("Search (minRating filter)", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Search (minRating filter)", f"Exception: {str(e)}")
    
    return None

def test_doctor_profile(slug: Optional[str]):
    """Test 6: GET /api/doctor/{slug}"""
    print("\n" + "="*80)
    print("TEST 6: Doctor Profile (GET /api/doctor/{slug})")
    print("="*80)
    
    # Test 6a: Valid slug
    if slug:
        try:
            response = requests.get(f"{BASE_URL}/doctor/{slug}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("slug") == slug:
                    log_pass("Doctor Profile (valid slug)", f"Retrieved profile: {data.get('name')}")
                    
                    # Check for MongoDB _id
                    if not check_no_mongodb_id(data):
                        log_fail("Doctor Profile (valid slug)", "Response contains MongoDB _id field")
                else:
                    log_fail("Doctor Profile (valid slug)", f"Slug mismatch: expected {slug}, got {data.get('slug')}")
            else:
                log_fail("Doctor Profile (valid slug)", f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            log_fail("Doctor Profile (valid slug)", f"Exception: {str(e)}")
    else:
        log_warning("Doctor Profile (valid slug)", "No slug available from search")
    
    # Test 6b: Invalid slug
    try:
        response = requests.get(f"{BASE_URL}/doctor/nichtvorhanden", timeout=10)
        
        if response.status_code == 404:
            data = response.json()
            if "Nicht gefunden" in data.get("error", ""):
                log_pass("Doctor Profile (invalid slug)", "Correctly returned 404")
            else:
                log_fail("Doctor Profile (invalid slug)", f"Wrong error message: {data}")
        else:
            log_fail("Doctor Profile (invalid slug)", f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        log_fail("Doctor Profile (invalid slug)", f"Exception: {str(e)}")

def test_symptom_suggest():
    """Test 7: GET /api/symptom-suggest"""
    print("\n" + "="*80)
    print("TEST 7: Symptom Suggest (GET /api/symptom-suggest)")
    print("="*80)
    
    test_cases = [
        ("Rückenschmerzen", ["Orthopäde", "Hausarzt", "Physiotherapeut"]),
        ("Zahnschmerzen", ["Zahnarzt"]),
        ("Herzrasen", ["Hausarzt", "Kardiologe"])
    ]
    
    for symptom, expected_specialties in test_cases:
        try:
            response = requests.get(
                f"{BASE_URL}/symptom-suggest",
                params={"q": symptom},
                timeout=10
            )
            
            if response.status_code != 200:
                log_fail(f"Symptom Suggest ({symptom})", f"Expected 200, got {response.status_code}")
                continue
            
            data = response.json()
            
            if data.get("query") != symptom:
                log_fail(f"Symptom Suggest ({symptom})", f"Query mismatch: {data.get('query')}")
                continue
            
            specialties = data.get("specialties", [])
            
            # Check if expected specialties are present
            matches = [s for s in expected_specialties if s in specialties]
            
            if len(matches) >= 1:
                log_pass(f"Symptom Suggest ({symptom})", f"Returned: {specialties}")
            else:
                log_fail(f"Symptom Suggest ({symptom})", 
                        f"Expected {expected_specialties}, got {specialties}")
                
        except Exception as e:
            log_fail(f"Symptom Suggest ({symptom})", f"Exception: {str(e)}")

def test_admin_jobs(token: Optional[str]):
    """Test 8: GET /api/admin/jobs"""
    print("\n" + "="*80)
    print("TEST 8: Admin Jobs (GET /api/admin/jobs)")
    print("="*80)
    
    if not token:
        log_fail("Admin Jobs", "No valid token available")
        return None
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/jobs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_fail("Admin Jobs", f"Expected 200, got {response.status_code}")
            return None
        
        data = response.json()
        
        if isinstance(data, list):
            log_pass("Admin Jobs", f"Retrieved {len(data)} jobs")
            
            # Check for MongoDB _id
            if not check_no_mongodb_id(data):
                log_fail("Admin Jobs", "Response contains MongoDB _id field")
            
            # Return first job_id if available
            if len(data) > 0 and "job_id" in data[0]:
                return data[0]["job_id"]
        else:
            log_fail("Admin Jobs", f"Expected array, got {type(data)}")
            
    except Exception as e:
        log_fail("Admin Jobs", f"Exception: {str(e)}")
    
    return None

def test_admin_logs(token: Optional[str], job_id: Optional[str]):
    """Test 9: GET /api/admin/logs"""
    print("\n" + "="*80)
    print("TEST 9: Admin Logs (GET /api/admin/logs)")
    print("="*80)
    
    if not token:
        log_fail("Admin Logs", "No valid token available")
        return
    
    # Test 9a: All logs
    try:
        response = requests.get(
            f"{BASE_URL}/admin/logs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                log_pass("Admin Logs (all)", f"Retrieved {len(data)} log entries")
                
                # Check for MongoDB _id
                if not check_no_mongodb_id(data):
                    log_fail("Admin Logs (all)", "Response contains MongoDB _id field")
            else:
                log_fail("Admin Logs (all)", f"Expected array, got {type(data)}")
        else:
            log_fail("Admin Logs (all)", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Admin Logs (all)", f"Exception: {str(e)}")
    
    # Test 9b: Logs for specific job
    if job_id:
        try:
            response = requests.get(
                f"{BASE_URL}/admin/logs",
                headers={"Authorization": f"Bearer {token}"},
                params={"job_id": job_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    log_pass("Admin Logs (by job_id)", f"Retrieved {len(data)} log entries for job {job_id}")
                else:
                    log_fail("Admin Logs (by job_id)", f"Expected array, got {type(data)}")
            else:
                log_fail("Admin Logs (by job_id)", f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            log_fail("Admin Logs (by job_id)", f"Exception: {str(e)}")
    else:
        log_warning("Admin Logs (by job_id)", "No job_id available to test")

def test_cors_headers():
    """Test CORS headers"""
    print("\n" + "="*80)
    print("TEST 10: CORS Headers")
    print("="*80)
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
        
        missing_headers = []
        for header, expected_value in cors_headers.items():
            actual_value = response.headers.get(header)
            if not actual_value:
                missing_headers.append(header)
        
        if not missing_headers:
            log_pass("CORS Headers", "All CORS headers present")
        else:
            log_fail("CORS Headers", f"Missing headers: {missing_headers}")
            
    except Exception as e:
        log_fail("CORS Headers", f"Exception: {str(e)}")

def test_claim_check_auth_guard():
    """Test POST /api/admin/claim-check without Authorization header → expect 401"""
    print("\n" + "="*80)
    print("TEST: Claim Check - Auth Guard (No Authorization)")
    print("="*80)
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/claim-check",
            json={"limit": 5, "only_stale": True},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 401:
            data = response.json()
            if data.get('error') == 'Nicht autorisiert':
                log_pass("Claim Check Auth Guard", "Correctly rejected with 401 'Nicht autorisiert'")
            else:
                log_fail("Claim Check Auth Guard", f"Got 401 but wrong error message: {data}")
        else:
            log_fail("Claim Check Auth Guard", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        log_fail("Claim Check Auth Guard", f"Exception: {str(e)}")

def test_claim_check_integration(token: str):
    """Test POST /api/admin/claim-check with real integration (OUTSCRAPER_API_KEY configured)"""
    print("\n" + "="*80)
    print("TEST: Claim Check - Real Integration (limit=10)")
    print("="*80)
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/admin/claim-check",
            json={"limit": 10, "only_stale": True},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            timeout=55  # Allow up to 55s (should complete within 50s per requirements)
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Request elapsed time: {elapsed_time:.2f}s")
        
        if response.status_code != 200:
            log_fail("Claim Check Integration", f"Expected 200, got {response.status_code}: {response.text}")
            return
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        required_keys = ['ok', 'checked', 'claimed', 'unclaimed', 'errors', 'batches', 
                        'cost_estimate_usd', 'total_candidates_scanned', 'partial', 
                        'elapsed_ms', 'remaining_candidates']
        
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            log_fail("Claim Check Integration", f"Missing required keys: {missing_keys}")
            return
        
        # Verify data types
        if not isinstance(data['partial'], bool):
            log_fail("Claim Check Integration", f"'partial' should be boolean, got {type(data['partial'])}")
            return
        
        if not isinstance(data['elapsed_ms'], (int, float)):
            log_fail("Claim Check Integration", f"'elapsed_ms' should be number, got {type(data['elapsed_ms'])}")
            return
        
        # Verify elapsed_ms is reasonable (< 50000ms as per requirements)
        if data['elapsed_ms'] >= 50000:
            log_warning("Claim Check Integration", f"elapsed_ms ({data['elapsed_ms']}ms) is >= 50000ms")
        
        # Verify request completed without timeout
        if elapsed_time >= 55:
            log_fail("Claim Check Integration", f"Request took {elapsed_time:.2f}s, approaching timeout")
            return
        
        # Check results
        if data['total_candidates_scanned'] == 0:
            print(f"INFO: No candidates found (message: {data.get('message', 'N/A')})")
            if data.get('message') == 'Keine Kandidaten gefunden.':
                log_pass("Claim Check Integration", f"No candidates scenario handled correctly")
            else:
                log_pass("Claim Check Integration", f"Completed with 0 candidates")
        else:
            print(f"INFO: Scanned {data['total_candidates_scanned']} candidates")
            print(f"INFO: Checked={data['checked']}, Claimed={data['claimed']}, Unclaimed={data['unclaimed']}, Errors={data['errors']}")
            print(f"INFO: Batches={data['batches']}, Cost=${data['cost_estimate_usd']}, Partial={data['partial']}")
            
            details = f"Scanned {data['total_candidates_scanned']} in {elapsed_time:.2f}s, elapsed_ms={data['elapsed_ms']}ms, partial={data['partial']}"
            log_pass("Claim Check Integration", details)
        
    except requests.exceptions.Timeout:
        log_fail("Claim Check Integration", "Request timed out after 55s")
    except Exception as e:
        log_fail("Claim Check Integration", f"Exception: {str(e)}")

def test_claim_check_code_verification():
    """Verify code changes are in place (BATCH_SIZE=5, DELAY_MS=200, TIME_BUDGET_MS=45000, timeout=20000)"""
    print("\n" + "="*80)
    print("TEST: Claim Check - Code Verification")
    print("="*80)
    
    try:
        # Read route.js
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            route_content = f.read()
        
        # Read outscraperClaim.js
        with open('/app/lib/outscraperClaim.js', 'r') as f:
            outscraper_content = f.read()
        
        checks = []
        details = []
        
        # Check BATCH_SIZE = 5
        if 'const BATCH_SIZE = 5;' in route_content:
            checks.append(True)
            details.append("BATCH_SIZE=5")
        else:
            checks.append(False)
            details.append("BATCH_SIZE≠5")
        
        # Check DELAY_MS = 200
        if 'const DELAY_MS = 200;' in route_content:
            checks.append(True)
            details.append("DELAY_MS=200")
        else:
            checks.append(False)
            details.append("DELAY_MS≠200")
        
        # Check TIME_BUDGET_MS = 45000
        if 'const TIME_BUDGET_MS = 45000;' in route_content:
            checks.append(True)
            details.append("TIME_BUDGET_MS=45000")
        else:
            checks.append(False)
            details.append("TIME_BUDGET_MS≠45000")
        
        # Check default timeout 20000 in outscraperClaim.js
        if 'const timeout = options.timeout || 20000;' in outscraper_content:
            checks.append(True)
            details.append("timeout=20000")
        else:
            checks.append(False)
            details.append("timeout≠20000")
        
        if all(checks):
            log_pass("Claim Check Code Verification", ", ".join(details))
        else:
            log_fail("Claim Check Code Verification", f"Some checks failed: {', '.join(details)}")
            
    except Exception as e:
        log_fail("Claim Check Code Verification", f"Exception: {str(e)}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    print(f"\n✅ PASSED: {len(test_results['passed'])} tests")
    for test in test_results['passed']:
        print(f"   - {test}")
    
    if test_results['warnings']:
        print(f"\n⚠️  WARNINGS: {len(test_results['warnings'])} tests")
        for warning in test_results['warnings']:
            print(f"   - {warning}")
    
    if test_results['failed']:
        print(f"\n❌ FAILED: {len(test_results['failed'])} tests")
        for failure in test_results['failed']:
            print(f"   - {failure}")
    
    print("\n" + "="*80)
    
    total = len(test_results['passed']) + len(test_results['failed'])
    pass_rate = (len(test_results['passed']) / total * 100) if total > 0 else 0
    print(f"PASS RATE: {pass_rate:.1f}% ({len(test_results['passed'])}/{total})")
    print("="*80 + "\n")
    
    return len(test_results['failed']) == 0

def main():
    """Run all tests"""
    print("="*80)
    print("NAVORIA.DE BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    print("="*80)
    
    # Run tests in sequence
    test_health_check()
    token = test_admin_login()
    test_admin_stats(token)
    test_admin_sync(token)
    slug = test_search()
    test_doctor_profile(slug)
    test_symptom_suggest()
    job_id = test_admin_jobs(token)
    test_admin_logs(token, job_id)
    test_cors_headers()
    
    # Claim Check tests (timeout/abort fix)
    test_claim_check_code_verification()
    test_claim_check_auth_guard()
    test_claim_check_integration(token)
    
    # Print summary
    all_passed = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
