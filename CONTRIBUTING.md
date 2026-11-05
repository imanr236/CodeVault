# Contributing to CodeVault

Thank you for considering a contribution! CodeVault is a local-first snippet library, and contributions of all sizes are welcome.

## Before you start

1. Check the existing [issues](https://github.com/imanr236/CodeVault/issues) to see whether the bug or idea has already been reported.
2. For a substantial change, open an issue first so we can discuss the approach before you spend time implementing it.
3. Keep changes focused. Small, reviewable pull requests are easier to test and maintain.

## Development setup

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/imanr236/CodeVault.git
cd CodeVault
npm install
npm run dev
```

## Making a change

1. Create a branch from `main` with a descriptive name, such as `fix/search-filter` or `feat/tag-shortcuts`.
2. Make the smallest complete change that addresses the issue.
3. Follow the existing React, TypeScript, and CSS patterns.
4. Add or update tests when behavior changes.
5. Run the checks before opening a pull request:

```bash
npm test
npm run build
```

6. Update documentation when user-facing behavior or setup instructions change.

## Local-first and privacy principles

- CodeVault currently stores snippets in the browser's `localStorage`.
- Do not introduce cloud sync, accounts, analytics, or external data collection without an explicit project discussion.
- Never include real passwords, API keys, access tokens, personal data, or private snippets in issues, screenshots, tests, or pull requests.
- Keep imported and exported snippet data handling transparent and predictable.

## Pull requests

- Explain the problem and why the change is useful.
- Describe what changed and how you tested it.
- Link related issues using closing keywords only when the PR is intended to close them.
- Include screenshots for meaningful UI changes, using safe sample data.
- Mention known limitations or follow-up work.

A maintainer may request changes before merging. Please keep discussion respectful and focused on the code.

## Reporting security issues

Do not publish exploitable security details or secrets in a public issue. Contact the repository owner privately through GitHub instead.

Thank you for helping make CodeVault better!
