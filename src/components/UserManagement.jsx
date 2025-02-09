import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', privilege: '' });

  // Fetch user list from server
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/dashboard');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/dashboard/addUser', form);
      setForm({ username: '', password: '', privilege: '' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to add user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/dashboard/deleteUser/${id}`);
      fetchUsers(); // Refresh the user list after deletion
    } catch (error) {
      console.error('Failed to delete user');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-pink-200 to-purple-300 min-h-screen flex flex-col items-center justify-center space-y-8 p-8">
    <h1 className="text-5xl font-bold text-center text-gray-800 drop-shadow-lg">User Management</h1>
  
    <table className="w-full max-w-4xl mx-auto border-collapse rounded-lg shadow-lg overflow-hidden">
      <thead>
        <tr className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg">
          <th className="py-3 px-4">ID</th>
          <th className="py-3 px-4">Username</th>
          <th className="py-3 px-4">Password</th>
          <th className="py-3 px-4">Privilege</th>
          <th className="py-3 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-all duration-300">
              <td className="py-3 px-4">{user.id}</td>
              <td className="py-3 px-4">{user.username}</td>
              <td className="py-3 px-4">{user.password}</td>
              <td className="py-3 px-4">{user.privilege}</td>
              <td className="py-3 px-4 text-center">
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all duration-200"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="py-4 text-center text-gray-500">No users available</td>
          </tr>
        )}
      </tbody>
    </table>
  
    <h1 className="text-3xl font-semibold text-center text-gray-800">Add New User</h1>
    <h2 className="text-sm text-red-500 text-center mt-2 px-6 py-2 font-medium bg-yellow-200 rounded-lg">
      |Warning: make sure to put "admin" or "user" in privileges, any different syntax will lead to error 404|
    </h2>
  
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg mt-4">
      <div>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all duration-300"
        />
      </div>
  
      <div>
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all duration-300"
        />
      </div>
  
      <div>
        <input
          type="text"
          placeholder="Privilege"
          value={form.privilege}
          onChange={(e) => setForm({ ...form, privilege: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all duration-300"
        />
      </div>
  
      <button
        type="submit"
        className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md hover:scale-105 transition-all duration-200"
      >
        Add User
      </button>
    </form>
  </div>
  
  );
};

export default UserManagement;
