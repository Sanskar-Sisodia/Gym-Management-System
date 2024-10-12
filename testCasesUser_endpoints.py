import unittest
import requests
import json
import random
import string

class TestUserController(unittest.TestCase):
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

    def test_01_get_all_users(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        response = requests.get(f"{self.BASE_URL}/users", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json()["data"], list)

    def test_02_get_user_by_id(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        # Assuming there is at least one user created, get the first user
        response = requests.get(f"{self.BASE_URL}/users", headers=headers)
        first_user = response.json()["data"][0]
        user_id = first_user["id"]

        # Fetch the user by ID
        response = requests.get(f"{self.BASE_URL}/users/{user_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], user_id)

    def test_03_get_user_by_invalid_id(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        # Assuming 99999 is an invalid user ID
        response = requests.get(f"{self.BASE_URL}/users/99999", headers=headers)
        self.assertEqual(response.status_code, 404)

    def test_04_update_user(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        # Assuming there is at least one user created, get the first user
        response = requests.get(f"{self.BASE_URL}/users", headers=headers)
        first_user = response.json()["data"][0]
        user_id = first_user["id"]

        # Update the user's first name
        update_data = {
            "firstName": "UpdatedName"
        }
        response = requests.put(f"{self.BASE_URL}/users/{user_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["firstName"], "UpdatedName")

    def test_05_update_user_invalid(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        # Assuming 99999 is an invalid user ID
        update_data = {
            "firstName": "UpdatedName"
        }
        response = requests.put(f"{self.BASE_URL}/users/99999", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 404)

    # def test_06_delete_user(self):
    #     headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
    #     # Create a new user to delete
    #     new_user_data = {
    #         "username": f"testuser_{random.randint(1000, 9999)}",
    #         "password": "testuser123",
    #         "firstName": "Test",
    #         "lastName": "User",
    #         "email": f"testuser{random.randint(1000, 9999)}@example.com",
    #         "phone": "1234567890",
    #         "gymId": 8  # Assuming a gym with ID 1 exists
    #     }
    #     response = requests.post(f"{self.BASE_URL}/signup/gymmember", json=new_user_data, headers=headers)
    #     new_user_id = response.json().get("user", {}).get("id")
        
    #     # Delete the new user
    #     response = requests.delete(f"{self.BASE_URL}/users/{new_user_id}", headers=headers)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertIn("User deleted successfully", response.json()["message"])

    def test_07_delete_user_invalid(self):
        headers = {"Authorization": f"Bearer {self.ADMIN_TOKEN}"}
        # Assuming 99999 is an invalid user ID
        response = requests.delete(f"{self.BASE_URL}/users/99999", headers=headers)
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()
