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
| `app.js` | State, live calculations, rendering, save/history, item list, print |
| `assets/` | The company logo and rubber stamp (transparent PNGs) used on the document |

## Using it

**One screen at a time.** You fill in the form; the quotation itself is not on screen while
you work. **Preview** shows it, **Save as PDF** (from there) or `← Edit` (or `Esc`) takes you
back to the form.

**Toolbar** — two screen-specific buttons, plus three that are always there:

- On the form: **Save** — stores the quotation's *data* (not a picture), no screen change · and
  **Preview** — shows you the finished document without saving
- On the document: **← Edit** — back to the form · and **Save as PDF** — saves the quotation
  (same as Save) and opens the print dialog; pick *Save as PDF* for a file, or a printer to print.
  Every quotation this button produces a PDF for ends up in **Saved quotations**.
- Always there: **New** — a blank quotation · **Saved** — every saved quotation, searchable by
  Ref. No., client or date, with Open / Copy / Delete · **My list** — the item shortcuts behind
  **Pick an item** on each line

If all five don't fit on one line on your phone, the button row scrolls sideways rather than
wrapping.

Keyboard: `Ctrl+S` save, `Ctrl+P` save as PDF, `Esc` back to the form.

**Details** — one plain field per cell of the top table: Ref. No., Date, Telephone,
Client Mobile, Location, Contractor and Client. Each caption is that cell's own label, so
relabelling a cell under *Advanced* renames the field here too. Contractor name and telephone
are pre-filled with the company's own details but can be changed per quotation.

**Items** — one card per line: **Pick an item ▾**, number, description, Qty, Unit price, Total.

- **Pick an item** drops down your saved item list and fills the line in — description, unit
  price and a quantity of 1 — so a normal line takes one tap and no typing. Edit the
  description afterwards for the villa number or anything else specific to the job.
- `＋ Add item` adds a line, the `✕` on a card removes it
- **No.** auto-increments but can be typed over (the sample has two rows numbered 10, like the original)
- **Total** is Qty × Unit price automatically. Type a different number and that row switches
  to manual (it turns gold, with an `auto` button to switch back) — for flat-rate lines such as
  item 7 in the sample, where 2 × 580 is billed as 580.

**My item list** (in the `⋯` menu, or *Edit my item list…* at the bottom of any dropdown) —
the jobs behind the **Pick an item** menu, each with its usual price. It starts with the
company's common AC and plumbing jobs, and **every line you type on a quotation is added to it
when you save**, newest first, so the list teaches itself as you work. Edit the wording or the
price in place, `✕` removes an entry, *Restore the starter list* puts the built-in ones back.
The list is capped at the 80 most recent items.

**Totals** — Sub Total and Total Amount are always derived and cannot be typed into.
VAT % is the only input (default 15).

**Advanced** — folded away at the bottom of the editor, because most quotations never need it:
rename the Arabic/English labels of any cell in the top table, rename the item-column headings,
and add or remove extra spec columns (they slot in before Total Price).

**The company is fixed.** This app quotes for Gulf Borders For Contracting and nothing else, so
the letterhead — logo, stamp/seal, company name (AR + EN), the footer phones, email, address and
the brand navy/gold — is baked in. It lives in one place, the `COMPANY` object near the top of
`app.js`, alongside the artwork in `assets/`; change it there and every quotation follows.

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
