import unittest
import requests
import random

class TestAdminSignupAndActions(unittest.TestCase):     
    BASE_URL = "http://localhost:3000/api"  # Replace with your actual API base URL
    ADMIN_TOKEN = None
    ADMIN_USERNAME = "testadmin" + str(random.randint(1, 1000))
    ADMIN_PASSWORD = "TestAdmin@123"
    GYM_ID = None
    GYM_MEMBER_ID = None
    MEMBERSHIP_PLAN_ID = None

    @classmethod
    def setUpClass(cls):
        # Create a new admin account
        admin_data = {
            "username": cls.ADMIN_USERNAME,
            "password": cls.ADMIN_PASSWORD
        }
        response = requests.post(f"{cls.BASE_URL}/signup/admin", json=admin_data)
        if response.status_code != 200:
            raise Exception("Failed to create admin account for testing")

        # Login as the new admin and store the token
        login_response = requests.post(f"{cls.BASE_URL}/login", json=admin_data)
        if login_response.status_code != 200:
            raise Exception("Failed to login as admin for testing")
        cls.ADMIN_TOKEN = login_response.json()["token"]

        # Use the token to delete all data
        headers = {"Authorization": f"Bearer {cls.ADMIN_TOKEN}"}
        response = requests.delete(f"{cls.BASE_URL}/deleteAll", headers=headers)
        print("Deleted all data:", response.json())

        # Signup again to prepare for other test cases
        signup_response = requests.post(f"{cls.BASE_URL}/signup/admin", json=admin_data)
        if signup_response.status_code != 200:
            raise Exception("Failed to signup admin again")

        # Login again to get a new token for further actions
        login_response = requests.post(f"{cls.BASE_URL}/login", json=admin_data)
        if login_response.status_code != 200:
            raise Exception("Failed to login again as admin")
        cls.ADMIN_TOKEN = login_response.json()["token"]

    def test_admin_token(self):
        self.assertIsNotNone(self.ADMIN_TOKEN)
        print("Admin Token:", self.ADMIN_TOKEN)


    def test_create_gym(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        gym_data = {
            "name": "Fitness Hub",
            "address": "123, ABC Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "pincode": "400001",
            "phone_number": "9876543210",
            "email": "info@fitnesshub.com",
            "website": "www.fitnesshub.com",
            "contact_person": "Mr. John Doe",
            "currency": "INR",
            "latitude": 19.0760,
            "longitude": 72.8777
        }

        # Send POST request to create a gym
        response = requests.post(f"{self.BASE_URL}/gym", json=gym_data, headers=headers)
        
        # Assert the response
        print("Create Gym Response:", response.json())
        self.assertEqual(response.status_code, 200)
        self.__class__.GYM_ID = response.json()["gym"]["id"]
        
    def test_create_gym_member(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        gym_member = {
            "username": "jane_smith",
            "password": "Password456",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane.smith@example.com",
            "phone": "9876543210",
            "address": "789, PQR Street",
            "city": "Delhi",
            "state": "Delhi",
            "pincode": "110001",
            "country": "India",
            "dateOfBirth": "1995-05-15",
            "gender": "female",
            "profilePicture": "https://example.com/jane_profile.jpg",
            "emergencyContactName": "John Smith",
            "emergencyContactRelationship": "Spouse",
            "emergencyContactPhone": "9876543211",
            "emergencyContactEmail": "john.smith@example.com",
            "gymId": self.GYM_ID
            }
        
        response = requests.post(f"{self.BASE_URL}/signup/gymmember", json=gym_member, headers=headers)
        print("Create Gym Member Response:", response.json())
        self.assertEqual(response.status_code, 200)
        self.__class__.GYM_MEMBER_ID = response.json()["user"]["id"]  
        
    def test_create_gym_admin(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        gym_admin = {
            "username": "john_doe",
            "password": "Password123",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "phone": "9876543210",
            "address": "456, XYZ Street",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "country": "India",
            "dateOfBirth": "1990-01-01",
            "gender": "male",
            "profilePicture": "https://example.com/profile.jpg",
            "emergencyContactName": "Jane Doe",
            "emergencyContactRelationship": "Spouse",
            "emergencyContactPhone": "9876543211",
            "emergencyContactEmail": "jane.doe@example.com"
            }
        
        response = requests.post(f"{self.BASE_URL}/signup/gymadmin", json=gym_admin, headers=headers)
        print("Create Gym Admin Response:", response.json())
        self.assertEqual(response.status_code, 200)
        self.__class__.GYM_ADMIN_ID = response.json()["user"]["id"]
        
    def test_link_gym_admin_to_gym(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        link_data = {
            "gymAdminId": self.GYM_ADMIN_ID,
            "gymId": self.GYM_ID
            }
        response = requests.post(f"{self.BASE_URL}/gymAndGymAdmin", json=link_data, headers=headers)
        print("Link Gym Admin to Gym Response:", response.json())
        self.assertEqual(response.status_code, 200)
            
    def test_create_membership_plan(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        membership_plan = {
            "gym_id": self.GYM_ID,
            "plan_name": "Monthly Plan",
            "plan_description": "This is a monthly plan",
            "duration_type": "months",
            "duration_value": 1,
            "category": "Regular"
            }
        response = requests.post(f"{self.BASE_URL}/gymMembershipPlans", json=membership_plan, headers=headers)
        print("Create Membership Plan Response:", response.json())
        self.assertEqual(response.status_code, 201)
        self.__class__.MEMBERSHIP_PLAN_ID = response.json()["id"]
        
    def test_create_membership_plan_price(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        membership_plan_price = {
            "membership_plan_id": self.MEMBERSHIP_PLAN_ID,
            "price": 1000,
            "validity_start_date": "2024-06-29",
            "validity_end_date": "2025-06-29",
            "comments": "This is a test price"
            }
        response = requests.post(f"{self.BASE_URL}/membershipPlansPrices", json=membership_plan_price, headers=headers)
        print("Create Membership Plan Price Response:", response.json())
        self.assertEqual(response.status_code, 201)
        members_membership = {
            "gym_member_id": self.GYM_MEMBER_ID,
            "membership_plan_id": self.MEMBERSHIP_PLAN_ID,
            "start_date": "2024-06-29",
            "end_date": "2024-8-29"
            }
        response = requests.post(f"{self.BASE_URL}/membersMemberships", json=members_membership, headers=headers)
        print("Create Members Membership Response:", response.json())
        self.assertEqual(response.status_code, 201)
        
        with open("setup_data.out", "w") as f:
            f.write(f"ADMIN_TOKEN={TestAdminSignupAndActions.ADMIN_TOKEN}\n")
            f.write(f"GYM_ID={TestAdminSignupAndActions.GYM_ID}\n")
            f.write(f"GYM_MEMBER_ID={TestAdminSignupAndActions.GYM_MEMBER_ID}\n")
            f.write(f"GYM_ADMIN_ID={TestAdminSignupAndActions.GYM_ADMIN_ID}\n")
            f.write(f"MEMBERSHIP_PLAN_ID={TestAdminSignupAndActions.MEMBERSHIP_PLAN_ID}\n")

if __name__ == "__main__":
    unittest.main()