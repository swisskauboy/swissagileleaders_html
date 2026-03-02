# Swiss Agile Leaders (Static Modernized Copy)

This repository currently contains a static mirror of https://swissagileleaders.org with a light modernization pass.

## What is included

- Full page mirror for the currently published WordPress pages:
  - `/` and `/heim/`
  - `/werte/`
  - `/agileunconference/`
  - `/services/`
  - `/erster-schritt/`
  - `/team/`
  - `/kontakt/`
  - `/impressum-and-legal/`
  - `/vernissage/`
  - `/trainingwithjoejustice/`
  - `/testpage/`
- Downloaded CSS/JS/images from the current site (`/wp-content`, `/wp-includes`).
- A light styling override at `site/assets/modern-overrides.css`.

## Local preview

From repository root:

```powershell
cd site
python -m http.server 8080
```

Then open `http://localhost:8080`.

If you use VS Code Live Server, this workspace includes [`.vscode/settings.json`](/d:/repos/swissagileleaders_html/.vscode/settings.json) with `liveServer.settings.root` set to `/site`.
After starting Live Server, open `http://127.0.0.1:5500/` (not `/site/`).

## Notes for next iteration

- The page content currently reflects the live site state imported on **March 2, 2026**.
- Requested future content changes (not applied yet):
  - Agile Unconference update for **November 5, 2026**.
- Add **Aino Vogne Corry** as keynote speaker.
  - Add bilingual support (German + English).
