import unittest
import requests
import json
import random
import string

class TestGymEndpoints(unittest.TestCase):
    BASE_URL = "http://localhost:3000/api"  
    ADMIN_TOKEN = None
    GYM_ADMIN_TOKEN = None
    GYM_MEMBER_TOKEN = None
    TEST_GYM_ID = None

    @classmethod
    def setUpClass(cls):
        # Create admin account and get token
        admin_username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        admin_password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
        admin_data = {"username": admin_username, "password": admin_password}
        requests.post(f"{cls.BASE_URL}/signup/admin", json=admin_data)
        login_response = requests.post(f"{cls.BASE_URL}/login", json=admin_data)
        cls.ADMIN_TOKEN = login_response.json()["token"]

        # Create gym admin account and get token
        gym_admin_data = {
            "username": f"gymadmin_{random.randint(1000, 9999)}",
            "password": "gymadmin123",
            "firstName": "Test",
            "lastName": "GymAdmin",
            "email": f"gymadmin{random.randint(1000, 9999)}@example.com",
            "phone": "1234567890"
        }
        headers = {"Authorization": f"Bearer {cls.ADMIN_TOKEN}"}
        requests.post(f"{cls.BASE_URL}/signup/gymadmin", json=gym_admin_data, headers=headers)
        login_response = requests.post(f"{cls.BASE_URL}/login", json={"username": gym_admin_data["username"], "password": gym_admin_data["password"]})
        cls.GYM_ADMIN_TOKEN = login_response.json()["token"]

        # Create gym member account and get token
        gym_member_data = {
            "username": f"gymmember_{random.randint(1000, 9999)}",
            "password": "gymmember123",
            "firstName": "Test",
            "lastName": "GymMember",
            "email": f"gymmember{random.randint(1000, 9999)}@example.com",
            "phone": "9876543210",
            "gymId": 1  # Assuming a gym with ID 1 exists
        }
        requests.post(f"{cls.BASE_URL}/signup/gymmember", json=gym_member_data)
        login_response = requests.post(f"{cls.BASE_URL}/login", json={"username": gym_member_data["username"], "password": gym_member_data["password"]})
        cls.GYM_MEMBER_TOKEN = login_response.json()["token"]

    def test_01_create_gym(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        gym_data = {
            "name": f"Test Gym {random.randint(1000, 9999)}",
            "address": "123 Test St",
            "city": "Test City",
            "state": "Test State",
            "country": "Test Country",
            "pincode": "123456",
            "phone_number": "1234567890",
            "email": f"testgym{random.randint(1000, 9999)}@example.com",
            "contact_person": "Test Person",
            "currency": "USD",
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        response = requests.post(f"{self.BASE_URL}/gym", headers=headers, json=gym_data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.json()["gym"])
        self.__class__.TEST_GYM_ID = response.json()["gym"]["id"]

    def test_03_get_all_gyms(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.get(f"{self.BASE_URL}/gym", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("data", response.json())
        self.assertIn("meta", response.json())

    def test_04_get_gym_by_id(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.get(f"{self.BASE_URL}/gym/{self.TEST_GYM_ID}", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.TEST_GYM_ID)

    def test_05_update_gym(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        update_data = {
            "name": f"Updated Test Gym {random.randint(1000, 9999)}",
            "email": f"updatedtestgym{random.randint(1000, 9999)}@example.com"
        }
        response = requests.put(f"{self.BASE_URL}/gym/{self.TEST_GYM_ID}", headers=headers, json=update_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], update_data["name"])
        self.assertEqual(response.json()["email"], update_data["email"])

    def test_06_delete_gym(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.delete(f"{self.BASE_URL}/gym/{self.TEST_GYM_ID}", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_07_gym_access_admin(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.get(f"{self.BASE_URL}/gym", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("data", response.json())

    
if __name__ == "__main__":
    unittest.main()
