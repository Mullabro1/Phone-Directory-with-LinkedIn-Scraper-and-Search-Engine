import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths to JSON files
const outputFilePath = path.join(__dirname, '1_update', 'output.json');
const outFilePath = path.join(__dirname, '2_update', 'out.json');
const notFoundFilePath = path.join(__dirname, '2_update', 'not_found.json');

// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

async function processProfiles() {
    try {
        console.log("Executing script to process profiles in DB1");
        
        // Connect to the database
        await client.connect();
        console.log("Connected to database");
        
        // Check if the file exists
        if (!await fs.pathExists(outputFilePath)) {
            console.error('Error: output.json not found');
            return;
        }

        // Read the JSON file
        const profiles = await fs.readJson(outputFilePath);
        const multipleResults = [];
        const notFoundResults = [];

        // Iterate through each profile and search for matches
        for (const profile of profiles) {
            const { first_name, last_name, city_and_place, email_1, email_2, contact_1, contact_2, contact_3 } = profile;
            
            const searchQuery = `
                SELECT id, name, city FROM profiles 
                WHERE name ILIKE $1 AND name ILIKE $2 AND city ILIKE $3;
            `;
            
            const searchValues = [
                first_name ? `${first_name}%` : "%",
                last_name ? `%${last_name}%` : "%%",
                city_and_place ? `%${city_and_place}%` : "%%"
            ];
            
            const searchResult = await client.query(searchQuery, searchValues);
            
            if (searchResult.rows.length > 1) {
                multipleResults.push({
                    record: profile,
                    profiles: searchResult.rows
                });
            } else if (searchResult.rows.length === 1) {
                const updateQuery = `
                    UPDATE profiles
                    SET email_1 = $1, email_2 = $2, contact_1 = $3, contact_2 = $4, contact_3 = $5
                    WHERE id = $6;
                `;
                
                const updateValues = [
                    email_1 || null,
                    email_2 || null,
                    contact_1 || null,
                    contact_2 || null,
                    contact_3 || null,
                    searchResult.rows[0].id
                ];
                
                await client.query(updateQuery, updateValues);
                console.log(`Updated profile for ${first_name || "Unknown"} ${last_name || "Unknown"}`);
            } else {
                notFoundResults.push(profile);
            }
        }

        // Save multiple results to out.json if necessary
        if (multipleResults.length > 0) {
            await fs.outputJson(outFilePath, multipleResults, { spaces: 2 });
            console.log("Saved multiple profile matches to out.json");
        }

        // Save not found records to not_found.json if necessary
        if (notFoundResults.length > 0) {
            await fs.outputJson(notFoundFilePath, notFoundResults, { spaces: 2 });
            console.log("Saved not found profiles to not_found.json");
        }
    } catch (error) {
        console.error('Error processing profiles:', error);
    } finally {
        await client.end();
        console.log("Database connection closed");
    }
}

// Execute the function
processProfiles();
