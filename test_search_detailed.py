#!/usr/bin/env python3
"""
Detailed search tests for Navoria.de
"""

import requests
import json
import os

BASE_URL = os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000') + '/api'

print("="*80)
print("DETAILED SEARCH TESTS")
print("="*80)

# Test 1: Search Hausarzt in Berlin
print("\n1. Search Hausarzt in Berlin")
response = requests.get(f"{BASE_URL}/search", params={"q": "Hausarzt", "ort": "Berlin"}, timeout=10)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total: {data.get('total')}")
print(f"Results: {len(data.get('results', []))}")
if data.get('results'):
    print(f"First result: {data['results'][0].get('name')}")

# Test 2: Search with website filter
print("\n2. Search Zahnarzt Hamburg with website filter")
response = requests.get(f"{BASE_URL}/search", params={"q": "Zahnarzt", "ort": "Hamburg", "withWebsite": "1"}, timeout=10)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total: {data.get('total')}")
print(f"Results: {len(data.get('results', []))}")
results = data.get('results', [])
if results:
    websites = [r.get('website_url') for r in results]
    print(f"Websites: {websites}")
    all_have_website = all(w for w in websites)
    print(f"All have website: {all_have_website}")

# Test 3: Search with rating sort
print("\n3. Search Zahnarzt Hamburg sorted by rating")
response = requests.get(f"{BASE_URL}/search", params={"q": "Zahnarzt", "ort": "Hamburg", "sort": "rating"}, timeout=10)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total: {data.get('total')}")
results = data.get('results', [])
if results:
    ratings = [r.get('rating') for r in results]
    print(f"Ratings: {ratings}")
    is_sorted = all(ratings[i] >= ratings[i+1] for i in range(len(ratings)-1) if ratings[i] is not None and ratings[i+1] is not None)
    print(f"Sorted correctly: {is_sorted}")

# Test 4: Search with minRating filter
print("\n4. Search Zahnarzt Hamburg with minRating=4")
response = requests.get(f"{BASE_URL}/search", params={"q": "Zahnarzt", "ort": "Hamburg", "minRating": "4"}, timeout=10)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total: {data.get('total')}")
results = data.get('results', [])
if results:
    ratings = [r.get('rating') for r in results]
    print(f"Ratings: {ratings}")
    all_above_4 = all(r >= 4 for r in ratings if r is not None)
    print(f"All >= 4: {all_above_4}")

print("\n" + "="*80)
