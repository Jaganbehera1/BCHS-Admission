import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AdmissionForm } from './components/AdmissionForm';
import { ClerkDashboard } from './components/ClerkDashboard';
import { HeadmasterDashboard } from './components/HeadmasterDashboard';
import { GraduationCap, Users } from 'lucide-react';

function AppContent() {
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (window.location.hash === '#register') {
      setShowRegister(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => {
              setShowRegister(false);
              window.location.hash = '';
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Login
          </button>
        </div>
        <Register />
      </div>
    );
  }

  if (user) {
    if (user.role === 'clerk') {
      return <ClerkDashboard />;
    }
    if (user.role === 'headmaster') {
      return <HeadmasterDashboard />;
    }
  }

  if (showStaffLogin) {
    return (
      <div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => setShowStaffLogin(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Admission Form
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              setShowStaffLogin(false);
              setShowRegister(true);
              window.location.hash = 'register';
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Create Staff Account
          </button>
        </div>
        <Login />
      </div>
    );
  }

  return (
    <div>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowStaffLogin(true)}
          className="flex items-center space-x-2 bg-blue-600 text-yellow-300 px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:text-yellow-200 transition-all"
        >
          <Users className="w-4 h-4" />
          <span>Staff Login</span>
        </button>
      </div>
      <AdmissionForm />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
