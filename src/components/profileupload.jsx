import React, { useState } from "react";
import axios from "axios";

const ProfileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [deadUrls, setDeadUrls] = useState([]); // State to store dead URLs

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file!");
      setStatus("Upload failed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      const response = await axios.post("http://localhost:5000/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
      setStatus("Upload successful");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage(error.response.data); // Profiles already exist
        setStatus("Upload failed: Profiles already exist.");
      } else {
        setMessage("Error uploading file.");
        setStatus("Upload failed");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the dead URLs
  const fetchDeadUrls = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dead_url");
      setDeadUrls(response.data); // Set the fetched dead URLs into the state
    } catch (error) {
      console.error("Error fetching dead URLs:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-black text-2xl font-semibold mb-4">Upload Profile Data</h2>

      {/* File Input */}
      <input
        type="file"
        onChange={handleFileChange}
        accept=".csv"
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`px-6 py-3 rounded-lg border-2 ${
          loading
            ? "bg-gray-300 text-gray-600"
            : "bg-red-600 text-white border-black-600 hover:bg-white-600"
        } transition-all duration-300`}
      >
        {loading ? "Uploading..." : "Upload Profiles"}
      </button>

      <h2 className="text-sm text-red-500 text-center mt-2 px-6 py-2 font-medium bg-yellow-200 rounded-lg">
        |Warning: Maximum links in csv file no more than 500 links|
      </h2>

      {/* Status Message */}
      {status && <p className="mt-4 text-gray-700">{status}</p>}
      {message && <p className="mt-4 text-gray-700">{message}</p>}

      {/* Failed URL Button */}
      <button
        onClick={fetchDeadUrls}
        className="bg-white text-red-500 py-2 px-4 rounded-lg text-lg transition duration-300 ease-in-out transform hover:bg-red-500 hover:text-white border-2 border-red-500 mb-4 mt-4"
      >
        Failed URL
      </button>

      {/* Table to Display Dead URLs */}
      {deadUrls.length > 0 && (
        <table className="min-w-full table-auto mt-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">URL</th>
              <th className="border px-4 py-2">Reference</th>
              <th className="border px-4 py-2">class</th>
            </tr>
          </thead>
          <tbody>
            {deadUrls.map((urlObj, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{urlObj.url}</td>
                <td className="border px-4 py-2">{urlObj.reference}</td>
                <td className="border px-4 py-2">{urlObj.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProfileUpload;
