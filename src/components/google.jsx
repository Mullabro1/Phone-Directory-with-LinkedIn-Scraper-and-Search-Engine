import React, { useState, useEffect } from 'react';

// Utility function to decode HTML entities
const decodeHtmlEntities = (text) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const GoogleNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated to fetch from the local server
  const newsFeedUrl = 'http://localhost:5000/rss'; // Endpoint for interleaved articles

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(newsFeedUrl);
        if (!response.ok) {
          throw new Error(`Error fetching news: ${response.statusText}`);
        }

        const data = await response.json();
        setNews(data); // Backend returns interleaved articles as a flat array
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Loading state
  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="news-container mt-4 max-h-96 overflow-y-scroll border p-4 rounded-lg shadow-lg">
      {/* Scrollable container */}
      <div className="grid grid-rows-auto gap-4">
        {news.map((item, index) => (
          <div key={index} className="news-card border rounded-lg shadow-lg p-4">
            <div className="news-details">
              {/* Decode HTML entities in the title */}
              <h4 className="text-lg font-semibold">{decodeHtmlEntities(item.title)}</h4>
              <p className="text-sm text-gray-500">
                Source: <span className="font-medium">{item.feedSource}</span>
              </p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="know-more-btn mt-2 inline-block py-1 px-3 bg-red-600 text-white text-center rounded transition-colors duration-300 hover:bg-white hover:text-red-600 border border-red-600"
              >
                Know More
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleNews;
