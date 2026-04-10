#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class VocabulousAPITester:
    def __init__(self, base_url="https://cdb5af48-8a35-4a83-84fe-427e43eccd45.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.tests_run = 0
        self.tests_passed = 0
        self.teacher_token = None
        self.student_token = None
        self.teacher_user = None
        self.student_user = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = self.session.headers.copy()
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        success, response = self.run_test("Health Check", "GET", "health", 200)
        return success and response.get('status') == 'ok'

    def test_teacher_login(self):
        """Test teacher login"""
        success, response = self.run_test(
            "Teacher Login",
            "POST", 
            "auth/login",
            200,
            {"email": "teacher@vocabulous.app", "password": "teacher123"}
        )
        if success and 'id' in response:
            self.teacher_user = response
            return True
        return False

    def test_student_login(self):
        """Test student login"""
        success, response = self.run_test(
            "Student Login",
            "POST",
            "auth/login", 
            200,
            {"email": "student@vocabulous.app", "password": "student123"}
        )
        if success and 'id' in response:
            self.student_user = response
            return True
        return False

    def test_teacher_analytics(self):
        """Test teacher analytics endpoint"""
        if not self.teacher_user:
            self.log("❌ Teacher Analytics - No teacher user available")
            return False
        
        success, response = self.run_test(
            "Teacher Analytics",
            "GET",
            f"analytics/teacher/{self.teacher_user['id']}",
            200
        )
        return success and 'total_classes' in response

    def test_student_analytics(self):
        """Test student analytics endpoint"""
        if not self.student_user:
            self.log("❌ Student Analytics - No student user available")
            return False
            
        success, response = self.run_test(
            "Student Analytics", 
            "GET",
            f"analytics/student/{self.student_user['id']}",
            200
        )
        return success and 'total_reviews' in response

    def test_classes_list(self):
        """Test classes listing"""
        success, response = self.run_test("Classes List", "GET", "classes", 200)
        return success and isinstance(response, list)

    def test_student_due_cards(self):
        """Test student due cards endpoint"""
        if not self.student_user:
            self.log("❌ Student Due Cards - No student user available")
            return False
            
        success, response = self.run_test(
            "Student Due Cards",
            "GET", 
            f"students/{self.student_user['id']}/due-cards",
            200
        )
        return success and isinstance(response, list)

    def test_student_achievements(self):
        """Test student achievements endpoint"""
        if not self.student_user:
            self.log("❌ Student Achievements - No student user available")
            return False
            
        success, response = self.run_test(
            "Student Achievements",
            "GET",
            f"students/{self.student_user['id']}/achievements", 
            200
        )
        return success and 'earned' in response and 'locked' in response

    def test_student_classes(self):
        """Test student classes endpoint"""
        if not self.student_user:
            self.log("❌ Student Classes - No student user available")
            return False
            
        success, response = self.run_test(
            "Student Classes",
            "GET",
            f"students/{self.student_user['id']}/classes",
            200
        )
        return success and isinstance(response, list)

    def test_decks_list(self):
        """Test decks listing"""
        success, response = self.run_test("Decks List", "GET", "decks", 200)
        return success and isinstance(response, list)

    def test_auth_me(self):
        """Test auth/me endpoint after login"""
        success, response = self.run_test("Auth Me", "GET", "auth/me", 200)
        return success and 'id' in response

    def test_logout(self):
        """Test logout endpoint"""
        success, response = self.run_test("Logout", "POST", "auth/logout", 200)
        return success

def main():
    print("🚀 Starting Vocabulous API Tests")
    print("=" * 50)
    
    tester = VocabulousAPITester()
    
    # Core tests
    tests = [
        ("Health Check", tester.test_health_check),
        ("Teacher Login", tester.test_teacher_login),
        ("Student Login", tester.test_student_login),
        ("Auth Me", tester.test_auth_me),
        ("Teacher Analytics", tester.test_teacher_analytics),
        ("Student Analytics", tester.test_student_analytics),
        ("Classes List", tester.test_classes_list),
        ("Student Due Cards", tester.test_student_due_cards),
        ("Student Achievements", tester.test_student_achievements),
        ("Student Classes", tester.test_student_classes),
        ("Decks List", tester.test_decks_list),
        ("Logout", tester.test_logout),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            tester.log(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())