import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';  // Import to handle module URLs

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);  // Convert module URL to filename
const __dirname = path.dirname(__filename);  // Get the directory of the current module

// Path to the 'input' folder (relative to this script's directory)
const inputFolderPath = path.join(__dirname, 'fol_3');

// Path for the not_success.json file (inside the 'fail' folder)
const failFolderPath = path.join(__dirname, 'Zfail_url');
const notSuccessFilePath = path.join(failFolderPath, 'not_success.json');

// Ensure the 'fail' folder exists using fs-extra
fs.ensureDirSync(failFolderPath);  // This works with fs-extra

// Function to read, modify, and write the JSON files
const removeWarningCodeEntries = async () => {
  // Read all files in the input folder
  try {
    const files = await fs.readdir(inputFolderPath);

    // Filter only JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Array to store URLs of entries that have warning codes
    const notSuccessUrls = [];

    for (const file of jsonFiles) {
      const filePath = path.join(inputFolderPath, file);

      // Read each JSON file
      const data = await fs.readFile(filePath, 'utf8');

      try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Filter out entries that contain 'warning_code', but collect URLs for them
        const filteredData = jsonData.filter(entry => {
          if (entry.hasOwnProperty('warning_code') && entry.input && entry.input.url) {
            // Add URL to notSuccessUrls if warning_code exists and URL is non-empty
            notSuccessUrls.push({ url: entry.input.url });  // Format each URL as an object
            return false;  // Do not include this entry in the final data
          }
          return true;  // Include this entry in the final data
        });

        // Convert the modified data back to a JSON string
        const updatedData = JSON.stringify(filteredData, null, 2);

        // Write the updated data back to the file
        await fs.writeFile(filePath, updatedData, 'utf8');
        console.log(`Updated ${file}`);

      } catch (err) {
        console.error(`Error parsing JSON in file ${file}:`, err);
      }
    }

    // Once all files are processed, save the not_success.json file with only URLs in the specified format
    if (notSuccessUrls.length > 0) {
      await fs.writeFile(notSuccessFilePath, JSON.stringify(notSuccessUrls, null, 2), 'utf8');
      console.log('Saved not_success.json in the fail folder');
    }

  } catch (err) {
    console.error('Error processing files:', err.message);
  }
};

// Call the function to start processing the files
removeWarningCodeEntries();
