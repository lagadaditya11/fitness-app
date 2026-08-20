# FitTrack — Calorie & Workout Tracker

A full-stack web app to log meals and workouts, track macros, and visualize your
calorie balance over time. Built with **Java (Spring Boot)** on the backend and
**React** on the frontend.

---

## 1. What does it do?

- **Register / Login** — secure accounts with JWT authentication
- **Food logging** — search a food database, pick grams and a meal, see daily totals
- **Nutrition** — automatic calories + protein / carbs / fat breakdown per day
- **Workouts** — create workout sessions and log sets (exercise, weight, reps)
- **Calorie math** — computes BMR and TDEE from your profile, gives a daily goal
- **Analytics** — line/bar charts of calories eaten vs goal and workout burn (7/30/90 days)
- **Streak tracking** — counts consecutive days you logged food
- **Profile** — update height, weight, age, sex, activity level

---

## 2. How it is made — the big picture

A modern website is usually **three separate pieces** that talk to each other:

```
Browser (React)  ──HTTP/JSON──►  Server (Java + Spring Boot)  ──SQL──►  Database (PostgreSQL)
  what you see                    logic, rules, security                where data is stored
```

1. **Frontend (React)** runs in the browser. It draws the pages and collects your input.
2. When you click something, the frontend sends a request to the **backend** using
   a web address like `POST /api/foodlog`.
3. The **backend** validates the request, reads/writes the **database**, and returns
   the answer as **JSON** (a text format for data).
4. The frontend receives the JSON and re-renders the screen.

The three pieces run separately and only talk over the network. That is the whole
point of a "full-stack" app: you can change the UI without touching the server, and
each layer can be scaled or replaced independently.

---

## 3. Tech stack

| Layer      | Technology                         | Why |
|------------|------------------------------------|-----|
| Frontend   | React 18 + TypeScript              | Component-based UI; types catch errors early |
| Build tool | Vite                              | Fast development server and bundler |
| Styling    | Tailwind CSS v4                    | Utility classes in the HTML, no separate CSS files |
| Charts     | Recharts                           | Easy React chart components for analytics |
| Routing    | React Router                       | Navigation between pages (login, dashboard, etc.) |
| Backend    | Java 21 + Spring Boot 3            | Mature framework that turns Java into a web server |
| Persistence| Spring Data JPA + Hibernate        | Maps Java classes to database tables automatically |
| Security   | Spring Security + JWT + BCrypt     | Login tokens + hashed passwords |
| Database   | PostgreSQL 16 (via Docker)         | Relational database, stores all records |
| Build      | Maven                              | Downloads dependencies and builds the backend |

---

## 4. Folder structure

```
fitness-tracker/
├── docker-compose.yml          # starts PostgreSQL in a container
├── backend/                    # Java + Spring Boot server (port 8080)
│   ├── pom.xml                 # Maven config: dependencies & build
│   └── src/main/java/com/fitness/tracker/
│       ├── FitnessTrackerApplication.java   # main() — starts the server
│       ├── config/             # JWT, security, CORS, seeder, current-user helper
│       ├── user/               # User entity + repository (accounts)
│       ├── auth/               # register/login logic + endpoints
│       ├── food/               # Food entity, search, custom foods
│       ├── foodlog/            # daily meal logging + day summary
│       ├── workout/            # sessions, sets, exercises
│       ├── profile/            # BMR/TDEE/daily-goal calculation
│       └── analytics/          # chart series + streak
└── frontend/                   # React app (port 5173)
    ├── package.json            # npm dependencies & scripts
    ├── vite.config.ts          # dev server + proxy /api → backend
    └── src/
        ├── main.tsx            # entry point that mounts the app
        ├── App.tsx             # defines the routes/pages
        ├── api.ts              # fetch helper — calls the backend with JWT
        ├── auth.tsx            # login state (keeps your token)
        ├── types.ts            # TypeScript types matching backend JSON
        ├── components/         # reusable UI pieces (Card, Button, Layout...)
        └── pages/              # one file per screen
```

---

## 5. How a feature works end-to-end (example)

**"Log 200g of chicken for dinner"**

1. **Frontend** — `pages/FoodLog.tsx` shows a search box. You type "chicken",
   it calls `GET /api/foods/search?q=chicken` and lists results.
2. You pick the food, enter `200` grams, choose `DINNER`, click **Add to log**.
3. **Frontend** sends: `POST /api/foodlog?foodId=1` with body `{grams: 200, mealType: "DINNER"}`.
4. **Backend** — `FoodLogController` receives it → `FoodLogService` saves a new row.
5. The app re-loads `GET /api/foodlog/day` — the backend sums up the day
   (330 kcal, 62 g protein) and returns it as JSON.
6. **Frontend** re-renders and you see the totals update.

Every feature follows this same pattern:
**page → API call → controller → service → repository → database → JSON back → render.**

### The 3-layer pattern inside the backend
- **Entity** (`Food.java`) — the Java blueprint of a database table.
- **Repository** (`FoodRepository.java`) — queries the database ("foods whose name contains X").
- **Controller + Service** (`FoodController.java`, `FoodService.java`) — receives requests,
  applies rules, returns JSON.

---

## 6. Security

- **Passwords** are never stored in plain text — they are scrambled with BCrypt hashing.
- On login, the backend creates a **JWT** (a signed "ID card" containing your email + id).
- The frontend stores the token and sends it in every request header:
  `Authorization: Bearer <token>`.
- `JwtAuthenticationFilter` checks the signature on every request; invalid or expired
  tokens are rejected with `401`.
- Each user's data is scoped to their own id — you only ever see your own logs.

---

## 7. The calorie math

- **BMR** (basal metabolic rate) via the Mifflin-St Jeor formula:
  `10 × weight(kg) + 6.25 × height(cm) − 5 × age` (+5 for male, −161 for female).
- **TDEE** = BMR × activity multiplier (sedentary 1.2 … very active 1.9).
- **Daily goal** = TDEE by default, or a custom number you set in Profile.
- **Workout burn** is estimated from total volume: `weight × reps` summed over all sets × 0.05.
  (A rough heuristic — real burn depends on many factors.)

---

## 8. How to run it

Requirements: Docker, Java 21+ (the machine has Java 26), Node 18+, Maven.

```bash
# 1. Start the database
cd fitness-tracker
docker compose up -d postgres

# 2. Start the backend (port 8080)
cd backend
mvn spring-boot:run

# 3. Start the frontend (port 5173) — in a new terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, register an account, and start logging.

> The app seeds a starter food database (chicken, rice, eggs…) and exercise library
> (squat, bench press…) automatically on first launch (`config/DataSeeder.java`).

---

## 9. API reference (brief)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | create account → returns JWT |
| POST | `/api/auth/login` | login → returns JWT |
| GET | `/api/foods/search?q=` | search foods |
| GET | `/api/foods` | list your custom foods |
| POST | `/api/foods` | add a custom food |
| POST | `/api/foodlog?foodId=` | log a meal |
| GET | `/api/foodlog/day?date=` | daily summary (calories/macros) |
| DELETE | `/api/foodlog/{id}` | remove a food log |
| GET | `/api/workouts/sessions` | list your workouts |
| POST | `/api/workouts/sessions` | create a workout |
| GET | `/api/workouts/sessions/{id}` | session + sets detail |
| POST | `/api/workouts/sessions/{id}/sets?exerciseId=` | add a set |
| DELETE | `/api/workouts/sessions/{sid}/sets/{setId}` | remove a set |
| GET | `/api/workouts/exercises/search?q=` | search exercises |
| POST | `/api/workouts/exercises` | add a custom exercise |
| GET | `/api/profile` | BMR, TDEE, daily goal, profile |
| PUT | `/api/profile` | update profile |
| GET | `/api/analytics/daily?days=30` | chart series |
| GET | `/api/analytics/streak` | current day streak |

---

## 10. Ideas to extend it

- **Workout templates** — save a set of exercises and reuse them
- **Calorie cycling** — different goals on training vs rest days
- **Strength PR charts** — track max weight per exercise over time
- **Food barcode scanner / OCR** — nutrition from a photo
- **CSV/PDF export** of your history
- **Dockerize the backend** so one `docker compose up` starts everything
- **Tests** — JUnit for services, React Testing Library for components

