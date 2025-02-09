import fs from 'fs-extra';
import path from 'path';
import csvtojson from 'csvtojson';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const csvFolder = path.join(__dirname, 'fol_2'); // Folder where files are uploaded
const jsonOutFolder = path.join(__dirname, 'fol_3'); // Folder where processed JSON files will be stored

// Ensure 'jsonout' folder exists
fs.ensureDirSync(jsonOutFolder);

// Function to process files
const processFiles = async () => {
  try {
    // Read all files in the 'csv' folder
    const files = await fs.readdir(csvFolder);

    const filePromises = files.map(async (file) => {
      const filePath = path.join(csvFolder, file);
      const extension = path.extname(file).toLowerCase();

      let jsonData = [];

      // Handle CSV files
      if (extension === '.csv') {
        const csvRecords = await csvtojson().fromFile(filePath);
        jsonData = csvRecords.map((record) => {
          const jsonRecord = {};

          for (const key in record) {
            if (record.hasOwnProperty(key)) {
              // Try to parse JSON-like fields
              if (['current_company', 'experience', 'input'].includes(key)) {
                try {
                  jsonRecord[key] = JSON.parse(record[key]);
                } catch (err) {
                  jsonRecord[key] = record[key];
                }
              } else {
                jsonRecord[key] = record[key];
              }
            }
          }

          // Remove empty attributes
          for (const key in jsonRecord) {
            if (jsonRecord[key] === "" || jsonRecord[key] === null || jsonRecord[key] === undefined) {
              delete jsonRecord[key];
            }
          }

          return jsonRecord;
        });
      }
      // Handle XLSX files
      else if (extension === '.xlsx') {
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

        jsonData = sheetData.map((record) => {
          const jsonRecord = {};

          for (const key in record) {
            if (record.hasOwnProperty(key)) {
              if (['current_company', 'experience', 'input'].includes(key)) {
                try {
                  jsonRecord[key] = JSON.parse(record[key]);
                } catch (err) {
                  jsonRecord[key] = record[key];
                }
              } else {
                jsonRecord[key] = record[key];
              }
            }
          }

          // Remove empty attributes
          for (const key in jsonRecord) {
            if (jsonRecord[key] === "" || jsonRecord[key] === null || jsonRecord[key] === undefined) {
              delete jsonRecord[key];
            }
          }

          return jsonRecord;
        });
      }

      // Save the resulting JSON data to the 'jsonout' folder in pretty format
      const outputFilePath = path.join(jsonOutFolder, `${file.replace(extension, '.json')}`);
      await fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2));

      // Clean up the uploaded file (delete the original file)
      // await fs.remove(filePath);

      return { filename: file, jsonData };
    });

    // Wait for all file promises to complete
    const result = await Promise.all(filePromises);
    console.log({ success: true, files: result });
  } catch (error) {
    console.error('Error processing files:', error.message);
  }
};

// Start processing the files
processFiles();
