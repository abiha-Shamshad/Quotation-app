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
| `index.html` | App shell — toolbar, the form, the document screen, panels |
| `app.css` | App chrome **and** the document layout (the `@media print` block at the bottom is what makes print == screen) |
| `app.js` | State, live calculations, rendering, save/history, print |

## Using it

**One screen at a time.** You fill in the form; the quotation itself is not on screen while
you work. It appears once you have added everything and press **Save** or **PDF / Print**, and
`← Edit` (or `Esc`) takes you back to the form.

**Toolbar** — three buttons and a `⋯` menu, nothing else:

- **Saved** — every saved quotation, searchable by Ref. No., client or date; Open / Copy / Delete
- **Save** — stores the quotation's *data* (not a picture) and shows you the finished document
- **PDF / Print** — shows the document and opens the print dialog; pick *Save as PDF* for a file,
  or a printer to print
- **⋯** — New quotation · Duplicate this one · Company profile (and *Saved* on a phone)

Keyboard: `Ctrl+S` save, `Ctrl+P` print, `Esc` back to the form.

**Details** — one plain field per cell of the top table: Ref. No., Date, Telephone,
Client Mobile, Location, Contractor and Client. Each caption is that cell's own label, so
relabelling a cell under *Advanced* renames the field here too. Contractor name and telephone
are pre-filled from the company profile but can be changed per quotation.

**Items** — one card per line: number, description, Qty, Unit price, Total.

- `＋ Add item` adds a line, the `✕` on a card removes it
- **No.** auto-increments but can be typed over (the sample has two rows numbered 10, like the original)
- **Total** is Qty × Unit price automatically. Type a different number and that row switches
  to manual (it turns gold, with an `auto` button to switch back) — for flat-rate lines such as
  item 7 in the sample, where 2 × 580 is billed as 580.

**Totals** — Sub Total and Total Amount are always derived and cannot be typed into.
VAT % is the only input (default 15).

**Advanced** — folded away at the bottom of the editor, because most quotations never need it:
rename the Arabic/English labels of any cell in the top table, rename the item-column headings,
and add or remove extra spec columns (they slot in before Total Price).

**Company profile** (in the `⋯` menu) — logo, stamp/seal, company name (AR + EN), default
contractor telephone, the two footer phones, email, address and the two brand colours. Company
name, logo and stamp are deliberately *not* editable per quotation — only here. Upload images
under ~1.5 MB; until you upload real artwork, a built-in JB monogram and round seal are drawn in.

**The document screen** — the A4 sheet exactly as it prints; the button above it toggles
100% for a closer look. Nothing is editable here — press `← Edit` to change something.

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
