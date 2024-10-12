import unittest
from unittest.mock import patch
import requests

BASE_URL = "http://localhost:3000/api"  # Replace with your API base URL


class TestGymAndGymAdminAPI(unittest.TestCase):

    @patch('requests.post')
    def test_create_gym_and_gym_admin(self, mock_post):
        # Mocking response for successful creation
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "id": 1,
            "gymAdmin": {"id": 1}  # Mocking response structure
        }

        # Replace with actual data you want to test
        data = {
            'gymAdminId': 1,
            'gymId': 1
        }

        response = requests.post(f'{BASE_URL}/gymAndGymAdmin', json=data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['gymAdmin']['id'], 1)  # Check if gymAdmin ID matches

    @patch('requests.delete')
    def test_delete_gym_and_gym_admin(self, mock_delete):
        # Mocking response for successful deletion
        mock_delete.return_value.status_code = 204

        gym_and_gym_admin_id = 1  # Replace with existing ID to delete
        response = requests.delete(f'{BASE_URL}/gymAndGymAdmin/{gym_and_gym_admin_id}')

        self.assertEqual(response.status_code, 204)

    @patch('requests.get')
    def test_get_all_gym_and_gym_admins(self, mock_get):
        # Mocking response for fetching all gymAndGymAdmins
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "draw": 1,
            "recordsTotal": 1,
            "recordsFiltered": 1,
            "data": [
                {
                    "id": 1,
                    "gymAdmin": {"id": 1},
                    "gym": {"id": 1}
                }
            ]
        }

        response = requests.get(f'{BASE_URL}/gymAndGymAdmin')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['data']), 1)

    @patch('requests.get')
    def test_get_gym_admins_of_gym(self, mock_get):
        # Mocking response for fetching gymAdmins of a gym
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "username": "admin", "type": "gym_admin"}
        ]

        gym_id = 1  # Replace with existing gym ID
        response = requests.get(f'{BASE_URL}/gymAndGymAdmin/gymAdmins/{gym_id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    @patch('requests.get')
    def test_get_gyms_of_gym_admin(self, mock_get):
        # Mocking response for fetching gyms of a gym admin
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "name": "Gym A"}
        ]

        gym_admin_id = 1  # Replace with existing gym admin ID
        response = requests.get(f'{BASE_URL}/gymAndGymAdmin/gyms/{gym_admin_id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    @patch('requests.post')
    def test_unauthorized_access(self, mock_post):
        # Mocking response for unauthorized access
        mock_post.return_value.status_code = 401

        data = {
            'gymAdminId': 1,
            'gymId': 1
        }

        response = requests.post(f'{BASE_URL}/gymAndGymAdmin', json=data)

        self.assertEqual(response.status_code, 401)


if __name__ == '__main__':
    unittest.main()

