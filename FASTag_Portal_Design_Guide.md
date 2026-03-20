# FASTag Loose Tag Portal — Design System Guide

> **Version:** 1.0  
> **Stack:** React 18 + TypeScript + Tailwind CSS + shadcn/ui  
> **Aesthetic:** Industrial GovTech — clean, utilitarian, data-dense

---

## 1. Design Philosophy

The portal serves three distinct user roles (Toll Plaza operators, Acquirer Bank reviewers, IHMCL administrators), each with different needs and authority levels. The design follows an **industrial-utilitarian** direction: no decorative gradients, no rounded-everything — just clean lines, tight spacing, and high data density appropriate for operational government software.

**Core Principles:**

- **Role-coded accents** — each dashboard carries a unique accent color so users instantly know which context they're in
- **Information density over whitespace** — operators and admins scan tables fast; the UI respects that
- **Progressive disclosure** — details live in dialogs and expandable rows, not sprawled across the screen
- **Mobile-aware but desktop-first** — toll booth operators may use tablets; admins work on desktops

---

## 2. Color System

### Base Palette (CSS Variables — HSL Format)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `210 20% 98%` | `220 20% 8%` | Page background |
| `--foreground` | `215 25% 12%` | `210 20% 95%` | Primary text |
| `--card` | `0 0% 100%` | `220 18% 11%` | Card surfaces |
| `--primary` | `173 58% 36%` | `173 58% 42%` | Teal — brand actions, links |
| `--accent` | `38 92% 50%` | `38 92% 50%` | Amber — alerts, warnings |
| `--destructive` | `0 72% 51%` | `0 62.8% 30.6%` | Red — errors, block actions |
| `--muted` | `210 16% 93%` | `220 14% 16%` | Subtle backgrounds |
| `--border` | `214 20% 88%` | `220 14% 18%` | Borders, dividers |

### Status Colors

These are critical for complaint tracking. Every status has a dedicated color used consistently across badges, charts, and indicators:

| Status | Color | Badge Style |
|---|---|---|
| **Pending** | Amber `#EAB308` | `bg-amber-500/10 text-amber-600 border-amber-500/20` |
| **Fined** | Violet `#8B5CF6` | `bg-violet-500/10 text-violet-600 border-violet-500/20` |
| **Blocked** | Red `#EF4444` | `bg-red-500/10 text-red-600 border-red-500/20` |
| **No Issue** | Emerald `#10B981` | `bg-emerald-500/10 text-emerald-600 border-emerald-500/20` |

### Role Accent Colors

| Role | Accent Class | Where Used |
|---|---|---|
| Toll Plaza | `bg-primary` (Teal) | Sidebar brand, nav highlight, avatar |
| Acquirer Bank | `bg-violet-600` | Sidebar brand, nav highlight, avatar |
| IHMCL Admin | `bg-slate-800` | Sidebar brand, nav highlight, avatar |

---

## 3. Typography

**Font Stack:**

- **Primary:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) — geometric sans-serif with excellent readability at small sizes
- **Monospace:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — for Case IDs, FASTag IDs, VRNs

**Scale:**

| Element | Size | Weight | Notes |
|---|---|---|---|
| Page title (top bar) | `text-sm` (14px) | `font-semibold` (600) | |
| Card title | `text-base` (16px) | `font-semibold` | |
| Body text | `text-sm` (14px) | `font-normal` (400) | |
| Table cell | `text-xs` (12px) | `font-normal` | Dense data |
| Label / caption | `text-[10px]` | `font-medium` (500) | Uppercase, tracked |
| Monospace IDs | `text-xs` | `font-mono` | JetBrains Mono |

**Tracking:** Labels and section headers use `tracking-wider` + `uppercase` for a clean utilitarian feel.

---

## 4. Layout Architecture

### Sidebar + Content Shell

Every dashboard uses a shared `DashboardShell` component:

```
┌──────────┬─────────────────────────────────┐
│          │  Top Bar (h-14, border-bottom)   │
│  Sidebar │─────────────────────────────────│
│  (w-64)  │                                  │
│          │  Content Area                    │
│  - Brand │  (overflow-y-auto, p-4 md:p-6)  │
│  - Nav   │                                  │
│  - User  │                                  │
│          │                                  │
└──────────┴─────────────────────────────────┘
```

**Responsive behavior:**

- `lg` and up: sidebar is static, always visible
- Below `lg`: sidebar slides in from left with a dark overlay backdrop
- Hamburger menu in top bar triggers the slide-in

### Grid Patterns

| Context | Grid | Breakpoints |
|---|---|---|
| Summary cards (Admin) | `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` | 2 → 3 → 6 |
| Stat cards (Bank) | `grid-cols-2 md:grid-cols-4` | 2 → 4 |
| Bank breakdown | `grid-cols-1 md:grid-cols-2` | 1 → 2 |
| Filter bar | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` | 1 → 2 → 5 |
| Form fields | `grid-cols-1 sm:grid-cols-2` | 1 → 2 |

---

## 5. Component Inventory

### StatusBadge

The most reused component. Renders a compact badge with a colored dot indicator:

```tsx
<Badge variant="outline" className="bg-amber-500/10 text-amber-600 ...">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
  Pending
</Badge>
```

Always use `StatusBadge` — never inline status colors manually.

### SummaryCard (Admin Dashboard)

Left-bordered card with colored accent strip:

```tsx
<Card className="border-l-4 border-l-amber-500">
  <CardContent className="p-3">
    <p className="text-[10px] uppercase tracking-wider">Pending</p>
    <p className="text-2xl font-bold">12</p>
  </CardContent>
</Card>
```

### StatCard (Bank Dashboard)

Background-tinted stat block:

```tsx
<div className="bg-amber-500/10 rounded-lg border p-3">
  <p className="text-[10px] uppercase tracking-wider">Pending</p>
  <p className="text-2xl font-bold">5</p>
</div>
```

### Bank Breakdown Card

Uses a segmented horizontal bar to show status distribution:

```tsx
<div className="flex h-2 rounded-full overflow-hidden bg-secondary gap-px">
  <div className="bg-violet-500" style={{ width: '30%' }} />
  <div className="bg-red-500" style={{ width: '15%' }} />
  <div className="bg-emerald-500" style={{ width: '25%' }} />
  <div className="bg-amber-400" style={{ width: '30%' }} />
</div>
```

### Tables

All tables use shadcn `Table` with:
- `text-xs` cells for data density
- `font-mono` for IDs and codes
- Responsive column hiding: `hidden md:table-cell`, `hidden lg:table-cell`, `hidden xl:table-cell`
- Image thumbnails in last column with `Dialog` for enlargement

### Action Dialog (Bank Dashboard)

Modal with case details, evidence image, reason textarea, and three action buttons:

| Button | Color | Behavior |
|---|---|---|
| Fine | `bg-violet-600` | Requires reason text |
| Block Tag | `variant="destructive"` | Requires reason text |
| No Issue | `variant="outline"` green tint | Reason optional |

---

## 6. Animation & Transitions

Minimal, functional motion only:

| Effect | Implementation | Duration |
|---|---|---|
| Page entry | `animate-fade-up` (translateY + opacity) | 400ms ease-out |
| Staggered cards | `.animate-fade-up-1` through `-5` | 50ms increments |
| Sidebar slide | `transform transition-transform duration-200` | 200ms ease-out |
| Image hover | `hover:opacity-80 transition-opacity` | Default |
| Bar chart fill | `transition-all duration-500` | 500ms |

---

## 7. Responsive Table Strategy

Tables are the primary data display. Our responsive approach uses **column hiding** rather than horizontal scrolling where possible:

| Column | Mobile | Tablet (`md`) | Desktop (`lg`) | Wide (`xl`) |
|---|---|---|---|---|
| Case ID | ✅ | ✅ | ✅ | ✅ |
| VRN | ✅ | ✅ | ✅ | ✅ |
| Status | ✅ | ✅ | ✅ | ✅ |
| FASTag ID | ❌ | ✅ | ✅ | ✅ |
| Plaza / Bank | ❌ | ✅ | ✅ | ✅ |
| Crossing time | ❌ | ❌ | ✅ | ✅ |
| Reason | ❌ | ❌ | ✅ | ✅ |
| Image thumb | ❌ | ❌ | ❌ | ✅ |

An outer `overflow-x-auto` wrapper provides fallback horizontal scroll when needed.

---

## 8. Three Dashboards — Feature Map

### Dashboard 1: Toll Plaza

| Section | Components | Purpose |
|---|---|---|
| New Complaint | Form with 4 fields + image upload | File violation report |
| My Cases | Table with status tracking | Monitor submitted cases |

**Nav:** `New Complaint` · `My Cases`

### Dashboard 2: Acquirer Bank

| Section | Components | Purpose |
|---|---|---|
| Stat Row | 4 stat cards | Quick counts |
| Pending Review | Filtered table + action dialogs | Take enforcement action |
| Actioned | Historical resolved cases | Audit trail |
| All Cases | Combined view | Full bank portfolio |

**Nav:** `Pending Review` · `Actioned` · `All Cases`

### Dashboard 3: IHMCL Admin

| Section | Components | Purpose |
|---|---|---|
| Summary Cards | 6 colored cards (total/pending/fined/blocked/clear/unmapped) | At-a-glance KPIs |
| Bank Breakdown | 4 bank cards with segmented bars | Bank-level performance |
| Recent Complaints | Compact table (top 8) | Quick scan |
| All Cases | Full table with 5 filters + CSV export | Deep investigation |
| Analytics | Bar charts + progress bars | Trends & response rates |

**Nav:** `Overview` · `All Cases` · `Analytics`

---

## 9. File Structure

```
src/
├── data/
│   ├── mock.ts          # Types, static data, mock generator
│   └── store.tsx         # React Context global state
├── components/
│   └── shared/
│       ├── DashboardShell.tsx   # Sidebar + topbar layout wrapper
│       └── StatusBadge.tsx      # Status indicator component
├── pages/
│   ├── LoginPage.tsx            # Role selector login
│   ├── TollPlazaDashboard.tsx   # Dashboard 1
│   ├── BankDashboard.tsx        # Dashboard 2
│   └── IHMCLDashboard.tsx       # Dashboard 3
├── App.tsx              # Router (role-based)
├── main.tsx             # Entry point
└── index.css            # Theme + animations
```

---

## 10. Production Migration Notes

This prototype uses in-memory mock data. To wire up to a real backend:

1. **Replace `store.tsx`** — swap `useState` with API calls (`fetch` / `axios`) to your Express + Supabase backend
2. **Auth** — replace `sessionStorage` role selector with Supabase Auth or your own JWT flow
3. **Image upload** — the upload zone is a placeholder; connect it to `supabase.storage.from('complaint_images').upload(...)`
4. **Real-time** — add Supabase Realtime subscriptions for live status updates on bank/admin dashboards
5. **Pagination** — current tables render all rows; add cursor-based pagination for 100+ complaints

---

*Design System v1.0 — FASTag Loose Tag Reporting Portal*  
*Built with React + Tailwind CSS + shadcn/ui*
