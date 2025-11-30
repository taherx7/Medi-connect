# MediConnect – Doctor‑Patient Booking Platform

> **MediConnect** is a modern, premium‑looking web application that lets patients book appointments with doctors in a smooth, animated, and responsive UI. It features an interactive calendar, dynamic search dropdown, secure login flow, and flexible payment options.

---

## ✨ Features

- **Interactive Calendar** – Patients can pick any future date and view available time slots.
- **Dynamic Search Dropdown** – Real‑time doctor search with profile photos and names displayed side‑by‑side.
- **Login‑Redirect Flow** – If a patient tries to book while not logged in, they are redirected to the login page and returned to the calendar after authentication.
- **Payment Options** – Cash payments require no extra personal details; online payments reveal card fields only when selected.
- **Doctor Dashboard** – Doctors can edit their profile (including **specialty**), set working hours, block unavailable slots, and view upcoming appointments.
- **Premium UI** – Vibrant gradients, glass‑morphism, micro‑animations, dark‑mode support, and responsive design.
- **SEO‑Ready** – Proper title tags, meta descriptions, heading hierarchy, and semantic HTML.

---

## 🛠️ Tech Stack

- **Frontend** – HTML, vanilla CSS, JavaScript (no frameworks for the UI).
- **Backend** – Node.js, Express, PostgreSQL.
- **File Storage** – Supabase (for doctor profile photos).
- **Authentication** – `express-session` with secure cookies.
- **Animations** – CSS keyframes and `IntersectionObserver` for scroll‑based reveals.

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** based on the provided example:
   ```bash
   cp .env.example .env
   ```
   Fill in the required values (database URL, session secret, Supabase credentials, etc.).

4. **Run the database migrations** (the schema is in `schema.sql`):
   ```bash
   psql $DATABASE_URL -f schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000` (or the port defined in `.env`).

---

<<<<<<< HEAD
## 🚀 Deployment on Render

This project is configured for easy deployment on [Render](https://render.com).

### Option 1: Blueprints (Recommended)
1. Create a new **Blueprint Instance** on Render.
2. Connect your GitHub repository.
3. Render will automatically detect `render.yaml` and set up:
   - A **PostgreSQL database**.
   - A **Node.js web service**.
4. You will need to manually add your `SUPABASE_URL` and `SUPABASE_KEY` in the Render dashboard environment variables after creation.

### Option 2: Manual Setup
1. Create a **PostgreSQL** database on Render.
2. Create a **Web Service** on Render:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Add the following Environment Variables:
   - `DATABASE_URL`: (Internal connection string from your Render DB)
   - `SESSION_SECRET`: (Any random string)
   - `SUPABASE_URL`: (Your Supabase URL)
   - `SUPABASE_KEY`: (Your Supabase Key)
   - `SUPABASE_BUCKET`: `doctor-photos`
   - `NODE_ENV`: `production`

### Database Setup
After deployment, connect to your Render database (using the external connection string) and run the contents of `schema.sql` to create the tables.

---

=======
>>>>>>> cb09ee84dc8a7a7d4bbac41578025e41fabdb027
## ⚙️ Environment Variables (`.env`)

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret for signing session cookies |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service key |
| `SUPABASE_BUCKET` | Bucket name for doctor photos (default: `doctor-photos`) |
| `PORT` | Port for the Express server (default: `3000`) |

---

## 📂 Project Structure

```
hackathon/
├─ public/                # Static assets (css, js, images)
├─ views/                 # EJS templates
│   ├─ doctor/            # Doctor profile & dashboard
│   ├─ patient/           # Patient dashboard
│   └─ partials/          # Header & footer
├─ routes/                # Express route handlers
│   ├─ auth.js            # Login / registration
│   ├─ doctor.js          # Doctor‑specific endpoints
│   └─ patient.js         # Patient‑specific endpoints
├─ config/                # DB & Supabase config
├─ schema.sql             # Database schema
├─ .gitignore             # Ignored files (generated automatically)
└─ README.md              # **You are reading it!**
```

---

## 🧭 Usage Walk‑through

1. **Visit the home page** – Search for doctors using the animated search bar.
2. **Select a doctor** – View their profile, see the interactive calendar, and pick a slot.
3. **Book an appointment** – If you’re not logged in, you’ll be taken to the login page and then back to the calendar.
4. **Doctor dashboard** – Doctors can edit their profile (including specialty), block unavailable times, and see upcoming appointments.
5. **Payment** – Choose *Cash* (no extra fields) or *Online* (card fields appear).

---

## 🧪 Testing

The project currently does not include automated tests, but you can manually verify:
- Calendar navigation and slot fetching (`/doctor/:id/slots`).
- Login‑redirect flow.
- Specialty and cost display in DT.
- Search dropdown layout (photo + name).

---

## 📜 License

This project is provided for educational / hackathon purposes. Feel free to adapt, improve, and share!

---

## 🙏 Acknowledgements

<<<<<<< HEAD
- Inspired by **Doctolib** UI/UX.
=======
>>>>>>> cb09ee84dc8a7a7d4bbac41578025e41fabdb027
- Icons from **Font Awesome**.
- Supabase for simple object storage.

---
<<<<<<< HEAD

*Happy coding, and may your appointments always be on time!*
=======
## Credits : Big thanks to @taherx7, @threalzaara, @mondherbenazza, @frozedy

>>>>>>> cb09ee84dc8a7a7d4bbac41578025e41fabdb027
