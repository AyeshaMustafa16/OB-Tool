# Website Builder

## Overview
Web Builder is a comprehensive web customization tool that allows users to design and customize website headers, footers, and various page sections through an intuitive interface. The application provides real-time previews of the changes, making it easy for users to build and visualize their websites.

---------------------------
Installation Guide
---------------------------

This is a Next.js project using TypeScript, Tailwind CSS, and PNPM for package management.

---------------------------
Prerequisites
---------------------------
Make sure you have the following installed:

1. Node.js (v18 or later recommended)  
   Download: https://nodejs.org/

2. PNPM - Fast, disk space-efficient package manager  
   Install PNPM globally:  
   `npm install -g pnpm`

---------------------------
Project Setup Instructions
---------------------------

1. Clone or download the project files.  
   If you have downloaded the zip, extract it.

2. Open the project directory in your terminal:  
   `cd ob-tool`

3. Install dependencies using PNPM:  
   `pnpm install`

4. Run the development server:  
   `pnpm dev`  
   This will start the app on http://localhost:3000

---------------------------
Build and Production
---------------------------

To create a production build:  
`pnpm build`

To start the production server after building:  
`pnpm start`

---------------------------
Project Structure
---------------------------

- `app/`              : Contains pages, layouts, and API routes  
- `public/`           : Static assets  
- `components/`       : Shared UI components  
- `styles/`           : Global and module CSS (if any)  
- `tailwind.config.ts`: Tailwind CSS configuration  
- `next.config.mjs`   : Next.js custom configuration  
- `middleware.ts`     : Middleware logic (if any)

---------------------------
Troubleshooting
---------------------------

If you face issues:

- Delete `node_modules` and `pnpm-lock.yaml`, then run:  
  `pnpm install`

- Make sure you're using a compatible Node.js version (>=18)

- For Tailwind styling issues, check `globals.css` and `tailwind.config.ts`

---------------------------
Contact
---------------------------

If you have any questions or need support, feel free to reach out to me.
