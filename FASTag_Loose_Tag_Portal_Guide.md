# FASTag Loose Tag Reporting Portal — v1 Prototype Guide

> **Project:** Tag-in-Hand / Loose FASTag Reporting Module  
> **Based on:** IHMCL Policy Circular 19.08.2019, IHMCL Circular 16.07.2024  
> **Scope:** Local prototype with cloud database (Supabase)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Phase 1 — Supabase Setup](#4-phase-1--supabase-setup)
5. [Phase 2 — Project Structure](#5-phase-2--project-structure)
6. [Phase 3 — Backend Setup](#6-phase-3--backend-setup)
7. [Phase 4 — Frontend Setup](#7-phase-4--frontend-setup)
8. [Phase 5 — The 3 Dashboards](#8-phase-5--the-3-dashboards)
9. [Phase 6 — Role-Based Login](#9-phase-6--role-based-login)
10. [Phase 7 — Running Everything](#10-phase-7--running-everything)
11. [FASTag → Bank Mapping Logic](#11-fastag--bank-mapping-logic)
12. [Build Checklist](#12-build-checklist)

---

## 1. Project Overview

### Problem Statement

When a vehicle passes through a FASTag toll lane without properly affixing the FASTag to the windshield (holding it in hand instead), the vehicle is liable for a **double fee and potential blacklisting**. Currently there is no structured digital workflow to report, track, and enforce these cases.

### What This Portal Does

- **Toll Plaza** detects a loose tag vehicle → submits a complaint with image + details
- **Issuer Bank** reviews the complaint → takes action (Fine / Block / No Issue)
- **IHMCL Admin** observes all cases, actions, and reasons → can download reports

### How Bank Routing Works

The FASTag ID contains an embedded prefix (first 6 digits = IIN/BIN code) that identifies which bank issued the tag. The system auto-maps each complaint to the correct bank using a `tag_bank_mapping` table. No manual assignment needed.

---

## 2. Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | React + Vite | Fast local dev, easy routing |
| Backend | Node.js + Express | Simple REST API |
| Database | **Supabase (free)** | Postgres + image file storage, hosted |
| Auth | Role selector (prototype) | No auth library needed for v1 |
| Image Storage | Supabase Storage | Free bucket, public URLs for images |
| Routing | React Router v6 | 3 separate dashboard views |

> **Supabase free tier includes:** 500MB database, 1GB file storage, 50,000 monthly active users — more than enough for a prototype.

---

## 3. System Architecture

```
┌─────────────────────┐     POST complaint      ┌────────────────────┐
│   Toll Plaza        │ ──────────────────────▶ │   Express Backend  │
│   Dashboard         │                          │   (Node.js :4000)  │
└─────────────────────┘                          └────────┬───────────┘
                                                          │
┌─────────────────────┐     PATCH action                  │  Auto-maps bank
│   Acquirer Bank     │ ──────────────────────▶          │  via Tag ID prefix
│   Dashboard         │ ◀─────────────────────           │
└─────────────────────┘     GET filtered cases  ┌────────▼───────────┐
                                                 │   Supabase         │
┌─────────────────────┐     GET all cases        │   (PostgreSQL)     │
│   IHMCL Admin       │ ──────────────────────▶ │                    │
│   Dashboard         │                          │   + Storage Bucket │
└─────────────────────┘                          │   (Images)         │
                                                 └────────────────────┘
```

---

## 4. Phase 1 — Supabase Setup

### Step 1: Create a Free Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it: `fastag-portal`
3. Note down from **Settings → API**:
   - `Project URL` → used as `SUPABASE_URL`
   - `anon public` key → used in frontend
   - `service_role` key → used in backend only (keep secret)

---

### Step 2: Create Database Tables

Open the **SQL Editor** in Supabase and run:

```sql
-- Toll Plazas
CREATE TABLE toll_plazas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plaza_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Acquirer Banks
CREATE TABLE acquirer_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FASTag ID Prefix → Bank Mapping
CREATE TABLE tag_bank_mapping (
  tag_id_prefix TEXT PRIMARY KEY,  -- first 6 digits of FASTag ID
  bank_id UUID REFERENCES acquirer_banks(id)
);

-- Complaints (main table)
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT UNIQUE NOT NULL,
  toll_plaza_id UUID REFERENCES toll_plazas(id),
  fastag_id TEXT NOT NULL,
  vrn TEXT NOT NULL,
  lane_id TEXT,
  crossing_datetime TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  assigned_bank_id UUID REFERENCES acquirer_banks(id),
  status TEXT DEFAULT 'Pending',       -- Pending / Fined / Blocked / No Issue
  bank_action_reason TEXT,
  bank_acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Step 3: Create Image Storage Bucket

1. Supabase → **Storage** → **New Bucket**
2. Name: `complaint_images

`
3. Set **Public: ON** (so image URLs work without auth tokens)

---

### Step 4: Seed Test Data

```sql
-- Insert sample toll plazas
INSERT INTO toll_plazas (name, plaza_code) VALUES
  ('Delhi-Meerut Expressway Plaza 1', 'DME-001'),
  ('NH-48 Gurugram Toll', 'NH48-GGN'),
  ('Yamuna Expressway Toll', 'YEP-003');

-- Insert sample acquirer banks
INSERT INTO acquirer_banks (name, bank_code) VALUES
  ('ICICI Bank', 'ICICI'),
  ('HDFC Bank', 'HDFC'),
  ('State Bank of India', 'SBI'),
  ('Axis Bank', 'AXIS');

-- Map FASTag prefixes to banks (first 6 digits of FASTag ID = IIN/BIN code)
INSERT INTO tag_bank_mapping (tag_id_prefix, bank_id)
  SELECT '402001', id FROM acquirer_banks WHERE bank_code = 'ICICI';

INSERT INTO tag_bank_mapping (tag_id_prefix, bank_id)
  SELECT '402002', id FROM acquirer_banks WHERE bank_code = 'HDFC';

INSERT INTO tag_bank_mapping (tag_id_prefix, bank_id)
  SELECT '402003', id FROM acquirer_banks WHERE bank_code = 'SBI';

INSERT INTO tag_bank_mapping (tag_id_prefix, bank_id)
  SELECT '402004', id FROM acquirer_banks WHERE bank_code = 'AXIS';
```

> **Note:** In production, replace these prefixes with actual NPCI IIN/BIN codes assigned to each issuer bank.

---

## 5. Phase 2 — Project Structure

```
fastag-portal/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   └── complaints.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── TollPlazaDashboard.jsx
    │   │   ├── BankDashboard.jsx
    │   │   └── IHMCLDashboard.jsx
    │   ├── components/
    │   │   ├── ComplaintForm.jsx
    │   │   ├── ComplaintTable.jsx
    │   │   └── StatusBadge.jsx
    │   ├── lib/
    │   │   └── supabase.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env
```

---

## 6. Phase 3 — Backend Setup

### Step 1: Initialize

```bash
mkdir fastag-portal && cd fastag-portal
mkdir backend && cd backend
npm init -y
npm install express cors dotenv @supabase/supabase-js uuid
```

Add `"type": "module"` to `package.json`.

---

### Step 2: `.env` File

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=4000
```

> ⚠️ Use the `service_role` key in backend (not `anon` key). Never expose it in frontend.

---

### Step 3: `index.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import complaintRoutes from './routes/complaints.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/complaints', complaintRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
```

---

### Step 4: `routes/complaints.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import express from 'express';
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generate unique Case ID
function generateCaseId() {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  return `CASE-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/complaints — Toll Plaza submits a new complaint
router.post('/', async (req, res) => {
  const { toll_plaza_id, fastag_id, vrn, lane_id, crossing_datetime, image_url } = req.body;

  // Auto-map to bank using first 6 digits of FASTag ID
  const prefix = fastag_id.substring(0, 6);
  const { data: mapping } = await supabase
    .from('tag_bank_mapping')
    .select('bank_id')
    .eq('tag_id_prefix', prefix)
    .single();

  const { data, error } = await supabase
    .from('complaints')
    .insert({
      case_id: generateCaseId(),
      toll_plaza_id,
      fastag_id,
      vrn,
      lane_id,
      crossing_datetime,
      image_url,
      assigned_bank_id: mapping?.bank_id || null,
      status: 'Pending'
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET /api/complaints — Fetch complaints (optionally filtered)
// Query params: ?bank_id=xxx  or  ?plaza_id=xxx
router.get('/', async (req, res) => {
  let query = supabase
    .from('complaints')
    .select(`*, toll_plazas(name, plaza_code), acquirer_banks(name)`)
    .order('created_at', { ascending: false });

  if (req.query.bank_id)  query = query.eq('assigned_bank_id', req.query.bank_id);
  if (req.query.plaza_id) query = query.eq('toll_plaza_id', req.query.plaza_id);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// PATCH /api/complaints/:id — Bank takes action on a complaint
router.patch('/:id', async (req, res) => {
  const { status, bank_action_reason } = req.body;

  const { data, error } = await supabase
    .from('complaints')
    .update({
      status,
      bank_action_reason,
      bank_acted_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;
```

---

## 7. Phase 4 — Frontend Setup

### Step 1: Scaffold with Vite

```bash
cd ../
npm create vite@latest frontend -- --template react
cd frontend
npm install @supabase/supabase-js react-router-dom axios
npm run dev
```

---

### Step 2: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

### Step 3: `frontend/.env`

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
VITE_API_URL=http://localhost:4000/api
```

---

### Step 4: `App.jsx` Routing

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TollPlazaDashboard from './pages/TollPlazaDashboard';
import BankDashboard from './pages/BankDashboard';
import IHMCLDashboard from './pages/IHMCLDashboard';

function App() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/plaza" element={user?.role === 'plaza' ? <TollPlazaDashboard /> : <Navigate to="/" />} />
        <Route path="/bank" element={user?.role === 'bank' ? <BankDashboard /> : <Navigate to="/" />} />
        <Route path="/ihmcl" element={user?.role === 'admin' ? <IHMCLDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 8. Phase 5 — The 3 Dashboards

### Dashboard 1 — Toll Plaza

**Purpose:** Submit new loose tag complaints with image evidence.

**UI Elements:**
- Complaint submission form
- Image upload (to Supabase Storage)
- Table of "My Submitted Cases" with live status

**Key Fields in Form:**

| Field | Type | Notes |
|---|---|---|
| FASTag ID | Text | Used to auto-detect bank |
| VRN | Text | Vehicle Registration Number |
| Lane ID | Text | Which lane at the plaza |
| Date & Time of Crossing | DateTime | When the incident occurred |
| Vehicle Photo | File Upload | JPEG/PNG, uploaded to Supabase |

**Image Upload Snippet:**

```javascript
const uploadImage = async (file) => {
  const path = `complaints/${Date.now()}-${file.name}`;
  
  await supabase.storage
    .from('complaint_images

')
    .upload(path, file);
  
  const { data } = supabase.storage
    .from('complaint_images

')
    .getPublicUrl(path);
  
  return data.publicUrl;  // Store this URL in the complaint record
};
```

---

### Dashboard 2 — Acquirer Bank

**Purpose:** Review complaints assigned to this bank and take enforcement action.

**UI Elements:**
- Complaints table filtered to this bank's cases only
- Thumbnail of uploaded vehicle image (click to enlarge)
- Action panel per row with 3 buttons
- Reason text box (required for Fine/Block)

**Action Buttons:**

| Button | Status Value | Reason Required? |
|---|---|---|
| ✅ Fine | `Fined` | Yes |
| 🚫 Block Tag | `Blocked` | Yes |
| ✔️ No Issue | `No Issue` | Optional |

**Action Handler Snippet:**

```javascript
const handleAction = async (complaintId, status, reason) => {
  if ((status === 'Fined' || status === 'Blocked') && !reason.trim()) {
    alert('Please provide a reason for this action.');
    return;
  }
  
  await axios.patch(`${import.meta.env.VITE_API_URL}/complaints/${complaintId}`, {
    status,
    bank_action_reason: reason
  });
  
  fetchComplaints(); // Refresh the list
};
```

---

### Dashboard 3 — IHMCL Admin

**Purpose:** Full visibility into all cases across all plazas and banks, with download.

**UI Elements:**
- Summary cards (Total / Pending / Fined / Blocked / No Issue)
- Full complaints table with all columns
- Filters: date range, status, toll plaza, bank
- CSV download button

**Summary Cards Data:**

```javascript
const summary = {
  total:    complaints.length,
  pending:  complaints.filter(c => c.status === 'Pending').length,
  fined:    complaints.filter(c => c.status === 'Fined').length,
  blocked:  complaints.filter(c => c.status === 'Blocked').length,
  noIssue:  complaints.filter(c => c.status === 'No Issue').length,
};
```

**CSV Download Snippet:**

```javascript
const downloadCSV = (data) => {
  const headers = [
    'Case ID', 'FASTag ID', 'VRN', 'Toll Plaza',
    'Assigned Bank', 'Status', 'Reason', 'Submitted At', 'Actioned At'
  ];
  
  const rows = data.map(c => [
    c.case_id,
    c.fastag_id,
    c.vrn,
    c.toll_plazas?.name || 'Unknown',
    c.acquirer_banks?.name || 'Unmapped',
    c.status,
    c.bank_action_reason || '',
    new Date(c.created_at).toLocaleString(),
    c.bank_acted_at ? new Date(c.bank_acted_at).toLocaleString() : ''
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${v}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `IHMCL_Report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
```

---

## 9. Phase 6 — Role-Based Login

For the prototype, use a **hardcoded role selector** dropdown instead of real auth. This avoids the complexity of user management while still demonstrating the role-separated dashboards.

### `pages/Login.jsx`

```javascript
const DEMO_USERS = [
  { label: '🛣️  Toll Plaza — DME-001',     role: 'plaza', id: 'PLAZA_UUID_1' },
  { label: '🛣️  Toll Plaza — NH48-GGN',    role: 'plaza', id: 'PLAZA_UUID_2' },
  { label: '🏦  ICICI Bank',               role: 'bank',  id: 'BANK_UUID_ICICI' },
  { label: '🏦  HDFC Bank',                role: 'bank',  id: 'BANK_UUID_HDFC' },
  { label: '🏦  SBI',                      role: 'bank',  id: 'BANK_UUID_SBI' },
  { label: '🏛️  IHMCL Admin',              role: 'admin', id: null },
];

const handleLogin = (selectedUser) => {
  localStorage.setItem('fastag_user', JSON.stringify(selectedUser));
  if (selectedUser.role === 'plaza') navigate('/plaza');
  if (selectedUser.role === 'bank')  navigate('/bank');
  if (selectedUser.role === 'admin') navigate('/ihmcl');
};
```

> Replace `PLAZA_UUID_1`, `BANK_UUID_ICICI` etc. with the actual UUIDs from your Supabase seed data.

---

## 10. Phase 7 — Running Everything

### Start Backend

```bash
cd fastag-portal/backend
node index.js
# ✅ Backend running on port 4000
```

### Start Frontend

```bash
cd fastag-portal/frontend
npm run dev
# ✅ Frontend running on http://localhost:5173
```

### Test the Flow

1. Open `http://localhost:5173`
2. Login as **Toll Plaza — DME-001**
3. Submit a complaint with FASTag ID starting with `402001` (maps to ICICI)
4. Logout → Login as **ICICI Bank**
5. See the complaint appear in bank's dashboard
6. Take action (Fine / Block / No Issue) with reason
7. Logout → Login as **IHMCL Admin**
8. See the case with bank's action and reason
9. Download CSV report

---

## 11. FASTag → Bank Mapping Logic

The auto-mapping works by reading the first 6 characters of the FASTag ID, which corresponds to the **IIN (Issuer Identification Number)** assigned by NPCI to each bank.

```
FASTag ID: 402001XXXXXXXXXX
           ^^^^^^
           First 6 digits = IIN/BIN prefix
           → Lookup in tag_bank_mapping table
           → Returns bank_id
           → Complaint auto-assigned to that bank
```

### What if the prefix isn't found?

```javascript
assigned_bank_id: mapping?.bank_id || null
// status remains 'Pending', visible to IHMCL as an unmapped case
```

IHMCL admin can see all unmapped cases (where `assigned_bank_id IS NULL`) and handle them manually.

### Adding More Mappings

Simply insert new rows into `tag_bank_mapping`:

```sql
INSERT INTO tag_bank_mapping (tag_id_prefix, bank_id)
  SELECT '402005', id FROM acquirer_banks WHERE bank_code = 'AXIS';
```

---

## 12. Build Checklist

### Supabase
- [ ] Project created and keys noted
- [ ] 4 tables created: `toll_plazas`, `acquirer_banks`, `tag_bank_mapping`, `complaints`
- [ ] `complaint_images

` storage bucket created (Public: ON)
- [ ] Seed data inserted (plazas, banks, tag prefix mappings)

### Backend
- [ ] Node.js + Express initialized
- [ ] `.env` configured with Supabase service key
- [ ] `POST /api/complaints` — creates complaint, auto-maps bank
- [ ] `GET /api/complaints` — filtered by bank or plaza
- [ ] `PATCH /api/complaints/:id` — bank updates status and reason

### Frontend
- [ ] Vite + React scaffolded
- [ ] Supabase client configured
- [ ] React Router with 3 protected routes
- [ ] **Login page** with role selector dropdown

### Toll Plaza Dashboard
- [ ] Complaint form with all fields
- [ ] Image upload to Supabase Storage
- [ ] "My Cases" table with status tracking

### Bank Dashboard
- [ ] Cases table filtered to this bank's assigned complaints
- [ ] Vehicle image thumbnail visible
- [ ] Fine / Block / No Issue action buttons
- [ ] Reason text box (required for Fine/Block)

### IHMCL Dashboard
- [ ] Summary cards (Total, Pending, Fined, Blocked, No Issue)
- [ ] Full complaints table with all columns
- [ ] Filter by status, date, plaza, bank
- [ ] CSV download button

---

## Appendix: Key Supabase URLs

| Resource | URL Format |
|---|---|
| API Base | `https://<project>.supabase.co/rest/v1/` |
| Image Public URL | `https://<project>.supabase.co/storage/v1/object/public/complaint_images

/<path>` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/<project>` |

---

*Guide Version: 1.0 — FASTag Portal Prototype*  
*For production deployment, add proper authentication, SLA timers, duplicate detection, and NPCI API integration as specified in the TMCC Portal implementation note.*
