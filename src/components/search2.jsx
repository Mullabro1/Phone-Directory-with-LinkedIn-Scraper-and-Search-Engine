import { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SearchComponent2 = () => {
  const [searchParams, setSearchParams] = useState({
    first_name: "",
    last_name: "",
    city: "",
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleSearch = async () => {
    setError(null);
    setLoading(true);

    const { first_name, last_name, city } = searchParams;
    const query = `first_name=${first_name}&last_name=${last_name}&city=${city}`;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/search2?${query}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.message || "No profiles found");
        setResults(null);
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated editMode:", editMode);
  }, [editMode]);
  
  const handleEdit = (profileId, tableName, columnName, value, entryId = null) => {
    setEditMode({ profileId, tableName, columnName, entryId });
  
    setUpdatedData(prev => ({
      ...prev,
      [`${profileId}-${tableName}-${columnName}-${entryId || "profile"}`]: value,
    }));
  };
  

  const handleInputChange = (profileId, tableName, columnName, entryId, value) => {
    setUpdatedData((prev) => ({
      ...prev,
      [`${profileId}-${tableName}-${columnName}-${entryId || "profile"}`]: value,
    }));
  };
  

  const handleSave = async (profileId, tableName, columnName, entryId = null) => {
    const key = `${profileId}-${tableName}-${columnName}-${entryId || "profile"}`;
    const newValue = updatedData[key];
    console.log(newValue);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          id: entryId,
          table_name: tableName,
          column_name: columnName,
          new_value: newValue,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setResults((prevResults) =>
        prevResults.map((profile) => {
          if (profile.id === profileId) {
            if (tableName === "education" || tableName === "experiences") {
              return {
                ...profile,
                [tableName]: profile[tableName].map((entry) =>
                  entry.id === entryId ? { ...entry, [columnName]: newValue } : entry
                ),
              };
            }
            return { ...profile, [columnName]: newValue };
          }
          return profile;
        })
      );

      setEditMode(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };
  


  return (
    <div className="flex flex-col items-left justify-left min-h-screen bg-gray-100 pt-40 w-full">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-center text-2xl font-bold mb-4">Search Profile</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-red-600 text-white py-2 px-4 rounded-md shadow-md transition duration-300 
              hover:border-2 hover:border-red-500 hover:shadow-red-500/50 flex items-center justify-center gap-2"
          >
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        {loading && <p className="text-blue-500 text-center mt-4">Searching...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>

      {results && (
        <div className="mt-6 bg-grey-100 p-6 w-full max-w-4xl">
          {results.map((profile) => (
              <div key={profile.id} className="profile-section bg-grey-100 p-6 rounded-lg w-full max-w-4xl">
              <h4 className="text-xl font-bold text-center mb-4">Profile</h4>
              <table className="w-full border-collapse border border-red-500 shadow-md">
                <thead>
                  <tr className="bg-red-500 text-white">
                    {["Name", "City", "Current Company", "Followers", "Connections", "Email 1", "Email 2", "Phone 1", "Phone 2", "Phone 3", "About"].map((heading) => (
                      <th key={heading} className="border border-red-500 p-2 w-[150px]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[
                      ["name", profile.name],
                      ["city", profile.city],
                      ["current_company", profile.current_company],
                      ["followers", profile.followers],
                      ["connections", profile.connections],
                      ["email_1", profile.email_1],
                      ["email_2", profile.email_2],
                      ["contact_1", profile.contact_1],
                      ["contact_2", profile.contact_2],
                      ["contact_3", profile.contact_3],
                      ["about", profile.about]
                    ].map(([key, value]) => (
                      <td key={key} className="border border-red-500 p-2 w-[150px] h-[50px] text-center">
                        {editMode?.profileId === profile.id && editMode.tableName === "profiles" && editMode.columnName === key ? (
                           <input
                           type="text"
                           value={updatedData[`${profile.id}-profiles-${key}-profile`] || ""}
                           onChange={(e) => handleInputChange(profile.id, "profiles", key, "profile", e.target.value)}
                           onBlur={() => handleSave(profile.id, "profiles", key)}
                           className="border p-1 w-full"
                           autoFocus
                         />                         
                        ) : (
                          <>
                            {value}
                            <button onClick={() => handleEdit(profile.id, "profiles", key, value)} className="block mx-auto mt-1">
                              <i className="fa-solid fa-pencil text-red-500 cursor-pointer"></i>
                            </button>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            
              {/* Education Section */}
              <div className="mt-6">
                <h4 className="text-xl font-bold text-center mb-4">Education</h4>
                <table className="w-full border-collapse border border-red-500 shadow-md">
                  <thead>
                    <tr className="bg-red-500 text-white">
                      {["Institution", "Start Year", "End Year"].map((heading) => (
                        <th key={heading} className="border border-red-500 p-2 w-[150px]">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.education.map((edu) => (
                      <tr key={edu.id}>
                        {[
                          ["title", edu.title],
                          ["start_year", edu.start_year],
                          ["end_year", edu.end_year],
                        ].map(([key, value]) => (
                          <td key={key} className="border border-red-500 p-2 w-[150px] h-[50px] text-center">
                            {editMode?.profileId === profile.id &&
                            editMode.tableName === "education" &&
                            editMode.columnName === key &&
                            editMode.entryId === edu.id ? (
                              <input
                              type="text"
                              value={updatedData[`${profile.id}-education-${key}-${edu.id}`] || ""}
                              onChange={(e) => handleInputChange(profile.id, "education", key, edu.id, e.target.value)}
                              onBlur={() => handleSave(profile.id, "education", key, edu.id)}
                              className="border p-1 w-full"
                              autoFocus
                            />                            
                            ) : (
                              <>
                                {value}
                                <button
                                  onClick={() =>
                                    handleEdit(profile.id, "education", key, value, edu.id)
                                  }
                                  className="block mx-auto mt-1"
                                >
                                  <i className="fa-solid fa-pencil text-red-500 cursor-pointer"></i>
                                </button>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            
              {/* Experience Section */}
              <div className="mt-6">
                <h4 className="text-xl font-bold text-center mb-4">Experience</h4>
                <table className="w-full border-collapse border border-red-500 shadow-md">
                  <thead>
                    <tr className="bg-red-500 text-white">
                      {["Title", "Company", "Start Date", "End Date", "Description"].map((heading) => (
                        <th key={heading} className="border border-red-500 p-2 w-[180px]">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.experiences.map((exp) => (
                      <tr key={exp.id}>
                        {[
                          ["title", exp.title],
                          ["company", exp.company],
                          ["start_date", exp.start_date],
                          ["end_date", exp.end_date],
                          ["description", exp.description],
                        ].map(([key, value]) => (
                          <td key={key} className="border border-red-500 p-2 w-[180px] h-[50px] text-center">
                            {editMode?.profileId === profile.id &&
                            editMode.tableName === "experiences" &&
                            editMode.columnName === key &&
                            editMode.entryId === exp.id ? (
                              <input
                                type="text"
                                value={updatedData[`${profile.id}-experiences-${key}-${exp.id}`] || ""}
                                onChange={(e) => handleInputChange(profile.id, "experiences", key, exp.id, e.target.value)}
                                onBlur={() => handleSave(profile.id, "experiences", key, exp.id)}
                                className="border p-1 w-full"
                                autoFocus
                              />
                            ) : (
                              <>
                                {value}
                                <button
                                  onClick={() => handleEdit(profile.id, "experiences", key, value, exp.id)}
                                  className="block mx-auto mt-1"
                                >
                                  <i className="fa-solid fa-pencil text-red-500 cursor-pointer"></i>
                                </button>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-20 mb-20"><strong>-------------------------------------------------------------------------------------------------------------</strong></p>
              </div>
            </div>
                     
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchComponent2;
