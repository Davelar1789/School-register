# CODEWHIZ STUDY BACKEND

This is the backend repository for CODEWHIZ-STUDY. It serves as the backend API to interact with the database and handle business logic for the frontend.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KelvinMhacwilson/JOCKALOIS-ENTERPRISE.git
   ```
2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Set up environment variables**:
   Skip this section(I Have done it)
   Create a `.env` file in the root directory of the backend directory and add the following variables:
   ```
   PORT=8000
   MONGODB_CONNECTION_STRING = your_mongodb_connection_string
   JWT_SECRET = a_personal_secret/key
   FRONTEND_URL = the_frontend_url
   ```
   Replace `your_mongodb_connection_string` with your actual MongoDB connection string.

## Usage

- **Development**:
  ```bash
  npm run server
  ```
  This will start the server using `nodemon`, which will automatically restart the server when changes are detected.

## Folder Structure

- **`controllers/`**: Handles business logic and interacts with the models.
- **`middleware/`**: Contains custom middleware functions.
- **`models/`**: Defines MongoDB schemas and models.
- **`routes/`**: Defines API routes.
- **`utils/`**: Contains utility functions.
- **`server.js`**: Entry point of the application.
