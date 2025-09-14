import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DoNow from './views/DoNow';
import CalendarView from './views/CalendarView';
import AnalyticsView from './views/AnalyticsView';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<DoNow />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
        </Routes>
      </main>
    </div>
  );
}
