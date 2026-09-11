# Bilingual Quotation Generator — Gulf Borders For Contracting

Fill in a form, get a print-ready bilingual (Arabic + English) A4 quotation that matches the
company template exactly. What you see in the preview is literally what gets printed and
exported to PDF — the same HTML, the same CSS, no second "PDF version".

## Run it

Double-click **`index.html`**. That's it — no install, no server, no build step.
Works in Chrome, Edge or Safari on a PC, tablet or phone.

Everything is stored on the device in the browser's local storage, so it works offline.
(Google Fonts are fetched on first load for the Tajawal/Poppins look; offline it falls back
to system fonts and still prints correctly.)

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell — toolbar, editor form, preview pane, panels |
| `app.css` | App chrome **and** the document layout (the `@media print` block at the bottom is what makes print == screen) |
| `app.js` | State, live calculations, rendering, save/history, print |

## Using it

**Toolbar**

- **New** — blank quotation (4×3 header grid + Location row, 7 empty line items)
- **Save** — stores the quotation's *data* (not a picture) so it can be reopened and edited
- **History** — every saved quotation, searchable by Ref. No., client or date; Open / Copy / Delete
- **Duplicate** — clone the open quotation as a new one (handy for repeat villa jobs)
- **Company** — the one-time company profile
- **PDF** — opens the print dialog; choose destination **Save as PDF**
- **Print** — same layout straight to the printer

Keyboard: `Ctrl+S` save, `Ctrl+P` print.

**Quotation details (top table)** — 4 columns. Both the values *and* the Arabic/English labels
are editable, so a cell can be relabelled for a different kind of job. Contractor name and
telephone are pre-filled from the company profile but can be changed per quotation.

**Line items** — starts at 4 columns × 7 rows.

- `+ Row` / the trash icon on each card grows or shrinks the list
- `+ Column` / `– Column` adds or removes extra spec columns; they slot in before Total Price
- `Column headings` sub-panel renames any column in both languages
- **No.** auto-increments but can be typed over (the sample has two rows numbered 10, like the original)
- **Total Price** is Qty × Unit Price automatically. Type a different number and that row switches
  to manual (it turns gold, with a `↺ auto` button to switch back) — for flat-rate lines such as
  item 7 in the sample, where 2 × 580 is billed as 580.

**Totals** — Sub Total and Total Amount are always derived and cannot be typed into.
VAT % is the only input (default 15).

**Company profile** — logo, stamp/seal, company name (AR + EN), default contractor telephone,
the two footer phones, email, address and the two brand colours. Company name, logo and stamp are
deliberately *not* editable per quotation — only here. Upload images under ~1.5 MB; until you
upload real artwork, a built-in JB monogram and round seal are drawn in.

## Fitting one page

The line-item type auto-shrinks in steps so a long quotation still lands on a single A4 sheet.
With the 11 rows of the reference quotation it settles around 11px. Past roughly 25–30 rows the
text would get uncomfortably small — split the job across two quotations at that point.

## Notes

- Data lives in this browser on this device. Clearing site data clears saved quotations, and they
  do not sync between devices. If sync or a shared team history is ever needed, the save/load
  layer in `app.js` (`K_QUOTES`, `save`/`load`) is the only part that has to change — swap
  localStorage for Supabase/Firebase and everything else stays as is.
- The reference quotation (CONT-812-2026) is loaded on first launch as a worked example.
  Press **New** for an empty one.
