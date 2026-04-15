# Period Tracker - Next.js Frontend

A modern, responsive Next.js application with TypeScript for tracking menstrual cycles, monitoring symptoms, and predicting future periods.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm
- **Runtime**: Node.js

## Features

✅ **Track Your Period**

- Log period start and end dates
- Record flow intensity (light, moderate, heavy)
- Add notes and observations

✅ **Monitor Symptoms**

- Log various symptoms with severity levels
- Track patterns over time

✅ **Predict Next Period**

- Automatic prediction based on cycle history
- Customizable cycle length settings

✅ **Cycle History**

- View all past periods and statistics
- Average cycle duration calculations

✅ **User Dashboard**

- Overview of current period status
- Quick access to common actions
- Cycle statistics and summary

✅ **Responsive Design**

- Mobile-friendly interface
- Modern gradient design
- Smooth transitions and interactions

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx          # Dashboard overview
│   ├── login/page.tsx              # User login
│   ├── signup/page.tsx             # User registration
│   ├── log-period/page.tsx         # Log new period
│   ├── cycle-history/page.tsx      # View all periods
│   ├── settings/page.tsx           # Configure settings
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── lib/
│   ├── api.ts                      # API service layer
│   └── auth.ts                     # Authentication utilities
└── globals.css
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create an optimized production build:

```bash
npm run build
npm start
```

## API Integration

The frontend uses REST API to communicate with the Django backend. API endpoints are defined in `src/lib/api.ts`:

- **Authentication**: Login, signup, logout
- **Periods**: CRUD operations
- **Symptoms**: Track symptoms per period
- **Statistics**: Cycle information and predictions
- **Settings**: User preferences

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Implemented

✨ **Pages Created**:

- Login & Signup pages with form validation
- Dashboard with cycle overview
- Log Period form
- Cycle History view
- Settings page for customization

✨ **TypeScript Benefits**:

- Full type safety across the application
- Better IDE autocomplete
- Catch errors at compile time

✨ **Styling**:

- Tailwind CSS for responsive design
- Mobile-first approach
- Modern UI with gradients and transitions

## Connecting to Django Backend

Ensure your Django backend is running:

```bash
python manage.py runserver
```

The frontend will communicate with the backend at `http://localhost:8000/api`
