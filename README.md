# HRMS Frontend

Enterprise Human Resource Management System — production-ready frontend foundation.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** design system
- **Zustand** (client state) + **TanStack Query** (server state)
- **React Hook Form** + **Zod** (forms)
- **Axios** (API layer) + **Recharts** (charts) + **Framer Motion** (animations)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use backend credentials (from your `.env` seed):

- Email: `owner@hrms.local`
- Password: `Owner@12345`

Ensure the backend is running at `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api/v1`).

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete architecture documentation.

## Project Structure

```
src/
├── app/           # Routes (auth, dashboard, errors)
├── components/    # UI, layout, data-table, forms, charts
├── features/      # Future business modules
├── hooks/         # Custom React hooks
├── services/      # API client & interceptors
├── store/         # Zustand stores
├── providers/     # React context providers
├── types/         # TypeScript definitions
├── config/        # App configuration
└── layouts/       # Layout wrappers
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Dashboard Routes

| Route | Role |
|-------|------|
| `/owner` | Owner |
| `/hr` | HR Admin |
| `/manager` | Manager |
| `/employee` | Employee |
