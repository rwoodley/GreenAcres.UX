# <span style="color: blue;">LeisurePlan.app</span>


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

## Deployment
We use [Github Pages](https://docs.github.com/en/pages) to host this web site in production.
Since we are using vite to build our web site, pushing changes to github is not enough to put those changes live. We need to also build a deployment package, as follows: 

```bash
# run this on the main branch.
npm run deploy
```

## Notes
- All frontend code is in the `ux` directory.
- Backend REST API endpoints should be configured in `src/api.js`.

#### Project Structure
- `src/components/` - UI components (Banner, Menu, Chat, Results, etc.)
- `src/pages/` - Route views (Plans, Settings)
- `src/App.jsx` - Main app layout and routing
- `src/theme.js` - Material UI theme customization
- `src/tests/` - Unit tests

