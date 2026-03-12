# Product Suggestion Site

This is a Next.js app for publishing product suggestions with admin uploads, Vercel Postgres, Vercel Blob storage, and keyword search.

## Quick start

1. Install dependencies

   npm install

2. Update .env

   Ensure these are set: APP_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
   POSTGRES_URL, BLOB_READ_WRITE_TOKEN.

3. Run dev server

   npm run dev

4. Open

   http://localhost:3000

## Admin login

- Default admin is created from ADMIN_EMAIL/ADMIN_PASSWORD on first run.
- You will be forced to change the password after the first login.

## Image storage

Uploads are stored in Vercel Blob (public URLs saved in the database).

## Database

Uses Postgres (Vercel Postgres or any compatible provider).

## Deployment

See DEPLOYMENT.md for Vercel deployment steps.
