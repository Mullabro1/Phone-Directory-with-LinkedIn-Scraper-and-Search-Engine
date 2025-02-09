import pkg from 'pg';
import cors from 'cors';
import express from 'express';

const { Client } = pkg;

// Express app setup
const app = express();
app.use(cors()); // Enable CORS

// PostgreSQL client setup
const client = new Client({
  user: 'admin',        // Your database username
  host: 'localhost',    // Your database host
  database: 'DB1',      // Your database name
  password: 'pass',     // Your database password
  port: 5432,           // Default PostgreSQL port
});

// Script to refresh the `search_from_refs` table
const refreshSearchFromRefs = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database.');

    // Step 1: Delete all data from the table
    const deleteQuery = `DELETE FROM search_from_refs`;
    await client.query(deleteQuery);
    console.log('All data deleted from search_from_refs.');

    // Step 2: Repopulate the table
    const insertQuery = `
      INSERT INTO search_from_refs (name, city, avatar, reference, ref_id, class, url, class_id)
      SELECT 
          p.name, 
          p.city, 
          p.avatar, 
          r.reference, 
          r.ref_id, 
          c.class, 
          c.url, 
          c.class_id
      FROM 
          refs r
      JOIN 
          classic c ON r.ref_id = c.ref_id
      JOIN 
          profiles p ON p.url = c.url;
    `;

    const result = await client.query(insertQuery);
    console.log(`Data inserted successfully. Rows affected: ${result.rowCount}`);
  } catch (error) {
    console.error('Error refreshing search_from_refs:', error.message);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log('Disconnected from the database.');
  }
};

// Call the script
refreshSearchFromRefs();
