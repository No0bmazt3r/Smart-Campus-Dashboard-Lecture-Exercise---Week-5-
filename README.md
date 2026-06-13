# Smart Campus Monitoring Dashboard

A compact D3.js prototype for a "Smart Campus Monitoring Dashboard" demonstrating KPIs, sparklines, line charts, a composite chart, and simulated real-time updates.

## What’s included

- `index.html` — minimal static page loading D3 v7 from CDN and `script.js`.
- `script.js` — dashboard logic: KPI cards, sparklines, line/bar/composite charts, smooth D3 enter/update/exit transitions, and a simulated streaming update loop.
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

If you prefer to manage dependencies locally (e.g., to pin a D3 version or build toolchain):

1. Initialize a project and install D3:

```bash
# using npm
npm init -y
npm install d3

# or using pnpm
pnpm init -y
pnpm add d3
```

2. Update `index.html` to load the local `node_modules/d3/dist/d3.min.js` instead of the CDN, or use a bundler (Vite/Rollup) to bundle `script.js` and D3.

## Notes & Next steps

- For production real-time streams, replace the simulated interval with a WebSocket or Server-Sent Events connection and push updates into the same `pushRandomUpdate`-style handler.
- Consider adding accessibility (ARIA) labels, keyboard navigation, and a legend explaining units/colors.
- For sub-second updates in production, batch incoming messages and use WebWorkers for heavy computations.

---

If you want, I can add a `package.json` with scripts and an optional `serve` dependency, or switch D3 to a local install and add a small build script. Tell me which you'd prefer.