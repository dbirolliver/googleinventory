
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string, onError: (message: string) => void) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onLogin(username, password, (message) => setError(message));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 text-white">
          <h1 className="text-2xl font-bold text-center mb-2 text-cyan-300">Premierlux Dental Clinic</h1>
          <p className="text-center text-gray-300 mb-8 leading-tight">A Smart and Predictive Inventory Management system with AI Forecasting, QR Code tracking, and audit compliance.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. password123"
                className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500/50 text-white font-bold py-3 px-6 rounded-lg border border-blue-400 hover:bg-blue-500/80 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 text-white text-xs">
            <h3 className="font-bold text-center text-gray-300 mb-2">Demo Accounts</h3>
            <p className="text-gray-400 text-center">Use any of these to log in. <br/>(Password for all is: <span className="font-mono text-yellow-300">password123</span>)</p>
            <ul className="mt-3 space-y-1 text-center">
                <li><span className="font-semibold text-gray-200">Admin:</span> <span className="font-mono text-cyan-300">admin</span></li>
                <li><span className="font-semibold text-gray-200">Staff (Downtown Clinic):</span> <span className="font-mono text-cyan-300">maria</span></li>
                <li><span className="font-semibold text-gray-200">Staff (Westside Clinic):</span> <span className="font-mono text-cyan-300">sam</span></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;