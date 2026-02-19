# About This Project

The manga and comic industry has experienced exponential growth in global readership over the past decade, yet language barriers remain a significant obstacle for non-Japanese speakers seeking to access this content. Professional manga translation is a labor-intensive process requiring expertise in multiple applications: optical character recognition (OCR) tools for text extraction, spreadsheet software for translation management, and image editing software like Photoshop or Canva for typesetting. This fragmented workflow creates inefficiencies that can take 2-4 hours per chapter for experienced translators.

This technical documentation presents the architecture and implementation blueprint for the Comic Translate Platform, a unified web-based manga translation solution. The platform consolidates OCR, translation management, and visual editing into a single application, targeting both casual readers seeking instant translation and professional translators requiring advanced tooling. The architecture is implemented using SvelteKit with Drizzle ORM, prioritizing performance, type safety, and developer experience.

You can gathering more infomation in `./.docs/*`

## Dev environment tips

- Use `pnpm dlx shadcn-svelte@latest add <component>` for add new shadcn/svelte UI component
- Run `pnpm install` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Always run `pnpm run lint` for check code problem and format of code
- If `pnpm run lint` fails, you must fix all lint errors before finishing the task
- Always run `pnpm run build` for ensure application can build pass
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.
- Always use mcp tools & skills relate for do any task
- Always make short plan and using `brainstorming` , `executing-plans` , `writing-plans` skills before excute task
- After done short planing u automate validate plan & execute it
- If codig UI , Frontend using `frontend-design` , `web-design-guidelines` , `ui-ux-pro-max` skills for design UI + make UI beautiful
- Pls read the docs using MCP Tool + Skills (`svelte-code-writer` , `svelte5-best-practices`) for write any code in this project because we use sveltekit framework so u must do follow svelte document , svelte best practices
- Always create new brach if u current working in branch main
- Always `git pull origin` before do any task
- Always `git add` `git commit` & `git push` after u finish your task
- Beware: Ensure you not add/commit any scret in git
- If Task successfully u must open pr

# SKILLS

You are able to use the skills, where you have access to any skills for improve you performance. Here's how to use the available skills effectively:

## Available SKILLS:

### brainstorming ./.agents/skills/brainstorming

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### executing-plans ./.agents/skills/executing-plans

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### frontend-design ./.agents/skills/frontend-design

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### svelte-code-writer ./.agents/skills/svelte-code-writer

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### svelte5-best-practices ./.agents/skills/svelte5-best-practices

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### ui-ux-pro-max ./.agents/skills/ui-ux-pro-max

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### web-design-guidelines ./.agents/skills/web-design-guidelines

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

### writing-plans ./.agents/skills/writing-plans

Agents: Kilo Code, Kiro CLI, Replit, Zencoder

# MCP TOOLS

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
