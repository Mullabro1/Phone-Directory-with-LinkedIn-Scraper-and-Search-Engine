import fs from "fs-extra";
import path from "path";

// Get the current directory using import.meta.url
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const zfailUrlFolder = path.join(__dirname, "Zfail_url");
const refFolder = path.join(__dirname, "ref2");

// Function to add references and class to Zfail_url's not_success.json based on matching url
const addReferenceToZfailUrl = async () => {
  try {
    // Step 1: Read the not_success.json file in the Zfail_url folder
    const notSuccessFilePath = path.join(zfailUrlFolder, "not_success.json");
    const notSuccessData = await fs.readJson(notSuccessFilePath);

    // Step 2: Read all files in the `ref` folder
    const refFiles = await fs.readdir(refFolder);

    // Step 3: Process each file in the ref folder
    for (const file of refFiles) {
      const refFilePath = path.join(refFolder, file);
      const refFileData = await fs.readJson(refFilePath);

      // Step 4: Iterate over not_success.json data and add references and class based on matching URLs
      notSuccessData.forEach((entry) => {
        // Check if the URL matches any entry in the current ref file
        const matchingReference = refFileData.find((refEntry) => refEntry.url === entry.url);

        if (matchingReference) {
          // If a match is found, add the reference and class
          entry.reference = matchingReference.reference;
          entry.class = matchingReference.class; 
        }
      });

      console.log(`Processed ${file}`);
    }

    // Step 5: Save the updated not_success.json with added references and class
    await fs.writeJson(notSuccessFilePath, notSuccessData, { spaces: 2 });
    console.log("Updated not_success.json with references and class from all ref files.");
  } catch (error) {
    console.error("Error adding references and class to not_success.json:", error);
  }
};

// Run the function to add references and class to Zfail_url/not_success.json
addReferenceToZfailUrl();
