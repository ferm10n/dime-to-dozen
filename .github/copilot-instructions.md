# Dime To Dozen - Budget Tracking Web Application

Dime To Dozen is a full-stack web application for expense tracking and budget
management. Built with Deno, Vue 3, TypeScript, and Material Design, it features
a mobile-first dark theme interface.

## Automated Troubleshooting and Validation

When troubleshooting or validating the application, always prefer using the
Playwright MCP for end-to-end browser automation. This includes:

- Running Playwright MCP tests to validate UI and routing
- Taking screenshots of relevant application states and saving them to the
  `docs/` folder (e.g., `docs/screenshots/`)
- Using Playwright MCP to automate navigation, form submissions, and error state
  capture

### Playwright Authentication

The application requires a passkey for access. When using Playwright MCP:

1. The app will prompt for a passkey on first load via a browser dialog
2. Handle the dialog by accepting it with the passkey value from the
   `APP_PASSKEY` environment variable
3. Use `playwright-browser_handle_dialog` tool with `accept: true` and
   `promptText: "value of APP_PASSKEY"`
4. Multiple dialog prompts may appear - handle each one until the app loads
   successfully

## Working Effectively

### Bootstrap and Setup

- Install Deno (if not already installed):
  `curl -fsSL https://deno.land/install.sh | sh`
  - Add to PATH: `export PATH="/home/runner/.deno/bin:$PATH"`
  - Install dependencies: `deno install` -- takes 10-15 seconds. NEVER CANCEL.
    Set timeout to 60+ seconds.
- (Optional) Setup development tools: `./scripts/setup-dev` -- installs
  pre-commit hook for formatting

### Build and Development

- Build the application: `deno task build` -- takes 1-2 seconds. NEVER CANCEL.
  Set timeout to 30+ seconds.
- Start frontend dev server: `deno task dev` -- starts in 1-2 seconds. NEVER
  CANCEL. Set timeout to 30+ seconds.
  - Serves at http://localhost:5173/ (also accessible via network interfaces)
  - Configured to listen on 0.0.0.0 for accessibility from external tools (e.g.,
    Playwright MCP)
  - Hot reloading enabled
- Start API server: `deno task serve`

### Code Quality

- Format code: `deno fmt` -- applies automatic formatting
- Check formatting: `deno fmt --check` -- verifies formatting without applying
  changes
- Lint code: `deno lint` -- checks for code quality issues
- Always run `deno fmt` and `deno lint` before committing changes

## Validation

1. Run `deno task build` to ensure FE build succeeds
1. Check code for type correctness with `deno check`
1. Start the backend server with `deno task serve`
1. Start dev server with `deno task dev`
1. Navigate to http://localhost:5173/
1. Check browser console for errors
1. Verify expense creation, budget management, and monthly overview
   functionality

## Database Operations

- Schema migrations: `deno task db:push` -- pushes schema changes to database.
  NEVER CANCEL. Set timeout to 60+ seconds.
- Requires PostgreSQL database connection
- Uses Drizzle ORM for database operations
- Schema defined in `server/db/schema.ts`

## Common Issues and Solutions

### Environment Variables

Required for full functionality (these will be automatically set in the coding
agent environment):

- `DATABASE_URL` - PostgreSQL connection string
- `APP_PASSKEY` - Application authentication key

## Project Structure

### Key Directories

- `src/` - Vue 3 frontend application
- `server/` - Deno backend API
- `server/api/` - API endpoint handlers
- `server/db/` - Database schema and configuration
- `dist/` - Built frontend assets
- `.github/` - GitHub Actions workflows

### Important Files

- `deno.json` - Project configuration and task definitions
- `vite.config.ts` - Vite build configuration with proxy setup
- `drizzle.config.ts` - Database ORM configuration
- `server/main.ts` - API server entry point
- `src/main.ts` - Frontend application entry point

### Common File Locations

- Vue components: `src/components/`
- Styling: `src/style.css` (Material Design dark theme)
- API routes: `server/api/router.ts`
- Database schema: `server/db/schema.ts`
- Store/state management: `src/store.ts` (Pinia)

## Coding Guidelines

- Use Material Design for UI components and styling
- Follow mobile-first responsive design principles
- Maintain dark theme consistency (no light theme)
- Keep code DRY (styles, logic, hardcoded values)
- Use TypeScript throughout
- Follow Deno formatting standards (`deno fmt`)
- Address linting issues (`deno lint`)

## Deployment

- Application deploys to Deno Deploy via GitHub Actions
- Triggered on pushes to master branch
- Build step runs automatically in CI/CD
- Static assets and server code are deployed together

## Performance Notes

- Frontend build is very fast (1-2 seconds)
- Dependency installation takes 10-15 seconds
- Development server starts quickly
- Hot reloading works efficiently during development
