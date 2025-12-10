import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthScreen.css';

// 1. CONFIGURATION: Update this with your live Render backend URL
// NOTE: Using localhost:5000 for local development testing, as requested.
// const RENDER_API_BASE_URL = "https://stealthmate.onrender.com";
const RENDER_API_BASE_URL = "http://localhost:5000" 

// 2. TIER CONFIGURATION
const TIER_DETAILS = [
  { id: 0, name: "Basic Tier (Free)", features: "1 image capture per prompt. Standard AI processing.", price: "Free", duration: 'N/A' },
  { id: 1, name: "Pro Tier", features: "Unlock 2 image captures per prompt. Priority AI processing.", price: "$9.99", duration: 'Monthly' },
//   { id: 2, name: "Elite Tier", features: "Unlimited captures. Fastest AI processing. Dedicated support.", price: "$19.99", duration: 'Monthly' }
];

const AuthScreen = ({ onLoginSuccess }) => {
  // State for UI/Flow
  const [isLoginView, setIsLoginView] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { username, tier, apiKey }

  // State for Form Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');

  // --- Utility Functions ---

  const handleAuthSwitch = () => {
    setIsLoginView(prev => !prev);
    setMessage('');
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setApiKey('');
  };

  // --- API Handlers ---

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !email || !apiKey) {
      return setMessage({ text: 'Please fill in all fields.', type: 'error' });
    }

    setLoading(true);
    setMessage({ text: 'Registering...', type: 'info' });

    try {
      const response = await axios.post(`${RENDER_API_BASE_URL}/register`, {
        username,
        password,
        email, // 🔑 NEW: Send email for registration
        apiKey
      });

      setMessage({ text: response.data.message, type: 'success' });
      clearForm();
      setIsLoginView(true); // Switch to login after successful registration

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Server error. Check console.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return setMessage({ text: 'Please enter username and password.', type: 'error' });
    }

    setLoading(true);
    setMessage({ text: 'Logging in...', type: 'info' });

    try {
      const response = await axios.post(`${RENDER_API_BASE_URL}/login`, {
        username,
        password
      });

      const { apiKey /* , tier */ } = response.data;
      
      // 🔑 CRITICAL CHANGE: Force tier to 0 until payment is integrated.
      // We ignore the tier value from the server for now.
      const FORCED_TIER = 0; 

      // 🔑 Store the user object with the forced Tier 0 status
      const user = { username, apiKey, tier: FORCED_TIER }; 
      localStorage.setItem('currentUser', JSON.stringify(user));

      setCurrentUser(user);
      setMessage({ text: 'Login successful!', type: 'success' });
      
      // Optional: Pass the API key/tier to your main application component
      // onLoginSuccess(user); 

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Server error. Check console.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (tierId, duration) => {
    // 🔑 NEW LOGIC: Prevent server communication and show placeholder message
    setLoading(true);
    
    setMessage({ 
        text: `Upgrade to ${TIER_DETAILS.find(t => t.id === tierId)?.name} is currently disabled. Payment integration coming soon!`, 
        type: 'info' 
    });
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setLoading(false);
  };


  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    clearForm();
    setMessage('');
  };

  // --- Initial Load Effect ---
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Render Functions ---

  const renderAuthForm = () => (
    <div className="form-container">
      <h3>{isLoginView ? 'Login to StealthMate' : 'Create a Free Account'}</h3>
      <div className="switch-auth" onClick={handleAuthSwitch}>
        {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
      </div>

      <form onSubmit={isLoginView ? handleLogin : handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        {!isLoginView && (
          <input
            type="email"
            placeholder="Email (for recovery)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {!isLoginView && (
          <input
            type="text"
            placeholder="Paste Gemini API Key (Required for Sign Up)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
        </button>
      </form>
      {message && <p className={`message ${message.type}`}>{message.text}</p>}
    </div>
  );

  const renderTierSelection = () => (
    <div className="tier-selection-container">
      <div className="header">
        <h2>Welcome, {currentUser.username}!</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <p className="current-tier-info">
        Your current tier: 
        <span className={`tier-badge tier-${currentUser.tier}`}>
          {TIER_DETAILS.find(t => t.id === currentUser.tier)?.name || 'Unknown Tier'}
        </span>
      </p>
      
      <h3>🚀 Upgrade Your Experience</h3>
      
      {/* Renders all tiers with an ID greater than the current tier (which is 0) */}
      {TIER_DETAILS.filter(t => t.id > currentUser.tier).map((tier) => (
        <div 
          key={tier.id} 
          className={`tier-card tier-card-${tier.id}`}
        >
          <div className="tier-header">
            <h4>{tier.name} ({tier.duration})</h4>
            <span className="price">{tier.price}</span>
          </div>
          <p className="features">{tier.features}</p>
          
          {tier.duration !== 'N/A' ? (
              <button 
                  className="purchase-btn"
                  // Calls the placeholder function
                  onClick={() => handlePurchase(tier.id, tier.duration.toLowerCase())}
                  disabled={loading}
              >
                  {loading ? 'Redirecting...' : 'Purchase & Unlock'}
              </button>
          ) : null}

        </div>
      ))}

      {message && <p className={`message ${message.type}`}>{message.text}</p>}
    </div>
  );

  return (
    <div className="auth-screen">
      <div className="container">
        {currentUser ? renderTierSelection() : renderAuthForm()}
      </div>
    </div>
  );
};

export default AuthScreen;