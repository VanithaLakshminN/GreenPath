import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Achievements from './pages/Achievements';
import Maps from './pages/Maps';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import InstagramCallback from './pages/InstagramCallback';
import UsernameSetup from './pages/UsernameSetup';
import DataDeletionCallback from './pages/DataDeletionCallback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { AuthProvider } from './pages/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/maps" element={<Maps />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/username-setup" element={<UsernameSetup />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
              <Route path="/auth/instagram/deauthorize" element={<DataDeletionCallback />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;