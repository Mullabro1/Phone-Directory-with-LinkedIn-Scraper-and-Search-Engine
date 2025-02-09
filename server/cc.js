import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';  // Import to handle module URLs

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);  // Convert module URL to filename
const __dirname = path.dirname(__filename);  // Get the directory of the current module

// Path to the 'processed_data.json' file inside the 'jsonin' folder
const inputFilePath = path.join(__dirname, 'fol_4', 'processed_data.json');

// Function to read, modify, and write the JSON file
const updateCurrentCompanyFormat = async () => {
  try {
    // Read the processed_data.json file
    const data = await fs.readFile(inputFilePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Loop through each entry and process current_company
    jsonData.forEach((entry) => {
      // Check if current_company is an object
      if (entry.current_company && typeof entry.current_company === 'object') {
        // If the object has a link property, update current_company to the link
        if (entry.current_company.link) {
          entry.current_company = entry.current_company.link;
        } else {
          // If no link exists, set current_company as an empty string
          entry.current_company = "";
        }
      }
      // If current_company is already a string, leave it as is
      else if (typeof entry.current_company !== 'string') {
        // Set current_company to empty string if not a string
        entry.current_company = "";
      }
    });

    // Convert the modified data back to a JSON string
    const updatedData = JSON.stringify(jsonData, null, 2);

    // Write the updated data back to the file
    await fs.writeFile(inputFilePath, updatedData, 'utf8');
    console.log('Updated processed_data.json with empty current_company when necessary');

  } catch (err) {
    console.error('Error processing the processed_data.json file:', err.message);
  }
};

// Call the function to start processing the file
updateCurrentCompanyFormat();
