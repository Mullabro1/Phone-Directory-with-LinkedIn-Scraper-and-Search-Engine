import { useEffect, useState } from "react";

const OutDataTable2 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/no-out-data")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 pt-10">Profile Records</h1>
      {data.length === 0 ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
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
            {data.map((entry, index) => (
              <tr key={index}>
                <td className="border p-2">{entry.first_name || "N/A"}</td>
                <td className="border p-2">{entry.middle_name || "N/A"}</td>
                <td className="border p-2">{entry.last_name || "N/A"}</td>
                <td className="border p-2">{entry.email_1 || "N/A"}</td>
                <td className="border p-2">{entry.email_2 || "N/A"}</td>
                <td className="border p-2">{entry.contact_1 || "N/A"}</td>
                <td className="border p-2">{entry.contact_2 || "N/A"}</td>
                <td className="border p-2">{entry.contact_3 || "N/A"}</td>
                <td className="border p-2">{entry.city_and_place || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OutDataTable2;
