# 🚀 Smart Notes Workspace

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A premium, full-stack note-taking application built as the final project for the ITI Full Stack Developer track. This workspace provides a seamless, dynamic, and beautiful interface for managing personal and professional notes.

## 🎥 Project Demo

Check out the full walkthrough of the application in the video below:



https://github.com/user-attachments/assets/a2cbc4e7-8a07-4016-830c-90dbde294fc7



---

## ✨ Key Features & Requirements Met

### 🖥️ Frontend (React & Vite)
- **Modern Stack**: Built with React (Vite), React Router for routing.
- **State Management**: Redux Toolkit (Auth/Theme), TanStack Query (Server State caching and Optimistic Updates).
- **Forms & Validation**: Fully typed and validated forms using React Hook Form and Zod schemas.
- **UI & UX**: Beautiful glassmorphism aesthetic built with Tailwind CSS. Responsive design that works flawlessly on mobile and desktop.
- **Dark/Light Mode**: Full theme toggling support.
- **Markdown Support**: Notes support rich markdown formatting (rendered beautifully with `@tailwindcss/typography`).

### ⚙️ Backend (Node.js & Express)
- **Robust Architecture**: Built with Node.js, Express, and MongoDB (Mongoose).
- **Authentication**: JWT-based authentication and Bcrypt password hashing.
- **Data Validation**: Strict server-side input validation using Zod.
- **API Documentation**: Full Swagger documentation available at `/api-docs`.
- **Security**: Protected routes and middleware.

### 📝 Core Functionality
- **Full CRUD for Notes**: Create, Read, Update, and Delete notes.
- **Dynamic Categories & Tags**: Create new categories seamlessly using a custom dropdown. Add comma-separated tags to notes.
- **Advanced Filtering & Sorting**: Filter your dashboard by dynamic categories and status. Sort by date or alphabetically.
- **Debounced Search**: Lightning-fast search that doesn't overwhelm the backend (custom debounce hook).
- **Pagination**: Server-side pagination implemented for performance.
- **Profile Management**: Upload custom profile pictures (handled via Multer).

---

## 🏗️ Project Structure

This repository is a monorepo containing both the frontend and backend applications.

- `/frontend` - The React application
- `/backend` - The Node.js Express server
- `/uploads` - Contains user-uploaded profile images
- `postman_collection.json` - Complete API collection for testing endpoints

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB installed locally (or a MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file based on the `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartnotes
JWT_SECRET=your_super_secret_jwt_key
```
Start the server:
```bash
npm run dev
# Server will run on http://localhost:5000
```
> **Note:** Swagger API Documentation will be available at `http://localhost:5000/api-docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## ✅ Bonus Features Implemented
- [x] **Optimistic Updates**: UI instantly reacts before backend confirmation (implemented in Dashboard for deleting/editing).
- [x] **Debounced Search**: Search input waits 500ms before querying the server.
- [x] **Upload Profile Image**: Full support for `multipart/form-data` uploads with Multer.
- [x] **Markdown Support**: Notes rendered nicely with standard markdown support.
- [x] **Unit Tests**: Included tests for custom hooks (Vitest).
- [x] **Swagger Documentation**: Complete endpoint testing UI built into the backend.
