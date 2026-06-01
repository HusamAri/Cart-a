---
name: Carta · F&B Operations Studio
description: Editorial F&B operations UI — eucalyptus, antique gold, Playfair + Barlow
colors:
  bone-cream: "#FBFAF6"
  sand-linen: "#F4F2EC"
  pale-sage: "#E8EFE6"
  eucalyptus: "#1B2A22"
  ink-graphite: "#3A4A40"
  antique-gold: "#C9A227"
  gold-hover: "#D4AE2E"
  gold-press: "#A8861F"
  highlight-yellow: "#FFB133"
  error: "#B3261E"
  success: "#2A6B47"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 4.25rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Barlow', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  label-caps:
    fontFamily: "'Barlow', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "14px"
  xl: "20px"
  pill: "9999px"
spacing:
  unit: "8px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.antique-gold}"
    textColor: "#141210"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.gold-hover}"
    textColor: "#141210"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-secondary:
    backgroundColor: "{colors.pale-sage}"
    textColor: "{colors.ink-graphite}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-graphite}"
    rounded: "{rounded.pill}"
    padding: "11px 21px"
  surface-card:
    backgroundColor: "{colors.bone-cream}"
    textColor: "{colors.ink-graphite}"
    rounded: "{rounded.xl}"
    padding: "28px"
---

## Overview

Carta uses a static multi-page site (`index.html` marketing, `app/studio/*.html` product) with a single source of truth in `styles/tokens.css`. Visual language follows Occidental H&R–inspired foundations: warm bone and sand surfaces, eucalyptus forest ink, antique gold accent, Playfair Display for display type, Barlow for UI and body. Light mode is default; dark mode via `html[data-color-scheme="dark"]` and `html[data-theme="dark"]`. Layout max width 1280px (`--max-w`), generous gutters (`clamp(20px, 6vw, 64px)`), studio sidebar ~288px in app shells.

## Colors

| Role | Token | Hex | Use |
|------|--------|-----|-----|
| Surface | `--surface` / bone-cream | #FBFAF6 | Page background |
| Surface dim | `--sand-linen` | #F4F2EC | Sections, table stripes |
| Container | `--pale-sage` | #E8EFE6 | Cards, chips, soft panels |
| Primary text | `--ink-graphite` | #3A4A40 | Body, labels |
| Brand / CTA | `--antique-gold` | #C9A227 | Primary buttons, focus ring |
| Brand deep | `--eucalyptus` | #1B2A22 | Secondary brand, dark chrome, inverse surfaces |
| Highlight | `--tertiary` | #FFB133 | Sparingly; accent CTAs |
| Error / success | `--error`, `--success` | #B3261E, #2A6B47 | States |

Neutrals are **tinted** toward sage/eucalyptus (not generic gray). Gold is the interactive accent; eucalyptus carries brand weight on marketing hero and dark UI. Avoid flat gray-on-cream body text below 4.5:1 contrast.

## Typography

- **Display:** Playfair Display, weight 500–700, italic for emphasis (`em` in headlines). Scale from `--type-body` (1rem) through `--type-display` (4.25rem). `text-wrap: balance` on major headings.
- **UI / body:** Barlow 400–700, base 17px, line-height 1.45–1.62 for long copy.
- **Eyebrows / section labels:** Barlow 600, uppercase only for short labels (≤4 words), `--track-caps` 0.14em.
- **Buttons:** Sentence case, never all-caps body. Max three families (display, sans, mono for data).

## Elevation

Warm forest-tinted shadows (`--shadow-1` through `--shadow-4`) plus `--shadow-inner-glow` on raised controls. Cards use `--r-xl` (20px) or `--r-2xl` (28px), not nested card-in-card unless the affordance demands it. Focus: `--shadow-focus` gold ring. Glass panels use blur 24–32px with soft ink borders where used on marketing.

## Components

- **Buttons (`.btn`):** Pill radius (`--r-pill`), 12×22px padding, 600 weight. Variants: `.btn-primary` (gold), `.btn-secondary` (sage container), `.btn-ghost` (outline), `.btn-sage`, `.btn-gold`. Hover lifts shadow one step; `:focus-visible` uses primary outline + shadow-focus.
- **Inputs / tables:** Studio tables (`.data-table`) with hover row state; forms align to token borders and `--r-lg` fields.
- **Navigation:** Topbar ~80px; studio sidebar with theme toggle and lang toggle (`.lang-toggle`).
- **Marketing:** Hero with editorial photography treatment (sepia/saturate filters on `body.carta-landing`), module index cards, plans band.

Motion: `--ease` cubic-bezier(0.22, 0.61, 0.36, 1), durations 140–380ms; honor reduced motion.

## Do's and Don'ts

**Do**

- Use CSS variables from `tokens.css`; extend tokens before hardcoding hex in pages.
- Keep hierarchy through type scale + weight, not color alone.
- Use gold primary for the main action; eucalyptus for brand moments and dark surfaces.
- Preserve bilingual `data-i18n` patterns when adding copy.

**Don't**

- Introduce a fourth font or purple/blue SaaS palette.
- Use cream body backgrounds as a lazy warm default without brand intent.
- Stack cards inside cards for dashboards.
- Use em dashes in product copy; use commas, colons, or periods.
- Animate layout properties without a reduced-motion fallback.
