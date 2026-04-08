import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './Dashboard';
import LoginPage from './LoginPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-bg-orbs">
          <div className="login-orb orb-1" />
          <div className="login-orb orb-2" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="login-logo-icon" style={{ width: 56, height: 56, fontSize: 24 }}>N</div>
          <div className="login-spinner" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
