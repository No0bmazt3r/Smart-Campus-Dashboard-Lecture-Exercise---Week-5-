# Smart Campus Monitoring Dashboard

A compact D3.js prototype for a "Smart Campus Monitoring Dashboard" demonstrating KPIs, sparklines, line charts, a composite chart, and simulated real-time updates.

## What’s included

- `index.html` — minimal static page loading the `src/main.js` ES module.
- `src/` — modular ES modules: `data.js`, `utils.js`, `kpi.js`, `charts.js`, `main.js` (replaces the monolithic `script.js`).
- `style.css` — lightweight styling and responsive layout.

## Highlights

- Smooth enter/update/exit transitions using D3 joins.
- Buffered UI updates (`requestAnimationFrame`) for better performance under high-frequency streams.
- Click-to-filter drilldown (building selection) with reset button.
- Tooltips and annotation examples.

## Development & Run

This project now uses local npm-managed dependencies and Vite so the ES modules can import `d3` cleanly.

To run locally:

1. Install dependencies:

```bash
pnpm install
```

2. Start the dev server:

```bash
pnpm run dev
```

3. Open the local URL printed by Vite, usually `http://localhost:5173`.

## If you want a package-managed setup

If you prefer a package-managed development workflow (recommended for extension, bundling, or local versioning), this project includes a `package.json` and is configured for Vite.

1. The `dev` script runs Vite, which supports bare imports like `import * as d3 from 'd3'` in the ES modules under `src/`.

2. Build for production with `pnpm run build` and preview with `pnpm run preview`.

## Code Quality

- Format the project with `pnpm run format`.
- Check formatting with `pnpm run format:check`.
- Lint the JavaScript files with `pnpm run lint`.

## Notes & Next steps

- For production real-time streams, replace the simulated interval with a WebSocket or Server-Sent Events connection and push updates into the same `pushRandomUpdate`-style handler.
- Consider adding accessibility (ARIA) labels, keyboard navigation, and a legend explaining units/colors.
- For sub-second updates in production, batch incoming messages and use WebWorkers for heavy computations.

