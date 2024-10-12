import unittest
import requests
import json
import random
import string

class TestAPIEndpoints(unittest.TestCase):
    BASE_URL = "http://localhost:3000/api"  # Replace with your actual API base URL
    ADMIN_TOKEN = None
    ADMIN_USERNAME = None
    ADMIN_PASSWORD = None

    @classmethod
    def setUpClass(cls):
        # Generate random admin credentials
        cls.ADMIN_USERNAME = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        cls.ADMIN_PASSWORD = ''.join(random.choices(string.ascii_letters + string.digits, k=12))

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
        cls.ADMIN_TOKEN = login_response.json()["token"]

    def test_01_signup_admin(self):
        data = {
            "username": f"testadmin_{random.randint(1000, 9999)}",
            "password": "testadmin123"
        }
        response = requests.post(f"{self.BASE_URL}/signup/admin", json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Admin user created successfully", response.json()["message"])

    def test_02_signup_admin_invalid(self):
        data = {
            "username": f"testadmin_{random.randint(1000, 9999)}",
            "password": "short"
        }
        response = requests.post(f"{self.BASE_URL}/signup/admin", json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Password must be at least 8 characters long", response.json()["error"])

    def test_03_signup_gym_admin(self):
        data = {
            "username": f"testgymadmin_{random.randint(1000, 9999)}",
            "password": "testgymadmin123",
            "firstName": "Test",
            "lastName": "GymAdmin",
            "email": f"testgymadmin{random.randint(1000, 9999)}@example.com",
            "phone": "1234567890"
        }
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.post(f"{self.BASE_URL}/signup/gymadmin", json=data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Gym admin user created successfully", response.json()["message"])

    def test_04_signup_gym_admin_unauthorized(self):
        data = {
            "username": f"testgymadmin_{random.randint(1000, 9999)}",
            "password": "testgymadmin123",
            "firstName": "Test2"
        }
        response = requests.post(f"{self.BASE_URL}/signup/gymadmin", json=data)
        self.assertEqual(response.status_code, 401)

    def test_05_signup_gym_member(self):
        data = {
            "username": f"testgymmember_{random.randint(1000, 9999)}",
            "password": "testgymmember123",
            "firstName": "Test",
            "lastName": "GymMember",
            "email": f"testgymmember{random.randint(1000, 9999)}@example.com",
            "phone": "9876543210",
            "gymId": 1  # Assuming a gym with ID 1 exists
        }
        response = requests.post(f"{self.BASE_URL}/signup/gymmember", json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Gym member user created successfully", response.json()["message"])

    def test_06_signup_gym_member_invalid(self):
        data = {
            "username": f"testgymmember_{random.randint(1000, 9999)}",
            "password": "short",
            "firstName": "Test2"
        }
        response = requests.post(f"{self.BASE_URL}/signup/gymmember", json=data)
        self.assertEqual(response.status_code, 400)

    def test_07_login_valid(self):
        data = {
            "username": self.ADMIN_USERNAME,
            "password": self.ADMIN_PASSWORD
        }
        response = requests.post(f"{self.BASE_URL}/login", json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.json())

    def test_08_login_invalid(self):
        data = {
            "username": self.ADMIN_USERNAME,
            "password": "wrongpassword"
        }
        response = requests.post(f"{self.BASE_URL}/login", json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid username or password", response.json()["error"])

    def test_09_user_details(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.post(f"{self.BASE_URL}/userDetails", headers=headers)
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        self.assertEqual(user_data["username"], self.ADMIN_USERNAME)
        self.assertNotIn("password", user_data)

if __name__ == "__main__":
    unittest.main()