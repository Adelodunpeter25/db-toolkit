import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import SplashScreen from './components/common/SplashScreen';
import { Spinner } from './components/common/Spinner';
import './styles/App.css';
import './styles/split.css';

// Lazy load pages to reduce initial bundle size
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const SchemaPage = lazy(() => import('./pages/SchemaPage'));
const QueryPage = lazy(() => import('./pages/QueryPage'));
const DataExplorerPage = lazy(() => import('./pages/DataExplorerPage'));
const MigrationsPage = lazy(() => import('./pages/MigrationsPage'));
const BackupsPage = lazy(() => import('./pages/BackupsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));

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
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
          <span className="ml-2 text-gray-600">Loading page...</span>
        </div>
      }>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/schema/:connectionId" element={<SchemaPage />} />
          <Route path="/query/:connectionId" element={<QueryPage />} />
          <Route path="/data-explorer" element={<DataExplorerPage />} />
          <Route path="/migrations" element={<MigrationsPage />} />
          <Route path="/backups" element={<BackupsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
        </Routes>
      </Suspense>
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
