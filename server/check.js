import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import pkg from 'pg'; // Keeping your import pattern
import cors from 'cors'; // Importing CORS
import { fileURLToPath } from 'url'; // Import to handle module URLs

const { Client } = pkg;

const app = express();

// Deriving __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url); // Convert module URL to filename
const __dirname = path.dirname(__filename); // Get directory name from filename

// Middleware for parsing JSON request body (not used in this script directly)
app.use(bodyParser.json({ limit: '10mb' }));

// Enable CORS (not needed in this specific script but kept for future use)
app.use(cors());

// PostgreSQL client setup (Only for DB access)
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

// Connect to PostgreSQL database
client.connect();

// Function to read a JSON file
const readJsonFile = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Error reading JSON file at ${filePath}`, err);
    return [];
  }
};

// Function to write to a JSON file
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to JSON file at ${filePath}`, err);
  }
};

// Function to fetch URLs from the database
const fetchUrlsFromDb = async () => {
  try {
    const result = await client.query('SELECT url FROM profiles');
    return result.rows.map(row => row.url);
  } catch (err) {
    console.error("Error fetching data from DB", err);
    return [];
  }
};

// Function to get all input JSON files from a folder
const getJsonFilePathsFromFolder = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  // Filter out non-JSON files
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.error(`No JSON files found in the ${folderPath} folder.`);
    process.exit(1); // Exit if no files are found
  }
  return jsonFiles.map(file => path.join(folderPath, file)); // Return full paths of all JSON files
};

// Main function to compare URLs and update the input files
const compareUrlsAndUpdateFiles = async () => {
  try {
    // Fetch URLs from the database once (you can optimize by caching if necessary)
    const dbUrls = await fetchUrlsFromDb();

    // Process files in fol_1 folder
    const fol1JsonFilePaths = getJsonFilePathsFromFolder(path.join(__dirname, 'fol_1'));
    for (const fol1FilePath of fol1JsonFilePaths) {
      console.log(`Processing file in fol_1: ${fol1FilePath}`);

      // Read the content of the input JSON file
      const inputUrls = readJsonFile(fol1FilePath);

      // Separate the matched and remaining URLs
      const matchedUrls = inputUrls.filter(jsonUrl => dbUrls.includes(jsonUrl.url));
      const remainingUrls = inputUrls.filter(jsonUrl => !dbUrls.includes(jsonUrl.url));

      // Write the remaining URLs back to the original file (overwrite the file)
      writeJsonFile(fol1FilePath, remainingUrls);

      // Log the results
      console.log(`Matched URLs in ${fol1FilePath}:`, matchedUrls);
      console.log(`Remaining URLs in ${fol1FilePath}:`, remainingUrls);
    }

    // Process files in ref folder
    const refJsonFilePaths = getJsonFilePathsFromFolder(path.join(__dirname, 'ref'));
    for (const refFilePath of refJsonFilePaths) {
      console.log(`Processing file in ref: ${refFilePath}`);

      // Read the content of the input JSON file
      const inputUrls = readJsonFile(refFilePath);

      // Separate the matched and remaining URLs
      const matchedUrls = inputUrls.filter(jsonUrl => dbUrls.includes(jsonUrl.url));
      const remainingUrls = inputUrls.filter(jsonUrl => !dbUrls.includes(jsonUrl.url));

      // Write the remaining URLs back to the original file (overwrite the file)
      writeJsonFile(refFilePath, remainingUrls);

      // Log the results
      console.log(`Matched URLs in ${refFilePath}:`, matchedUrls);
      console.log(`Remaining URLs in ${refFilePath}:`, remainingUrls);
    }

  } catch (err) {
    console.error("Error comparing URLs", err);
  } finally {
    // Close the database connection
    client.end();
  }
};

// Execute the main function
compareUrlsAndUpdateFiles();
