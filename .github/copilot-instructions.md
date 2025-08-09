# Dime To Dozen - Budget Tracking Web Application

Dime To Dozen is a full-stack web application for expense tracking and budget
management. Built with Deno, Vue 3, TypeScript, and Material Design, it features
a mobile-first dark theme interface.

Always follow these instructions first and only fallback to additional search
and context gathering if the information here is incomplete or found to be in
error.

## Working Effectively

### Bootstrap and Setup

- Install Deno: `curl -fsSL https://deno.land/install.sh | sh`
- Add to PATH: `export PATH="/home/runner/.deno/bin:$PATH"`
- For AI agents, set TLS: `export DENO_TLS_CA_STORE=mozilla,system`
- Install dependencies: `deno install` -- takes 10-15 seconds. NEVER CANCEL. Set
  timeout to 60+ seconds.
- Create environment file: `cp .env.example .env`

### Build and Development

- Build the application: `deno task build` -- takes 1-2 seconds. NEVER CANCEL.
  Set timeout to 30+ seconds.
- Start frontend dev server: `deno task dev` -- starts in 1-2 seconds. NEVER
  CANCEL. Set timeout to 30+ seconds.
  - Serves at http://127.0.0.1:5173/
  - Hot reloading enabled
- Start API server: `deno task serve` -- may fail due to JSR network
  connectivity issues in restricted environments
  - If failing, the frontend can still be developed and tested independently
- Serve built files: `python3 -m http.server 8080 --directory dist` (alternative
  static serving)

### Code Quality

- Format code: `deno fmt` -- applies automatic formatting
- Check formatting: `deno fmt --check` -- verifies formatting without applying
  changes
- Lint code: `deno lint` -- checks for code quality issues
- Always run `deno fmt` and `deno lint` before committing changes

## Validation Scenarios

### Frontend Validation

After making changes to the frontend:

1. Run `deno task build` to ensure build succeeds
2. Start dev server with `deno task dev`
3. Navigate to http://127.0.0.1:5173/
4. Test routing: navigate to `/monthly-overview` and `/copy-groups`
5. Verify Material Design dark theme is applied
6. Test mobile responsiveness (Material Design components should be
   mobile-first)
7. Check browser console for errors

### Full Stack Validation

When database connectivity is available:

1. Ensure DATABASE_URL is set in .env file
2. Run `deno task serve` to start API server
3. Test API endpoints work with the frontend
4. Verify expense creation, budget management, and monthly overview
   functionality

### Build Validation

- Built files are generated in `dist/` directory
- Static assets are properly referenced
- Application loads correctly when served statically

## Database Operations

- Schema migrations: `deno task db:push` -- pushes schema changes to database.
  NEVER CANCEL. Set timeout to 60+ seconds.
- Requires PostgreSQL database connection
- Uses Drizzle ORM for database operations
- Schema defined in `server/db/schema.ts`

## Common Issues and Solutions

### JSR Network Connectivity Issues

If `@std/dotenv` or other JSR packages fail to download:

- This is a known issue in restricted network environments
- Frontend development can continue independently
- Use static file serving for testing built application
- Backend functionality requires resolving network connectivity

### Environment Variables

Required for full functionality:

- `DATABASE_URL` - PostgreSQL connection string
- `APP_PASSKEY` - Application authentication key
- `SECRET_KEY` - Application secret
- `PORT` - Server port (defaults to 6960)

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
