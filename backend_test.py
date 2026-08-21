import requests
import sys
from datetime import datetime, timedelta

BASE_URL = "https://growth-tracker-hub-1.preview.emergentagent.com/api"

class LifeOSTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.created_ids = {
            "goals": [],
            "milestones": [],
            "tasks": [],
            "content": [],
            "fitness": [],
        }

    def log(self, msg, level="INFO"):
        prefix = "✅" if level == "PASS" else "❌" if level == "FAIL" else "🔍"
        print(f"{prefix} {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        self.tests_run += 1
        self.log(f"Testing {name}...", "INFO")
        
        try:
            if method == "GET":
                response = requests.get(url, params=params, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, timeout=10)
            
            if response.status_code == expected_status:
                self.tests_passed += 1
                self.log(f"PASS: {name} - Status {response.status_code}", "PASS")
                return True, response.json() if response.text else {}
            else:
                self.tests_failed += 1
                self.log(f"FAIL: {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"Response: {response.text[:200]}", "FAIL")
                return False, {}
        except Exception as e:
            self.tests_failed += 1
            self.log(f"FAIL: {name} - Error: {str(e)}", "FAIL")
            return False, {}

    def get_today(self):
        return datetime.now().strftime("%Y-%m-%d")
    
    def get_tomorrow(self):
        return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    def get_current_month(self):
        return datetime.now().strftime("%Y-%m")
    
    def get_week_start(self):
        """Get Monday of current week"""
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        return monday.strftime("%Y-%m-%d")

    # ==================== MONTHLY GOALS ====================
    def test_goals(self):
        self.log("\n=== Testing Monthly Goals ===", "INFO")
        month = self.get_current_month()
        
        # Create first goal
        success, goal1 = self.test("Create Goal 1", "POST", "/goals", 200, {
            "title": "Read 4 books",
            "description": "Expand knowledge",
            "month": month,
            "color": "emerald"
        })
        if success:
            self.created_ids["goals"].append(goal1["id"])
        
        # Create second goal
        success, goal2 = self.test("Create Goal 2", "POST", "/goals", 200, {
            "title": "Exercise 3x/week",
            "month": month
        })
        if success:
            self.created_ids["goals"].append(goal2["id"])
        
        # Create third goal
        success, goal3 = self.test("Create Goal 3", "POST", "/goals", 200, {
            "title": "Learn Python",
            "month": month
        })
        if success:
            self.created_ids["goals"].append(goal3["id"])
        
        # Try to create 4th goal - should fail with 400
        self.test("Create Goal 4 (should fail - max 3)", "POST", "/goals", 400, {
            "title": "Fourth goal",
            "month": month
        })
        
        # List goals
        self.test("List Goals", "GET", "/goals", 200, params={"month": month})
        
        # Update goal
        if self.created_ids["goals"]:
            self.test("Update Goal", "PUT", f"/goals/{self.created_ids['goals'][0]}", 200, {
                "title": "Read 5 books (updated)"
            })
        
        # Delete one goal
        if len(self.created_ids["goals"]) > 1:
            self.test("Delete Goal", "DELETE", f"/goals/{self.created_ids['goals'][1]}", 200)

    # ==================== WEEKLY MILESTONES ====================
    def test_milestones(self):
        self.log("\n=== Testing Weekly Milestones ===", "INFO")
        week_start = self.get_week_start()
        
        # Create milestone
        success, milestone = self.test("Create Milestone", "POST", "/milestones", 200, {
            "title": "Complete project proposal",
            "week_start": week_start,
            "goal_id": self.created_ids["goals"][0] if self.created_ids["goals"] else None
        })
        if success:
            self.created_ids["milestones"].append(milestone["id"])
        
        # List milestones
        self.test("List Milestones", "GET", "/milestones", 200, params={"week_start": week_start})
        
        # Toggle completed
        if self.created_ids["milestones"]:
            self.test("Complete Milestone", "PUT", f"/milestones/{self.created_ids['milestones'][0]}", 200, {
                "completed": True
            })
        
        # Delete milestone
        if self.created_ids["milestones"]:
            self.test("Delete Milestone", "DELETE", f"/milestones/{self.created_ids['milestones'][0]}", 200)

    # ==================== DAILY TASKS (1-3-5 RULE) ====================
    def test_tasks(self):
        self.log("\n=== Testing Daily Tasks (1-3-5 Rule) ===", "INFO")
        today = self.get_today()
        
        # Create 1 big_win task
        success, task1 = self.test("Create Big Win Task", "POST", "/tasks", 200, {
            "title": "Complete quarterly review",
            "tier": "big_win",
            "date": today
        })
        if success:
            self.created_ids["tasks"].append(task1["id"])
        
        # Try to create 2nd big_win - should fail
        self.test("Create 2nd Big Win (should fail)", "POST", "/tasks", 400, {
            "title": "Another big win",
            "tier": "big_win",
            "date": today
        })
        
        # Create 3 medium tasks
        for i in range(3):
            success, task = self.test(f"Create Medium Task {i+1}", "POST", "/tasks", 200, {
                "title": f"Medium task {i+1}",
                "tier": "medium",
                "date": today
            })
            if success:
                self.created_ids["tasks"].append(task["id"])
        
        # Try to create 4th medium - should fail
        self.test("Create 4th Medium (should fail)", "POST", "/tasks", 400, {
            "title": "Fourth medium",
            "tier": "medium",
            "date": today
        })
        
        # Create 5 quick tasks
        for i in range(5):
            success, task = self.test(f"Create Quick Task {i+1}", "POST", "/tasks", 200, {
                "title": f"Quick task {i+1}",
                "tier": "quick",
                "date": today
            })
            if success:
                self.created_ids["tasks"].append(task["id"])
        
        # Try to create 6th quick - should fail
        self.test("Create 6th Quick (should fail)", "POST", "/tasks", 400, {
            "title": "Sixth quick",
            "tier": "quick",
            "date": today
        })
        
        # List tasks
        self.test("List Tasks for Today", "GET", "/tasks", 200, params={"date": today})
        
        # Update task - complete it
        if self.created_ids["tasks"]:
            self.test("Complete Task", "PUT", f"/tasks/{self.created_ids['tasks'][0]}", 200, {
                "completed": True
            })
        
        # Update task - add timeblock
        if len(self.created_ids["tasks"]) > 1:
            self.test("Add Timeblock", "PUT", f"/tasks/{self.created_ids['tasks'][1]}", 200, {
                "start_time": "09:00",
                "end_time": "10:30"
            })

    # ==================== ROLLOVER ====================
    def test_rollover(self):
        self.log("\n=== Testing Rollover ===", "INFO")
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Create tasks for yesterday
        rollover_tasks = []
        success, task = self.test("Create Yesterday Task 1", "POST", "/tasks", 200, {
            "title": "Unfinished task 1",
            "tier": "medium",
            "date": yesterday,
            "completed": False
        })
        if success:
            rollover_tasks.append(task["id"])
        
        success, task = self.test("Create Yesterday Task 2", "POST", "/tasks", 200, {
            "title": "Unfinished task 2",
            "tier": "quick",
            "date": yesterday,
            "completed": False
        })
        if success:
            rollover_tasks.append(task["id"])
        
        # Get rollover candidates
        self.test("Get Rollover Candidates", "GET", "/tasks/rollover-candidates", 200, params={"date": yesterday})
        
        # Rollover to tomorrow
        if rollover_tasks:
            self.test("Rollover to Tomorrow", "POST", "/tasks/rollover", 200, {
                "task_ids": [rollover_tasks[0]],
                "target": "tomorrow",
                "from_date": yesterday
            })
        
        # Rollover to backlog
        if len(rollover_tasks) > 1:
            self.test("Rollover to Backlog", "POST", "/tasks/rollover", 200, {
                "task_ids": [rollover_tasks[1]],
                "target": "backlog",
                "from_date": yesterday
            })
        
        # List backlog tasks
        self.test("List Backlog Tasks", "GET", "/tasks", 200, params={"backlog": True})

    # ==================== CONTENT LIBRARY ====================
    def test_content(self):
        self.log("\n=== Testing Content Library ===", "INFO")
        
        # Create book in backlog
        success, book = self.test("Create Book (Backlog)", "POST", "/content", 200, {
            "title": "Atomic Habits",
            "type": "book",
            "status": "BACKLOG",
            "total_units": 320,
            "current_progress": 0
        })
        if success:
            self.created_ids["content"].append(book["id"])
        
        # Create film
        success, film = self.test("Create Film", "POST", "/content", 200, {
            "title": "Inception",
            "type": "film",
            "status": "IN_PROGRESS",
            "total_units": 148,
            "current_progress": 0
        })
        if success:
            self.created_ids["content"].append(film["id"])
        
        # Create podcast
        success, podcast = self.test("Create Podcast", "POST", "/content", 200, {
            "title": "Lex Fridman Podcast",
            "type": "podcast",
            "status": "IN_PROGRESS",
            "total_units": 180,
            "current_progress": 0
        })
        if success:
            self.created_ids["content"].append(podcast["id"])
        
        # List content
        self.test("List All Content", "GET", "/content", 200)
        self.test("List Backlog Content", "GET", "/content", 200, params={"status": "BACKLOG"})
        
        # Update content status
        if self.created_ids["content"]:
            self.test("Update Content Status", "PUT", f"/content/{self.created_ids['content'][0]}", 200, {
                "status": "IN_PROGRESS"
            })

    # ==================== PROGRESS LOGS ====================
    def test_progress_logs(self):
        self.log("\n=== Testing Progress Logs ===", "INFO")
        
        if not self.created_ids["content"]:
            self.log("Skipping progress logs - no content created", "INFO")
            return
        
        content_id = self.created_ids["content"][0]
        
        # Log progress with Active Recall note
        self.test("Log Progress with Note", "POST", f"/content/{content_id}/log", 200, {
            "content_id": content_id,
            "increment": 50,
            "note": "Key insight: Small habits compound over time",
            "date": self.get_today()
        })
        
        # Log more progress
        self.test("Log More Progress", "POST", f"/content/{content_id}/log", 200, {
            "content_id": content_id,
            "increment": 100,
            "note": "Chapter on identity-based habits was powerful"
        })
        
        # List progress logs
        self.test("List All Progress Logs", "GET", "/progress-logs", 200)
        self.test("List Progress for Content", "GET", "/progress-logs", 200, params={"content_id": content_id})
        
        # Complete content by logging remaining progress
        self.test("Complete Content", "POST", f"/content/{content_id}/log", 200, {
            "content_id": content_id,
            "increment": 170,
            "note": "Finished! Great book on habit formation"
        })

    # ==================== FITNESS LOGS ====================
    def test_fitness(self):
        self.log("\n=== Testing Fitness Logs ===", "INFO")
        
        # Create workout with metrics
        success, workout1 = self.test("Log Workout 1", "POST", "/fitness", 200, {
            "activity": "Morning Run",
            "duration_min": 30,
            "metrics": {"distance_km": 5.2},
            "note": "Felt great!",
            "date": self.get_today()
        })
        if success:
            self.created_ids["fitness"].append(workout1["id"])
        
        # Create strength workout
        success, workout2 = self.test("Log Workout 2", "POST", "/fitness", 200, {
            "activity": "Strength Training",
            "duration_min": 45,
            "metrics": {"sets": 4, "reps": 12},
            "note": "Upper body day"
        })
        if success:
            self.created_ids["fitness"].append(workout2["id"])
        
        # List fitness logs
        self.test("List Fitness Logs", "GET", "/fitness", 200)
        
        # Delete fitness log
        if self.created_ids["fitness"]:
            self.test("Delete Fitness Log", "DELETE", f"/fitness/{self.created_ids['fitness'][0]}", 200)

    # ==================== GROWTH DASHBOARD ====================
    def test_growth_dashboard(self):
        self.log("\n=== Testing Growth Dashboard ===", "INFO")
        week_start = self.get_week_start()
        
        self.test("Get Growth Dashboard", "GET", "/dashboard/growth", 200, params={"week_start": week_start})

    # ==================== WEEKLY REVIEW ====================
    def test_weekly_review(self):
        self.log("\n=== Testing Weekly Review ===", "INFO")
        week_start = self.get_week_start()
        
        # Get review (creates if not exists)
        self.test("Get Weekly Review", "GET", "/weekly-review", 200, params={"week_start": week_start})
        
        # Save review progress
        self.test("Save Review Step 1", "POST", "/weekly-review", 200, {
            "week_start": week_start,
            "step": 1,
            "reflections": {
                "wins": "Completed all major tasks",
                "challenges": "Time management",
                "focus": "Better planning"
            }
        })
        
        # Save balance
        self.test("Save Review Step 2", "POST", "/weekly-review", 200, {
            "week_start": week_start,
            "step": 2,
            "balance": {
                "work": 4,
                "energy": 3,
                "balance": 4
            }
        })
        
        # Get summary
        self.test("Get Review Summary", "GET", "/weekly-review/summary", 200, params={"week_start": week_start})
        
        # Get pending tasks
        self.test("Get Pending Tasks", "GET", "/weekly-review/pending-tasks", 200, params={"week_start": week_start})
        
        # Complete review
        self.test("Complete Review", "POST", "/weekly-review", 200, {
            "week_start": week_start,
            "step": 3,
            "completed": True
        })

    # ==================== SETTINGS ====================
    def test_settings(self):
        self.log("\n=== Testing Settings ===", "INFO")
        
        # Get settings
        success, settings = self.test("Get Settings", "GET", "/settings", 200)
        
        # Update settings
        self.test("Update Settings", "PUT", "/settings", 200, {
            "rollover_enabled": True,
            "default_pomodoro": 25,
            "week_start_day": "monday",
            "default_rating_scale": 5,
            "display_name": "Test User"
        })
        
        # Get updated settings
        self.test("Get Updated Settings", "GET", "/settings", 200)

    # ==================== CLEANUP ====================
    def cleanup(self):
        self.log("\n=== Cleanup ===", "INFO")
        
        # Delete created tasks
        for task_id in self.created_ids["tasks"]:
            requests.delete(f"{BASE_URL}/tasks/{task_id}")
        
        # Delete created content
        for content_id in self.created_ids["content"]:
            requests.delete(f"{BASE_URL}/content/{content_id}")
        
        # Delete created fitness
        for fitness_id in self.created_ids["fitness"]:
            requests.delete(f"{BASE_URL}/fitness/{fitness_id}")
        
        # Delete created milestones
        for milestone_id in self.created_ids["milestones"]:
            requests.delete(f"{BASE_URL}/milestones/{milestone_id}")
        
        # Delete created goals
        for goal_id in self.created_ids["goals"]:
            requests.delete(f"{BASE_URL}/goals/{goal_id}")
        
        self.log("Cleanup complete", "INFO")

    def run_all(self):
        self.log("🚀 Starting Personal Growth & LifeOS Backend Tests", "INFO")
        self.log(f"Base URL: {BASE_URL}\n", "INFO")
        
        try:
            # Test health endpoint
            self.test("Health Check", "GET", "/health", 200)
            
            # Run all test suites
            self.test_goals()
            self.test_milestones()
            self.test_tasks()
            self.test_rollover()
            self.test_content()
            self.test_progress_logs()
            self.test_fitness()
            self.test_growth_dashboard()
            self.test_weekly_review()
            self.test_settings()
            
        finally:
            self.cleanup()
        
        # Print summary
        self.log("\n" + "="*60, "INFO")
        self.log(f"📊 Test Summary:", "INFO")
        self.log(f"   Total: {self.tests_run}", "INFO")
        self.log(f"   Passed: {self.tests_passed} ✅", "PASS")
        self.log(f"   Failed: {self.tests_failed} ❌", "FAIL" if self.tests_failed > 0 else "INFO")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%", "INFO")
        self.log("="*60, "INFO")
        
        return 0 if self.tests_failed == 0 else 1

if __name__ == "__main__":
    tester = LifeOSTester()
    sys.exit(tester.run_all())
