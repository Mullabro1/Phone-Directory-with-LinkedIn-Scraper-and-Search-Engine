// src/components/NextPageButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NextPageButton = () => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      // Call the Express function to delete files using axios
      const response = await axios.post('http://localhost:5000/del_all');
      
      if (response.status === 200) {
        // Navigate to /admin/re-profile after successful deletion
        navigate('/admin/re-profile');
      } else {
        alert('Error deleting files');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting files');
    }
  };

  const handleDownload = async () => {
    try {
      // Call the Express function to download the example CSV file from localhost:5000
      const response = await axios.get('http://localhost:5000/sample', { responseType: 'blob' });

      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'example.csv'; // The name of the file to download
        link.click();
      } else {
        alert('Error downloading the sample file');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while downloading the sample file');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        {/* Next Page Button */}
        <button
          onClick={handleClick}
          className="bg-red-500 text-white py-2 px-4 rounded-lg text-lg transition duration-300 ease-in-out transform hover:bg-white hover:text-red-500 border-2 border-red-500 mb-4"
        >
          Next Page
        </button>

        {/* Text Below Buttons */}
        <h2 className="text-black text-2xl mb-4">
          Here is an example CSV file, please have a look
        </h2>
        {/* Download Sample Button */}
        <button
          onClick={handleDownload}
          className="bg-white text-red-500 py-2 px-4 rounded-lg text-lg transition duration-300 ease-in-out transform hover:bg-red-500 hover:text-white border-2 border-red-500 mb-4"
        >
          Download Sample
        </button>
      </div>
    </div>
  );
};

export default NextPageButton;
