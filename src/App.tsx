import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { KidsDashboard } from './components/kids/KidsDashboard';
import { AdminPanel } from './components/admin/AdminPanel';

function AppContent() {
  const { isAdminMode } = useApp();

  return (
    <Layout>
      {isAdminMode ? <AdminPanel /> : <KidsDashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
