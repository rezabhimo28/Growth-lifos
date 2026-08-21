import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

// ------------------------- Goals -------------------------
export const getGoals = (month) => client.get("/goals", { params: { month } }).then((r) => r.data);
export const createGoal = (data) => client.post("/goals", data).then((r) => r.data);
export const updateGoal = (id, data) => client.put(`/goals/${id}`, data).then((r) => r.data);
export const deleteGoal = (id) => client.delete(`/goals/${id}`).then((r) => r.data);

// ------------------------- Milestones -------------------------
export const getMilestones = (week_start) =>
  client.get("/milestones", { params: { week_start } }).then((r) => r.data);
export const createMilestone = (data) => client.post("/milestones", data).then((r) => r.data);
export const updateMilestone = (id, data) => client.put(`/milestones/${id}`, data).then((r) => r.data);
export const deleteMilestone = (id) => client.delete(`/milestones/${id}`).then((r) => r.data);

// ------------------------- Tasks -------------------------
export const getTasks = (date) => client.get("/tasks", { params: { date } }).then((r) => r.data);
export const getBacklogTasks = () => client.get("/tasks", { params: { backlog: true } }).then((r) => r.data);
export const createTask = (data) => client.post("/tasks", data).then((r) => r.data);
export const updateTask = (id, data) => client.put(`/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id) => client.delete(`/tasks/${id}`).then((r) => r.data);
export const getRolloverCandidates = (date) =>
  client.get("/tasks/rollover-candidates", { params: { date } }).then((r) => r.data);
export const rolloverTasks = (data) => client.post("/tasks/rollover", data).then((r) => r.data);

// ------------------------- Content -------------------------
export const getContent = (params = {}) => client.get("/content", { params }).then((r) => r.data);
export const createContent = (data) => client.post("/content", data).then((r) => r.data);
export const updateContent = (id, data) => client.put(`/content/${id}`, data).then((r) => r.data);
export const deleteContent = (id) => client.delete(`/content/${id}`).then((r) => r.data);
export const logProgress = (id, data) => client.post(`/content/${id}/log`, data).then((r) => r.data);
export const getProgressLogs = (params = {}) =>
  client.get("/progress-logs", { params }).then((r) => r.data);

// ------------------------- Fitness -------------------------
export const getFitness = () => client.get("/fitness").then((r) => r.data);
export const createFitness = (data) => client.post("/fitness", data).then((r) => r.data);
export const deleteFitness = (id) => client.delete(`/fitness/${id}`).then((r) => r.data);

// ------------------------- Dashboard -------------------------
export const getGrowthDashboard = (week_start) =>
  client.get("/dashboard/growth", { params: { week_start } }).then((r) => r.data);

// ------------------------- Weekly Review -------------------------
export const getWeeklyReview = (week_start) =>
  client.get("/weekly-review", { params: { week_start } }).then((r) => r.data);
export const saveWeeklyReview = (data) => client.post("/weekly-review", data).then((r) => r.data);
export const getReviewSummary = (week_start) =>
  client.get("/weekly-review/summary", { params: { week_start } }).then((r) => r.data);
export const getPendingTasks = (week_start) =>
  client.get("/weekly-review/pending-tasks", { params: { week_start } }).then((r) => r.data);

// ------------------------- Settings -------------------------
export const getSettings = () => client.get("/settings").then((r) => r.data);
export const updateSettings = (data) => client.put("/settings", data).then((r) => r.data);

export default client;
