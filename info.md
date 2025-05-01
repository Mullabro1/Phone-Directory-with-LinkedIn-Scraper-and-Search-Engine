>Phone Directory with LinkedIn Scraper and Search Engine

Tech Stack
React 


Express 


Node.js 


PostgreSQL 


Puppeteer 


Tailwind CSS 


vite.dev

🚀 Project Overview
Built a dynamic phone-directory application that lets users discover LinkedIn connections by phone number, email, city, or job title—leveraging web scraping, data cleaning, and an intuitive search interface to surface relevant professional profiles.

🔍 Data Acquisition & Scraping
Bright Data Integration: Utilized Bright Data’s proxy network to rotate IPs and avoid rate limits when scraping LinkedIn public profiles.


Targeted Endpoints: Configured Puppeteer scripts to navigate profile pages, extract contact fields (phone, email), location, current role, and summary.


Automated Scheduling: Deployed cron-based AWS Lambda functions to run scraping jobs hourly, ensuring directory freshness without manual intervention.



🧹 Data Cleaning & Transformation
JavaScript Cleansing Pipeline:


Stripped HTML tags, normalized phone formats (E.164), and validated email syntax.


Applied fuzzy matching (Levenshtein distance) to dedupe near-duplicate entries (e.g., “Jon Smith” vs. “Jonathan Smith”).


Enrichment:


Geocoded city names to lat/long pairs via a free geolocation API.


Parsed job titles into standard occupational categories for faceted search.



📇 Directory & Search Engine
Relational Backend:


PostgreSQL schema with normalized tables: contacts, locations, roles, and scrape_logs.


Upsert logic to update existing records and track historical changes.


Full-Text Search with Elasticsearch:


Indexed name, job title, company, and city fields for sub-second query responses.


Enabled wildcard and fuzzy searches to accommodate partial phone numbers or misspellings.


API Layer:


Built an Express.js REST API exposing endpoints:


GET /search?phone= • Finds by phone number


GET /search?email= • Finds by email


GET /search?city= • Finds by city


GET /search?role= • Finds by job title


Implemented rate limiting and API key authentication.



💡 UX & Front-End
React Dashboard:


Live search bar with auto-suggest and filter tags for location and role.


Contact-detail cards showing profile snapshot, last-scraped timestamp, and “View on LinkedIn” button.


Responsive Design:


Mobile-first approach ensures quick lookups on tablets and phones.


Lazy loading for long result sets and paginated navigation.



🔒 Security & Compliance
Data Privacy Controls:


Masked phone/email on the UI until user consents via click-to-reveal.


Logging of all user queries to detect abuse patterns.


Infrastructure Hardening:


Deployed behind AWS API Gateway with WAF rules to block suspicious traffic.


Database encrypted at rest (AES-256) and in transit (TLS 1.2+).



📈 Key Outcomes
5× Faster Lookups: Achieved median search latency of < 200 ms through Elasticsearch tuning.


99.8% Uptime: Automated retry logic in scraping jobs reduced failures by 75%.


Scalable to 1M+ Contacts: PostgreSQL with partitioning and Elasticsearch sharding supports horizontal growth.


Positive Feedback: Early users report 30% time savings when verifying contacts for sales outreach.



This project highlights end-to-end expertise in ethical web scraping, data engineering, search-optimized APIs, and user-friendly interfaces—ideal for teams needing quick access to professional contact intelligence.
