# Lawyers Feature Setup Guide

## Overview
This guide explains how to set up the lawyer search functionality and cyber complaint registration feature.

## Features Implemented

### 1. Lawyer Search
- MongoDB model for storing lawyer data
- Backend API for searching and filtering lawyers
- Frontend component with search bar and domain filters
- Responsive design with dark theme support

### 2. Cyber Complaint Registration
- Integration with N8N webhook
- Form for submitting cyber crime complaints
- Email notification via N8N workflow

## Setup Instructions

### Backend Setup

1. **Seed the Lawyers Database**

   Run the seed script to populate the database with lawyer data:

   ```powershell
   cd server
   node seedLawyers.js
   ```

   This will:
   - Connect to MongoDB
   - Clear existing lawyer data
   - Insert all lawyer records (217 lawyers total)
   - Close the database connection

   Expected output:
   ```
   Connected to MongoDB
   Cleared existing lawyer data
   Successfully seeded 217 lawyers
   Database connection closed
   ```

2. **Start the Server**

   ```powershell
   npm start
   ```

### Frontend Setup

1. **Install Dependencies** (if not already done)

   ```powershell
   cd client
   npm install
   ```

2. **Start the Development Server**

   ```powershell
   npm run dev
   ```

## API Endpoints

### Lawyers API

- **GET /api/lawyers**
  - Get all lawyers with optional search and filter
  - Query params:
    - `search`: Search term for name or domain
    - `domain`: Filter by specific domain (e.g., "Criminal Law")

- **GET /api/lawyers/domains**
  - Get list of all unique law domains

- **POST /api/lawyers/seed**
  - Seed lawyers data (for initial setup)
  - Body: `{ "lawyers": [...] }`

### Cyber Complaint API

- **POST /api/complaint/submit-complaint**
  - Submit cyber crime complaint
  - Body: `{ "subject": "...", "message": "..." }`

## Routes

### Frontend Routes

- `/search-lawyers` - Search and browse lawyers
- `/cyber-complaint` - File cyber crime complaints
- `/dashboard` - Main dashboard with all features

## Law Domains Included

1. Criminal Law
2. Civil Law
3. Property Law
4. Family Law
5. Corporate Law
6. Tax Law
7. Labour Law
8. Cyber Law
9. Consumer Protection Law
10. Constitutional Law
11. Intellectual Property Law (IPR)
12. Banking & Finance Law
13. Media & IT Law
14. Education Law
15. Immigration Law

## Usage

### Searching for Lawyers

1. Navigate to `/search-lawyers` or click "Search Lawyers" from the dashboard
2. Use the search bar to search by lawyer name or domain
3. Use the domain filter dropdown to filter by specific law domain
4. Click on lawyer cards to view details

### Filing Cyber Complaints

1. Navigate to `/cyber-complaint` or click "Register Complaint" from the dashboard
2. Fill in the subject and complaint details
3. Click "Submit Complaint"
4. You'll receive a confirmation message once the email is sent

## N8N Integration

The cyber complaint form integrates with N8N workflow:

- **Webhook URL**: `https://aniruthpvt.app.n8n.cloud/webhook/92321f9b-13b4-4f13-ab86-ed9d37b22970`
- **Request Body**:
  ```json
  {
    "subject": "Complaint subject",
    "message": "Complaint details"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Mail sent successfully"
  }
  ```

## Troubleshooting

### Lawyers Not Showing

1. Verify MongoDB is running
2. Run the seed script: `node seedLawyers.js`
3. Check server logs for errors
4. Verify MongoDB connection string in `.env`

### Cyber Complaint Not Submitting

1. Check N8N webhook is active
2. Verify the webhook URL in `server/routes/complaint.js`
3. Check network tab for API errors
4. Verify axios is installed in server dependencies

## File Structure

```
server/
├── models/
│   └── Lawyer.js          # Lawyer MongoDB model
├── routes/
│   ├── lawyers.js         # Lawyer API routes
│   └── complaint.js       # Cyber complaint API routes
├── lawyersData.js         # Lawyer seed data
└── seedLawyers.js         # Seed script

client/
└── src/
    └── components/
        ├── SearchLawyers.jsx      # Lawyer search component
        ├── SearchLawyers.css      # Lawyer search styles
        ├── CyberComplaint.jsx     # Cyber complaint form
        └── CyberComplaint.css     # Cyber complaint styles
```

## Notes

- The lawyer database contains 217 lawyers across 15 law domains
- Text search is enabled on lawyer names and domains
- Dark theme support is included for all new components
- All components are fully responsive
