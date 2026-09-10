# AI Prison — Project Context

## What this project is

AI Prison is a colorful, pixel-inspired, top-down world where the user is a playable director character and AI agents live, move, collaborate, learn and perform real work.

The prison is a playful metaphor for an organized AI ecosystem. It should feel like a cheerful management game, not a dark or violent prison game.

The user wants agents for practical business work, including:

- YouTube automation
- Content creation
- Marketing
- Sales
- Research
- Analytics
- Software development
- Quality review

The user remains involved as the human director. Agents should not be treated as a fully unsupervised business replacement.

## Product vision

The user can:

- Walk around the world with their own character.
- Interact with agents and inspect what they are doing.
- Give agents tasks and goals.
- Move agents between departments.
- See agent status, current tasks, blockers and results.
- Train agents through instructions, examples and feedback.
- Create new agents through a specialist called Agent Architect.
- Approve important actions before they happen.

Agents should move around automatically and have a visible simulated daily life, while their work is backed by real task execution in the application backend.

## Recommended agents

- Nova — Director: breaks down high-level goals and coordinates work.
- Agent Architect — creates and configures new agents.
- Trainer — improves agent instructions and evaluates performance.
- Research agent — finds information and trends.
- Content agent — writes scripts, posts and ideas.
- Video agent — prepares and manages YouTube content.
- Marketing agent — creates campaigns and analyzes audiences.
- Sales agent — manages leads and sales workflows.
- Analyst agent — tracks metrics and suggests improvements.
- Developer agent — builds tools and automations.
- Quality agent — reviews work before publication.

## Visual direction

Target presentation: 1920x1080-style fullscreen experience, inspired by colorful top-down pixel management games. The attached reference showed a tile-based top-down room layout, readable HUD, characters, room labels, status cards and strong outlines.

Use original assets and original design decisions. Do not copy The Escapists 2's exact sprites, characters, UI, maps, names or assets. The intended qualities are:

- colorful and cheerful
- crisp pixel/grid feeling
- top-down rooms and corridors
- readable characters and status indicators
- lively world with agents walking around
- game-like but useful business control center

## Current technical direction

- React + TypeScript for application UI.
- Phaser for the game world, movement and interactions.
- Vite for development and builds.
- Start with mock/local agent behavior so the vertical slice is testable.
- Add real model/API integrations only behind clear interfaces.
- Later support OpenAI and Claude-based agent execution.
- Later add WebSockets/realtime events, persistent memory and a database.
- Later make the app installable as a PWA or desktop app with Tauri.

## Current repository state

The repository already contains a first visual prototype with:

- A Phaser top-down world with four departments.
- A playable player character controlled with WASD/arrow keys.
- Four selectable placeholder agents.
- Agent status panel, event log and fullscreen button.
- Original procedural placeholder visuals rather than final art assets.

Build command:

```bash
npm run build
```

Development command:

```bash
npm run dev
```

## First development milestone

Build a vertical slice where a user can select an agent, assign a task, see the agent status change from idle to working to done, and read the event history. Keep the implementation small, understandable and testable.

Do not jump directly into fine-tuning models. In the first version, “training” means persistent role instructions, examples, goals, constraints and human feedback.

## Collaboration rules

- Read this file before making changes.
- Inspect the existing code before editing it.
- Keep changes focused and explain the files changed.
- Do not delete or rewrite unrelated user work.
- Do not add external integrations or secrets without asking first.
- Use small commits with descriptive messages.
- Run `npm run build` after code changes.
- Prefer a working vertical slice over speculative architecture.

## History handoff

This file is a deliberate handoff from the prior Codex planning conversation. Claude Code does not have automatic access to the full Codex chat transcript. This file contains the relevant product decisions and context needed to continue the work safely.
