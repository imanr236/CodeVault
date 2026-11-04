# CodeVault

> A local-first library for saving, organizing, and reusing code snippets.

CodeVault is a small React + TypeScript application. It helps you keep useful snippets in one place, search them, organize them with tags, and copy them when needed.

## Features

- Create, edit, and delete snippets
- Choose a language and add comma-separated tags
- Search titles, descriptions, code, languages, and tags
- Filter by language or tag
- Copy code to the clipboard
- Export your library as a JSON backup
- Import a previously exported JSON backup
- Starter examples included on first launch
- Responsive dark interface

## Run locally

**Requirements:** Node.js 18 or newer and npm.

```bash
git clone https://github.com/imanr236/CodeVault.git
cd CodeVault
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in the `dist/` directory.

## Data and privacy

CodeVault stores snippets in the browser's `localStorage`. There is no backend and snippets are not automatically uploaded or synchronized between devices.

- Export a JSON backup regularly if your snippets matter.
- Import a backup to restore or move your library.
- Clearing this site's browser storage can permanently remove locally saved snippets.
- Do not store passwords, API keys, access tokens, or other secrets in snippets.

## Project structure

```
CodeVault/
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Current limitations

- No account system or cloud synchronization
- No multi-user sharing
- No server-side storage
- No automated test suite yet

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for planned improvements.

## License

No license has been added yet. Until a license is selected, do not assume the code is available for reuse.
