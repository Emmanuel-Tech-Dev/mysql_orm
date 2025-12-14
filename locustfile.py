from locust import HttpUser, task, between

class AdminPathsUser(HttpUser):
    # Simulate wait between 1 and 3 seconds between tasks
    wait_time = between(1, 3)
    # Global timeout for all requests to prevent false failures
    network_timeout = 30.0  # seconds

    @task
    def get_admin_paths(self):
        # Replace '/' with your actual API endpoint
        self.client.get("/api/admin_paths/", timeout=30)
