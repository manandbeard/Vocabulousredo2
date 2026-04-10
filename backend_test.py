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
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers)
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

    # NEW FEATURE TESTS FOR ITERATION 2
    def test_teacher_heatmap(self):
        """Test teacher heatmap analytics endpoint"""
        if not self.teacher_user:
            self.log("❌ Teacher Heatmap - No teacher user available")
            return False
        
        success, response = self.run_test(
            "Teacher Heatmap",
            "GET",
            f"analytics/teacher/{self.teacher_user['id']}/heatmap",
            200
        )
        return success and 'students' in response and 'dates' in response

    def test_teacher_bottlenecks(self):
        """Test teacher bottlenecks analytics endpoint"""
        if not self.teacher_user:
            self.log("❌ Teacher Bottlenecks - No teacher user available")
            return False
        
        success, response = self.run_test(
            "Teacher Bottlenecks",
            "GET",
            f"analytics/teacher/{self.teacher_user['id']}/bottlenecks",
            200
        )
        return success and 'struggle_cards' in response and 'tag_retention' in response and 'class_overdue' in response

    def test_student_research_decks(self):
        """Test student research decks endpoint"""
        if not self.student_user:
            self.log("❌ Student Research Decks - No student user available")
            return False
        
        success, response = self.run_test(
            "Student Research Decks",
            "GET",
            f"students/{self.student_user['id']}/research-decks",
            200
        )
        return success and isinstance(response, list)

    def test_student_practice_cards(self):
        """Test student practice cards endpoint"""
        if not self.student_user:
            self.log("❌ Student Practice Cards - No student user available")
            return False
        
        # Use deck ID 1 (Cell Biology from seed data)
        success, response = self.run_test(
            "Student Practice Cards",
            "GET",
            f"students/{self.student_user['id']}/practice-cards/1",
            200
        )
        return success and isinstance(response, list)

    def test_join_class_by_code(self):
        """Test joining class by code"""
        if not self.student_user or not self.teacher_user:
            self.log("❌ Join Class by Code - Missing user data")
            return False
        
        # First create a new class as teacher to get a valid class code
        success_create, new_class = self.run_test(
            "Create Test Class for Join",
            "POST",
            "classes",
            200,
            {
                "name": "Test Join Class",
                "description": "For testing join functionality",
                "subject": "Test",
                "teacher_id": self.teacher_user['id']
            }
        )
        
        if not success_create or 'class_code' not in new_class:
            self.log("❌ Failed to create test class or get class code")
            return False
        
        test_class_code = new_class['class_code']
        self.log(f"Created test class with code: {test_class_code}")
        
        # Test with invalid code first
        success_invalid, response = self.run_test(
            "Join Class by Code (Invalid)",
            "POST",
            "classes/join",
            404,
            {"class_code": "INVALID"}
        )
        
        # Test with valid code
        success_valid, response_valid = self.run_test(
            "Join Class by Code (Valid)",
            "POST",
            "classes/join",
            200,
            {"class_code": test_class_code}
        )
        
        # Test joining again (should return "Already enrolled")
        success_already, response_already = self.run_test(
            "Join Class by Code (Already Enrolled)",
            "POST",
            "classes/join",
            200,
            {"class_code": test_class_code}
        )
        
        return (success_invalid and success_valid and success_already and 
                'message' in response_valid and 'message' in response_already)

    def test_deck_cards_crud(self):
        """Test deck cards CRUD operations"""
        if not self.teacher_user:
            self.log("❌ Deck Cards CRUD - No teacher user available")
            return False
        
        # Get cards from deck 1
        success1, cards = self.run_test(
            "Get Deck Cards",
            "GET",
            "decks/1/cards",
            200
        )
        
        if not success1 or not isinstance(cards, list) or len(cards) == 0:
            self.log("❌ No cards found in deck 1")
            return False
        
        # Create a new card
        success2, new_card = self.run_test(
            "Create Card",
            "POST",
            "decks/1/cards",
            200,
            {
                "front": "Test Question",
                "back": "Test Answer", 
                "hint": "Test Hint",
                "tags": ["test", "api"]
            }
        )
        
        if not success2 or 'id' not in new_card:
            return False
        
        card_id = new_card['id']
        
        # Update the card
        success3, updated_card = self.run_test(
            "Update Card",
            "PATCH",
            f"cards/{card_id}",
            200,
            {
                "front": "Updated Test Question",
                "back": "Updated Test Answer",
                "hint": "Updated Test Hint",
                "tags": ["updated", "test"]
            }
        )
        
        # Delete the card
        success4, _ = self.run_test(
            "Delete Card",
            "DELETE",
            f"cards/{card_id}",
            200
        )
        
        return success1 and success2 and success3 and success4

    def test_blurting_session(self):
        """Test blurting session creation"""
        if not self.student_user:
            self.log("❌ Blurting Session - No student user available")
            return False
        
        success, response = self.run_test(
            "Create Blurting Session",
            "POST",
            "blurting-sessions",
            200,
            {
                "student_id": self.student_user['id'],
                "deck_id": 1,
                "content": "Mitochondria is the powerhouse of the cell. DNA contains genetic information. Cells have membranes that control what enters and exits."
            }
        )
        
        if not success or 'coverage' not in response:
            return False
        
        # Test getting blurting sessions
        success2, sessions = self.run_test(
            "Get Blurting Sessions",
            "GET",
            f"students/{self.student_user['id']}/blurting-sessions",
            200
        )
        
        return success and success2 and isinstance(sessions, list)

def main():
    print("🚀 Starting Vocabulous API Tests")
    print("=" * 50)
    
    tester = VocabulousAPITester()
    
    # Core tests + New Feature tests
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
        # NEW FEATURE TESTS
        ("Teacher Heatmap", tester.test_teacher_heatmap),
        ("Teacher Bottlenecks", tester.test_teacher_bottlenecks),
        ("Student Research Decks", tester.test_student_research_decks),
        ("Student Practice Cards", tester.test_student_practice_cards),
        ("Join Class by Code", tester.test_join_class_by_code),
        ("Deck Cards CRUD", tester.test_deck_cards_crud),
        ("Blurting Session", tester.test_blurting_session),
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