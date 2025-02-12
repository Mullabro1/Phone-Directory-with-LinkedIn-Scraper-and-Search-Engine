
# Project Setup Guide

This guide provides instructions to set up and run the project in two ways:
1. Using **Docker**.
2. Running the app manually using **npm** (Docker is required for the database).

---

## Prerequisites

- **Docker** and **Docker Compose** installed for containerized setup.
- **Node.js** and **npm** installed for manual setup.

---

## Table of Contents

1. [SQL Database Schema](#sql-database-schema)
2. [Setup Using Docker](#setup-using-docker)
3. [Manual Setup](#manual-setup)
4. [NPM Commands](#npm-commands)

---

## SQL Database Schema

The project uses PostgreSQL for the database. Below is the schema definition:

### Profiles Table
```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  linkedin_id TEXT,
  name TEXT,
  city TEXT,
  about TEXT,
  current_company TEXT,
  url TEXT,
  avatar TEXT,
  banner_image TEXT,
  followers INT,
  connections INT,
  reference_text TEXT,
  search_vector tsvector
);
-- Create the profiles table with the reference_text and search_vector for full-text search
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  linkedin_id TEXT,
  name TEXT,
  city TEXT,
  about TEXT,
  current_company TEXT,
  url TEXT,
  avatar TEXT,
  banner_image TEXT,
  followers INT,
  connections INT,
  reference_text TEXT,  -- New searchable reference_text column
  -- Add a tsvector column for full-text search
  search_vector tsvector,
  -- New columns for emails and contacts
  email_1 TEXT,
  email_2 TEXT,
  contact_1 TEXT,
  contact_2 TEXT,
  contact_3 TEXT
);


CREATE INDEX idx_search_vector_profiles ON profiles USING gin(search_vector);
```

### Experiences Table
```sql
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  title TEXT,
  company TEXT,
  company_id TEXT,
  company_url TEXT,
  company_logo_url TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  duration TEXT,
  search_vector tsvector
);

CREATE INDEX idx_search_vector_experiences ON experiences USING gin(search_vector);
```

### Education Table
```sql
CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  title TEXT,
  institute_name TEXT,
  institute_logo_url TEXT,
  start_year TEXT,
  end_year TEXT,
  description TEXT,
  search_vector tsvector
);

CREATE INDEX idx_search_vector_education ON education USING gin(search_vector);
```

### Users Table (Login System)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  privilege TEXT NOT NULL
);

INSERT INTO users (username, password, privilege) VALUES ('admin', 'admin123', 'admin');
INSERT INTO users (username, password, privilege) VALUES ('user', 'user123', 'user');
```

---
# PostgreSQL Data Deletion Guide

This document explains how to delete records from a PostgreSQL database in a structured manner while maintaining referential integrity.

## Deletion Process

```sql
DELETE FROM experiences 
WHERE profile_id IN (SELECT id FROM profiles WHERE reference_text = 'ddd');

-- Then, delete from 'education' based on the reference_text in profiles
DELETE FROM education 
WHERE profile_id IN (SELECT id FROM profiles WHERE reference_text = 'ddd');

-- Now delete the profile itself from 'profiles' where reference_text is 'ddd'
DELETE FROM profiles 
WHERE reference_text = 'ddd' 
RETURNING *;  -- Optional: To verify what was deleted
```
## Setup Using Docker

### Step 1: Build and Run Docker Containers
1. Ensure Docker is installed and running.
2. Use the following command to start the containers:
   ```bash
   docker-compose up --build
   ```

### Step 2: Access the Application
- API/backend: `http://localhost:PORT` (Replace `PORT` with the defined port in `docker-compose.yml`.)
- Database: Managed by Docker.

---

## Manual Setup

### Step 1: Set Up the Database
1. Ensure Docker is installed and running.
2. Start the database container:
   ```bash
   docker-compose up -d
   yarn install
   ```

### Step 2: Install Node.js Dependencies(*optional) 
1. Install npm packages:
   ```bash
   npm install \
   @eslint/js@9.16.0 \
   @fortawesome/fontawesome-free@6.7.2 \
   @types/react-dom@18.3.1 \
   @types/react@18.3.13 \
   @vitejs/plugin-react@4.3.4 \
   autoprefixer@10.4.20 \
   axios@1.7.9 \
   body-parser@1.20.3 \
   concurrently@9.1.0 \
   cors@2.8.5 \
   csvtojson@2.0.10 \
   eslint-plugin-react-hooks@5.0.0 \
   eslint-plugin-react-refresh@0.4.16 \
   eslint-plugin-react@7.37.2 \
   eslint@9.16.0 \
   express@4.21.2 \
   fs-extra@11.2.0 \
   globals@15.13.0 \
   multer@1.4.5-lts.1 \
   pg@8.13.1 \
   postcss-loader@8.1.1 \
   postcss@8.4.49 \
   react-dom@18.3.1 \
   react-dropzone@14.3.5 \
   react-router-dom@7.0.2 \
   react@18.3.1 \
   tailwindcss@3.4.17 \
   vite@6.0.2 \
   xlsx@0.18.5
   ```

### Step 3: Start the Application
Run the application:
```bash
cd e_search
yarn dev
```

---

## NPM Commands

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm start
```

### Build the Application
```bash
npm run build
```

### Run Tests
```bash
npm test
```
## now including instructions and a `docker-compose.yml` file for setting up the npm application, PostgreSQL, and pgAdmin. 

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    image: node:18
    container_name: npm_app
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    command: >
      sh -c "npm install && npm start"
    depends_on:
      - db
    environment:
      - NODE_ENV=development

  db:
    image: postgres:15
    container_name: postgres_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mydb

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## SQL Database Schema (*for manual setup)

The project uses PostgreSQL for the database. Below is the schema definition:

...

*(Schema details are the same as in the previous version)*

---

## Setup Using Docker

### Step 1: Build and Run Docker Containers
1. Ensure Docker is installed and running.
2. Start the containers using the following command:
   ```bash
   docker-compose up --build
   ```

### Step 2: Access the Services
- **Application**: `http://localhost:3000`
- **pgAdmin**: `http://localhost:5050`
  - Login with:
    - Email: `admin@admin.com`
    - Password: `admin`
  - Add a new server:
    - Hostname: `db`
    - Username: `postgres`
    - Password: `postgres`

### Step 3: Database Setup
Run the SQL scripts provided in the project to set up the database schema.

---

## Manual Setup

### Step 1: Set Up the Database
1. Start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

### Step 2: Install Node.js Dependencies
Install npm packages:
```bash
npm install
```

### Step 3: Start the Application
Run the application:
```bash
npm start
```

---

Feel free to customize the ports or other configurations in the `docker-compose.yml` or `.env` file.

## profiles table setup
```sql
-- Create the profiles table with the reference_text and search_vector for full-text search
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  linkedin_id TEXT,
  name TEXT,
  city TEXT,
  about TEXT,
  current_company TEXT,
  url TEXT,
  avatar TEXT,
  banner_image TEXT,
  followers INT,
  connections INT,
  reference_text TEXT,  -- New searchable reference_text column
  -- Add a tsvector column for full-text search
  search_vector tsvector,
  -- New columns for emails and contacts
  email_1 TEXT,
  email_2 TEXT,
  contact_1 TEXT,
  contact_2 TEXT,
  contact_3 TEXT
);


-- Create GIN index on the search_vector column for fast searching
CREATE INDEX idx_search_vector_profiles ON profiles USING gin(search_vector);

-- Function to update the search_vector in profiles table
CREATE OR REPLACE FUNCTION update_profiles_search_vector() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.name, '') || ' ' || 
    coalesce(NEW.city, '') || ' ' ||
    coalesce(NEW.reference_text, ''));  -- Include reference_text in the search vector
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to call the function on INSERT or UPDATE for profiles
CREATE TRIGGER trigger_update_profiles_search_vector
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_search_vector();
  ```
  ## experiences table setup
  ```sql
  -- Create the experiences table with search_vector for full-text search
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  title TEXT,
  company TEXT,
  company_id TEXT,
  company_url TEXT,
  company_logo_url TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  duration TEXT,
  -- Add a tsvector column for full-text search
  search_vector tsvector
);

-- Create GIN index on the search_vector column for fast searching
CREATE INDEX idx_search_vector_experiences ON experiences USING gin(search_vector);

-- Function to update the search_vector in experiences table
CREATE OR REPLACE FUNCTION update_experiences_search_vector() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' || 
    coalesce(NEW.company, ''));
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to call the function on INSERT or UPDATE for experiences
CREATE TRIGGER trigger_update_experiences_search_vector
  BEFORE INSERT OR UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_experiences_search_vector();
  ```
## education table setup
```sql
-- Create the education table with search_vector for full-text search

CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  title TEXT,
  institute_name TEXT,
  institute_logo_url TEXT,
  start_year TEXT,
  end_year TEXT,
  description TEXT,
  -- Add a tsvector column for full-text search
  search_vector tsvector
);

-- Create GIN index on the search_vector column for fast searching
CREATE INDEX idx_search_vector_education ON education USING gin(search_vector);

-- Function to update the search_vector in education table
CREATE OR REPLACE FUNCTION update_education_search_vector() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' || 
    coalesce(NEW.institute_name, ''));
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger to call the function on INSERT or UPDATE for education
CREATE TRIGGER trigger_update_education_search_vector
  BEFORE INSERT OR UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_education_search_vector();
```
## other table setup
```sql
--showcase------

--SELECT * FROM experiences 
SELECT * FROM profiles 
--select * from education 
--SELECT url FROM profiles
-- Drop all the tables if they exist
--DROP TABLE IF EXISTS experiences, profiles, education CASCADE;


--login sys -------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  privilege TEXT NOT NULL
);

-- Insert example users
INSERT INTO users (username, password, privilege) VALUES ('admin', 'admin123', 'admin');
INSERT INTO users (username, password, privilege) VALUES ('user', 'user123', 'user');  -- --what do u undersatnd by this 

-- Table 1: refs
CREATE TABLE refs (
    ref_id SERIAL PRIMARY KEY,
    reference TEXT NOT NULL
);

-- Table 2: classic
CREATE TABLE classic (
    class_id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    class TEXT NOT NULL,
    ref_id INT REFERENCES refs(ref_id)
);
--table between for api
CREATE TABLE search_from_refs (
   id BIGSERIAL PRIMARY KEY,   -- Auto-increment ID for this table
    name TEXT,                 -- From profiles.name
    city TEXT,                 -- From profiles.city
    avatar TEXT,               -- From profiles.avatar
    reference TEXT,            -- From refs.reference
    ref_id INT,                -- From refs.ref_id
    class TEXT,                -- From classic.class
    url TEXT,                  -- From classic.url
    class_id INT               -- From classic.class_id
);
