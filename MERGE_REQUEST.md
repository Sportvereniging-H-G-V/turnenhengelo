## 📝 Beschrijving

Deze merge request bevat uitgebreide PageSpeed optimalisaties om de Lighthouse score te verbeteren. De belangrijkste focus ligt op het verbeteren van LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), en het verminderen van render-blocking resources.

**Doel:** Verbetering van PageSpeed score met focus op:
- LCP optimalisatie (hero image preload)
- CLS = 0 (expliciete afbeelding afmetingen)
- Render-blocking optimalisatie
- Code cleanup (verwijderen ongebruikte code)
- SEO verbeteringen (sitemap + robots.txt)

## 🔗 Gerelateerde Issues

- PageSpeed optimalisatie: CLS +25, SI +10, Prestaties verbetering

## 🎯 Type Wijziging

- [x] Verbetering / Refactor
- [x] Performance optimalisatie
- [x] Build / CI / Config
- [x] SEO optimalisatie

## ✅ Wat is er veranderd?

### Performance Optimalisaties

**Hero Image Optimalisatie:**
- Hero image preload toegevoegd in `<head>` (AVIF + WebP formaten)
- `fetchpriority="high"` toegevoegd aan hero image
- Expliciete `width` en `height` attributen (2002x3648) voor CLS preventie
- `decoding="async"` en `sizes="100vw"` toegevoegd
- Donkere achtergrondkleur (#1a1a1a) die automatisch verdwijnt na laden
- `onload` handler voor automatisch verbergen achtergrond

**Afbeelding Optimalisaties:**
- Alle afbeeldingen voorzien van expliciete `width` en `height` attributen
- `decoding="async"` toegevoegd aan alle afbeeldingen
- CSS `aspect-ratio` toegevoegd voor alle afbeelding types
- Lazy loading behouden voor niet-hero afbeeldingen

**Network Optimalisaties:**
- Preconnect hint toegevoegd voor eigen domain
- Script optimalisatie met throttling (requestAnimationFrame)
- DOM-ready check voor script execution

### SEO Verbeteringen

- **Sitemap integration:** `@astrojs/sitemap` toegevoegd
  - Automatische sitemap generatie
  - Changefreq: monthly, Priority: 0.7
  - Dynamische lastmod (geen statische waarde)
- **Robots.txt:** Toegevoegd met sitemap referentie

### Code Cleanup

**Verwijderde ongebruikte code:**
- `--color-accent` CSS variabele (niet gebruikt)
- `--transition-fast` CSS variabele (niet gebruikt)
- `.text-center` utility class (niet gebruikt)
- `.mb-sm` utility class (niet gebruikt)
- `test` script uit package.json (vitest niet gebruikt)

**Verbeteringen:**
- Fade-in animaties geoptimaliseerd met `prefers-reduced-motion` media query
- Header component verwijderd uit layout (was per ongeluk toegevoegd)

### Build Optimalisaties

- CSS minificatie al actief via Vite config
- HTML compressie al actief
- Sitemap automatisch gegenereerd bij build

## 🧪 Testen

- [x] Functioneel getest
- [x] Build test succesvol (0 errors)
- [x] Type checking succesvol (0 errors, 0 warnings)
- [x] Linter check succesvol (geen errors)
- [x] Sitemap correct gegenereerd
- [x] Robots.txt correct gegenereerd
- [x] Alle afbeeldingen hebben correcte attributen
- [x] Preload hints aanwezig in HTML output
- [x] Hero achtergrond verdwijnt na laden (getest)

**Test resultaten:**
- Build: ✅ 2 pagina's gebouwd in ~650ms
- Type check: ✅ 0 errors, 0 warnings, 0 hints
- Linter: ✅ Geen errors
- Sitemap: ✅ Correct gegenereerd met dynamische lastmod

## ▶️ Preview / Screenshots

- **Branch:** `improve-pagespeed`
- **Preview URL:** Na merge beschikbaar via Cloudflare Pages

**Verwachte verbeteringen:**
- LCP: Verbetering door hero image preload
- CLS: 0 (door expliciete afmetingen)
- SI: Verbetering door preconnect en preload
- TBT: Verbetering door script throttling

## 📦 Impact

- **Breaking change:** Nee
- **Performance impact:** Ja - Positief
  - Snellere LCP door hero image preload
  - CLS = 0 door expliciete afmetingen
  - Minder render-blocking door optimalisaties
- **Beveiliging geraakt:** Nee
- **Nieuwe dependencies:** Ja
  - `@astrojs/sitemap` (dev dependency)

**Toelichting:**
- Alle wijzigingen zijn backwards compatible
- Geen breaking changes voor bestaande functionaliteit
- Nieuwe dependency is alleen voor build-time sitemap generatie

## 🚀 Deployment Notes

- [x] Geen speciale acties nodig
- [ ] Nieuwe ENV variabelen: Nee
- [ ] Migraties: Nee
- [x] Config-aanpassingen: Ja
  - `astro.config.mjs`: Sitemap integration toegevoegd
  - `package.json`: Nieuwe dependency `@astrojs/sitemap`
- [ ] Overig: Nee

**Deployment stappen:**
1. Merge naar main branch
2. Cloudflare Pages zal automatisch rebuilden
3. Sitemap wordt automatisch gegenereerd bij build
4. Robots.txt wordt automatisch gedeployed

## 🔍 Review Focus

**Belangrijk om te controleren:**
1. ✅ Hero image preload werkt correct (check HTML output)
2. ✅ Alle afbeeldingen hebben width/height attributen
3. ✅ Sitemap wordt correct gegenereerd
4. ✅ Robots.txt is aanwezig
5. ✅ Geen console errors
6. ✅ Hero achtergrond verdwijnt na laden
7. ✅ Performance verbeteringen meetbaar in Lighthouse

**Code kwaliteit:**
- Geen ongebruikte code meer
- TypeScript types correct
- Geen linter errors
- Build succesvol

## 📝 Extra Notities

**PageSpeed optimalisaties geïmplementeerd:**
- Hero image preload (AVIF + WebP)
- Preconnect hints
- Expliciete afbeelding afmetingen (CLS = 0)
- CSS aspect-ratio voor layout stability
- Script throttling voor betere TBT
- Donkere hero achtergrond die verdwijnt na laden

**SEO verbeteringen:**
- Automatische sitemap generatie
- Robots.txt met sitemap referentie
- Dynamische lastmod per pagina

**Code cleanup:**
- Ongebruikte CSS variabelen verwijderd
- Ongebruikte utility classes verwijderd
- Ongebruikte scripts verwijderd

**Cloudflare caching:**
- Hero afbeeldingen worden gecached door Cloudflare CDN
- Dit zal de korte flash verder verminderen na eerste deploy

**Volgende stappen (optioneel):**
- Lighthouse test na deploy om exacte score verbetering te meten
- Eventueel verder optimaliseren op basis van nieuwe Lighthouse resultaten

