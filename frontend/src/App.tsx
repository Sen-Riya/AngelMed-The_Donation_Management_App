import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import LifeMembers from './pages/LifeMembers';
import Donations from './pages/Donations';
import Clients from './pages/Clients';
import Distribution from './pages/Distribution';
import Analytics from './pages/Analytics';
import MedDonation from './pages/MedDonation'; 
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/life-members"
            element={
              <ProtectedRoute>
                <LifeMembers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-donation"
            element={
              <ProtectedRoute>
                <MedDonation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/distribution"
            element={
              <ProtectedRoute>
                <Distribution />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;