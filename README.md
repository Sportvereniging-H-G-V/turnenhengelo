# Turnen Hengelo

Website voor Turnen Hengelo, de turnafdeling van Sportvereniging H.G.V. in Hengelo. Een statische single-page website met informatie over turnlessen, disciplines en contact.

De website is live op [turnenhengelo.nl](https://turnenhengelo.nl).

## Gebouwd met

- [Astro](https://astro.build) v5 — statische site generator
- TypeScript
- CSS (mobile-first, geen framework)
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — automatische sitemap generatie

## Aan de slag

### Vereisten

- Node.js 18 of hoger
- npm

### Installatie

```bash
npm install
```

### Ontwikkelserver starten

```bash
npm run dev
```

De website is beschikbaar op `http://localhost:4321`.

### Typecontrole uitvoeren

```bash
npm run check
```

## Build en deployment

### Productie build maken

```bash
npm run build
```

De statische bestanden worden gegenereerd in de `dist/` map.

### Productie build lokaal bekijken

```bash
npm run preview
```

### Afbeeldingen optimaliseren

```bash
npm run optimize-images
```

Dit script (via Sharp) converteert bronafbeeldingen naar geoptimaliseerde AVIF- en WebP-varianten.

### Deployment

De site wordt gehost op Cloudflare Pages. De CI/CD-pipeline voert automatisch typecontrole en linting uit, bouwt de site en deployt naar Cloudflare Pages. Bij pull requests wordt een preview-omgeving aangemaakt.

## Projectstructuur

```
/
├── public/
│   ├── images/          # Statische afbeeldingen (hero, sporten)
│   └── robots.txt
├── scripts/
│   └── optimize-images.js   # Afbeeldingenoptimalisatie via Sharp
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro  # Hoofdpagina
│   │   └── 404.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
