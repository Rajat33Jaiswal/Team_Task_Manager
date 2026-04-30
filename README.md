# Team Task Manager

A full-stack project and task management application built with Next.js (App Router), Prisma, and NextAuth.js.

## Features
- 🔐 **Authentication:** Secure signup & login using NextAuth and bcrypt.
- 👥 **Role-Based Access Control:** Admin & Member roles with distinct permissions.
- ⭐ **Task Rating System:** Admins can rate completed work (1-5 stars).
- 🔄 **Auto-Reassignment:** Tasks with low ratings (< 2/5) are automatically reassigned to other members.
- 📊 **Dynamic Dashboard:** Role-specific stats, "My Projects" view for members, and "Total Tasks" for admins.
- 📂 **Project Management:** Create projects and manage tasks within a mandatory project context.
- 👤 **User Profile:** Dedicated profile section to view/update details and change passwords securely.
- 🎨 **Premium UI:** Glassmorphism, CSS Modules, vibrant gradients, and animations.

## Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Initialize Database (SQLite for local):**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Railway Deployment Instructions

To deploy this application to Railway using PostgreSQL:

1. In your `prisma/schema.prisma` file, change the provider from `sqlite` to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Generate Prisma Client again for Postgres (optional locally, but Railway will do it):
   ```bash
   npx prisma generate
   ```

3. Commit your changes and push to a GitHub repository.
4. Go to **Railway.app** and create a new project.
5. Provision a **PostgreSQL** database.
6. Connect your GitHub repository to Railway to deploy the app.
7. Under the App's **Variables** settings, add the following:
   - `DATABASE_URL` (Use the connection URL provided by the Railway Postgres add-on)
   - `NEXTAUTH_SECRET` (A strong random string)
   - `NEXTAUTH_URL` (Your Railway deployment URL, e.g., `https://your-app.up.railway.app`)

Railway will automatically build the app, run database migrations (`npx prisma migrate deploy`), and start the production server according to the `railway.json` configuration provided.
