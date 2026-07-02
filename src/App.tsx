import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { RecordPage } from "@/pages/RecordPage";
import { RecordsPage } from "@/pages/RecordsPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { DownloadPage } from "@/pages/DownloadPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WeightPage } from "@/pages/WeightPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<RecordPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/weight" element={<WeightPage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
