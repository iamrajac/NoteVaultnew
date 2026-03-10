# NoteVault

NoteVault is a modern, real-time collaborative workspace web application. It features real-time note editing, workspace management, task tracking, and much more.

## Tech Stack
- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MySQL, Prisma ORM
- **Real-time**: Socket.io

## Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server

## Getting Started

Follow these steps to clone and run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/heysuhas/sepmnotevault.git
cd sepmnotevault
```

### 2. Backend Setup
The backend is an Express server connected to a MySQL database using Prisma.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on the following template, replacing `root:admin@localhost:3306` with your actual MySQL credentials:
   ```env
   DATABASE_URL="mysql://root:admin@localhost:3306/notevault_db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   ```
4. Push the Prisma schema to the database and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
The frontend is a Next.js application styled with TailwindCSS.

1. Open a new terminal window/tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Open the Application
Once both servers are running:
- The backend API will be running at `http://localhost:5000`
- The frontend Next.js app will be running at `http://localhost:3000`

Open `http://localhost:3000` in your browser to view the application!
