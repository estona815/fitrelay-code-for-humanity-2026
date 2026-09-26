# FitRelay

FitRelay is a free, browser-only prototype for community clothing exchanges. It compares three laid-flat measurements of a garment you already like with measurements of donated garments, then ranks the closest dimensions. The goal is to make self-measurement useful before a pickup and explore whether better shortlisting could reduce wasted trips and support clothing reuse.

**Live demo:** https://estona815.github.io/fitrelay-code-for-humanity-2026/

## Try it

Open `index.html` in a modern browser or serve this directory with `python3 -m http.server 8000`. The page starts with three **fictional** donated outer layers and a fictional reference garment. Change any reference measurement and select **Compare garments**. Add, edit, and remove garments to explore the ranking.

Measurements stay in the current browser tab. The app has no account, backend, analytics, database, or network call for measurement data. Reloading resets the fictional sample.

## Measurement method

Measure a comfortable garment laid flat, in centimeters:

1. Chest width: armpit to armpit.
2. Length: top of shoulder to hem.
3. Sleeve: shoulder seam to cuff.

Compare similar types of garment. FitRelay validates each value as 1–300 cm and supports up to 30 donated items. It ranks by a weighted sum of absolute differences divided by fixed reference tolerances (chest 4 cm, length 5 cm, sleeve 4 cm; weights 0.45, 0.30, 0.25). These are design defaults, not a validated fit model. The labels reflect measurement differences only. Fabric, cut, condition, and personal preference still matter, so inspect a garment in person when possible.

## Run tests

```sh
node --test test/*.test.mjs
```

## Scope and evidence

This is an original hackathon prototype, built in September 2026. The idea responds to the Code for Humanity measurement and waste theme. It has **not** been tested with a clothing exchange or shown to reduce textile waste, travel, or returns. The [US EPA textile data](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/textiles-material-specific-data) provides general context on textile waste; the EPA has not evaluated FitRelay. All sample garment names, dimensions, and illustrations are fictional. Garment illustrations and the initial design concept were generated with OpenAI ImageGen; application code and copy were developed with Codex assistance. No pre-existing proprietary code or third-party clothing catalog was used.

## Files

- `index.html`, `styles.css`, `app.js`: interface and interaction.
- `engine.mjs`: validation and comparison logic.
- `test/engine.test.mjs`: comparison checks.
- `assets/fitrelay-garments.png`: generated sample garment artwork.

MIT licensed. See `LICENSE`.
