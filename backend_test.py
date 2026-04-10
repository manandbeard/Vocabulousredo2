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

    def test_settings_endpoints(self):
        """Test settings endpoints"""
        if not self.student_user:
            self.log("❌ Settings - No student user available")
            return False
        
        # Set authorization header for student
        auth_headers = {"Authorization": f"Bearer {self.student_user.get('token', '')}"}
        
        # Test get settings
        success1, settings = self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200,
            headers=auth_headers
        )
        
        if not success1 or 'name' not in settings:
            return False
        
        # Test update settings (name and theme)
        success2, updated_settings = self.run_test(
            "Update Settings",
            "PATCH",
            "settings",
            200,
            {"name": "Updated Test Name", "theme": "dark"},
            headers=auth_headers
        )
        
        if not success2 or updated_settings.get('theme') != 'dark':
            return False
        
        # Test change password with wrong current password
        success3, _ = self.run_test(
            "Change Password (Wrong Current)",
            "POST",
            "settings/password",
            400,
            {"current_password": "wrongpassword", "new_password": "newpass123"},
            headers=auth_headers
        )
        
        # Test change password with correct current password
        success4, _ = self.run_test(
            "Change Password (Correct)",
            "POST",
            "settings/password",
            200,
            {"current_password": "student123", "new_password": "newpass123"},
            headers=auth_headers
        )
        
        # Change password back
        success5, _ = self.run_test(
            "Change Password Back",
            "POST",
            "settings/password",
            200,
            {"current_password": "newpass123", "new_password": "student123"},
            headers=auth_headers
        )
        
        return success1 and success2 and success3 and success4 and success5

    def test_ai_persona(self):
        """Test AI persona endpoint"""
        if not self.student_user:
            self.log("❌ AI Persona - No student user available")
            return False
        
        success, persona = self.run_test(
            "Student AI Persona",
            "GET",
            f"students/{self.student_user['id']}/persona",
            200
        )
        
        # Check if persona has required fields
        if success and persona:
            required_fields = ['persona_type', 'persona_label', 'grit_score', 'flow_state']
            has_required = all(field in persona for field in required_fields)
            if has_required:
                self.log(f"   Persona: {persona.get('persona_label')} (Grit: {persona.get('grit_score')})")
            return has_required
        
        return False

    def test_auth_with_token(self):
        """Test authentication using token from login response"""
        if not self.student_user or 'token' not in self.student_user:
            self.log("❌ Auth with Token - No token available")
            return False
        
        # Test auth/me with Authorization header
        auth_headers = {"Authorization": f"Bearer {self.student_user['token']}"}
        success, response = self.run_test(
            "Auth Me with Token",
            "GET",
            "auth/me",
            200,
            headers=auth_headers
        )
        
        return success and response.get('id') == self.student_user['id']

    def test_coach_send_message(self):
        """Test AI Study Coach message sending"""
        if not self.student_user:
            self.log("❌ Coach Send Message - No student user available")
            return False
        
        success, response = self.run_test(
            "Coach Send Message",
            "POST",
            "coach/message",
            200,
            {
                "student_id": self.student_user['id'],
                "message": "Can you help me understand mitochondria?",
                "card_context": {
                    "front": "What is the powerhouse of the cell?",
                    "back": "Mitochondria",
                    "hint": "Think about energy production"
                }
            }
        )
        
        if success and 'conversation_id' in response and 'message' in response:
            self.conversation_id = response['conversation_id']
            self.log(f"   Created conversation ID: {self.conversation_id}")
            return True
        return False

    def test_coach_list_conversations(self):
        """Test listing AI Study Coach conversations"""
        if not self.student_user:
            self.log("❌ Coach List Conversations - No student user available")
            return False
        
        success, response = self.run_test(
            "Coach List Conversations",
            "GET",
            f"coach/conversations/{self.student_user['id']}",
            200
        )
        
        return success and isinstance(response, list)

    def test_coach_get_conversation(self):
        """Test getting specific AI Study Coach conversation"""
        if not self.student_user or not hasattr(self, 'conversation_id'):
            self.log("❌ Coach Get Conversation - No student user or conversation ID available")
            return False
        
        success, response = self.run_test(
            "Coach Get Conversation",
            "GET",
            f"coach/conversations/{self.student_user['id']}/{self.conversation_id}",
            200
        )
        
        if success and 'messages' in response and isinstance(response['messages'], list):
            self.log(f"   Found {len(response['messages'])} messages in conversation")
            return True
        return False

    def test_coach_send_followup_message(self):
        """Test sending a follow-up message in existing conversation"""
        if not self.student_user or not hasattr(self, 'conversation_id'):
            self.log("❌ Coach Send Follow-up - No student user or conversation ID available")
            return False
        
        success, response = self.run_test(
            "Coach Send Follow-up Message",
            "POST",
            "coach/message",
            200,
            {
                "student_id": self.student_user['id'],
                "conversation_id": self.conversation_id,
                "message": "Can you create a mnemonic to help me remember this?"
            }
        )
        
        return success and 'message' in response

def main():
    print("🚀 Starting Vocabulous API Tests")
    print("=" * 50)
    
    tester = VocabulousAPITester()
    
    # Core tests + New Feature tests + AI Coach tests
    tests = [
        ("Health Check", tester.test_health_check),
        ("Teacher Login", tester.test_teacher_login),
        ("Student Login", tester.test_student_login),
        ("Auth with Token", tester.test_auth_with_token),
        ("Auth Me", tester.test_auth_me),
        ("Settings Endpoints", tester.test_settings_endpoints),
        ("AI Persona", tester.test_ai_persona),
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
        # AI COACH TESTS
        ("Coach Send Message", tester.test_coach_send_message),
        ("Coach List Conversations", tester.test_coach_list_conversations),
        ("Coach Get Conversation", tester.test_coach_get_conversation),
        ("Coach Send Follow-up Message", tester.test_coach_send_followup_message),
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