import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pkg;

// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

async function processFiles() {
  try {
    // Connect to the database
    await client.connect();

    const inputFolder = path.join(__dirname, 'ref2'); // Folder containing input files
    const outputFolder = path.join(__dirname, 'ref3'); // Folder for output files

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    const files = fs.readdirSync(inputFolder);

    for (const file of files) {
      const inputPath = path.join(inputFolder, file);
      const outputPath = path.join(outputFolder, file);

      // Read and parse the input file
      const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

      // Initialize the output data structure
      const outputData = [];

      for (const item of inputData) {
        const { url, reference, class: classification } = item;

        // Query the database for matching URL
        const query = `
          SELECT r.reference, c.class
          FROM classic c
          JOIN refs r ON c.ref_id = r.ref_id
          WHERE c.url = $1
        `;
        const result = await client.query(query, [url]);

        // Build the subitems for the current URL
        const subitems = [];

        // Add data from the database to subitems
        for (const row of result.rows) {
          if (!subitems.some(subitem => subitem.reference === row.reference)) {
            subitems.push({
              reference: row.reference,
              classification: row.class,
            });
          }
        }

        // Always include the input reference and classification, but only if not already present
        if (!subitems.some(subitem => subitem.reference === reference)) {
          subitems.push({
            reference,
            classification,
          });
        }

        // Add the URL and its subitems to the output data
        outputData.push({ url, subitems });
      }

      // Write the processed data to the output folder with the same filename
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
      console.log(`Processed file: ${file}`);
    }
  } catch (error) {
    console.error('Error processing files:', error);
  } finally {
    // Disconnect from the database
    await client.end();
  }
}

// Execute the file processing
processFiles();
