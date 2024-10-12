import unittest
import requests
from unittest.mock import patch

BASE_URL = "http://localhost:3000/api"  # Replace with your API base URL


class TestMembershipPlanController(unittest.TestCase):

    @patch('requests.get')
    def test_get_membership_plan_by_id(self, mock_get):
        # Mocking response for getting a membership plan by ID
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "id": 1,
            "gym_id": 1,
            "plan_name": "Gold Plan",
            "plan_description": "Access to all facilities",
            "duration_type": "months",
            "duration_value": 12,
            "category": "premium"
        }

        plan_id = 1
        response = requests.get(f'{BASE_URL}/gymMembershipPlans/{plan_id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], 1)

    @patch('requests.post')
    def test_create_membership_plan(self, mock_post):
        # Mocking response for creating a membership plan
        mock_post.return_value.status_code = 201
        mock_post.return_value.json.return_value = {
            "id": 2,
            "gym_id": 1,
            "plan_name": "Silver Plan",
            "plan_description": "Basic facilities access",
            "duration_type": "months",
            "duration_value": 6,
            "category": "standard"
        }

        data = {
            "gym_id": 1,
            "plan_name": "Silver Plan",
            "plan_description": "Basic facilities access",
            "duration_type": "months",
            "duration_value": 6,
            "category": "standard"
        }

        response = requests.post(f'{BASE_URL}/gymMembershipPlans', json=data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['id'], 2)

    @patch('requests.get')
    def test_get_membership_plans_by_gym_id(self, mock_get):
        # Mocking response for getting all membership plans by gym ID
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {
                "id": 1,
                "gym_id": 1,
                "plan_name": "Gold Plan",
                "plan_description": "Access to all facilities",
                "duration_type": "months",
                "duration_value": 12,
                "category": "premium"
            },
            {
                "id": 2,
                "gym_id": 1,
                "plan_name": "Silver Plan",
                "plan_description": "Basic facilities access",
                "duration_type": "months",
                "duration_value": 6,
                "category": "standard"
            }
        ]

        gym_id = 1
        response = requests.get(f'{BASE_URL}/gymMembershipPlans/allByGym/{gym_id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    @patch('requests.put')
    def test_update_membership_plan_by_id(self, mock_put):
        # Mocking response for updating a membership plan by ID
        mock_put.return_value.status_code = 200
        mock_put.return_value.json.return_value = {
            "id": 1,
            "gym_id": 1,
            "plan_name": "Gold Plan Updated",
            "plan_description": "Access to all facilities, updated",
            "duration_type": "months",
            "duration_value": 12,
            "category": "premium"
        }

        plan_id = 1
        data = {
            "plan_name": "Gold Plan Updated",
            "plan_description": "Access to all facilities, updated"
        }

        response = requests.put(f'{BASE_URL}/gymMembershipPlans/update/{plan_id}', json=data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['plan_name'], "Gold Plan Updated")

    @patch('requests.delete')
    def test_delete_membership_plan_by_id(self, mock_delete):
        # Mocking response for deleting a membership plan by ID
        mock_delete.return_value.status_code = 204

        plan_id = 2
        response = requests.delete(f'{BASE_URL}/gymMembershipPlans/delete/{plan_id}')

        self.assertEqual(response.status_code, 204)


if __name__ == '__main__':
    unittest.main()

