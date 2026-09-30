# ComplainAI — Centralized AI Government Complaint Platform

A production-style MERN college project based on the supplied ComplainAI specification. The original concept calls for a MERN + Generative AI multi-agent complaint platform with image understanding, classification, urgency prediction, duplicate detection, department routing, tracking, analytics, authentication and cloud image storage. fileciteturn0file0L5-L20

This rebuilt version adds the missing pieces requested:
- User registration/login with JWT + bcrypt
- Real email syntax + MX-record domain validation
- Forgot-password OTP by email with expiry and one-time use
- Grok 4.7 instead of Gemini/Flash for complaint analysis and image understanding
- Mandatory location with multi-option address search
- Government-style centralized admin portal
- Category admins for roads, education, health, electricity, water and public safety
- Admin verification and forwarding to the correct department by email
- Complaint tracking and status timeline
- Cloudinary image storage
- AI summary, category, urgency, image observations and duplicate hints
- Analytics dashboard
- Strong validation, rate limiting, Helmet, CORS and role-based authorization
- Modern responsive UI without requiring a paid frontend template

## Stack
Frontend: React + Vite + React Router + Axios + Lucide React + Recharts
Backend: Node.js + Express + Mongoose
DB: MongoDB
Auth: JWT + bcryptjs
Email: Nodemailer
AI: xAI Grok 4.7 via OpenAI-compatible SDK
Images: Cloudinary
Location search: Nominatim/OSM through backend proxy

The xAI API is OpenAI-compatible and current xAI documentation shows `grok-4.7` supports text and image input through the Responses API. citeturn0search0turn1search0turn0search4

## 1. Requirements on Kali Linux GNOME
Install Node.js 20+ and npm. MongoDB can be MongoDB Atlas (recommended for a college demo) or a local MongoDB installation.

```bash
node -v
npm -v
```

If Node is missing, install Node 20+ using your preferred NodeSource/nvm method. Then verify the commands above.

## 2. Install dependencies
From this folder:

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Environment variables
Copy the examples:

```bash
cd server
cp .env.example .env
```

Fill in:

- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: long random secret
- `XAI_API_KEY`: xAI API key
- `CLOUDINARY_*`: Cloudinary credentials
- `SMTP_*`: Gmail SMTP/app-password or another SMTP provider
- department email addresses

xAI's current quickstart uses an `XAI_API_KEY` environment variable and `https://api.x.ai/v1`; the project follows that approach. citeturn0search3turn0search2

## 4. Seed administrator accounts

```bash
cd server
npm run seed:admins
```

Default demo accounts are printed by the script. **Change their passwords before any real deployment.**

Six category administrators are seeded:
1. Roads & Infrastructure
2. Education
3. Health & Sanitation
4. Electricity
5. Water & Drainage
6. Public Safety

A Super Admin can see all categories.

## 5. Start backend

```bash
cd server
npm run dev
```

API: `http://localhost:5000`

## 6. Start frontend
Open another terminal:

```bash
cd client
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## 7. How the project works

### Citizen
1. Register with name, email and password.
2. Email is checked for valid syntax and its domain's MX records.
3. Login.
4. Submit a complaint with title, description, mandatory location and optional image.
5. Location field searches multiple address options.
6. Server uploads the image to Cloudinary.
7. Grok 4.7 analyzes text and image and returns structured JSON: summary, category, subcategory, urgency, confidence, image observations, safety flags and routing recommendation.
8. Complaint appears in the citizen dashboard with a timeline.

### Category admin
1. Login through Admin Login.
2. See complaints assigned to their category.
3. Open the AI analysis and evidence.
4. Verify or reject.
5. If verified, choose/confirm department and forward it.
6. The system emails the department contact and records the action.

### Super admin
Can inspect every category, user and complaint, plus platform-wide analytics.

## 8. Demo email configuration
For Gmail SMTP:
- Enable 2-Step Verification.
- Create a Google App Password.
- Put the generated app password into `SMTP_PASS`.
- Do not use your normal Gmail password.

For a college demonstration, Mailtrap/Ethereal can also be used so OTPs and forwarding emails stay inside a test inbox.

## 9. MongoDB Atlas
Create a free/low-cost cluster, database user, allow your IP, copy the connection string and place it in `MONGO_URI`.

## 10. Cloudinary
Create a Cloudinary account and put the cloud name, API key and API secret into `.env`. Images are uploaded from the backend, not directly from the browser, so secrets are never exposed in the React bundle.

## 11. Grok AI
The backend sends the complaint description plus the public Cloudinary image URL to Grok. Current xAI image-understanding documentation supports public image URLs and the `input_image` content type. citeturn1search0

If `XAI_API_KEY` is missing, the project falls back to a deterministic local analysis so the rest of the demo still works. For the actual AI demonstration, configure the key.

## 12. Location search
The UI calls `/api/locations/search?q=...`. The backend queries Nominatim and returns several options. The selected result stores:
- formatted address
- latitude
- longitude
- display name

For production government deployment, replace the public Nominatim endpoint with an approved geocoding provider or your own service and follow its usage policy.

## 13. Security notes
- JWT is used for API authentication.
- Passwords are bcrypt-hashed.
- OTPs are hashed before storage.
- OTP attempts are rate-limited and expire.
- Admin endpoints require role/category authorization.
- Helmet, CORS and request limits are enabled.
- Uploaded files are restricted to images and size-limited.
- API keys remain server-side.

## 14. Suggested college demo flow
Use two browser tabs:
- Tab A: citizen account
- Tab B: category admin account

Create a road complaint with a damaged-road image. Submit it. Show Grok analysis. Switch to the Road Admin. Verify it. Forward it to the Roads department. Show the generated email and status timeline. Then open the analytics dashboard.

## 15. Production upgrades
For a real government deployment, add:
- SSO/official identity integration
- MFA for admins
- audit log immutability
- CAPTCHA/abuse protection
- virus/malware scanning for uploads
- background queue (BullMQ/Redis) for AI/email work
- official GIS/geocoding provider
- SMS/WhatsApp notifications
- SLA timers and escalation rules
- department-specific service-level policies
- multilingual UI
- accessibility audit
- HTTPS/reverse proxy
- centralized logging and monitoring
- database backups and disaster recovery
