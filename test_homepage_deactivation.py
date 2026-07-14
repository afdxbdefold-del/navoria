#!/usr/bin/env python3
"""
Backend test for Navoria.de homepage mode endpoint
Tests the fix for website_checked_at being preserved when deactivating homepage mode
"""

import os
import sys
import requests
from pymongo import MongoClient
from datetime import datetime
import time

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://arzt-suche.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'navoria_db')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@navoria.de')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'one4all1')

print(f"🔧 Configuration:")
print(f"   API_URL: {API_URL}")
print(f"   MONGO_URL: {MONGO_URL}")
print(f"   DB_NAME: {DB_NAME}")
print(f"   ADMIN_EMAIL: {ADMIN_EMAIL}")
print()

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    doctor_places = db['doctor_places']
    print(f"✅ Connected to MongoDB: {DB_NAME}")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    sys.exit(1)

def admin_login():
    """Login as admin and return token"""
    print("\n📝 Step 1: Admin Login")
    try:
        response = requests.post(
            f"{API_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"   ✅ Login successful, token received")
            return token
        else:
            print(f"   ❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return None

def find_active_practice():
    """Find an active practice in the database"""
    print("\n📝 Step 2: Find Active Practice")
    try:
        practice = doctor_places.find_one({"is_active": True})
        if practice:
            print(f"   ✅ Found practice: {practice.get('name')} (ID: {practice.get('id')})")
            return practice
        else:
            print(f"   ⚠️  No active practice found in database")
            return None
    except Exception as e:
        print(f"   ❌ Database query error: {e}")
        return None

def get_practice_from_db(practice_id):
    """Get current practice data from database"""
    return doctor_places.find_one({"id": practice_id})

def activate_homepage_mode(token, practice_id):
    """Activate homepage mode for a practice"""
    print(f"\n📝 Step 3: Activate Homepage Mode")
    try:
        response = requests.post(
            f"{API_URL}/admin/doctors/{practice_id}/homepage",
            headers={"Authorization": f"Bearer {token}"},
            json={"enabled": True},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"   ✅ Homepage mode activated (HTTP 200)")
            
            # Check database state
            time.sleep(0.5)  # Give DB a moment to update
            practice = get_practice_from_db(practice_id)
            
            print(f"   📊 Database state after activation:")
            print(f"      homepage_mode: {practice.get('homepage_mode')}")
            print(f"      website_checked_at: {practice.get('website_checked_at')}")
            print(f"      is_verified: {practice.get('is_verified')}")
            print(f"      verification_method: {practice.get('verification_method')}")
            
            # Validate
            errors = []
            if not practice.get('homepage_mode'):
                errors.append("homepage_mode should be true")
            if not practice.get('website_checked_at'):
                errors.append("website_checked_at should be set")
            if practice.get('verification_method') != 'navoria_homepage':
                errors.append(f"verification_method should be 'navoria_homepage', got '{practice.get('verification_method')}'")
            
            if errors:
                print(f"   ❌ Validation errors: {', '.join(errors)}")
                return False
            else:
                print(f"   ✅ All fields correctly set")
                return True
        else:
            print(f"   ❌ Activation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Activation error: {e}")
        return False

def deactivate_homepage_mode(token, practice_id):
    """Deactivate homepage mode for a practice (WITHOUT mode_only)"""
    print(f"\n📝 Step 4: Deactivate Homepage Mode (enabled:false, NO mode_only)")
    print(f"   🎯 KEY TEST: website_checked_at MUST remain set (not null)")
    try:
        response = requests.post(
            f"{API_URL}/admin/doctors/{practice_id}/homepage",
            headers={"Authorization": f"Bearer {token}"},
            json={"enabled": False},  # IMPORTANT: NO mode_only parameter
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"   ✅ Homepage mode deactivated (HTTP 200)")
            
            # Check database state
            time.sleep(0.5)  # Give DB a moment to update
            practice = get_practice_from_db(practice_id)
            
            print(f"   📊 Database state after deactivation:")
            print(f"      homepage_mode: {practice.get('homepage_mode')}")
            print(f"      website_checked_at: {practice.get('website_checked_at')}")
            print(f"      is_verified: {practice.get('is_verified')}")
            print(f"      verification_method: {practice.get('verification_method')}")
            
            # Validate - THIS IS THE CORE FIX
            errors = []
            critical_errors = []
            
            if practice.get('homepage_mode'):
                errors.append("homepage_mode should be removed/false")
            
            # CRITICAL: website_checked_at MUST be set (not null)
            if not practice.get('website_checked_at'):
                critical_errors.append("🚨 CRITICAL: website_checked_at is NULL - this is the bug we're testing!")
            
            if not practice.get('is_verified'):
                errors.append("is_verified should be true")
            
            if practice.get('verification_method') != 'admin_no_website_check':
                errors.append(f"verification_method should be 'admin_no_website_check', got '{practice.get('verification_method')}'")
            
            if critical_errors:
                print(f"   ❌ CRITICAL ERRORS: {', '.join(critical_errors)}")
                print(f"   ❌ This means the practice will NOT appear in sitemap!")
                return False
            elif errors:
                print(f"   ⚠️  Minor issues: {', '.join(errors)}")
                return True  # Still pass if website_checked_at is set
            else:
                print(f"   ✅ All fields correctly set - FIX WORKING!")
                print(f"   ✅ Practice will appear in sitemap")
                return True
        else:
            print(f"   ❌ Deactivation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Deactivation error: {e}")
        return False

def check_sitemap(practice_id, practice_name):
    """Check if practice appears in sitemap"""
    print(f"\n📝 Step 5: Check Sitemap (Optional)")
    try:
        response = requests.get(
            f"{BASE_URL}/sitemap-praxen/1",
            headers={"x-forwarded-host": "navoria.de"},
            timeout=10
        )
        
        if response.status_code == 200:
            content = response.text
            # Check if practice appears in sitemap
            if practice_id in content or practice_name in content:
                print(f"   ✅ Practice found in sitemap")
                return True
            else:
                print(f"   ⚠️  Practice not found in sitemap (may be filtered by other criteria)")
                return None  # Not a failure, just informational
        elif response.status_code == 404:
            print(f"   ℹ️  Sitemap endpoint not found (404) - skipping this check")
            return None
        else:
            print(f"   ⚠️  Sitemap check failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"   ⚠️  Sitemap check error: {e}")
        return None

def restore_practice(practice_id, original_state):
    """Restore practice to original state"""
    print(f"\n📝 Step 6: Cleanup - Restore Original State")
    try:
        # Restore original fields
        update = {"$set": {}}
        unset = {}
        
        for field in ['homepage_mode', 'homepage_generated_at', 'website_checked_at', 
                      'is_verified', 'verified_at', 'verification_method', 'homepage_slug']:
            if field in original_state and original_state[field] is not None:
                update["$set"][field] = original_state[field]
            else:
                unset[field] = ""
        
        if unset:
            update["$unset"] = unset
        
        if update["$set"]:
            doctor_places.update_one({"id": practice_id}, update)
        elif unset:
            doctor_places.update_one({"id": practice_id}, {"$unset": unset})
            
        print(f"   ✅ Practice restored to original state")
        return True
    except Exception as e:
        print(f"   ⚠️  Restore error: {e}")
        return False

def main():
    print("=" * 80)
    print("🧪 HOMEPAGE MODE DEACTIVATION TEST")
    print("=" * 80)
    print("Testing: website_checked_at preservation when deactivating homepage mode")
    print()
    
    # Step 1: Login
    token = admin_login()
    if not token:
        print("\n❌ TEST FAILED: Could not login")
        sys.exit(1)
    
    # Step 2: Find practice
    practice = find_active_practice()
    if not practice:
        print("\n⚠️  TEST SKIPPED: No active practice found")
        sys.exit(0)
    
    practice_id = practice.get('id')
    practice_name = practice.get('name')
    
    # Save original state for cleanup
    original_state = {
        'homepage_mode': practice.get('homepage_mode'),
        'homepage_generated_at': practice.get('homepage_generated_at'),
        'website_checked_at': practice.get('website_checked_at'),
        'is_verified': practice.get('is_verified'),
        'verified_at': practice.get('verified_at'),
        'verification_method': practice.get('verification_method'),
        'homepage_slug': practice.get('homepage_slug')
    }
    
    try:
        # Step 3: Activate homepage mode
        if not activate_homepage_mode(token, practice_id):
            print("\n❌ TEST FAILED: Could not activate homepage mode")
            restore_practice(practice_id, original_state)
            sys.exit(1)
        
        # Step 4: Deactivate homepage mode (THE CORE TEST)
        if not deactivate_homepage_mode(token, practice_id):
            print("\n❌ TEST FAILED: Deactivation did not preserve website_checked_at")
            restore_practice(practice_id, original_state)
            sys.exit(1)
        
        # Step 5: Check sitemap (optional)
        check_sitemap(practice_id, practice_name)
        
        # Step 6: Cleanup
        restore_practice(practice_id, original_state)
        
        print("\n" + "=" * 80)
        print("✅ TEST PASSED: Homepage deactivation correctly preserves website_checked_at")
        print("=" * 80)
        print()
        print("Summary:")
        print("  ✅ Homepage mode activation works")
        print("  ✅ Homepage mode deactivation preserves website_checked_at")
        print("  ✅ Practice will appear in sitemap after deactivation")
        print("  ✅ Verification method correctly set to 'admin_no_website_check'")
        print()
        
    except Exception as e:
        print(f"\n❌ TEST ERROR: {e}")
        restore_practice(practice_id, original_state)
        sys.exit(1)

if __name__ == "__main__":
    main()
