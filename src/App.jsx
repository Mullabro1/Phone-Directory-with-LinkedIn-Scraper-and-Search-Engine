import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import LoginComponent from './components/login.jsx';
import ProfileUpload from './components/ProfileUpload.jsx';
import SearchComponent from './components/search.jsx';
import UserManagement from './components/UserManagement.jsx';
import Navbar from './navbar.jsx';
import NextPageButton from './components/next.jsx';
import ListComponent from './components/list.jsx';

// Admin Dashboard Navigation Component
function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Admin Dashboard</h1>
        <div className="flex justify-center items-center gap-5">
          <button 
            className="w-48 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition"
            onClick={() => navigate('/admin/profile')}
          >
            Profile Upload
          </button>
          <button 
            className="w-48 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition"
            onClick={() => navigate('/admin/pass')}
          >
            Password Management
          </button>
        </div>

        <button 
          className="mt-6 py-2 px-6 bg-white text-red-600 border-2 border-red-600 rounded-md shadow-md hover:bg-red-600 hover:text-white transition"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// PinInput Component
const PinInput = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const correctPin = '985621';

  const handleChange = (e) => {
    setPin(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      navigate('/admin/re-pass');  // Navigate to the next page if PIN is correct
    } else {
      setError('Invalid login');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-md">
        <form onSubmit={handleSubmit} className="text-center">
          <h1 className="text-2xl font-bold mb-4">Enter PIN</h1>
          <input
            type="password"
            maxLength="6"
            value={pin}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full text-center text-lg rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 6-digit PIN"
          />
          <button
            type="submit"
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-white hover:text-red-500 border border-red-500 transition"
          >
            Submit
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

// User Dashboard
function UserDashboard() {
  const { username } = useContext(AuthContext);
  const [reference, setReference] = useState(localStorage.getItem('username'));
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // Update `reference` whenever `username` or localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setReference(localStorage.getItem('username'));
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);

    // Clean up the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [username]); // Dependency on username ensures `reference` updates with it

  return (
    <div key={username} className="pt-24 px-4"> {/* pt-24 adds space to the top to avoid overlap with navbar */}
      <SearchComponent isSidebarVisible={isSidebarVisible} setIsSidebarVisible={setIsSidebarVisible}/> {/* Assuming your SearchComponent is already styled */}
     {isSidebarVisible &&  <ListComponent initialReference={reference} />}
    </div>
  );
}

function Base() {
  const { logout } = useContext(AuthContext);
  
  return (
    <div className="base-page flex items-center justify-center h-screen bg-white">
      <div className="text-center p-8 bg-white shadow-lg rounded-md">
        <h1 className="text-2xl font-bold text-black mb-4">Invalid login</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Go back to home
        </button>
      </div>
    </div>
  );
}

function App() {
  const { responseMessage } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for Login if not authenticated */}
          {!responseMessage && (
            <Route path="/" element={
              <>  
                <Navbar />
                <LoginComponent />
              </>
            } />
          )}

          {/* Admin Routes */}
          {responseMessage === 'admin' && (
            <>
              <Route path="/admin" element={
                <>
                  <Navbar />
                  <AdminDashboard />
                </>
              } />
              <Route path="/admin/profile" element={
                <>
                  <Navbar className="fixed top-0 left-0 right-0 p-4 z-50 bg-white shadow-md" />
                  <div className="pt-20"> {/* Add padding-top to avoid overlap with fixed Navbar */}
                    <NextPageButton />
                  </div>
                </>
              } />
              <Route path="/admin/re-profile" element={
                <>
                  <Navbar className="fixed top-0 left-0 right-0 p-4 z-50 bg-white shadow-md" />
                  <div className="pt-20"> {/* Add padding-top to avoid overlap with fixed Navbar */}
                    <ProfileUpload />
                  </div>
                </>
              } />
              <Route path="/admin/pass" element={<><Navbar /> <PinInput /></>} />
              <Route path="/admin/re-pass" element={<><Navbar /> <UserManagement /></>} />
            </>
          )}

          {/* User Routes */}
          {responseMessage === 'user' && <Route path="/user" element={
            <>
              <Navbar />
              <div className="mt-2000"> {/* Adjust this value based on the height of your Navbar */}
                <UserDashboard />
              </div>
            </>
          } />}

          {/* Handle invalid routes */}
          <Route path="*" element={
            <>
              {responseMessage ? <Navigate to={`/${responseMessage}`} /> : <Navigate to="/" />}
              <Base />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
