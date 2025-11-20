import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import SplashScreen from './components/common/SplashScreen';
import DashboardPage from './pages/DashboardPage';
import ConnectionsPage from './pages/ConnectionsPage';
import SchemaPage from './pages/SchemaPage';
import QueryPage from './pages/QueryPage';
import DataExplorerPage from './pages/DataExplorerPage';
import MigrationsPage from './pages/MigrationsPage';
import BackupsPage from './pages/BackupsPage';
import DocumentationPage from './pages/DocumentationPage';
import './styles/App.css';
import './styles/split.css';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionState = JSON.parse(localStorage.getItem('session-state') || '{}');
    if (!sessionState.has_opened_before) {
      localStorage.setItem('session-state', JSON.stringify({ 
        ...sessionState, 
        has_opened_before: true,
        last_active: new Date().toISOString()
      }));
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/schema/:connectionId" element={<SchemaPage />} />
        <Route path="/query/:connectionId" element={<QueryPage />} />
        <Route path="/data-explorer" element={<DataExplorerPage />} />
        <Route path="/migrations" element={<MigrationsPage />} />
        <Route path="/backups" element={<BackupsPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
