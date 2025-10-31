# Gensec Dashboard

A modern, responsive dashboard for the Gensec security scanning platform.

## Features

- **Navigation Bar**: Logo on left, menu items (Home, About, Pricing) in center, Login/Register on right
- **Home Page**: Hero section with call-to-action buttons and feature highlights
- **About Page**: Information about Gensec and its mission
- **Pricing Page**: Detailed feature list and pricing plans
- **Login/Register Modal**: Email-based authentication and GitHub OAuth option (frontend only)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  ├── components/
  │   ├── NavBar.jsx       # Navigation bar component
  │   ├── LoginModal.jsx   # Login/Register modal
  ├── pages/
  │   ├── Home.jsx         # Home page
  │   ├── About.jsx         # About page
  │   ├── Pricing.jsx      # Pricing page with features
  ├── App.jsx              # Main app component with routing
  ├── main.jsx             # Entry point
  └── index.css            # Global styles
```

## Technologies Used

- React 18
- React Router DOM 6
- Vite 5
- Tailwind CSS 3
- Space Grotesk Font

## Notes

- This is a frontend-only application
- Login/Register functionality is UI-only (no backend integration)
- GitHub OAuth is mocked (requires backend for actual implementation)
- All routes are client-side only