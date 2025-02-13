import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // FontAwesome import
import GoogleNews from './google';

const SearchComponent = ({isSidebarVisible,setIsSidebarVisible}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [pos, setPos] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [refre, setRefre] = useState('');
  const [class2 , setClass2] = useState('');

  const [showLocation, setShowLocation] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [showPos, setShowPos] = useState(false);
  const [showSchool, setShowSchool] = useState(false);
  const [showRefre, setShowRefre] = useState(false);

  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters visibility
 

  const [isSidebarVisible2, setIsSidebarVisible2] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [suggestions, setSuggestions] = useState([]); // Filtered suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableSuggestions, setAvailableSuggestions] = useState([]); // Initialize as an empty array

  const handleSuggestionFilter = async (query) => {
    if (query) {
      if (availableSuggestions.length === 0) {
        // Fetch suggestions if not already fetched
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suggest`); // Adjust the URL if needed
          if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
          }
          const data = await response.json();
          setAvailableSuggestions(data); // Populate available suggestions
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          return;
        }
      }

      // Filter suggestions based on the query
      const filtered = availableSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  // Initialize available suggestions when the component is loaded (making the API call)
  const initializeSuggestions = async () => {
    if (availableSuggestions.length === 0) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suggest`); // Adjust URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        setAvailableSuggestions(data); // Populate available suggestions
      } catch (error) {
        console.error('Error fetching suggestions on page load:', error);
      }
    }
  };

  // Call initializeSuggestions when the component is rendered (before user starts typing)
  initializeSuggestions();
  const handleViewProfileClick = (profile) => {
    setSelectedProfile(profile);
    setIsSidebarVisible2(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build the query string based on search parameters for the search endpoint
      let queryString = `${import.meta.env.VITE_API_BASE_URL}/search?`;
      if (name) {
        queryString += `searchQuery=${encodeURIComponent(name)}`;
      }
  
      console.log(queryString); // Log query for debugging

      // Build the query string for the optional front2 endpoint
      let queryString2 = `${import.meta.env.VITE_API_BASE_URL}/front2?`;
      if (name) {
        queryString2 += `reference=${name}`;
      }
  
      console.log(queryString2); // Log query for debugging
      
      // Fetch the search results from the backend
      const response = await fetch(queryString);
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
  
      // Fetch from the front2 endpoint (optional)
      const response2 = await fetch(queryString2);
      const data2 = await response2.ok ? await response2.json() : [];
      
      // Fetch the data from the search endpoint
      const data1 = await response.json();
  
      // Merge the data only if data2 is valid
      const mergeData = (data1, data2) => {
        const mergedMap = new Map();
  
        // Add all objects from data1 to the Map
        data1.forEach((item) => mergedMap.set(item.url, { ...item }));
  
        // Add all objects from data2 to the Map, merging properties if `id` matches
        data2.forEach((item) => {
          const existing = mergedMap.get(item.url) || {};
          mergedMap.set(item.url, {
            ...existing,
            ...item,
            class: existing.class || item.class || "none", // Default to "none" if both are missing
          });
        });
  
        // Convert the Map back to an array
        return Array.from(mergedMap.values());
      };
      let mergedData2;
       // Check if data1 is empty
       if (data1.length <= 20) {
        console.log('No results found in search');

        // We already have data2 from the fetch, so no need to repeat this logic outside
        // We directly use data2 here, no extra fetch or query string needed
        
        // Loop through data2 and perform a search for each name
        const newSearchResults = [];
        console.log("data2:",data2)
        for (const item of data2) {
          const nameFromData2 = item.name;  // Extract the name from each item in data2
          const queryStringForName = `${import.meta.env.VITE_API_BASE_URL}/search?searchQuery=${encodeURIComponent(nameFromData2)}`;

          const searchResponse = await fetch(queryStringForName);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            newSearchResults.push(...searchData);  // Add the search results to the newSearchResults array
          }
        }

        // Now, newSearchResults contains all the profiles found by searching each name in data2
        console.log("New search results based on data2:", newSearchResults);

        // You can now proceed with your logic using the newSearchResults (e.g., merge it later or handle it as needed)
        const data3 = newSearchResults; // Replace data1 with the new search results if needed
        // If data2 is empty, do not merge it
        mergedData2 = mergeData(data3, data2);
        console.log(mergedData2);
      }else{
        // If data2 is empty, do not merge it
        mergedData2 = mergeData(data1, data2);
        console.log(mergedData2);
      }
      const data = mergedData2;

      // Filter the data based on the company and education filters on the frontend
      const filteredData = data.filter((profile) => {
        let isMatch = true; // Assume the profile matches by default

        // Apply location filter
        if (location && profile.city) {
          const locationMatch = profile.city.toLowerCase().includes(location.toLowerCase());
          if (!locationMatch) {
            isMatch = false; // Profile doesn't match the location filter
          }
        }

        // Apply reference filter
        if (refre && profile.reference_text) {
          const refreMatch = profile.reference_text.toLowerCase().includes(refre.toLowerCase());
          if (!refreMatch) {
            isMatch = false; // Profile doesn't match the reference filter
          }
        }

        // Apply company filter
        if (company && profile.experiences) {
          const companyMatch = profile.experiences.some((exp) =>
            exp.company && exp.company.toLowerCase().includes(company.toLowerCase())
          );
          if (!companyMatch) {
            isMatch = false; // Profile doesn't match the company filter
          }
        }

        // Apply position filter
        if (pos && profile.experiences) {
          const posMatch = profile.experiences.some((exp) =>
            exp.title && exp.title.toLowerCase().includes(pos.toLowerCase())
          );
          if (!posMatch) {
            isMatch = false; // Profile doesn't match the position filter
          }
        }

        // Apply education filter
        if (school && profile.education) {
          const schoolMatch = profile.education.some((edu) =>
            edu.title && edu.title.toLowerCase().includes(school.toLowerCase())
          );
          if (!schoolMatch) {
            isMatch = false; // Profile doesn't match the education filter
          }
        }

        // Apply class filter based on button selection
        if (class2) {
          console.log("here is class:", class2);
          const classMatch = profile.class && profile.class.toLowerCase() === class2.toLowerCase();
          if (!classMatch) {
            isMatch = false; // Profile doesn't match the class filter
          }
        }

        return isMatch;
      });

      setFilteredProfiles(filteredData);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message); // Set error message if request fails
      setFilteredProfiles([]); // Clear the profiles in case of an error
    }
  };
  const handleRedirect = (page) => {
    const redirects = {
      "mass mail": "https://amgt.ecovisrkca.com/survey/MassMail",
      "survey": "https://amgt.ecovisrkca.com/survey/Survey",
      "ticketrequest": "https://ticket.ecovisrkca.com/Ticket_Generation"
    };
    window.location.href = redirects[page];
  };
    
   // Toggle function to show/hide sidebar
   const toggleSidebar = () => {
   if (isSidebarVisible === true){ 
    setIsSidebarVisible((prev) => !prev);
   } 
  };
  return (
    <div className="searchContainer">
      <form onSubmit={handleSubmit}>

       {/* Navbar with search bar */}
       <nav className="bg-red-500 w-full h-20 flex items-center justify-between px-6">
          <div className="searchBarContainer mb-4 w-[400px] flex justify-center mx-auto relative">
            <button
              type="button"
              className="bg-white border-2 border-red-700 text-red-700 p-2 rounded-md absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 h-10 transition-colors duration-300 ease-in-out hover:bg-red-500 hover:border-white hover:text-white"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <i className="fas fa-filter"></i>
            </button>

            <input
              type="text"
              placeholder="Search profiles ..."
              value={name}
              onChange={(e) => {
                const inputValue = e.target.value;
                setName(inputValue);

                // Trigger suggestion filtering only if input starts with '@'
                if (inputValue.startsWith('@')) {
                  const query = inputValue.slice(1); // Text after '@'
                  handleSuggestionFilter(query);
                } else {
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              }}
              className="border-2 border-gray-300 p-2 rounded-md w-full pl-12"
            />{showSuggestions && (
              <div className="absolute top-full left-0 w-full border-2 border-gray-300 mt-2 bg-white shadow-lg">
                <ul>
                  {suggestions.length === 0 ? (
                    <li className="p-2 text-gray-500">Not found</li>  
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-red-200 text-red-500 cursor-pointer"
                        onClick={() => {
                          // Update the input with the selected suggestion
                          setName(suggestion);  // Set the suggestion to the input
                          setShowSuggestions(false); // Hide suggestions after selection
                        }}
                      >
                        {suggestion}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            <button
              type="submit"
              onClick={toggleSidebar}
              className="bg-white text-red-500 p-2 rounded-md absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 h-10 border-none transition-all duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            >
              <i className="fas fa-search"></i>
            </button>

          </div>

          {/* Redirect Buttons
          <div className="flex space-x-4 ml-6">
            <button
              onClick={() => handleRedirect('mass mail')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
            >
              <i className="fas fa-envelope text-red-500 mr-2"></i> Mass Mail
            </button>
            <button
              onClick={() => handleRedirect('survey')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
            >
              <i className="fas fa-poll text-blue-500 mr-2"></i> Survey
            </button>
            <button
              onClick={() => handleRedirect('ticketrequest')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
            >
              <i className="fas fa-ticket-alt text-yellow-500 mr-2"></i> Ticket Request
            </button>
          </div> */}
        </nav>

      {/* Content below the navbar */}
      <div className="pt-8 px-4">
        {/* Your content goes here */}
      </div>
        
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "w-300 text-gray-800" : "w-0 text-white"
        } overflow-hidden bg-white  p-4 fixed right-0 top-0 h-full z-50 mt-[20vh]`}
      >
        {/* Sidebar Content */}
        <div className="w-[420px]">
          <h2 className="text-2xl font-bold ml-4 ">How Ecovis Connect works?</h2>
          {/* First iframe (YouTube Video) */}
          <div className="mt-4 ml-4">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/pzpwdBkGVWc?si=EAStc956C01QaKxt"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <h2 className="text-2xl font-bold ml-4 ">
            What’s Going On!
          </h2>

          {/* Google News Component */}
          <div>
            <GoogleNews />
          </div>
        </div>
      </div>

        {/* Filter Section */}
        {showFilters && (
        <div className="filtersSection bg-gray-100 p-4 rounded-md shadow-md mb-4">
          <div className="filterInput mb-3">
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-md w-[500px] flex items-center justify-start"
              onClick={() => setShowLocation((prev) => !prev)}
            >
              <i className="fas fa-filter text-white mr-2"></i>
              {showLocation ? 'Hide Location Filter' : 'Add Location Filter'}
            </button>
            {showLocation && (
              <input
                type="text"
                placeholder="Search by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-2 border-gray-300 p-2 rounded-md mt-2 w-[500px] flex items-center justify-start"
              />
            )}
          </div>

          <div className="filterInput mb-3">
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-md w-[500px] flex items-center justify-start"
              onClick={() => setShowCompany((prev) => !prev)}
            >
              <i className="fas fa-filter text-white mr-2"></i>
              {showCompany ? 'Hide Company Filter' : 'Add Company Filter'}
            </button>
            {showCompany && (
              <input
                type="text"
                placeholder="Search by company..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="border-2 border-gray-300 p-2 rounded-md mt-2 w-[500px] flex items-center justify-start"
              />
            )}
          </div>

          <div className="filterInput mb-3">
            <button
              type="button"
               className="bg-red-500 text-white p-2 rounded-md w-[500px] flex items-center justify-start"
              onClick={() => setShowPos((prev) => !prev)}
            >
              <i className="fas fa-filter text-white mr-2"></i>
              {showPos ? 'Hide Position Filter' : 'Add Position Filter'}
            </button>
            {showPos && (
              <input
                type="text"
                placeholder="Search by job position..."
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="border-2 border-gray-300 p-2 rounded-md mt-2 w-[500px] flex items-center justify-start"
              />
            )}
          </div>

          <div className="filterInput mb-3">
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-md w-[500px] flex items-center justify-start"
              onClick={() => setShowSchool((prev) => !prev)}
            >
              <i className="fas fa-filter text-white mr-2"></i>
              {showSchool ? 'Hide School Filter' : 'Add School Filter'}
            </button>
            {showSchool && (
              <input
                type="text"
                placeholder="Search by school..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="border-2 border-gray-300 p-2 rounded-md mt-2 w-[500px] flex items-center justify-start"
              />
            )}
          </div>

          <div className="filterInput mb-3">
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-md w-[500px] flex items-center justify-start"
              onClick={() => setShowRefre((prev) => !prev)}
            >
              <i className="fas fa-filter text-white mr-2"></i>
              {showRefre ? 'Hide Reference Filter' : 'Add Reference Filter'}
            </button>
            {showRefre && (
              <input
                type="text"
                placeholder="Search by reference..."
                value={refre}
                onChange={(e) => setRefre(e.target.value)}
                className="border-2 border-gray-300 p-2 rounded-md mt-2 w-[500px] flex items-center justify-start"
              />
            )}
          </div>
          <div className="filterInput mb-3 flex flex-row">
            <button
              onClick={() => setClass2('in person')}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-white hover:text-blue-500 hover:border-blue-500 border border-transparent"
            >
              in person
            </button>
            <button
              onClick={() => setClass2('references')}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-white hover:text-blue-500 hover:border-blue-500 border border-transparent"
            >
              references
            </button>
            <button
              onClick={() => setClass2('social circle')}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-white hover:text-blue-500 hover:border-blue-500 border border-transparent"
            >
              social circle
            </button>
            <button
              onClick={() => setClass2('social media')}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-white hover:text-blue-500 hover:border-blue-500 border border-transparent"
            >
              social media
            </button>
            <button
              onClick={() => setClass2('')}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-white hover:text-blue-500 hover:border-red-500 border border-transparent"
            >
              no filter
            </button>
          </div>

        </div>
      )}

      </form>

      {/* Error message */}
      {error && <p className="text-red-500 font-bold mt-2">{error}</p>}

      <div className="searchComponent">
      {/* Displaying the filtered results */}
      {filteredProfiles.length > 0 ? (
        <div className="resultsContainer mt-4">
          <h2 className="text-xl font-bold">Search Results:</h2>
          <h3 className="text-sm text-gray-600">Total results: {filteredProfiles.length}</h3>

          {/* 3-column layout */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="profileItem bg-gray-100 p-4 rounded-md shadow-md w-[300px]">
                {/* Profile Avatar, Name, City */}
                <div className="profilePreview ">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="profileAvatar rounded-full w-24 h-24 mx-auto"
                  />
                  <h3 className="text-lg font-bold text-center mt-2">{profile.name}</h3>
                  <p className="text-center text-gray-600">{profile.city}</p>
                  <p className="text-center text-blue-600">{profile.class}</p>
                  {/* Experience Title if it exists */}
                  {profile.experiences && profile.experiences.length > 0 && (
                    <p className="mt-2 text-red-500 text-center font-semibold">{profile.experiences[0].title}</p>
                  )}

                  {/* View Profile Button */}
                  <button
                    className="viewProfileButton mt-4 w-full py-2 bg-red-600 text-white rounded-md"
                    onClick={() => handleViewProfileClick(profile)}
                  >
                    View Profile
                  </button>
                  {/*  here will be text and of diffent colour box */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="noResults text-start mt-4">

        </div>
      )}

    {/* Sidebar for profile details */}
      {isSidebarVisible2 && selectedProfile && (
        <div className="sidebar fixed right-0 top-0 w-1/3 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto max-h-full">
          <button
            className="closeSidebar text-red-600 font-bold text-xl"
            onClick={() => setIsSidebarVisible2(false)}
          >
            &times; Close
          </button>

          {/* Profile Full Details */}
          <div className="profileDetails mt-4">
            <img
              src={selectedProfile.avatar}
              alt={selectedProfile.name}
              className="profileAvatar rounded-full w-32 h-32 mx-auto"
            />
            <h3 className="text-2xl font-bold text-center mt-2">{selectedProfile.name}</h3>
            <p className="text-center text-gray-600">{selectedProfile.city}</p>
            <p><strong>About:</strong> {selectedProfile.about}</p>
            <p><strong>Current Company:</strong> <a href={selectedProfile.current_company} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {selectedProfile.current_company}</a></p>
            <p>
              <strong>Profile URL:</strong>
              <a href={selectedProfile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                {selectedProfile.url}
              </a>
            </p>
            <p><strong>Followers:</strong> {selectedProfile.followers}</p>
            <p><strong>Connections:</strong> {selectedProfile.connections}</p>
            <p><strong>email:</strong> {selectedProfile.email_1}<strong> : </strong> {selectedProfile.email_2}</p>
            <p><strong>Contact:</strong> {selectedProfile.contact_1}<strong> : </strong> {selectedProfile.contact_2}<strong> : </strong>{selectedProfile.contact_3}</p>
            <p><strong>Reference:</strong> {selectedProfile.reference_text}</p>

            {/* Render Experiences */}
            {selectedProfile.experiences && selectedProfile.experiences.length > 0 && (
              <div className="mt-4">
                <h4 className="text-blue-500 font-semibold">Experiences:</h4>
                <ul>
                  {selectedProfile.experiences.map((exp, index) => (
                    <li key={index}>
                      <p><strong>Title:</strong> {exp.title}</p>
                      <p><strong>Company:</strong> {exp.company}</p>
                      <p><strong>Start Date:</strong> {exp.start_date}</p>
                      <p><strong>End Date:</strong> {exp.end_date}</p>
                      <p><strong>Description:</strong> {exp.description}</p>
                      <p><strong>Duration:</strong> {exp.duration}</p>
                      <p><strong>----------------------------------------------------------</strong></p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render Education */}
            {selectedProfile.education && selectedProfile.education.length > 0 && (
              <div className="mt-4">
                <h4 className="text-blue-500 font-semibold">Education:</h4>
                <ul>
                  {selectedProfile.education.map((edu, index) => (
                    <li key={index}>
                      <p><strong>Institute:</strong> {edu.title}</p>
                      <p><strong>Start Year:</strong> {edu.start_year}</p>
                      <p><strong>End Year:</strong> {edu.end_year}</p>
                      <p><strong>----------------------------------------------------------</strong></p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedProfile.banner_image && (
              <img
                src={selectedProfile.banner_image}
                alt={`${selectedProfile.name}'s banner`}
                className="profileBanner w-full mt-4"
              />
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default SearchComponent;
