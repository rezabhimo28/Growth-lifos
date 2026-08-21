import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DailyFocus from "@/pages/DailyFocus";
import GrowthHub from "@/pages/GrowthHub";
import WeeklyReview from "@/pages/WeeklyReview";
import Settings from "@/pages/Settings";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/daily-focus" replace />} />
            <Route path="/daily-focus" element={<DailyFocus />} />
            <Route path="/growth-hub" element={<GrowthHub />} />
            <Route path="/weekly-review" element={<WeeklyReview />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
