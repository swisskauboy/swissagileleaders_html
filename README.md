# Swiss Agile Leaders (Static Site)

Statische Website fuer Swiss Agile Leaders, ohne CMS-Runtime.

## Seiten

- `/`
- `/werte/`
- `/agileunconference/`
- `/services/`
- `/erster-schritt/`
- `/team/`
- `/kontakt/`
- `/impressum-and-legal/`

## Struktur

- `index.html` und Unterseiten in `<slug>/index.html`
- Zentrale Styles: `assets/site.css`
- Zentrales Verhalten (Navigation, Sprache, Slider, Lightbox): `assets/site.js`
- Optimierte Medien unter `assets/img/*`
- Alle Bild-/Icon-Dateien liegen unter `assets/img/*`
- Hilfsskripte liegen unter `scripts/` und werden nicht deployed

## Lokal starten

```powershell
python -m http.server 8080
```

Dann `http://localhost:8080` oeffnen.

## Deployment

Deployment erfolgt mit:

```bat
.\scripts\deploy.bat
```

Dry-run:

```bat
.\scripts\deploy.bat -DryRun
```

Standard-Ziel:

`D:\Nextcloud (aragost)\public\swissagileleaders_html`
