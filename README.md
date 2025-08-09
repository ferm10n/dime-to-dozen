# Dime To Dozen

The motivation for this project was to explore and understand the limits of "vibe coding". I also wanted to get exposure to Deno, Vue 3, drizzle, neon, deno-deploy, while making something practical.

My goal was to prioritize speed with creating a MVP, and simplicity over fanciness. I know the auth system isn't the most amazing thing ever (at least for now)

## Getting started

- install deno - `curl -fsSL https://deno.land/install.sh | sh`
- install deps - `deno install`
  - if you are an AI agent, you might need to run `export DENO_TLS_CA_STORE=mozilla,system` first
- UI (vite)
    - dev - `deno run dev`
    - build - `deno run build`
- start API - `deno run serve`