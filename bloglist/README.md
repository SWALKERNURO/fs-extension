# Extended blog list — exercises 7.7–7.20

The Part 4 backend and completed Part 5 routed frontend are combined as server and client workspaces. Zustand owns notification, blog and signed-in-user state. persistentUser.js is the sole storage service. Forms use useField; users have list/detail routes; anonymous comments persist in MongoDB. An error boundary below the navigation catches render failures and resets on route changes. Missing pages and blog/user ids show Page not found.

Run npm install from this directory. Configure private server/.env using server/.env.example. npm run dev starts the API on 3001 and the Vite frontend on 5173. npm run build && npm start builds the frontend and serves it through Express, including SPA route fallback. API paths retain JSON 404 responses.

Prettier configuration and VS Code format-on-save recommendations are included in this project. Run npm run format to format its client and server source, or npm run format:check to inspect formatting.

Tests use a separate database ending in _test and a fictional CI signing secret. npm run start:test in server never uses the production URI. The reset endpoint exists only in test mode and refuses non-test database names. Supplied browser tests are unchanged; backend helper/API tests from Part 4 are retained. No live database password is committed.

For backend integration tests, run npm run build first, then npm test --workspace=server with TEST_MONGODB_URI set to an isolated _test database. This also verifies that Express serves the built frontend on deep routes and keeps unknown API paths as JSON 404 responses.
