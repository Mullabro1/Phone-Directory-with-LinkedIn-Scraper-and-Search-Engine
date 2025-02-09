import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext.jsx';

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setResponseMessage, setUsername: setContextUsername } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Immediately save username to localStorage
      localStorage.setItem('username', username);

      const res = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      console.log('Server response:', res); // Debugging

      // Set response message based on server response
      if (setResponseMessage) {
        setResponseMessage(res?.data?.message || 'Invalid login');
      }

      // Save username in AuthContext
      if (setContextUsername) {
        setContextUsername(username); // Save username in AuthContext
      }
      
    } catch (error) {
      console.error('Error during login', error);
      setResponseMessage('Invalid login');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-center items-center p-6">
      <img src="/eco.png" alt="logo" className="mb-6 w-[200px] h-[70px]" />
      <h1 className="text-red-500 text-3xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Track username input
            className="w-full p-3 border-2 border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginComponent;
