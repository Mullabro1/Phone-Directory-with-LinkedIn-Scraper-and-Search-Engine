import fs from "fs-extra";
import path from "path";

// Get the current directory using import.meta.url
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const fol_3Folder = path.join(__dirname, "fol_3");
const refFolder = path.join(__dirname, "ref");

// Function to add references based on matching input.url
const addReferenceToFol3Files = async () => {
  try {
    // Step 1: Read all files in the `ref` folder
    const refFiles = await fs.readdir(refFolder);
    const refDataMap = new Map();

    // Step 2: Read all `ref` files and create a map of url -> reference
    for (const file of refFiles) {
      const refFilePath = path.join(refFolder, file);
      const refFileData = await fs.readJson(refFilePath);

      // If the file has a valid url and reference, store it in the map
      refFileData.forEach((entry) => {
        if (entry.url && entry.reference) {
          refDataMap.set(entry.url, entry.reference);
        }
      });
    }

    // Step 3: Read all files in `fol_3`
    const fol3Files = await fs.readdir(fol_3Folder);

    // Step 4: Process each file in `fol_3`
    for (const file of fol3Files) {
      const fol3FilePath = path.join(fol_3Folder, file);
      const fol3FileData = await fs.readJson(fol3FilePath);

      // Step 5: Add reference based on matching input.url
      const updatedData = fol3FileData.map((entry) => {
        const reference = refDataMap.get(entry.input?.url);
        if (reference) {
          // Add the reference to the entry
          return { ...entry, reference };
        }
        return entry; // If no match, keep the entry as is
      });

      // Step 6: Save the updated file back to `fol_3`
      await fs.writeJson(fol3FilePath, updatedData, { spaces: 2 });
      console.log(`Updated file: ${file}`);
    }
  } catch (error) {
    console.error("Error adding references:", error);
  }
};

// Run the function to add references
addReferenceToFol3Files();
