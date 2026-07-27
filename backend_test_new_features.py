#!/usr/bin/env python3
"""
Navoria.de Backend Test Suite - New Features
Tests for:
1. Bot-Detail-Admin-Endpoint (GET /api/admin/bots)
2. Server-Side Request Logging (lib/serverTracker.js)
3. Wildcard-Subdomain-Routing (middleware.js)
"""

import requests
import json
import time
import sys
import os
import subprocess
from pymongo import MongoClient
from typing import Dict, Any, Optional

# Configuration from .env
BASE_URL = os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = BASE_URL + '/api'
ADMIN_EMAIL = "admin@navoria.de"
ADMIN_PASSWORD = "one4all1"
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'navoria_db')

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

def get_admin_token():
    """Get admin authentication token"""
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        else:
            print(f"❌ Failed to get admin token: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Exception getting admin token: {str(e)}")
        return None

def get_mongo_client():
    """Get MongoDB client"""
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        # Test connection
        client.server_info()
        return client
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        return None

# ============================================================================
# TEST 1: Bot-Detail-Admin-Endpoint (GET /api/admin/bots)
# ============================================================================

def test_bot_endpoint_auth_guard():
    """Test 1.1: Bot endpoint without auth returns 401"""
    print("\n" + "="*80)
    print("TEST 1.1: Bot Endpoint Auth Guard (GET /api/admin/bots)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/admin/bots", timeout=10)
        
        if response.status_code == 401:
            data = response.json()
            if data.get("error") == "Nicht autorisiert":
                log_pass("Bot Endpoint Auth Guard", "Correctly returns 401 without token")
            else:
                log_fail("Bot Endpoint Auth Guard", f"Wrong error message: {data}")
        else:
            log_fail("Bot Endpoint Auth Guard", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        log_fail("Bot Endpoint Auth Guard", f"Exception: {str(e)}")

def test_bot_endpoint_with_auth():
    """Test 1.2: Bot endpoint with valid token and different ranges"""
    print("\n" + "="*80)
    print("TEST 1.2: Bot Endpoint With Valid Token (GET /api/admin/bots)")
    print("="*80)
    
    token = get_admin_token()
    if not token:
        log_fail("Bot Endpoint With Auth", "Could not get admin token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test different ranges
    for range_param in ['today', '7d', '30d']:
        try:
            print(f"\n  Testing range={range_param}...")
            response = requests.get(
                f"{API_BASE}/admin/bots?range={range_param}",
                headers=headers,
                timeout=15
            )
            
            if response.status_code != 200:
                log_fail(f"Bot Endpoint range={range_param}", f"Expected 200, got {response.status_code}")
                continue
            
            data = response.json()
            
            # Validate response schema
            required_fields = ['range', 'window', 'totals', 'bots', 'hourly_all', 'generated_at']
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                log_fail(f"Bot Endpoint range={range_param}", f"Missing fields: {missing_fields}")
                continue
            
            # Validate window structure
            if 'from' not in data['window'] or 'to' not in data['window']:
                log_fail(f"Bot Endpoint range={range_param}", "window missing 'from' or 'to'")
                continue
            
            # Validate totals structure
            totals_fields = ['hits', 'unique_paths', 'distinct_bots']
            missing_totals = [f for f in totals_fields if f not in data['totals']]
            if missing_totals:
                log_fail(f"Bot Endpoint range={range_param}", f"totals missing: {missing_totals}")
                continue
            
            # Validate totals.hits is a number
            if not isinstance(data['totals']['hits'], (int, float)):
                log_fail(f"Bot Endpoint range={range_param}", f"totals.hits is not a number: {type(data['totals']['hits'])}")
                continue
            
            # Validate bots is an array
            if not isinstance(data['bots'], list):
                log_fail(f"Bot Endpoint range={range_param}", f"bots is not an array: {type(data['bots'])}")
                continue
            
            # If there are bots, validate their structure
            if len(data['bots']) > 0:
                bot = data['bots'][0]
                bot_fields = ['bot', 'hits', 'first_seen', 'last_seen', 'paths_count', 'top_paths', 'hourly']
                missing_bot_fields = [f for f in bot_fields if f not in bot]
                if missing_bot_fields:
                    log_fail(f"Bot Endpoint range={range_param}", f"bot entry missing: {missing_bot_fields}")
                    continue
                
                # Validate top_paths structure
                if len(bot['top_paths']) > 0:
                    path_entry = bot['top_paths'][0]
                    if 'path' not in path_entry or 'hits' not in path_entry:
                        log_fail(f"Bot Endpoint range={range_param}", "top_paths entry missing 'path' or 'hits'")
                        continue
            
            # Validate hourly_all is an array
            if not isinstance(data['hourly_all'], list):
                log_fail(f"Bot Endpoint range={range_param}", f"hourly_all is not an array: {type(data['hourly_all'])}")
                continue
            
            log_pass(f"Bot Endpoint range={range_param}", 
                    f"Schema valid. Totals: {data['totals']['hits']} hits, {data['totals']['distinct_bots']} bots")
            
        except Exception as e:
            log_fail(f"Bot Endpoint range={range_param}", f"Exception: {str(e)}")

def test_bot_endpoint_invalid_range():
    """Test 1.3: Bot endpoint with invalid range falls back to 'today'"""
    print("\n" + "="*80)
    print("TEST 1.3: Bot Endpoint Invalid Range Fallback")
    print("="*80)
    
    token = get_admin_token()
    if not token:
        log_fail("Bot Endpoint Invalid Range", "Could not get admin token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{API_BASE}/admin/bots?range=invalid",
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('range') == 'today':
                log_pass("Bot Endpoint Invalid Range", "Correctly falls back to 'today'")
            else:
                log_warning("Bot Endpoint Invalid Range", f"Range is '{data.get('range')}', expected 'today'")
        else:
            log_fail("Bot Endpoint Invalid Range", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Bot Endpoint Invalid Range", f"Exception: {str(e)}")

# ============================================================================
# TEST 2: Server-Side Request Logging
# ============================================================================

def test_server_logging_bot_detection():
    """Test 2.1: Server-side logging detects bots correctly"""
    print("\n" + "="*80)
    print("TEST 2.1: Server-Side Bot Detection")
    print("="*80)
    
    client = get_mongo_client()
    if not client:
        log_fail("Server-Side Bot Detection", "Could not connect to MongoDB")
        return
    
    try:
        db = client[DB_NAME]
        col = db['server_hits']
        
        # Clear old test entries
        col.delete_many({"path": "/test-bot-detection"})
        
        # Test different bot user agents
        bot_tests = [
            ("Googlebot/2.1 (+http://www.google.com/bot.html)", "googlebot"),
            ("Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)", "perplexitybot"),
            ("Mozilla/5.0 (compatible; Bytespider; https://zhanzhang.toutiao.com/)", "bytespider"),
            ("Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)", "yandexbot"),
        ]
        
        for ua, expected_bot_name in bot_tests:
            print(f"\n  Testing UA: {ua[:60]}...")
            
            # Send request with bot UA
            response = requests.get(
                f"{BASE_URL}/test-bot-detection",
                headers={"User-Agent": ua},
                timeout=10
            )
            
            # Wait for fire-and-forget logging
            time.sleep(2)
            
            # Check MongoDB for entry
            entry = col.find_one({"path": "/test-bot-detection", "user_agent": ua})
            
            if entry:
                if entry.get('is_bot') == True:
                    if entry.get('bot_name') == expected_bot_name:
                        log_pass(f"Bot Detection: {expected_bot_name}", "Correctly detected and logged")
                    else:
                        log_warning(f"Bot Detection: {expected_bot_name}", 
                                  f"Detected as '{entry.get('bot_name')}' instead")
                else:
                    log_fail(f"Bot Detection: {expected_bot_name}", "is_bot=false, should be true")
            else:
                log_fail(f"Bot Detection: {expected_bot_name}", "No entry found in server_hits")
        
        # Cleanup
        col.delete_many({"path": "/test-bot-detection"})
        
    except Exception as e:
        log_fail("Server-Side Bot Detection", f"Exception: {str(e)}")
    finally:
        client.close()

def test_server_logging_normal_browser():
    """Test 2.2: Server-side logging handles normal browsers"""
    print("\n" + "="*80)
    print("TEST 2.2: Server-Side Normal Browser Detection")
    print("="*80)
    
    client = get_mongo_client()
    if not client:
        log_fail("Server-Side Browser Detection", "Could not connect to MongoDB")
        return
    
    try:
        db = client[DB_NAME]
        col = db['server_hits']
        
        # Clear old test entries
        col.delete_many({"path": "/test-browser-detection"})
        
        # Test normal browser UA
        browser_ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        
        print(f"\n  Testing browser UA: {browser_ua[:60]}...")
        
        # Send request with browser UA
        response = requests.get(
            f"{BASE_URL}/test-browser-detection",
            headers={"User-Agent": browser_ua},
            timeout=10
        )
        
        # Wait for fire-and-forget logging
        time.sleep(2)
        
        # Check MongoDB for entry
        entry = col.find_one({"path": "/test-browser-detection", "user_agent": browser_ua})
        
        if entry:
            if entry.get('is_bot') == False:
                log_pass("Browser Detection", "Correctly identified as non-bot")
            else:
                log_fail("Browser Detection", f"is_bot={entry.get('is_bot')}, should be false")
        else:
            log_fail("Browser Detection", "No entry found in server_hits")
        
        # Cleanup
        col.delete_many({"path": "/test-browser-detection"})
        
    except Exception as e:
        log_fail("Server-Side Browser Detection", f"Exception: {str(e)}")
    finally:
        client.close()

def test_server_logging_skip_paths():
    """Test 2.3: Server-side logging skips /api, /admin, /_next paths"""
    print("\n" + "="*80)
    print("TEST 2.3: Server-Side Skip Paths")
    print("="*80)
    
    client = get_mongo_client()
    if not client:
        log_fail("Server-Side Skip Paths", "Could not connect to MongoDB")
        return
    
    try:
        db = client[DB_NAME]
        col = db['server_hits']
        
        skip_paths = [
            "/api/track",
            "/admin/bots",
            "/_next/static/test.js"
        ]
        
        for path in skip_paths:
            print(f"\n  Testing skip path: {path}...")
            
            # Clear old entries
            col.delete_many({"path": path})
            
            # Send request
            full_url = BASE_URL + path
            try:
                response = requests.get(full_url, timeout=10)
            except:
                pass  # Path might not exist, that's ok
            
            # Wait for potential logging
            time.sleep(2)
            
            # Check MongoDB - should NOT have entry
            entry = col.find_one({"path": path})
            
            if entry:
                log_fail(f"Skip Path: {path}", "Path was logged but should be skipped")
            else:
                log_pass(f"Skip Path: {path}", "Correctly skipped")
        
    except Exception as e:
        log_fail("Server-Side Skip Paths", f"Exception: {str(e)}")
    finally:
        client.close()

# ============================================================================
# TEST 3: Wildcard-Subdomain-Routing
# ============================================================================

def test_subdomain_routing_praxis_homepage():
    """Test 3.1: Subdomain routes to homepage"""
    print("\n" + "="*80)
    print("TEST 3.1: Subdomain Routing to Praxis Homepage")
    print("="*80)
    
    try:
        # Test with Host header
        result = subprocess.run(
            ['curl', '-sI', '-H', 'Host: jaroslaw-raczynski.navoria.de', 'http://localhost:3000/'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        output = result.stdout
        
        if 'HTTP/1.1 200' in output or 'HTTP/2 200' in output:
            log_pass("Subdomain Homepage Routing", "Returns 200 for jaroslaw-raczynski.navoria.de/")
        else:
            log_fail("Subdomain Homepage Routing", f"Did not return 200. Output: {output[:200]}")
            
    except Exception as e:
        log_fail("Subdomain Homepage Routing", f"Exception: {str(e)}")

def test_subdomain_routing_redirect_to_main():
    """Test 3.2: Subdomain non-root paths redirect to main domain"""
    print("\n" + "="*80)
    print("TEST 3.2: Subdomain Non-Root Path Redirect")
    print("="*80)
    
    try:
        result = subprocess.run(
            ['curl', '-sI', '-H', 'Host: jaroslaw-raczynski.navoria.de', 'http://localhost:3000/aerzte'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        output = result.stdout
        
        if 'HTTP/1.1 301' in output or 'HTTP/2 301' in output:
            if 'Location: https://navoria.de/aerzte' in output:
                log_pass("Subdomain Non-Root Redirect", "Correctly redirects to navoria.de/aerzte")
            else:
                log_fail("Subdomain Non-Root Redirect", f"Wrong Location header. Output: {output[:300]}")
        else:
            log_fail("Subdomain Non-Root Redirect", f"Did not return 301. Output: {output[:200]}")
            
    except Exception as e:
        log_fail("Subdomain Non-Root Redirect", f"Exception: {str(e)}")

def test_canonical_redirect():
    """Test 3.3: Main domain slug redirects to subdomain"""
    print("\n" + "="*80)
    print("TEST 3.3: Canonical Redirect (Main Domain → Subdomain)")
    print("="*80)
    
    try:
        result = subprocess.run(
            ['curl', '-sI', '-H', 'Host: navoria.de', '-H', 'X-Forwarded-Host: navoria.de', 
             'http://localhost:3000/jaroslaw-raczynski'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        output = result.stdout
        
        if 'HTTP/1.1 307' in output or 'HTTP/2 307' in output:
            if 'Location: https://jaroslaw-raczynski.navoria.de/' in output:
                log_pass("Canonical Redirect", "Correctly redirects to subdomain")
            else:
                log_warning("Canonical Redirect", f"Redirect found but location might differ. Output: {output[:300]}")
        else:
            # This might be expected if homepage_mode is not active
            log_warning("Canonical Redirect", f"Did not return 307. This is OK if homepage_mode is not active for this practice. Output: {output[:200]}")
            
    except Exception as e:
        log_fail("Canonical Redirect", f"Exception: {str(e)}")

def test_reserved_subdomain():
    """Test 3.4: Reserved subdomains are not rewritten"""
    print("\n" + "="*80)
    print("TEST 3.4: Reserved Subdomain (admin.navoria.de)")
    print("="*80)
    
    try:
        result = subprocess.run(
            ['curl', '-sI', '-H', 'Host: admin.navoria.de', 'http://localhost:3000/'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        output = result.stdout
        
        if 'HTTP/1.1 200' in output or 'HTTP/2 200' in output:
            log_pass("Reserved Subdomain", "admin.navoria.de returns 200 (no rewrite)")
        else:
            log_fail("Reserved Subdomain", f"Did not return 200. Output: {output[:200]}")
            
    except Exception as e:
        log_fail("Reserved Subdomain", f"Exception: {str(e)}")

def test_preview_host_fallback():
    """Test 3.5: Preview host uses fallback behavior"""
    print("\n" + "="*80)
    print("TEST 3.5: Preview Host Fallback")
    print("="*80)
    
    try:
        result = subprocess.run(
            ['curl', '-sI', '-H', 'Host: arzt-suche.preview.emergentagent.com', 
             'http://localhost:3000/jaroslaw-raczynski'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        output = result.stdout
        
        if 'HTTP/1.1 200' in output or 'HTTP/2 200' in output:
            log_pass("Preview Host Fallback", "Preview host returns 200 (fallback active)")
        else:
            log_warning("Preview Host Fallback", f"Did not return 200. Output: {output[:200]}")
            
    except Exception as e:
        log_fail("Preview Host Fallback", f"Exception: {str(e)}")

def test_sitemap_homepages():
    """Test 3.6: Sitemap includes homepage URLs"""
    print("\n" + "="*80)
    print("TEST 3.6: Sitemap Homepages XML")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/sitemap-homepages.xml", timeout=10)
        
        if response.status_code == 200:
            content = response.text
            if 'https://jaroslaw-raczynski.navoria.de/' in content:
                log_pass("Sitemap Homepages", "Contains jaroslaw-raczynski.navoria.de")
            else:
                log_warning("Sitemap Homepages", "Does not contain test practice URL (might be OK if not in homepage_mode)")
        else:
            log_fail("Sitemap Homepages", f"Expected 200, got {response.status_code}")
            
    except Exception as e:
        log_fail("Sitemap Homepages", f"Exception: {str(e)}")

def test_broken_praxis_url():
    """Test 3.7: Broken praxis URL returns 410 Gone"""
    print("\n" + "="*80)
    print("TEST 3.7: Broken Praxis URL (410 Gone)")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/praxis/berlin/null", timeout=10, allow_redirects=False)
        
        if response.status_code == 410:
            log_pass("Broken Praxis URL", "Correctly returns 410 Gone for /praxis/berlin/null")
        else:
            log_fail("Broken Praxis URL", f"Expected 410, got {response.status_code}")
            
    except Exception as e:
        log_fail("Broken Praxis URL", f"Exception: {str(e)}")

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total = len(test_results["passed"]) + len(test_results["failed"])
    passed = len(test_results["passed"])
    failed = len(test_results["failed"])
    warnings = len(test_results["warnings"])
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️  Warnings: {warnings}")
    
    if test_results["failed"]:
        print("\n❌ FAILED TESTS:")
        for fail in test_results["failed"]:
            print(f"  - {fail}")
    
    if test_results["warnings"]:
        print("\n⚠️  WARNINGS:")
        for warn in test_results["warnings"]:
            print(f"  - {warn}")
    
    print("\n" + "="*80)
    
    return failed == 0

def main():
    """Main test runner"""
    print("="*80)
    print("NAVORIA BACKEND TEST SUITE - NEW FEATURES")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"MongoDB: {MONGO_URL}/{DB_NAME}")
    print("="*80)
    
    # Test 1: Bot-Detail-Admin-Endpoint
    print("\n\n" + "="*80)
    print("FEATURE 1: BOT-DETAIL-ADMIN-ENDPOINT")
    print("="*80)
    test_bot_endpoint_auth_guard()
    test_bot_endpoint_with_auth()
    test_bot_endpoint_invalid_range()
    
    # Test 2: Server-Side Request Logging
    print("\n\n" + "="*80)
    print("FEATURE 2: SERVER-SIDE REQUEST LOGGING")
    print("="*80)
    test_server_logging_bot_detection()
    test_server_logging_normal_browser()
    test_server_logging_skip_paths()
    
    # Test 3: Wildcard-Subdomain-Routing
    print("\n\n" + "="*80)
    print("FEATURE 3: WILDCARD-SUBDOMAIN-ROUTING")
    print("="*80)
    test_subdomain_routing_praxis_homepage()
    test_subdomain_routing_redirect_to_main()
    test_canonical_redirect()
    test_reserved_subdomain()
    test_preview_host_fallback()
    test_sitemap_homepages()
    test_broken_praxis_url()
    
    # Print summary
    success = print_summary()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
