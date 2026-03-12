# Deployment (Vercel)

## 1) Push to GitHub
- Create a repo and push this project.

## 2) Create a Vercel project
- Import the GitHub repo into Vercel.
- Vercel will detect Next.js automatically.

## 3) Add Vercel Postgres
- In Vercel project: Storage ? Create Database ? Postgres.
- Attach it to the project (Vercel will add `POSTGRES_URL`).

## 4) Add Vercel Blob
- In Vercel project: Storage ? Create ? Blob.
- Attach it to the project (Vercel will add `BLOB_READ_WRITE_TOKEN`).

## 5) Configure environment variables
Add these in Vercel ? Project Settings ? Environment Variables:
- `APP_URL` = your Vercel domain (e.g. https://your-site.vercel.app)
- `SESSION_SECRET` = long random string
- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD` = initial admin password

## 6) Deploy
- Click Deploy in Vercel (or push to main).

## 7) First admin login
- Go to `/admin/login` and log in.
- You will be forced to change the password.

## Notes
- For AdSense, insert your publisher ID in the AdSlot component.
- You can add a custom domain in Vercel after deployment.
