# VoteSafe — Complete Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Structure](#3-database-structure)
4. [REST API Reference](#4-rest-api-reference)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Deployment](#6-deployment)
7. [User Guide](#7-user-guide)
8. [Security & Anonymity](#8-security--anonymity)

---

## 1. Project Overview

**VoteSafe** is a full-stack anonymous voting web application built as a high school graduation project (atestat). It allows users to create polls, share them, and collect anonymous votes securely.

### Key Features

- User registration and login with two distinct roles: **Voter** and **Organizer**
- Organizers can create polls with multiple options and a deadline
- Voters can vote once per poll — re-voting is prevented
- Votes are stored anonymously — the organizer cannot see who voted for what
- Results are visible at any time after a vote is cast
- Polls expire automatically based on `closes_at` timestamp
- Dark mode / Light mode toggle
- Fully deployed: frontend on Netlify, backend proxy on Vercel, database on Oracle APEX

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | SCSS (modular, chapter-based) |
| Routing | React Router DOM v6 |
| HTTP Client | Fetch API |
| Backend Database | Oracle APEX (iAcademy2) |
| REST API | Oracle ORDS (RESTful Data Services) |
| CORS Proxy | Vercel Serverless Functions |
| Frontend Hosting | Netlify |
| Version Control | Git + GitHub |

---

## 3. Database Structure

The database is hosted on **Oracle APEX** (iAcademy2 platform) under schema `RO_A665_PLSQL_S25`.

### Tables

#### `vs_users`
Stores all registered users.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | NUMBER (PK, identity) | Unique user ID |
| `username` | VARCHAR2(50) | Unique username |
| `email` | VARCHAR2(100) | Unique email address |
| `password` | VARCHAR2(255) | Password (plain text — school environment) |
| `role` | VARCHAR2(10) | Either `voter` or `organizer` |
| `created_at` | TIMESTAMP | Account creation time |

#### `vs_polls`
Stores all polls created by organizers.

| Column | Type | Description |
|--------|------|-------------|
| `poll_id` | NUMBER (PK, identity) | Unique poll ID |
| `organizer_id` | NUMBER (FK → vs_users) | ID of the organizer who created it |
| `title` | VARCHAR2(200) | Poll title |
| `description` | VARCHAR2(1000) | Optional description |
| `closes_at` | TIMESTAMP | Deadline for voting |
| `is_closed` | NUMBER(1) | 0 = open, 1 = closed (legacy, logic uses closes_at) |
| `created_at` | TIMESTAMP | Poll creation time |

#### `vs_options`
Stores the answer options for each poll.

| Column | Type | Description |
|--------|------|-------------|
| `option_id` | NUMBER (PK, identity) | Unique option ID |
| `poll_id` | NUMBER (FK → vs_polls) | The poll this option belongs to |
| `option_text` | VARCHAR2(200) | The text of the option |

#### `vs_votes`
Stores individual votes — **anonymous**, no user_id stored here.

| Column | Type | Description |
|--------|------|-------------|
| `vote_id` | NUMBER (PK, identity) | Unique vote ID |
| `option_id` | NUMBER (FK → vs_options) | The option that was voted for |
| `voted_at` | TIMESTAMP | When the vote was cast |

#### `vs_voted_log`
Tracks which users have voted on which polls — without revealing which option they chose.

| Column | Type | Description |
|--------|------|-------------|
| `log_id` | NUMBER (PK, identity) | Unique log ID |
| `poll_id` | NUMBER (FK → vs_polls) | The poll |
| `user_id` | NUMBER (FK → vs_users) | The user who voted |
| `voted_at` | TIMESTAMP | When they voted |
| UNIQUE | (poll_id, user_id) | Prevents double voting |

### Views

#### `vs_active_polls`
Returns only polls that are currently open (not expired, not older than 28 days).

```sql
CREATE OR REPLACE VIEW vs_active_polls AS
SELECT * FROM vs_polls
WHERE closes_at > CURRENT_TIMESTAMP
AND created_at > CURRENT_TIMESTAMP - INTERVAL '28' DAY
```

#### `vs_closed_polls`
Returns polls that have closed within the last 14 days.

```sql
CREATE OR REPLACE VIEW vs_closed_polls AS
SELECT * FROM vs_polls
WHERE closes_at <= CURRENT_TIMESTAMP
AND closes_at > CURRENT_TIMESTAMP - INTERVAL '14' DAY
```

---

## 4. REST API Reference

**Base URL:** `https://votesafe-proxy.vercel.app/api`

All endpoints are proxied through Vercel to avoid CORS issues. The proxy forwards requests to:
`https://iacademy2.oracle.com/ords/ro_a665_plsql_s25/votesafe/`

Parameters are passed as **URL query strings**.

---

### `POST /auth/register`

Registers a new user.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `username` | string | ✅ |
| `email` | string | ✅ |
| `password` | string | ✅ |
| `role` | string (`voter` or `organizer`) | ✅ |

**Response (success):**
```json
{ "success": true, "message": "User registered successfully" }
```

**Response (error):**
```json
{ "success": false, "message": "Email or username already exists" }
```

---

### `POST /auth/login`

Authenticates a user.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response (success):**
```json
{
  "success": true,
  "user_id": 1,
  "role": "organizer",
  "username": "ursu"
}
```

---

### `GET /polls`

Returns all active polls.

**Response:**
```json
{
  "items": [
    {
      "poll_id": 8,
      "title": "Best language?",
      "description": "Vote for your favourite.",
      "closes_at": "2026-05-29T05:48:00Z",
      "created_at": "2026-05-05T21:43:23Z",
      "organizer": "ursu"
    }
  ]
}
```

---

### `POST /polls`

Creates a new poll. Only organizers should use this.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `organizer_id` | string | ✅ |
| `title` | string | ✅ |
| `description` | string | ❌ |
| `closes_at` | string (datetime) | ✅ |

**Response:**
```json
{ "success": true, "poll_id": 9 }
```

---

### `GET /polls/:id`

Returns details and options for a specific poll.

**Response:**
```json
{
  "success": true,
  "poll_id": 8,
  "title": "Best language?",
  "description": "Vote for your favourite.",
  "closes_at": "2026-05-29T05:48:00Z",
  "organizer": "ursu",
  "options": [
    { "option_id": 1, "option_text": "Python" },
    { "option_id": 2, "option_text": "JavaScript" }
  ]
}
```

---

### `POST /options`

Adds an option to a poll.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `poll_id` | string | ✅ |
| `option_text` | string | ✅ |

**Response:**
```json
{ "success": true, "option_id": 5 }
```

---

### `POST /votes`

Submits a vote. Prevents double voting via `vs_voted_log`.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `option_id` | string | ✅ |
| `user_id` | string | ✅ |

**Response (success):**
```json
{ "success": true, "message": "Vote recorded" }
```

**Response (already voted):**
```json
{ "success": false, "message": "Already voted on this poll" }
```

---

### `GET /polls/:id/results`

Returns vote counts per option for a poll.

**Response:**
```json
{
  "success": true,
  "title": "Best language?",
  "results": [
    { "option": "Python", "votes": 5 },
    { "option": "JavaScript", "votes": 3 }
  ]
}
```

---

## 5. Frontend Architecture

### Folder Structure

```
src/
├── api/
│   └── api.js              ← all API calls
├── components/
│   ├── AppShell.jsx        ← wraps all pages with Header
│   ├── Header.jsx          ← navbar + theme toggle
│   └── PollCard.jsx        ← poll card component
├── pages/
│   ├── Home.jsx            ← poll listing
│   ├── SignIn.jsx          ← login page
│   ├── Register.jsx        ← registration page
│   ├── CreatePoll.jsx      ← poll creation (organizer only)
│   ├── Vote.jsx            ← voting page
│   └── Results.jsx         ← results page
├── styles/
│   ├── main.scss           ← imports all chapters
│   ├── base.scss           ← variables, reset, typography
│   ├── layout.scss         ← page layout, containers
│   ├── header.scss         ← navbar styles
│   ├── forms.scss          ← inputs, buttons, messages
│   ├── polls.scss          ← poll cards and list
│   └── vote.scss           ← vote and results pages
├── AuthContext.jsx          ← React context for user state
├── App.jsx                 ← router and auth provider
└── main.jsx                ← entry point
```

### Routing

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/login` | SignIn | Public |
| `/register` | Register | Public |
| `/polls/create` | CreatePoll | Organizer only |
| `/polls/:id` | Vote | Authenticated |
| `/polls/:id/results` | Results | Public |

### Authentication

User data is stored in `localStorage` under key `votesafe_user` after a successful login. The `AuthContext` provides `user` and `setUser` to all components. Logging out clears the stored data.

### Theme System

The theme toggle in `Header.jsx` sets `data-theme="light"` or `data-theme="dark"` on `<html>`. All CSS variables switch automatically based on this attribute.

---

## 6. Deployment

### Frontend — Netlify

- Repository: GitHub (`costinwwe/atestat`)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE=https://votesafe-proxy.vercel.app/api`
- Live URL: `https://votesafe.netlify.app`

### CORS Proxy — Vercel

Because Oracle ORDS (iAcademy2) blocks cross-origin requests from external domains, a lightweight serverless proxy was deployed on Vercel.

The proxy (`api/index.js`) forwards all requests from the React frontend to ORDS and adds the necessary CORS headers.

- Live URL: `https://votesafe-proxy.vercel.app`

### Database — Oracle APEX

- Platform: iAcademy2 (Oracle APEX 22.2.1, ORDS 21.4)
- Schema: `RO_A665_PLSQL_S25`
- ORDS Module: `votesafe`
- Base Path: `/votesafe/`

---

## 7. User Guide

### Register

1. Go to `https://votesafe.netlify.app/register`
2. Fill in username, email, password
3. Select your role: **Voter** or **Organizer**
4. Click **Register**
5. You will be redirected to the login page

### Login

1. Go to `/login`
2. Enter your email and password
3. Click **Sign in**
4. You are redirected to the home page

### Create a Poll (Organizer only)

1. Click **Create Poll** in the navbar
2. Fill in the title, description (optional), and closing date
3. Add at least 2 options
4. Click **Create poll**
5. A shareable link will appear — copy and send it to voters

### Vote

1. Open a poll link (e.g. `https://votesafe.netlify.app/polls/8`)
2. Select one of the available options
3. Click **Submit vote**
4. You will be redirected to the results page
5. You cannot vote again on the same poll

### View Results

1. Click **Results** on any poll card on the home page
2. Or go to `/polls/:id/results` directly
3. Results show how many votes each option received

---

## 8. Security & Anonymity

### How anonymity works

VoteSafe separates the act of voting from the identity of the voter using two tables:

- `vs_votes` — stores which **option** was chosen, with no user reference
- `vs_voted_log` — stores which **user** voted on which **poll**, with no option reference

This means:
- The organizer can see **how many votes** each option got
- The organizer **cannot** see who voted for what
- The system **prevents double voting** using a UNIQUE constraint on `(poll_id, user_id)` in `vs_voted_log`

### Limitations (school project context)

- Passwords are stored in plain text — in production, bcrypt or similar hashing should be used
- No JWT or session tokens — user data is stored in localStorage
- No rate limiting on the API

---
---

# VoteSafe — Documentație Completă

---

## Cuprins

1. [Descrierea Proiectului](#1-descrierea-proiectului)
2. [Tehnologii Folosite](#2-tehnologii-folosite)
3. [Structura Bazei de Date](#3-structura-bazei-de-date)
4. [Referință API REST](#4-referință-api-rest)
5. [Arhitectura Frontend](#5-arhitectura-frontend)
6. [Deployment](#6-deployment)
7. [Ghid de Utilizare](#7-ghid-de-utilizare)
8. [Securitate și Anonimat](#8-securitate-și-anonimat)

---

## 1. Descrierea Proiectului

**VoteSafe** este o aplicație web de vot anonim, dezvoltată ca proiect de atestat. Permite utilizatorilor să creeze sondaje, să le distribuie și să colecteze voturi în mod anonim și sigur.

### Funcționalități principale

- Înregistrare și autentificare cu două roluri distincte: **Voter** și **Organizer**
- Organizatorii pot crea sondaje cu mai multe opțiuni și un termen limită
- Votanții pot vota o singură dată per sondaj — re-votarea este prevenită
- Voturile sunt stocate anonim — organizatorul nu poate vedea cine a votat pentru ce opțiune
- Rezultatele sunt vizibile imediat după vot
- Sondajele expiră automat pe baza câmpului `closes_at`
- Mod întunecat / mod luminos
- Deployment complet: frontend pe Netlify, proxy pe Vercel, baza de date pe Oracle APEX

---

## 2. Tehnologii Folosite

| Strat | Tehnologie |
|-------|-----------|
| Frontend | React 18 + Vite |
| Stilizare | SCSS (modular, pe capitole) |
| Rutare | React Router DOM v6 |
| Client HTTP | Fetch API |
| Baza de date | Oracle APEX (iAcademy2) |
| API REST | Oracle ORDS (RESTful Data Services) |
| Proxy CORS | Vercel Serverless Functions |
| Hosting Frontend | Netlify |
| Control versiuni | Git + GitHub |

---

## 3. Structura Bazei de Date

Baza de date este găzduită pe **Oracle APEX** (platforma iAcademy2) sub schema `RO_A665_PLSQL_S25`.

### Tabele

#### `vs_users`
Stochează toți utilizatorii înregistrați.

| Coloană | Tip | Descriere |
|---------|-----|-----------|
| `user_id` | NUMBER (PK, identity) | ID unic al utilizatorului |
| `username` | VARCHAR2(50) | Nume de utilizator unic |
| `email` | VARCHAR2(100) | Adresă de email unică |
| `password` | VARCHAR2(255) | Parolă |
| `role` | VARCHAR2(10) | `voter` sau `organizer` |
| `created_at` | TIMESTAMP | Data creării contului |

#### `vs_polls`
Stochează toate sondajele create de organizatori.

| Coloană | Tip | Descriere |
|---------|-----|-----------|
| `poll_id` | NUMBER (PK, identity) | ID unic al sondajului |
| `organizer_id` | NUMBER (FK → vs_users) | ID-ul organizatorului |
| `title` | VARCHAR2(200) | Titlul sondajului |
| `description` | VARCHAR2(1000) | Descriere opțională |
| `closes_at` | TIMESTAMP | Termenul limită pentru vot |
| `is_closed` | NUMBER(1) | 0 = deschis, 1 = închis |
| `created_at` | TIMESTAMP | Data creării sondajului |

#### `vs_options`
Stochează opțiunile de răspuns pentru fiecare sondaj.

| Coloană | Tip | Descriere |
|---------|-----|-----------|
| `option_id` | NUMBER (PK, identity) | ID unic al opțiunii |
| `poll_id` | NUMBER (FK → vs_polls) | Sondajul căruia îi aparține |
| `option_text` | VARCHAR2(200) | Textul opțiunii |

#### `vs_votes`
Stochează voturile individuale — **anonim**, fără referință la utilizator.

| Coloană | Tip | Descriere |
|---------|-----|-----------|
| `vote_id` | NUMBER (PK, identity) | ID unic al votului |
| `option_id` | NUMBER (FK → vs_options) | Opțiunea votată |
| `voted_at` | TIMESTAMP | Momentul votului |

#### `vs_voted_log`
Urmărește care utilizatori au votat pe care sondaje — fără a dezvălui opțiunea aleasă.

| Coloană | Tip | Descriere |
|---------|-----|-----------|
| `log_id` | NUMBER (PK, identity) | ID unic |
| `poll_id` | NUMBER (FK → vs_polls) | Sondajul |
| `user_id` | NUMBER (FK → vs_users) | Utilizatorul care a votat |
| `voted_at` | TIMESTAMP | Momentul votului |
| UNIQUE | (poll_id, user_id) | Previne votul dublu |

### View-uri

#### `vs_active_polls`
Returnează doar sondajele active (neexpirate, mai recente de 28 de zile).

```sql
CREATE OR REPLACE VIEW vs_active_polls AS
SELECT * FROM vs_polls
WHERE closes_at > CURRENT_TIMESTAMP
AND created_at > CURRENT_TIMESTAMP - INTERVAL '28' DAY
```

#### `vs_closed_polls`
Returnează sondajele închise în ultimele 14 zile.

```sql
CREATE OR REPLACE VIEW vs_closed_polls AS
SELECT * FROM vs_polls
WHERE closes_at <= CURRENT_TIMESTAMP
AND closes_at > CURRENT_TIMESTAMP - INTERVAL '14' DAY
```

---

## 4. Referință API REST

**URL de bază:** `https://votesafe-proxy.vercel.app/api`

Toate endpoint-urile sunt proxiate prin Vercel pentru a evita problemele de CORS. Proxy-ul redirecționează cererile către:
`https://iacademy2.oracle.com/ords/ro_a665_plsql_s25/votesafe/`

Parametrii sunt transmiși ca **query string în URL**.

---

### `POST /auth/register`

Înregistrează un utilizator nou.

**Parametri:**

| Parametru | Tip | Obligatoriu |
|-----------|-----|-------------|
| `username` | string | ✅ |
| `email` | string | ✅ |
| `password` | string | ✅ |
| `role` | string (`voter` sau `organizer`) | ✅ |

**Răspuns (succes):**
```json
{ "success": true, "message": "User registered successfully" }
```

---

### `POST /auth/login`

Autentifică un utilizator.

**Parametri:**

| Parametru | Tip | Obligatoriu |
|-----------|-----|-------------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Răspuns (succes):**
```json
{
  "success": true,
  "user_id": 1,
  "role": "organizer",
  "username": "ursu"
}
```

---

### `GET /polls`

Returnează toate sondajele active.

---

### `POST /polls`

Creează un sondaj nou. Doar organizatorii pot folosi acest endpoint.

**Parametri:**

| Parametru | Tip | Obligatoriu |
|-----------|-----|-------------|
| `organizer_id` | string | ✅ |
| `title` | string | ✅ |
| `description` | string | ❌ |
| `closes_at` | string (datetime) | ✅ |

---

### `GET /polls/:id`

Returnează detaliile și opțiunile unui sondaj specific.

---

### `POST /options`

Adaugă o opțiune la un sondaj.

**Parametri:**

| Parametru | Tip | Obligatoriu |
|-----------|-----|-------------|
| `poll_id` | string | ✅ |
| `option_text` | string | ✅ |

---

### `POST /votes`

Înregistrează un vot. Previne votul dublu prin `vs_voted_log`.

**Parametri:**

| Parametru | Tip | Obligatoriu |
|-----------|-----|-------------|
| `option_id` | string | ✅ |
| `user_id` | string | ✅ |

---

### `GET /polls/:id/results`

Returnează numărul de voturi per opțiune pentru un sondaj.

**Răspuns:**
```json
{
  "success": true,
  "title": "Cel mai bun limbaj?",
  "results": [
    { "option": "Python", "votes": 5 },
    { "option": "JavaScript", "votes": 3 }
  ]
}
```

---

## 5. Arhitectura Frontend

### Structura folderelor

```
src/
├── api/
│   └── api.js              ← toate apelurile API
├── components/
│   ├── AppShell.jsx        ← învelește paginile cu Header
│   ├── Header.jsx          ← navbar + toggle temă
│   └── PollCard.jsx        ← componenta card sondaj
├── pages/
│   ├── Home.jsx            ← lista sondajelor
│   ├── SignIn.jsx          ← pagina de autentificare
│   ├── Register.jsx        ← pagina de înregistrare
│   ├── CreatePoll.jsx      ← creare sondaj (doar organizer)
│   ├── Vote.jsx            ← pagina de vot
│   └── Results.jsx         ← pagina de rezultate
├── styles/
│   ├── main.scss           ← importă toate capitolele
│   ├── base.scss           ← variabile, reset, tipografie
│   ├── layout.scss         ← layout pagini, containere
│   ├── header.scss         ← stiluri navbar
│   ├── forms.scss          ← inputuri, butoane, mesaje
│   ├── polls.scss          ← carduri și lista sondajelor
│   └── vote.scss           ← paginile de vot și rezultate
├── AuthContext.jsx          ← context React pentru starea utilizatorului
├── App.jsx                 ← router și provider auth
└── main.jsx                ← punct de intrare
```

### Rutare

| Cale | Componentă | Acces |
|------|-----------|-------|
| `/` | Home | Public |
| `/login` | SignIn | Public |
| `/register` | Register | Public |
| `/polls/create` | CreatePoll | Doar Organizer |
| `/polls/:id` | Vote | Autentificat |
| `/polls/:id/results` | Results | Public |

### Autentificare

Datele utilizatorului sunt stocate în `localStorage` sub cheia `votesafe_user` după autentificare. `AuthContext` furnizează `user` și `setUser` tuturor componentelor. Deconectarea șterge datele stocate.

### Sistemul de teme

Toggle-ul de temă din `Header.jsx` setează `data-theme="light"` sau `data-theme="dark"` pe elementul `<html>`. Toate variabilele CSS se schimbă automat pe baza acestui atribut.

---

## 6. Deployment

### Frontend — Netlify

- Repository: GitHub (`costinwwe/atestat`)
- Comandă build: `npm run build`
- Director publicare: `dist`
- Variabilă de mediu: `VITE_API_BASE=https://votesafe-proxy.vercel.app/api`
- URL live: `https://votesafe.netlify.app`

### Proxy CORS — Vercel

Deoarece Oracle ORDS (iAcademy2) blochează cererile cross-origin din domenii externe, a fost deployat un proxy serverless ușor pe Vercel.

Proxy-ul (`api/index.js`) redirecționează toate cererile din frontend-ul React către ORDS și adaugă header-ele CORS necesare.

- URL live: `https://votesafe-proxy.vercel.app`

### Baza de date — Oracle APEX

- Platformă: iAcademy2 (Oracle APEX 22.2.1, ORDS 21.4)
- Schemă: `RO_A665_PLSQL_S25`
- Modul ORDS: `votesafe`
- Cale de bază: `/votesafe/`

---

## 7. Ghid de Utilizare

### Înregistrare

1. Accesează `https://votesafe.netlify.app/register`
2. Completează username, email, parolă
3. Selectează rolul: **Voter** sau **Organizer**
4. Apasă **Register**
5. Vei fi redirecționat la pagina de autentificare

### Autentificare

1. Accesează `/login`
2. Introdu email-ul și parola
3. Apasă **Sign in**
4. Ești redirecționat la pagina principală

### Creare sondaj (doar Organizer)

1. Apasă **Create Poll** în navbar
2. Completează titlul, descrierea (opțional) și data de închidere
3. Adaugă cel puțin 2 opțiuni
4. Apasă **Create poll**
5. Va apărea un link de partajare — copiază-l și trimite-l votanților

### Vot

1. Deschide linkul unui sondaj (ex: `https://votesafe.netlify.app/polls/8`)
2. Selectează una din opțiunile disponibile
3. Apasă **Submit vote**
4. Vei fi redirecționat la pagina de rezultate
5. Nu poți vota din nou pe același sondaj

### Vizualizare rezultate

1. Apasă **Results** pe orice card de sondaj din pagina principală
2. Sau accesează direct `/polls/:id/results`
3. Rezultatele arată câte voturi a primit fiecare opțiune

---

## 8. Securitate și Anonimat

### Cum funcționează anonimatul

VoteSafe separă actul de vot de identitatea votantului folosind două tabele:

- `vs_votes` — stochează **opțiunea** aleasă, fără referință la utilizator
- `vs_voted_log` — stochează **utilizatorul** care a votat pe **sondajul** respectiv, fără referință la opțiune

Aceasta înseamnă că:
- Organizatorul poate vedea **câte voturi** a primit fiecare opțiune
- Organizatorul **nu poate** vedea cine a votat pentru ce
- Sistemul **previne votul dublu** printr-un constraint UNIQUE pe `(poll_id, user_id)` în `vs_voted_log`

### Limitări (context proiect școlar)

- Parolele sunt stocate în text simplu — în producție, ar trebui folosit bcrypt sau similar
- Nu există JWT sau tokeni de sesiune — datele utilizatorului sunt în localStorage
- Nu există rate limiting pe API

---

*VoteSafe — Proiect Atestat 2026*
