import React, { useState, useEffect } from "react";

const ListComponent = ({ initialReference }) => {
  const [reference, setReference] = useState(initialReference);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataFound, setDataFound] = useState(false); // New state for tracking data availability
  const [class2, setClass2] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/front2?reference=${reference}`
        );
        const data = await response.json();
        if (response.ok) {
          setProfiles(data);
          setDataFound(data.length > 0); // Set dataFound to true if profiles are found
        } else {
          setDataFound(false); // Set to false if no profiles are returned
        }
      } catch (err) {
        setError("Error fetching data.");
        setDataFound(false); // Set to false in case of an error
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [reference]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Filter profiles based on `class2`
  const filteredProfiles = class2
    ? profiles.filter(
        (profile) => profile.class?.toLowerCase() === class2.toLowerCase()
      )
    : profiles;

  // Group filtered profiles by the first letter of their name
  const groupedProfiles = filteredProfiles.reduce((acc, profile) => {
    const firstLetter = profile.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(profile);
    return acc;
  }, {});

  // No contacts found handling
  if (!dataFound || filteredProfiles.length === 0) {
    return (
      <div className="min-h-screen flex items-start p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">YOUR CONTACTS</h1>
          <div className="filterInput mb-3 flex flex-row justify-center items-center space-x-4">
            {["in person", "references", "social circle", "social media", ""].map(
              (filter, index) => (
                <button
                  key={index}
                  onClick={() => setClass2(filter)}
                  className={`px-4 py-1 rounded-md border ${
                    class2 === filter
                      ? "bg-blue-500 text-white border-transparent"
                      : "bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {filter || "no filter"}
                </button>
              )
            )}
          </div>
          <h2 className="text-red-700 text-center">
            {class2
              ? `No contacts found for "${class2}".`
              : "No contacts found."}
          </h2>
        </div>
      </div>

    );
  }

  return (
    <div className="min-h-screen flex items-start justify-left p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">YOUR CONTACTS</h1>
        <div className="filterInput mb-3 flex flex-row justify-center items-center space-x-4">
          {["in person", "references", "social circle", "social media", ""].map(
            (filter, index) => (
              <button
                key={index}
                onClick={() => setClass2(filter)}
                className={`px-4 py-1 rounded-md border ${
                  class2 === filter
                    ? "bg-blue-500 text-white border-transparent"
                    : "bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                }`}
              >
                {filter || "no filter"}
              </button>
            )
          )}
        </div>
        <div className="space-y-8">
          {Object.keys(groupedProfiles)
            .sort()
            .map((letter) => (
              <div key={letter}>
                <h3 className="text-2xl font-semibold mb-4">{letter}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {groupedProfiles[letter].map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center bg-white rounded-lg shadow-lg p-4 space-x-4"
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">
                          <a
                            href={profile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:text-gray-500"
                          >
                            {profile.name}
                          </a>
                        </h3>
                        <p className="text-gray-500">{profile.city}</p>
                        <p className="text-blue-500">{profile.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ListComponent;
