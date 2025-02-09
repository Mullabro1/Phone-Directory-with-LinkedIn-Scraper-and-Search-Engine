import fs from "fs-extra";
import path from "path";

// Get the current directory using import.meta.url
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const mainFolder = path.join(__dirname, "fol_1");
const refFolder = path.join(__dirname, "ref");
const ref2Folder = path.join(__dirname, "ref2");

// Ensure folders exist
fs.ensureDirSync(refFolder);
fs.ensureDirSync(mainFolder);
fs.ensureDirSync(ref2Folder);

// Function to clean up empty URLs in JSON files
const cleanJsonFiles = (folderPath) => {
  // Read all files from the specified folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder ${folderPath}:`, err);
      return;
    }

    // Process each file
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      
      // Read the file
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading file ${filePath}:`, err);
          return;
        }

        // Parse the JSON data
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (parseError) {
          console.error(`Error parsing JSON in file ${filePath}:`, parseError);
          return;
        }

        // Filter out empty URL and reference entries
        const cleanedData = jsonData.filter(entry => {
          if (entry.url === "" || (entry.url === "" && entry.reference === "")) {
            // Remove entries with empty url or both empty url and reference
            return false;
          }
          return true;
        });

        // Save the cleaned data back to the file
        fs.writeFile(filePath, JSON.stringify(cleanedData, null, 2), (err) => {
          if (err) {
            console.error(`Error writing file ${filePath}:`, err);
          } else {
            console.log(`Cleaned file: ${filePath}`);
          }
        });
      });
    });
  });
};

// Run the cleanup on mainFolder, refFolder, and ref2Folder
cleanJsonFiles(refFolder);
cleanJsonFiles(mainFolder);
cleanJsonFiles(ref2Folder);
