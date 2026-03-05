// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';
import Background from './components/Background';
import ClockPage from './pages/ClockPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <BrowserRouter>
      <Background />
      <Routes>
        <Route
          path="/"
          element={<ClockPage settings={settings} />}
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              settings={settings}
              updateSettings={updateSettings}
              resetSettings={resetSettings}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
