import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';  
import cors from 'cors';
import { execSync } from 'child_process';
import multer from 'multer';
import csvtojson from 'csvtojson';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import rssToJson from 'rss-to-json';
import csvParser from 'csv-parser'

const { parse: parseRSS } = rssToJson;
// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const { Client } = pkg;

const app = express();
const port = 5000;

// Middleware to parse JSON request body with a custom size limit
app.use(bodyParser.json({ limit: '10mb' }));  // Increase payload size limit to 10MB

// Enable CORS
app.use(cors());
// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

client.connect();
// Multer setup for file upload
const upload = multer({ dest: "temp/" });

// Folder paths
const mainFolder = path.join(__dirname, "fol_1");
const refFolder = path.join(__dirname, "ref");
const ref2Folder = path.join(__dirname,"ref2");

// Ensure folders exist
fs.ensureDirSync(mainFolder);
fs.ensureDirSync(refFolder);
fs.ensureDirSync(ref2Folder);

// Function to process CSV and save in chunks
const processCSV = async (filePath, fileName) => {
  const jsonArray = await csvtojson().fromFile(filePath);

  // Extract `url`, `reference`, and `class` fields
  const urls = jsonArray.map((row) => ({
    url: row.url || "",
    reference: row.reference || "N/A",
    class: row.class || "none"
  }));

  // Split data into chunks of 50
  const chunks = [];
  for (let i = 0; i < urls.length; i += 50) {
    chunks.push(urls.slice(i, i + 50));
  }

  // Save chunks
  chunks.forEach((chunk, index) => {
    const chunkName = `${fileName}_${index + 1}.json`;

    // Save to `main` folder (URLs only)
    const mainData = chunk.map((entry) => ({ url: entry.url }));
    fs.writeFileSync(path.join(mainFolder, chunkName), JSON.stringify(mainData, null, 2));

    // Save to `ref` folder (URLs and references)
    const refData = chunk.map((entry) => ({ url: entry.url, reference: entry.reference }));
    fs.writeFileSync(path.join(refFolder, chunkName), JSON.stringify(refData, null, 2));

    // Save to `ref2` folder (URLs, references, and classes)
    const ref2Data = chunk.map((entry) => ({
      url: entry.url,
      reference: entry.reference,
      class: entry.class
    }));
    fs.writeFileSync(path.join(ref2Folder, chunkName), JSON.stringify(ref2Data, null, 2));
  });

  // Clean up uploaded file
  fs.removeSync(filePath);
};


// All-in-one profile upload
app.post('/profile', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = path.parse(file.originalname).name;

    // Process the uploaded CSV file
    await processCSV(file.path, fileName);

    // Execute the scripts in the specified order
    console.log('Starting execution of all scripts...');

   try {
      // 1. Execute empty.js (removes empty JSON entries)
      console.log('Executing empty.js...');
      execSync('node empty.js', { stdio: 'inherit' });
    
      // 2. Execute check.js (checks db for duplicate entries)
      console.log('Executing check.js...');
      execSync('node check.js', { stdio: 'inherit' });

      // 3. Execute main.js (activates scraper, scraps and returns data in CSV)
      console.log('Executing main.js...');
      execSync('node main.js', { stdio: 'inherit' });

      // 4. Execute csv.js (converts CSV to JSON)
      console.log('Executing csv.js...');
      execSync('node csv.js', { stdio: 'inherit' });

      // 5. Execute dead.js (removes failed scraper data)
      console.log('Executing dead.js...');
      execSync('node dead.js', { stdio: 'inherit' });

      // 6. Execute last.js (adds references to not_success.json)
      console.log('Executing last.js...');
      execSync('node last.js', { stdio: 'inherit' });

      // 7. Execute last2.js (adds references)
      console.log('Executing last2.js...');
      execSync('node last2.js', { stdio: 'inherit' });

      // 8. Execute last3.js (adds url to files)
      console.log('Executing last3.js...');
      execSync('node last3.js', { stdio: 'inherit' });

      // 9. Execute refdown.js (download rows of data from ref table)
      console.log('Executing refdown.js...');
      execSync('node refdown.js', { stdio: 'inherit' });
    
      // 10. Execute refup.js (uploads to ref tables)
      console.log('Executing refup.js...');
      execSync('node refup.js', { stdio: 'inherit' });
    
      // 11. Execute clean.js (cleans JSON files for any problems)
      console.log('Executing clean.js...');
      execSync('node clean.js', { stdio: 'inherit' });

      // 12. Execute cc.js (makes final format changes)
      console.log('Executing cc.js...');
      execSync('node cc.js', { stdio: 'inherit' });

      console.log('All scripts executed.');

      // Path to the processed data JSON file
      const filePath = path.join(__dirname, 'fol_4', 'processed_data.json');
     
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'Processed data file not found' });
      }
        
      // Read the JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const profiles = JSON.parse(fileContent);

      if (!Array.isArray(profiles) || profiles.length === 0) {
        return res.status(409).send('Profiles already exist in the database.');
      }
      
    

      // Process the profiles and insert into the database
      await client.query('BEGIN'); // Start transaction
      console.log('uploading to database');
      for (const profileData of profiles) {
        // Insert profile data
        const insertProfileQuery = `
        INSERT INTO profiles (
          linkedin_id, name, city, about, current_company, url, avatar, banner_image, 
          followers, connections, reference_text, email_1, email_2, contact_1, contact_2, contact_3
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
        RETURNING id
        `;

        const profileValues = [
          profileData.linkedin_id,
          profileData.name,
          profileData.city,
          profileData.about,
          profileData.current_company,
          profileData.url,
          profileData.avatar,
          profileData.banner_image,
          profileData.followers,
          profileData.connections,
          profileData.reference,
          profileData.email_1,
          profileData.email_2,
          profileData.contact_1,
          profileData.contact_2,
          profileData.contact_3
        ];


        const result = await client.query(insertProfileQuery, profileValues);
        const profileId = result.rows[0].id;

        // Insert experience data
        const insertExperienceQuery = `
          INSERT INTO experiences (profile_id, title, company, company_id, company_url, company_logo_url, start_date, end_date, description, duration)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        for (let experience of profileData.experience) {
          const experienceValues = [
            profileId,
            experience.title,
            experience.company,
            experience.company_id,
            experience.company_url,
            experience.company_logo_url,
            experience.start_date,
            experience.end_date,
            experience.description,
            experience.duration,
          ];
          await client.query(insertExperienceQuery, experienceValues);
        }

        // Insert education data
        const insertEducationQuery = `
          INSERT INTO education (profile_id, title, institute_name, institute_logo_url, start_year, end_year, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        for (let education of profileData.education) {
          const educationValues = [
            profileId,
            education.title,
            education.institute_name,
            education.institute_logo_url,
            education.start_year,
            education.end_year,
            education.description,
          ];
          await client.query(insertEducationQuery, educationValues);
        }
      }
      
      await client.query('COMMIT'); // Commit transaction
      res.status(200).send('Profiles uploaded and scripts executed successfully');
      // 12. Execute check2.js (re-organising the db for better search)
      console.log('re-organising database');
      execSync('node check2.js', { stdio: 'inherit' });
      console.log('Profiles uploaded and scripts executed successfully');
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback in case of error
      console.error('Error executing scripts:', error);
      return res.status(500).json({ message: 'Error executing scripts.', error: error.message });
    }

  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ message: "Error processing file" });
  }
});



// Delete all files in specified folders
app.post('/del_all', async (req, res) => {
  const folders = ['fol_1', 'fol_2', 'fol_3', 'fol_4', 'ref', 'Zfail_url', 'ref2', 'ref3'];

  try {
    for (const folder of folders) {
      const folderPath = path.join(__dirname, folder);
      const files = await fs.readdir(folderPath);

      // Delete all files in each folder
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        await fs.unlink(filePath); // Async file deletion
      }
    }

    res.status(200).send('Files deleted successfully');
  } catch (error) {
    console.error('Error deleting files:', error);
    res.status(500).send('Error deleting files');
  }
});

// Route to handle fetching dead URLs
app.get("/dead_url", (req, res) => {
  const filePath = path.join(__dirname, "Zfail_url", "not_success.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the file ${filePath}:`, err);
      return res.status(500).send("Error reading the file.");
    }

    try {
      const jsonData = JSON.parse(data);

      // Set response content type to application/json
      res.setHeader("Content-Type", "application/json");
      res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).send("Error parsing JSON.");
    }
  });
});



// Serve the example.csv file
app.get('/sample', (req, res) => {
  const filePath = path.join(__dirname, 'exe', 'example.csv');
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'example.csv', (err) => {
      if (err) {
        res.status(500).send('Error downloading file');
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

// Serve the example.csv file
app.get('/sample2', (req, res) => {
  const filePath = path.join(__dirname, 'exe', 'example2.csv');
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'example2.csv', (err) => {
      if (err) {
        res.status(500).send('Error downloading file');
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

//multipage rss feed
app.get('/rss', async (req, res) => {
  const urls = [
    //'https://www.moneycontrol.com/rss/economy.xml',
    //'https://finance.yahoo.com/rss/',
    //'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',
    'https://www.wired.com/feed/category/business/latest/rss',
    //'https://hnrss.org/frontpage',
    'https://techcrunch.com/category/startups/feed/',
  ];

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const rss = await parseRSS(url);
          return { source: url, rss: rss.items || [] }; // Ensure rss.items exists
        } catch (err) {
          console.error(`Error fetching RSS feed from ${url}:`, err.message);
          return { source: url, rss: [] }; // Return empty array if failed
        }
      })
    );

    // Interleave articles
    const allArticles = results.map((feed) => feed.rss);
    const maxLength = Math.max(...allArticles.map((articles) => articles.length));
    const interleaved = [];

    for (let i = 0; i < maxLength; i++) {
      allArticles.forEach((articles, index) => {
        if (articles[i]) {
          interleaved.push({
            title: articles[i].title,
            link: articles[i].link,
            feedSource: results[index].source, // Add the feed source for context
          });
        }
      });
    }

    res.json(interleaved); // Respond with the interleaved articles
  } catch (err) {
    console.error('Error processing RSS feeds:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

//search system api
app.get('/search', async (req, res) => {
  // Extract the search query parameter (applies to profiles, experiences, and education)
  const { searchQuery = '' } = req.query;

  // Prepare the SQL query text with dynamic table joins for experiences and education
  const queryText = `
    WITH experience_grouped AS (
    SELECT 
        e.profile_id,
        ARRAY_AGG(e.id ORDER BY e.id) AS experience_ids,
        ARRAY_AGG(e.title ORDER BY e.id) AS experience_titles,
        ARRAY_AGG(e.company ORDER BY e.id) AS experience_companies,
        ARRAY_AGG(e.company_id ORDER BY e.id) AS experience_company_ids,
        ARRAY_AGG(e.company_url ORDER BY e.id) AS experience_company_urls,
        ARRAY_AGG(e.company_logo_url ORDER BY e.id) AS experience_company_logos,
        ARRAY_AGG(e.start_date ORDER BY e.id) AS experience_start_dates,
        ARRAY_AGG(e.end_date ORDER BY e.id) AS experience_end_dates,
        ARRAY_AGG(e.description ORDER BY e.id) AS experience_descriptions,
        ARRAY_AGG(e.duration ORDER BY e.id) AS experience_durations
    FROM experiences e
    GROUP BY e.profile_id
), 

education_grouped AS (
    SELECT 
        ed.profile_id,
        ARRAY_AGG(ed.id ORDER BY ed.id) AS education_ids,
        ARRAY_AGG(ed.title ORDER BY ed.id) AS education_titles,
        ARRAY_AGG(ed.institute_name ORDER BY ed.id) AS education_institute_names,
        ARRAY_AGG(ed.institute_logo_url ORDER BY ed.id) AS education_institute_logos,
        ARRAY_AGG(ed.start_year ORDER BY ed.id) AS education_start_years,
        ARRAY_AGG(ed.end_year ORDER BY ed.id) AS education_end_years,
        ARRAY_AGG(ed.description ORDER BY ed.id) AS education_descriptions
    FROM education ed
    GROUP BY ed.profile_id
)

SELECT 
    p.id,
    p.linkedin_id,
    p.name,
    p.city,
    p.about,
    p.current_company,
    p.url,
    p.avatar,
    p.banner_image,
    p.followers,
    p.connections,
    p.email_1,
    p.email_2,
    p.contact_1,
    p.contact_2,
    p.contact_3,
    p.reference_text,

    -- Join pre-grouped experiences
    eg.experience_ids,
    eg.experience_titles,
    eg.experience_companies,
    eg.experience_company_ids,
    eg.experience_company_urls,
    eg.experience_company_logos,
    eg.experience_start_dates,
    eg.experience_end_dates,
    eg.experience_descriptions,
    eg.experience_durations,

    -- Join pre-grouped education
    edg.education_ids,
    edg.education_titles,
    edg.education_institute_names,
    edg.education_institute_logos,
    edg.education_start_years,
    edg.education_end_years,
    edg.education_descriptions

FROM profiles p
LEFT JOIN experience_grouped eg ON eg.profile_id = p.id
LEFT JOIN education_grouped edg ON edg.profile_id = p.id

WHERE 
    p.search_vector @@ plainto_tsquery('english', $1)
    OR EXISTS (SELECT 1 FROM experiences e2 WHERE e2.profile_id = p.id AND e2.search_vector @@ plainto_tsquery('english', $1))
    OR EXISTS (SELECT 1 FROM education ed2 WHERE ed2.profile_id = p.id AND ed2.search_vector @@ plainto_tsquery('english', $1))

ORDER BY 
    p.id;
  `;

  // Prepare the query params for parameterized queries (only using $1)
  const queryParams = [
    `%${searchQuery}%`  // Main search term for all tables (profiles, experiences, education)
  ];

  try {
    // Perform the database query
    const profilesResult = await client.query(queryText, queryParams);

    // Map the results for further processing
    const processedResults = profilesResult.rows.map((profile) => {
      const experiences = profile.experience_ids && profile.experience_ids.length > 0
        ? profile.experience_ids.map((id, index) => ({
            title: profile.experience_titles[index],
            company: profile.experience_companies[index],
            company_url: profile.experience_company_urls[index],
            company_logo_url: profile.experience_company_logos[index],
            start_date: profile.experience_start_dates[index],
            end_date: profile.experience_end_dates[index],
            description: profile.experience_descriptions[index],
            duration: profile.experience_durations[index],
          }))
        : [];

      const education = profile.education_ids && profile.education_ids.length > 0
        ? profile.education_ids.map((id, index) => ({
            title: profile.education_titles[index],
            degree: profile.education_titles[index],  // Assuming titles are degree names
            field: profile.education_descriptions[index], // Assuming description includes field
            url: profile.education_urls ? profile.education_urls[index] : null, // Add a check for education URLs
            start_year: profile.education_start_years[index],
            end_year: profile.education_end_years[index],
            description: profile.education_descriptions[index],
            institute_logo_url: profile.education_institute_logos[index],
          }))
        : [];

      return {
        id: profile.id,
        name: profile.name,
        city: profile.city,
        about: profile.about,
        current_company: profile.current_company,
        url: profile.url,
        avatar: profile.avatar,
        banner_image: profile.banner_image,
        followers: profile.followers,
        connections: profile.connections,
        reference_text: profile.reference_text,  // Added reference_text here
        email_1: profile.email_1,  // Added email_1
        email_2: profile.email_2,  // Added email_2
        contact_1: profile.contact_1,  // Added contact_1
        contact_2: profile.contact_2,  // Added contact_2
        contact_3: profile.contact_3,  // Added contact_3
        experiences: experiences,
        education: education
      };
    });

    // Return the processed search results
    res.status(200).json(processedResults);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).send('Error fetching profiles');
  }
});

// Route to search profiles based on first name, last name, and city and fetch their education and experiences
app.get('/search2', async (req, res) => {
  const { first_name, last_name, city } = req.query;

  try {
    // Query to find profiles based on first name, last name, and city
    const result = await client.query(
      `SELECT * FROM profiles
       WHERE name ILIKE $1 AND name ILIKE $2 AND city ILIKE $3`, 
      [`${first_name}%`, `%${last_name}%`, `%${city}%`]
    );

    const profiles = result.rows; // Extract rows from result

    // If no profiles are found, return an error
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: 'No profiles found' });
    }

    // Fetch education and experiences for the profiles
    const profilesWithDetails = await Promise.all(profiles.map(async (profile) => {
      // Get the education for each profile
      const education = (await client.query(
        'SELECT * FROM education WHERE profile_id = $1',
        [profile.id]
      )).rows;

      // Get the experiences for each profile
      const experiences = (await client.query(
        'SELECT * FROM experiences WHERE profile_id = $1',
        [profile.id]
      )).rows;

      // Return profile with education and experiences
      return {
        ...profile,
        education,
        experiences
      };
    }));

    // Return the profiles along with education and experiences
    return res.json(profilesWithDetails);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error querying the database' });
  }
});


// POST /login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to check if the provided username and password match
    const query = 'SELECT privilege FROM users WHERE username = $1 AND password = $2';
    const { rows } = await client.query(query, [username, password]);

    if (rows.length > 0) {
      // Login successful
      return res.status(200).json({ message: rows[0].privilege });
    }

    // Login failed
    return res.status(401).json({ message: 'invalid login' });
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ message: 'server error' });
  }
});

// Fetch all users
app.get('/dashboard', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add a user
app.post('/dashboard/addUser', async (req, res) => {
  const { username, password, privilege } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO users (username, password, privilege) VALUES ($1, $2, $3) RETURNING *',
      [username, password, privilege]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});

// Handle delete user request
app.delete('/dashboard/deleteUser/:id', async (req, res) => {
  const { id } = req.params; // Get the user ID from the URL parameter
  try {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

//alternate search via refrence
app.get("/front2", async (req, res) => {
  try {
    const { reference } = req.query;

    // Validate input
    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Step 1: Fetch all data from the `search_from_refs` table using reference
    const searchQuery = `
      SELECT * 
      FROM search_from_refs 
      WHERE reference LIKE $1
    `;
    
    const searchResult = await client.query(searchQuery, [`%${reference}%`]);

    if (searchResult.rows.length === 0) {
      return res.status(404).json({ message: "No profiles found for the given reference" });
    }

    // Return the results directly
    res.status(200).json(searchResult.rows);
  } catch (error) {
    console.error("Error in /front2 endpoint:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
});

// Endpoint to fetch suggestions
app.get('/suggest', async (req, res) => {
  const query = 'SELECT reference FROM refs'; // Replace with your table and column names
  try {
    const result = await client.query(query);
    const suggestions = result.rows.map((row) => row.reference); // Extract the 'reference' column
    res.json(suggestions); // Send the suggestions as JSON
  } catch (err) {
    console.error('Error fetching suggestions:', err.stack);
    res.status(500).send('Server Error');
  }
});

// convert csv to json and upload
app.post('/convert', upload.single('csvfile'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }

  const tempFilePath = path.join(__dirname, req.file.path);
  const outputFolderPath = path.join(__dirname, '1_update');
  const outputFilePath = path.join(outputFolderPath, 'output.json');

  if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath);
  }

  const results = [];

  fs.createReadStream(tempFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
          const cleanedData = {};

          for (const key in data) {
              let value = data[key].trim(); // Trim whitespace

              // Convert empty values to null
              if (value === '') {
                  cleanedData[key] = null;
                  continue;
              }

              // Fix scientific notation (e.g., "9.82E+11" to "982000000000")
              if (!isNaN(value) && value.includes('E')) {
                  cleanedData[key] = Number(value).toString();
                  continue;
              }

              // Fix phone numbers: remove invalid characters, ensure proper format
              if (key.toLowerCase().includes('contact')) {
                  cleanedData[key] = value.replace(/[^0-9+]/g, ''); // Remove anything except numbers and '+'
              } else {
                  cleanedData[key] = value;
              }
          }

          results.push(cleanedData);
      })
      .on('end', () => {
          fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');

          // Now execute 1_update_profile.js after processing is complete
          console.log('Executing 1_update_profile.js...');
          execSync('node 1_update_profile.js', { stdio: 'inherit' });
          

          res.json({ message: 'File successfully converted to JSON' });
          
          fs.unlinkSync(tempFilePath);
      })
      .on('error', (err) => {
          console.error('Error processing CSV file:', err);
          res.status(500).json({ error: 'Failed to process CSV file' });
      });
});

app.get('/out-data', async (req, res) => {
  try {
      const outFilePath = path.join(__dirname, '2_update', 'out.json');

      if (!await fs.pathExists(outFilePath)) {
          return res.status(404).json({ error: 'out.json not found' });
      }

      const data = await fs.readJson(outFilePath);
      res.json(data);
  } catch (error) {
      console.error('Error reading out.json:', error);
      res.status(500).json({ error: 'Failed to read out.json' });
  }
});

app.get('/no-out-data', async (req, res) => {
  try {
      const outFilePath = path.join(__dirname, '2_update', 'not_found.json');

      if (!await fs.pathExists(outFilePath)) {
          return res.status(404).json({ error: 'out.json not found' });
      }

      const data = await fs.readJson(outFilePath);
      res.json(data);
  } catch (error) {
      console.error('Error reading out.json:', error);
      res.status(500).json({ error: 'Failed to read out.json' });
  }
});

app.post("/append-records", async (req, res) => {
  const { profileId } = req.body; // Get profile.id from request

  if (!profileId) {
    return res.status(400).json({ success: false, message: "Missing profileId" });
  }

  try {
    // Read out.json
    const outFilePath = path.join(__dirname, "2_update", "out.json");
    const outData = JSON.parse(fs.readFileSync(outFilePath, "utf8"));

    // Find matching record
    const matchingRecord = outData.find((entry) =>
      entry.profiles.some((p) => p.id === profileId)
    );

    if (!matchingRecord) {
      return res.status(404).json({ success: false, message: "Record not found for the given profileId" });
    }

    // Extract required data
    const { email_1, email_2, contact_1, contact_2, contact_3 } = matchingRecord.record;

    // Update database using client instead of pool
    const updateQuery = `
      UPDATE profiles
      SET email_1 = $1, email_2 = $2, contact_1 = $3, contact_2 = $4, contact_3 = $5
      WHERE id = $6;
    `;

    await client.query(updateQuery, [email_1, email_2, contact_1, contact_2, contact_3, profileId]);

    // Remove matching entries from JSON file
    const updatedOutData = outData.filter((entry) =>
      !entry.profiles.some((p) => p.id === profileId)
    );

    // Write updated JSON data back to file
    fs.writeFileSync(outFilePath, JSON.stringify(updatedOutData, null, 2), "utf8");

    res.json({ success: true, message: "Profile updated successfully, and JSON entries deleted!" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ success: false, message: "Error updating profile." });
  }
});

app.post("/update-profile", async (req, res) => {
  console.log("Received request to /update-profile");
  console.log("Request body:", req.body);

  const { id, profile_id, table_name, column_name, new_value } = req.body;

  if (!table_name || !column_name || new_value === undefined) {
    console.log("Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  let query;
  let values;

  try {
    if (table_name === "profiles") {
      // If updating the main profile, use only profile_id
      query = `UPDATE profiles SET ${column_name} = $1 WHERE id = $2 RETURNING *`;
      values = [new_value, profile_id];
    } else if (table_name === "education" || table_name === "experiences") {
      // If updating education or experience, use both id & profile_id
      query = `UPDATE ${table_name} SET ${column_name} = $1 WHERE profile_id = $2 AND id = $3 RETURNING *`;
      values = [new_value, profile_id, id];
    } else {
      console.log("Invalid table name:", table_name);
      return res.status(400).json({ error: "Invalid table name" });
    }

    console.log("Executing query:", query);
    console.log("Query values:", values);

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      console.log(`No record found in ${table_name} for ID:`, id || profile_id);
      return res.status(404).json({ error: "Record not found" });
    }

    //console.log("Update successful:", result.rows[0]);
    res.json({ message: "Update successful", profile: result.rows[0] });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
