import { useEffect, useState } from "react";

const OutDataTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/out-data`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const handleAppendRecords = async (profileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/append-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Records appended successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert("Failed to append records.");
      }
    } catch (error) {
      console.error("Error appending records:", error);
      alert("Error appending records.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 pt-40">Profile Records</h1>
      {data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        data.map((entry, index) => (
          <div key={index} className="mb-6 border p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Record</h2>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">First Name</th>
                  <th className="border p-2">Middle Name</th>
                  <th className="border p-2">Last Name</th>
                  <th className="border p-2">Email 1</th>
                  <th className="border p-2">Email 2</th>
                  <th className="border p-2">Contact 1</th>
                  <th className="border p-2">Contact 2</th>
                  <th className="border p-2">Contact 3</th>
                  <th className="border p-2">City</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{entry.record.first_name || "N/A"}</td>
                  <td className="border p-2">{entry.record.middle_name || "N/A"}</td>
                  <td className="border p-2">{entry.record.last_name || "N/A"}</td>
                  <td className="border p-2">{entry.record.email_1 || "N/A"}</td>
                  <td className="border p-2">{entry.record.email_2 || "N/A"}</td>
                  <td className="border p-2">{entry.record.contact_1 || "N/A"}</td>
                  <td className="border p-2">{entry.record.contact_2 || "N/A"}</td>
                  <td className="border p-2">{entry.record.contact_3 || "N/A"}</td>
                  <td className="border p-2">{entry.record.city_and_place || "N/A"}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-md font-semibold mb-2">Related Profiles</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">City</th>
                  <th className="border p-2">Action</th> {/* New column for the button */}
                </tr>
              </thead>
              <tbody>
                {entry.profiles.length > 0 ? (
                  entry.profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="border p-2">{profile.id}</td>
                      <td className="border p-2">{profile.name}</td>
                      <td className="border p-2">{profile.city}</td>
                      <td className="border p-2 text-center">
                        <button 
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                          onClick={() => handleAppendRecords(profile.id)}
                        >
                          Append Records
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border p-2 text-center">
                      No related profiles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default OutDataTable;
