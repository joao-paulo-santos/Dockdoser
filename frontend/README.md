# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Dockdoser Frontend

This is the Vite + React frontend for the Dockdoser Docker monitoring dashboard.

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- The app will be available at `http://localhost:5173` by default.
- The API base URL is set via the `REACT_APP_API_URL` environment variable.

## Production

- Build with `npm run build`
- Serve with `npm run preview` or use a production web server.

## Docker

- Use the provided Dockerfile for container builds.
- The frontend expects the backend API to be available at the URL set in `REACT_APP_API_URL`.

---

For more details, see the backend and docker-compose setup in the project root.
