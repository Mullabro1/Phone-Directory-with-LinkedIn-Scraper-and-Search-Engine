import fs from 'fs-extra';
import path from 'path';

// Get the current directory using import.meta.url
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const zfailUrlFolder = path.join(__dirname, 'Zfail_url');
const refFolder = path.join(__dirname, 'ref2');

// Function to remove URLs from the ref2 files based on the URLs in not_success.json
const removeUrlsFromRefFiles = async () => {
  try {
    // Step 1: Read the not_success.json file in the Zfail_url folder
    const notSuccessFilePath = path.join(zfailUrlFolder, 'not_success.json');
    const notSuccessData = await fs.readJson(notSuccessFilePath);

    // Step 2: Get a list of URLs to remove
    const urlsToRemove = notSuccessData.map(entry => entry.url);

    // Step 3: Read all files in the ref2 folder
    const refFiles = await fs.readdir(refFolder);

    // Step 4: Process each file in the ref2 folder
    for (const file of refFiles) {
      const refFilePath = path.join(refFolder, file);
      const refFileData = await fs.readJson(refFilePath);

      // Step 5: Filter out entries where the URL matches a URL in not_success.json
      const updatedRefFileData = refFileData.filter(entry => !urlsToRemove.includes(entry.url));

      // Step 6: Save the updated file back to the ref2 folder
      await fs.writeJson(refFilePath, updatedRefFileData, { spaces: 2 });
      console.log(`Updated ${file} by removing matching URLs.`);
    }

    console.log('All ref files have been processed and updated.');
  } catch (error) {
    console.error('Error removing URLs from ref2 files:', error);
  }
};

// Run the function to remove URLs from ref2 files based on not_success.json
removeUrlsFromRefFiles();
