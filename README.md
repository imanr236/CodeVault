# CodeVault

> A local-first code snippet manager for developers who want to save, search, organize, and reuse useful code.

[![Deploy CodeVault to GitHub Pages](https://github.com/CodeVault-Community/CodeVault/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/CodeVault-Community/CodeVault/actions/workflows/deploy.yml)

**CodeVault** is a lightweight React + TypeScript application that keeps reusable code snippets organized in your browser. Add snippets, find them quickly with search and filters, copy code when you need it, and keep portable JSON backups.

**[Open the live demo](https://imanr236.github.io/CodeVault/)** · **[View the source code](https://github.com/CodeVault-Community/CodeVault)**

## Why CodeVault?

Developers often collect useful commands and code fragments across notes, files, and browser tabs. CodeVault brings those snippets into one searchable library without requiring an account or sending your data to a server.

## Features

- Create, edit, and delete snippets
- Choose a language and add comma-separated tags
- Search titles, descriptions, code, languages, and tags
- Filter by language or tag
- Sort by newest, oldest, or title
- Select and delete multiple visible snippets at once
- Copy code to the clipboard
- Export your library as a JSON backup
- Import a previously exported JSON backup
- Starter examples included on first launch
- Responsive dark interface

## Tech stack

- React
- TypeScript
- Vite
- Browser `localStorage`
- Vitest and automated tests
- GitHub Actions and GitHub Pages

## Run locally

**Requirements:** Node.js 18 or newer and npm.

```bash
git clone https://github.com/CodeVault-Community/CodeVault.git
cd CodeVault
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Automated tests

Run the test suite once:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

GitHub Actions runs the test suite on every push to `main`. The Pages deployment waits for both tests and the production build to pass.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in the `dist/` directory.

## GitHub Pages deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the app when changes are pushed to `main` and deploys the `dist/` output to GitHub Pages. The Vite base path is configured for this repository at `/CodeVault/`.

To enable deployment, open the repository's **Settings → Pages** and set the build and deployment source to **GitHub Actions**. Check the **Actions** tab for the build and deployment result after a push.

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
- Automated component tests for core snippet workflows

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for planned improvements.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. You can use the issue templates to report bugs or suggest features, and the pull request template to describe your changes.

## License

CodeVault is released under the [MIT License](LICENSE). You may use, copy, modify, distribute, and include the software in commercial projects, provided that the copyright and license notices are retained.

---

**Topics:** `code-snippets` · `snippet-manager` · `react` · `typescript` · `vite` · `developer-tools` · `local-first` · `productivity`
