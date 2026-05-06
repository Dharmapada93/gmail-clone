# Gmail Clone

A full-stack Gmail clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- Email inbox, sent, draft, spam, trash folders
- Real-time notifications with Socket.io
- AI Smart Replies and Email Enhancement
- Dynamic AI Theme Generator
- Node.js Clustering for high performance
- Pagination for large inboxes

## Local Development

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key (optional)
```
