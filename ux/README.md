## leisureplan.app 


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

## Deployment

This app is currently published off a special branch using github static pages. Pushing changes to github is not enough, you need to build a deployment package on the `gh-pages` branch, as follows: 
```bash
npm run deploy
```

## Notes
- All frontend code is in the `ux` directory.
- Backend REST API endpoints should be configured in `src/api.js`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

