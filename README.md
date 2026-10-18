# Prompt Library for DeepSeek Harness

English | [中文](README.zh.md)

A DeepSeek Harness Web plugin that keeps reusable prompt templates one click away. It adds a searchable template library to the sidebar and a compact picker to the message composer. Choosing a template inserts it at the caret, or starts a new conversation with the template already in the draft when no conversation is open.

Repository: <https://github.com/qifenglun1/dsh-plugin-prompt>

## Features

- **Sidebar library** — a bookmark entry in the left sidebar opens a full library panel.
- **Composer picker** — a small bookmark button in the composer tool row opens a compact, searchable picker without leaving the conversation.
- **Insert at the caret** — templates are inserted into the current draft; a selection is replaced. The edit is undoable through the composer's normal undo history.
- **No-conversation fallback** — with no conversation open, choosing a template starts a new conversation and puts the template in the draft.
- **Template management** — create, edit, delete, duplicate, copy, search, and filter templates by category.
- **Categories** — create a category before it has templates. The empty category offers **New template in this category**. A name matching a built-in category label belongs to that built-in category instead of creating a duplicate.
- **Eight built-in templates** — code review, refactoring, tests, debugging, explanation, summarization, translation, and structured research. They follow the UI language and are read-only; **Save as mine** creates an editable copy.
- **English and Simplified Chinese UI** — the interface follows the DSH language setting.
- **No configuration required** — no API key, token, password, account, or external service.

## Requirements

- DeepSeek Harness **0.2.1-rc.2** or newer, with the Web or Desktop UI.
- A DSH profile in which bundles can be installed (the default Desktop profile is fine).
- Network access to GitHub when installing from this repository.

The plugin is a **bundle**, not a standalone web page. Install it through DSH's plugin manager; do not try to open `client.js` directly.

The repository root is the installable package root. It contains `package.json`, `cordis.patch.yml`, `index.js`, and `client.js`; there is no monorepo subdirectory and no build step.

## Install from GitHub

### Desktop / Web (recommended)

1. In DSH, open **Plugins**.
2. Choose **Add plugin** → **Install a third-party plugin**.
3. Paste the repository address:

   ```text
   https://github.com/qifenglun1/dsh-plugin-prompt
   ```

4. Review the trust notice and confirm the installation. DSH reads `package.json` and installs the bundle.
5. If the `prompt-library` row remains off, enable it in **Plugins**.
6. If the sidebar bookmark does not appear, refresh the Web GUI once.

### CLI

`dsh plugin --profile <name> add ...` forwards the install to pnpm in that profile. Use the profile you actually run (`web`, `desktop`, or a custom profile):

```bash
dsh plugin --profile web add github:qifenglun1/dsh-plugin-prompt
```

The equivalent GitHub URL form is accepted by pnpm-based installs:

```bash
dsh plugin --profile web add https://github.com/qifenglun1/dsh-plugin-prompt
```

A git install fetches sources, not a prebuilt artifact. This package is plain JavaScript with no `prepare`/`build` script, so pnpm does not need to run an install-time build and users are not asked to allow one.

Do not edit the profile's `package.json` or `cordis.patch.yml` by hand; the plugin manager owns those files.

### Local checkout (development)

Install the absolute path to this repository as a linked bundle:

```bash
dsh plugin --profile dev add /absolute/path/to/dsh-plugin-prompt
```

The plugin manager links the checkout into the profile, so edits to `client.js` are picked up after a page refresh. Replace `dev` with a disposable profile name; do not mix development links into a profile you rely on.

### Update and uninstall

DSH upgrades non-official plugins by uninstalling and reinstalling them. Uninstall the bundle in **Plugins**, then install the new repository version. With the CLI:

```bash
dsh plugin --profile web remove dsh-plugin-prompt
dsh plugin --profile web add github:qifenglun1/dsh-plugin-prompt
```

Removing the bundle removes the sidebar entry and composer picker. Templates already saved in the browser are not deleted by uninstalling; clear the keys below if you want to remove them.

## Configuration

The plugin has **no Config schema** and no required settings. There is no API key, token, password, endpoint, or model selection to configure.

| Setting | Where |
| --- | --- |
| Templates | Managed in the library panel or the template editor. |
| Categories | Created with **New category** or by typing a new category in the template editor. |
| Language | Follows the DSH language setting (`English` or `简体中文`). |
| Built-in templates | Fixed in the plugin; **Save as mine** creates an editable copy. |

### Browser storage

Templates and categories are stored in the Harness Web origin's `localStorage`:

- `dsh.prompt-library.templates.v1` — user templates.
- `dsh.prompt-library.categories.v1` — categories that exist independently of templates. When this key is missing, categories already used by saved templates are migrated into it.

`localStorage` is scoped to the Web origin. A different origin, browser profile, or cleared browser storage has separate data. The plugin does not write templates to the session log, does not send them to a server, and does not read credentials. When you send a message, its text reaches your configured model through DSH as usual.

## Usage

### Sidebar library

1. Click the bookmark entry in the left sidebar.
2. Search by title, text, or category, or choose a category chip.
3. Choose **Insert** to put the template into the current draft, **Copy** to copy it, or **Save as mine** to duplicate a built-in template.
4. Use **New category** to create a category before it has templates.
5. Use the back arrow in the panel header to return to the conversation.

### Composer picker

1. Click the bookmark button in the composer's left tool row.
2. In a new, empty conversation the picker opens as a centered dialog, so the search field is always visible; in an active conversation it opens above the composer.
3. Search for a template. Use the arrow keys to move and Enter to insert, or click a row.
4. The template is inserted at the caret (or replaces the current selection).

### Example

Create a reusable review prompt:

1. Open the sidebar library.
2. Choose **New template**.
3. Set the title to `Review a pull request`, the category to `Engineering`, and the body to:

   ```text
   Review this change for correctness, edge cases, performance, security,
   and maintainability. List issues by severity, then give concrete fixes.

   ```

4. Save. The template appears under **My templates**.
5. In any conversation, click the composer bookmark, choose the template, and it is inserted at the caret.

### Empty categories

A newly created category is selected immediately. Until it has templates, the panel shows **No templates in this category yet** and **New template in this category**. That button opens the editor with the category prefilled.

Categories can be created and selected, but renaming or deleting a category is not yet supported.

## Compatibility

- Built and verified with **DeepSeek Harness 0.2.1-rc.2**.
- The package declares `engines.dsh: ">=0.2.1-rc.2 <0.3.0"`. Installation and profile startup refuse a bundle outside that range.
- The client half uses the public slot entries `sidebar.panellist`, `main`, `conversation.input.left`, and `conversation.input.overlay`, plus the composer's `InputActions.captureInsertion()` / `insertText()`.
- If a future DSH release changes those slots, the plugin may need an update. Please include the DSH version in bug reports.

## Privacy and security

- No analytics, telemetry, or network calls of its own.
- No credential, API key, token, cookie, or account access.
- No host filesystem access; the host half is an empty `apply()` row.
- Only templates and category names are stored, in this browser origin's `localStorage`.
- Built-in prompt text ships with the plugin and is not user data.
- Installing any third-party bundle executes its code inside DSH. Read the source before installing, and pin a commit with `github:qifenglun1/dsh-plugin-prompt#<sha>` if you need a fixed revision.

## Project layout

| File | Purpose |
| --- | --- |
| `package.json` | Package metadata, bundle declaration, client entry, `dsh.client` inject list. |
| `index.js` | Host half. A no-op `apply()` so the bundle has a host row and appears in the plugin inventory. |
| `client.js` | Browser half: sidebar entry, library panel, composer picker, insertion, storage, locale dictionaries. |
| `cordis.patch.yml` | Bundle patch inserting the `prompt-library` row. |
| `locale/en.json`, `locale/zh.json` | Plugin Manager title and description. |
| `icon.svg` | Plugin icon. |
| `README.md`, `README.zh.md` | Documentation. |
| `LICENSE` | MIT license. |

## Development checks

```bash
npm run check
npm pack --dry-run
```

`npm run check` runs `node --check` on `index.js` and `client.js` and requires Node.js only. `npm pack --dry-run` prints the exact files npm would publish; confirm that `package.json`, `cordis.patch.yml`, `index.js`, `client.js`, the locale files, the icon, both READMEs, and `LICENSE` are present.

There are no runtime dependencies and no build step. The browser module uses the loader's baseline React and the host-provided client packages listed in `dsh.client.inject`.

## Troubleshooting

- **The sidebar icon is missing** — refresh the Web GUI; confirm the Prompt Library bundle is enabled in **Plugins**; check the browser console for a client module load error.
- **Installation fails** — make sure the GitHub repository root contains `package.json` with `dsh.bundle.patch`; do not point the installer at a subdirectory. Check that the running DSH version satisfies `engines.dsh`. If GitHub is unreachable, use the plugin manager's mirror or another installation source.
- **Templates disappeared** — templates live in this browser origin's `localStorage`. Check that you are using the same GUI origin and browser profile, and that site data was not cleared.
- **A template does not insert** — the composer may be submitting or adjudicating at that moment. Try again after the send finishes.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 qifenglun1.

The plugin icon and built-in prompt text are original to this project.
