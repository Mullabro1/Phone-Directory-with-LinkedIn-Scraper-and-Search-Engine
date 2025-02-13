import React, { useState } from 'react';
import axios from 'axios';

const UploadCsv = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState(''); // Only store the message string
    const [error, setError] = useState('');

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }
        setError('');

        const formData = new FormData();
        formData.append('csvfile', file);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/convert`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Store the message directly
            setMessage(data.message); // Access only the 'message' key
        } catch (err) {
            setError('Upload failed');
        }
    };

    const handleDownloadSample = async () => {
        try {
            // Request to download the sample file
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sample2`, {
                responseType: 'blob',
            });

            // Create a URL for the file to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'example2.csv'); // Set the download filename
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            setError('Error downloading sample file');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[100px] bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-[0px_4px_8px_rgba(0,0,0,0.1)] w-96">
                {/* Download Sample Button */}
                <p className="mb-4 text-center text-gray-800 font-bold">Download Sample csv for use</p>
                <button
                    onClick={handleDownloadSample}
                    className="bg-blue-500 text-white border-2 border-blue-500 p-2 w-full rounded-md mb-4 hover:bg-white hover:text-blue-500 hover:border-blue-500 transition-all"
                >
                    Download Sample
                </button>
                <p className="mb-4 text-center text-gray-800 font-bold">--------------------------------------------------</p>
                {/* File Upload Input */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded p-2 w-full mb-4"
                />
                
                {/* Upload & Convert Button */}
                <button
                    onClick={handleUpload}
                    className="bg-red-500 text-white border-2 border-red-500 p-2 w-full rounded-md hover:bg-white hover:text-red-500 hover:border-red-500 transition-all"
                >
                    update contacts
                </button>
                
                {/* Error Message */}
                {error && <p className="text-red-500 mt-2">{error}</p>}

                {/* Success Message */}
                {message && <p className="mt-4 text-center text-gray-800 font-bold">{message}</p>}
            </div>
        </div>
    );
};

export default UploadCsv;
