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

This is a static demo that requires only a modern browser. You do not need `pnpm`, `npm`, or any package manager to run the demo because D3 is loaded via CDN in `index.html`.

To run locally:

1. Open `index.html` directly in your browser (double-click file or use `File → Open`).

OR, to serve via a lightweight static server (recommended to avoid any browser CORS / file restrictions):

- With Python 3:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

- With Node (serve) if you prefer:

```bash
npm install -g serve
serve .
```

No other dependencies are required.

## If you want a package-managed setup

If you prefer a package-managed development workflow (recommended for extension, bundling, or local versioning), this project includes a `package.json` and is configured for Vite.

1. Install dependencies and run the dev server:

```bash
# using npm
npm install
npm run dev

# or using pnpm
pnpm install
pnpm run dev
```

2. The `dev` script runs Vite which supports bare imports like `import * as d3 from 'd3'` in the ES modules under `src/`.

3. Build for production with `npm run build` and preview with `npm run preview`.

## Code Quality

- Format the project with `npm run format`.
- Check formatting with `npm run format:check`.
- Lint the JavaScript files with `npm run lint`.

## Notes & Next steps

- For production real-time streams, replace the simulated interval with a WebSocket or Server-Sent Events connection and push updates into the same `pushRandomUpdate`-style handler.
- Consider adding accessibility (ARIA) labels, keyboard navigation, and a legend explaining units/colors.
- For sub-second updates in production, batch incoming messages and use WebWorkers for heavy computations.

---

If you want, I can add a `package.json` with scripts and an optional `serve` dependency, or switch D3 to a local install and add a small build script. Tell me which you'd prefer.
