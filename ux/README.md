# Green Acres Demonstration - React Frontend

This project is a professional React frontend for the Green Acres Demonstration application, built with Vite, Material UI, and React Router. All code is contained in the `ux` directory.

## Features
- Material UI 3 (Google look and feel)
- Responsive layout: Banner, left menu, chat window, and results area
- React Router navigation (Plans, Settings)
- Factored components for maintainability
- Chat interface with RESTful backend integration
- Professional theme and color palette
- Unit testing setup

## Getting Started

1. Install dependencies:
	```bash
	npm install
	```
2. Start the development server:
	```bash
	npm run dev
	```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure
- `src/components/` - UI components (Banner, Menu, Chat, Results, etc.)
- `src/pages/` - Route views (Plans, Settings)
- `src/App.jsx` - Main app layout and routing
- `src/theme.js` - Material UI theme customization
- `src/tests/` - Unit tests

## Testing
Run tests with:
```bash
npm test
```

## Notes
- All frontend code is in the `ux` directory.
- Backend REST API endpoints should be configured in `src/api.js`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
