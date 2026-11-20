import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">HRMIS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Role: <span className="font-semibold text-gray-900">{user?.role}</span></span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </nav>
      <main className="p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Welcome to Phase 1</h2>
          <p className="text-gray-600">Authentication and RBAC is active.</p>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}