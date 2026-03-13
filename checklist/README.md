# abctokz Hackathon Checklist

A real-time collaborative checklist for the abctokz hackathon tasks.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and go to `http://localhost:3000`

## Features

- Real-time collaboration: Changes are automatically synced across all connected users.
- Minimalist design.
- Each task has a status (Not Started, In Progress, Completed) and notes section.
- All tasks from Tasks.md are included in full detail.

## Sharing

To share with others:
- Host the server on a public IP or use a service like ngrok to expose it.
- Share the URL with collaborators.

Note: This is a simple in-memory implementation. For production, use a database to persist data.