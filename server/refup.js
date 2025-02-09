import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';  // Import the entire pg package
const { Client } = pkg;  // Extract Client from the package

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

// Connect to the database
async function connectToDB() {
  await client.connect();
}

// Function to process the ref3 JSON files
async function processRef3Files() {
  // Read all files in ref3 directory
  const ref3Dir = path.join(__dirname, 'ref3');  // Path to your ref3 directory
  const files = fs.readdirSync(ref3Dir);

  for (const file of files) {
    const filePath = path.join(ref3Dir, file);

    try {
      // Log the current file being processed
      console.log(`Processing file: ${file}`);

      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Process each URL entry in the file
      for (const entry of fileData) {
        const { url, subitems } = entry;

        // Step 1: Delete existing URL entries in the classic table
        await client.query('DELETE FROM classic WHERE url = $1', [url]);

        // Step 2: Check if references exist in the refs table and insert if missing
        for (const subitem of subitems) {
          const { reference } = subitem;

          // Check if the reference exists in the refs table
          const res = await client.query('SELECT ref_id FROM refs WHERE reference = $1', [reference]);

          if (res.rows.length === 0) {
            // If not found, insert it
            await client.query('INSERT INTO refs (reference) VALUES ($1)', [reference]);
          }
        }

        // Step 3: Add URLs back to the classic table, linking to appropriate references
        for (const subitem of subitems) {
          const { reference } = subitem;

          // Get the ref_id for the current reference
          const res = await client.query('SELECT ref_id FROM refs WHERE reference = $1', [reference]);
          const ref_id = res.rows[0].ref_id;

          // Insert the URL and reference into the classic table
          await client.query('INSERT INTO classic (url, class, ref_id) VALUES ($1, $2, $3)', [url, subitem.classification, ref_id]);
        }
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }
}

// Main function to run the process
async function main() {
  try {
    await connectToDB();
    await processRef3Files();
    console.log('Process completed successfully');
  } catch (err) {
    console.error('Error during process:', err);
  } finally {
    await client.end();
  }
}

main();
