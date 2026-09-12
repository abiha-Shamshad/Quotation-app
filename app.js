/* ═══════════════════════════════════════════════════════════
   Bilingual Quotation Generator — app.js
   State  →  live A4 document  →  print / PDF
   Storage: localStorage (offline-first, no server needed)
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ───────────── tiny helpers ───────────── */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isAr = s => /[؀-ۿ]/.test(s || '');
const uid = () => 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));

function num(v) {
  const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : 0;
}
/* 1050 → "1050" · 646.5 → "646.50" · grouped: 4310 → "4,310" */
function fmt(n, grouped) {
  if (!isFinite(n)) n = 0;
  const whole = Math.abs(n % 1) < 0.005;
  const d = whole ? 0 : 2;
  return grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    : n.toFixed(d);
}
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 2400);
}

/* ───────────── default artwork (replaceable in Company profile) ───────────── */
let svgSeq = 0;
function defaultLogo() {
  return `<svg class="doc-logo" viewBox="0 0 230 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo">
    <text x="115" y="112" text-anchor="middle" font-family="Poppins,Segoe UI,Arial,sans-serif"
          font-size="132" font-weight="800" letter-spacing="-10" fill="#1B2A5B">JB</text>
  </svg>`;
}
function defaultStamp() {
  const id = 'sealArc' + (++svgSeq);
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stamp">
    <defs>
      <path id="${id}t" d="M 26,100 A 74,74 0 0 1 174,100" fill="none"/>
      <path id="${id}b" d="M 34,100 A 66,66 0 0 0 166,100" fill="none"/>
    </defs>
    <circle cx="100" cy="100" r="94" fill="none" stroke="#1B2A5B" stroke-width="3.4"/>
    <circle cx="100" cy="100" r="85" fill="none" stroke="#1B2A5B" stroke-width="1.4"/>
    <text font-family="Tajawal,Cairo,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#1B2A5B">
      <textPath href="#${id}t" xlink:href="#${id}t" startOffset="50%" text-anchor="middle">مؤسسة حدود الخليج للمقاولات</textPath>
    </text>
    <text font-family="Poppins,Segoe UI,sans-serif" font-size="12.5" font-weight="600" fill="#1B2A5B">
      <textPath href="#${id}b" xlink:href="#${id}b" startOffset="50%" text-anchor="middle">Gulf Borders For Contracting</textPath>
    </text>
    <text x="100" y="128" text-anchor="middle" font-family="Poppins,Segoe UI,sans-serif"
          font-size="62" font-weight="800" letter-spacing="-5" fill="#1B2A5B">JB</text>
  </svg>`;
}
const ICONS = {
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail : 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  pin  : 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z'
};
const ico = d => `<span class="f-ico"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></span>`;

/* decorative gold + navy double frame, drawn 1:1 over the 794×1123 page */
function frameSVG(navy, gold) {
  return `<svg class="frame" viewBox="0 0 794 1123" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6.5" y="6.5" width="781" height="1110" rx="44" fill="none" stroke="${navy}" stroke-width="13"/>
    <rect x="19" y="19" width="756" height="1085" rx="72" fill="none" stroke="${gold}" stroke-width="3.2"/>
    <rect x="27" y="27" width="740" height="1069" rx="58" fill="none" stroke="${navy}" stroke-width="1.6"/>
    <path d="M32 150 A 118 118 0 0 1 150 32"  fill="none" stroke="${gold}" stroke-width="3.6"/>
    <path d="M644 32 A 118 118 0 0 1 762 150" fill="none" stroke="${gold}" stroke-width="3.6"/>
    <path d="M32 973 A 118 118 0 0 0 150 1091"  fill="none" stroke="${gold}" stroke-width="3.6"/>
    <path d="M644 1091 A 118 118 0 0 0 762 973" fill="none" stroke="${gold}" stroke-width="3.6"/>
  </svg>`;
}

/* ───────────── storage ───────────── */
const K_PROFILE = 'gbfc.profile.v1';
const K_QUOTES  = 'gbfc.quotes.v1';
const K_CURRENT = 'gbfc.current.v1';
const K_CATALOG = 'gbfc.catalog.v1';
const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; }
                         catch (e) { toast('Storage full — remove some saved quotations.'); return false; } };

/* ───────────── defaults ───────────── */
const DEFAULT_PROFILE = {
  logo: '', stamp: '',
  nameAr: 'مؤسسة حدود الخليج للمقاولات',
  nameEn: 'Gulf Borders For Contracting',
  tel: '0592860812',
  phone1: '0557070210',
  phone2: '0138041113',
  email: 'hussinalfteh210@gmail.com',
  address: 'الدمام شارع الملك سعود',
  navy: '#1B2A5B', gold: '#C9A24B'
};

/* The starter item list — the jobs this shop quotes again and again.
   The user prunes or adds to it under ⋯ › My item list, and every line
   typed on a quotation joins it automatically on save. */
const DEFAULT_CATALOG = [
  { d:'Concealed AC - compressor change + nitrogen + R22 gas refill', u:'1050' },
  { d:'Concealed AC - gas refill',                                    u:'250'  },
  { d:'Concealed AC - fan motor change + cleaning',                   u:'250'  },
  { d:'Concealed AC - PCB repair',                                    u:'350'  },
  { d:'Split AC - compressor change + PCB repair + gas refill',       u:'780'  },
  { d:'Split AC - gas refill + outdoor unit cleaning',                u:'300'  },
  { d:'Split AC - indoor fan motor change',                           u:'200'  },
  { d:'Split AC - capacitor change',                                  u:'200'  },
  { d:'AC water leak repair',                                         u:'100'  },
  { d:'AC service and cleaning',                                      u:'150'  },
  { d:'Water leakage repair',                                         u:'100'  },
  { d:'Site visit and inspection',                                    u:''     }
];
let catalog = load(K_CATALOG, null);
if (!Array.isArray(catalog)) catalog = clone(DEFAULT_CATALOG);
catalog = catalog.filter(c => c && typeof c === 'object');

/* one short line for the dropdown — the full text still goes in the description */
function catLabel(c) {
  const d = String((c && c.d) || '').split(/\r?\n/).join(' · ').trim();
  const short = d.length > 58 ? d.slice(0, 57) + '…' : d;
  return c.u ? short + '  ·  ' + c.u : short;
}

const BASE_COLS = () => ([
  { key:'no',    ar:'م',              en:'No.',                 kind:'no',    fixed:true,  w:8.4  },
  { key:'desc',  ar:'التفاصيل',        en:'Description / Detail', kind:'text',  fixed:false, w:54.8 },
  { key:'qty',   ar:'الكمية',          en:'Qty',                  kind:'num',   fixed:true,  w:11   },
  { key:'unit',  ar:'سعر الوحدة',      en:'Unit Price',           kind:'num',   fixed:true,  w:12.1 },
  { key:'total', ar:'السعر الاجمالي',  en:'Total Price',          kind:'total', fixed:true,  w:13.7 }
]);

const L = (ar, en) => ({ ar, en });
const V = (v, align, size) => ({ v: v || '', align: align || 'left', size: size || 'lg' });

function blankInfo() {
  return [
    [V(''), L('الرقم', 'Ref. No.'),      V('', 'left', 'md'),  L('التاريخ', 'Date')],
    [V(''), L('تليفون', 'Telephone'),    V('', 'center', 'sm'), L('الطرف الأول', 'Contractor')],
    [V(''), L('جوال العميل', 'Client Mobile'), V('', 'center', 'sm'), L('الطرف الثاني', 'Client')],
    [V(''), L('', ''),                    V('', 'center', 'md'), L('الموقع', 'Location')]
  ];
}
function blankRow(cols) {
  const r = {};
  cols.forEach(c => { r[c.key] = ''; });
  r._over = false;
  return r;
}
function newQuote() {
  const p = state ? state.profile : DEFAULT_PROFILE;
  const cols = BASE_COLS();
  const info = blankInfo();
  info[1][0].v = p.tel || '';
  info[1][2].v = (p.nameAr || '') + '\n' + (p.nameEn || '');
  const rows = [];
  for (let i = 0; i < 7; i++) { const r = blankRow(cols); r.no = String(i + 1); rows.push(r); }
  return { id: uid(), created: Date.now(), updated: Date.now(), info, cols, rows, vat: 15,
           tAr:'عرض الاسعار', tEn:'QUOTATION',
           subAr:'', subEn:'Sub Total', vatEn:'VAT', totAr:'', totEn:'Total Amount' };
}

/* the reference quotation — matches the printed sample exactly */
function sampleQuote() {
  const q = newQuote();
  q.info[0][0] = V('CONT-812-2026', 'left', 'lg');
  q.info[0][2] = V('August 2026', 'left', 'md');
  q.info[1][0] = V('0592860812', 'left', 'lg');
  q.info[1][2] = V('مؤسسة حدود الخليج للمقاولات\nGulf Borders For Contracting', 'center', 'sm');
  q.info[2][0] = V('0550710254', 'left', 'lg');
  q.info[2][2] = V('شركة خالد مقبل التطوير العقاري\nKhaidi M. Al-Tatweer Real Estate Co.', 'center', 'sm');
  q.info[3][2] = V('Compound#2', 'center', 'md');
  const data = [
    ['1',  'Villa No - 2 - 1 Conceled Compreser Chang +Nitrom+ R22 Gas Refill\n2nd AC concealed Fan Motor Change', '1', '1050', '1050'],
    ['2',  'Villa No - 10 - Gass Refill + consealed AC + Cleaning', '1', '250', '250'],
    ['3',  'Villa No - 12 - Split AC Chang Compreser ++ PCB Repair with Gass Refill', '1', '780', '780'],
    ['4',  'Villa No - 12 - Conceled AC Fan Moror Change + Cleaning', '1', '250', '250'],
    ['5',  'Haris Room Split AC Indor Fan Motor Chang', '1', '200', '200'],
    ['6',  'Vill No B ; Repair Consealed Water Leking', '1', '100', '100'],
    ['7',  'Villa No - 9 - (4 AC Consealed Check 1 Gas Refile 2nd AC Fan Motor\nChange & 3rd AC Water Leaking', '2', '580', '580'],
    ['8',  'Villa No - 8 - Conceled AC Gass Refill', '1', '250', '250'],
    ['9',  'Villa 7 - Gass Refil + Outdoor cleaning', '1', '300', '300'],
    ['10', 'villa 10, Split AC Capsitor Chang +\n2nd AC Gas Refill & 3rd conseald AC Water Leaking', '1', '450', '450'],
    ['10', 'Room Norine Split AC Water Leaking', '1', '100', '100']
  ];
  q.rows = data.map(d => {
    const r = { no: d[0], desc: d[1], qty: d[2], unit: d[3], total: d[4] };
    r._over = num(d[2]) * num(d[3]) !== num(d[4]);   /* row 7 is a flat-rate override */
    return r;
  });
  return q;
}

/* ───────────── state ───────────── */
let state = {
  profile: Object.assign({}, DEFAULT_PROFILE, load(K_PROFILE, {})),
  quote:   null,
  savedId: null
};
const restored = load(K_CURRENT, null);
state.quote   = restored || sampleQuote();
state.savedId = restored ? restored.id : null;
if (!state.quote.cols) state.quote.cols = BASE_COLS();

/* ───────────── calculations ───────────── */
function rowTotal(r) {
  if (r._over) return num(r.total);
  return num(r.qty) * num(r.unit);
}
function totals() {
  const sub = state.quote.rows.reduce((a, r) => a + rowTotal(r), 0);
  const vat = sub * num(state.quote.vat) / 100;
  return { sub, vat, total: sub + vat };
}
function widths(cols) {
  const flex = cols.filter(c => !c.fixed);
  const fixedSum = cols.filter(c => c.fixed).reduce((a, c) => a + c.w, 0);
  const each = flex.length ? (100 - fixedSum) / flex.length : 0;
  return cols.map(c => c.fixed ? c.w : each);
}

/* ═══════════════════════════════════════════════════════════
   RENDER — the document
   ═══════════════════════════════════════════════════════════ */
function valHTML(cell) {
  const lines = String(cell.v || '').split('\n').filter(s => s.trim() !== '');
  const align = 'ta-' + (cell.align || 'left');
  if (cell.size === 'sm' || lines.length > 1) {
    return '<div class="v-main small ' + align + '">' +
      lines.map(l => '<span class="' + (isAr(l) ? 'ar' : 'en') + '">' + esc(l) + '</span>').join('') +
      '</div>';
  }
  const cls = cell.size === 'md' ? 'v-main md ' : 'v-main ';
  return '<div class="' + cls + align + (isAr(cell.v) ? ' rtl' : '') + '">' + esc(cell.v) + '</div>';
}
function lblHTML(c) {
  return (c.ar ? '<div class="l-ar">' + esc(c.ar) + '</div>' : '') +
         (c.en ? '<div class="l-en">' + esc(c.en) + '</div>' : '') ||
         '&nbsp;';
}

function renderDoc() {
  const q = state.quote, p = state.profile;
  const page = $('#page');
  page.style.setProperty('--navy', p.navy || '#1B2A5B');
  page.style.setProperty('--gold', p.gold || '#C9A24B');

  /* letterhead */
  const logo = p.logo
    ? '<img class="doc-logo" src="' + p.logo + '" alt="">'
    : defaultLogo();
  const stamp = p.stamp
    ? '<img src="' + p.stamp + '" alt="">'
    : defaultStamp();

  /* info table */
  const infoRows = q.info.map(r => {
    return '<tr>' +
      '<td class="i-v">' + valHTML(r[0]) + '</td>' +
      '<td class="i-l ta-center">' + lblHTML(r[1]) + '</td>' +
      '<td class="i-v">' + valHTML(r[2]) + '</td>' +
      '<td class="i-l ta-right">' + lblHTML(r[3]) + '</td>' +
    '</tr>';
  }).join('');

  /* items table */
  const w = widths(q.cols);
  const colGroup = q.cols.map((c, i) => '<col style="width:' + w[i].toFixed(2) + '%">').join('');
  const head = q.cols.map(c =>
    '<th>' + (c.ar ? '<span class="ar">' + esc(c.ar) + '</span>' : '') +
             (c.en ? '<span class="en">' + esc(c.en) + '</span>' : '') + '</th>').join('');
  const body = q.rows.map((r, i) => {
    const cells = q.cols.map(c => {
      let cls = '', txt;
      if (c.kind === 'no')         { cls = 'c-no';    txt = r.no || ''; }
      else if (c.kind === 'total') { cls = 'c-total'; txt = fmt(rowTotal(r), false); }
      else if (c.key === 'desc')   { cls = 'c-desc';  txt = r[c.key] || ''; }
      else                         { txt = r[c.key] || ''; }
      if (isAr(txt)) cls += ' rtl';
      return '<td class="' + cls.trim() + '">' + esc(txt) + '</td>';
    }).join('');
    return '<tr class="' + (i % 2 ? '' : 'alt') + '">' + cells + '</tr>';
  }).join('');

  /* totals */
  const t = totals();
  const vatLabel = (q.vatEn || 'VAT') + '(' + fmt(num(q.vat), false) + '%)';

  page.innerHTML =
    frameSVG(p.navy || '#1B2A5B', p.gold || '#C9A24B') +
    '<div class="doc">' +

      '<div class="doc-head">' + logo +
        '<div class="doc-names">' +
          '<div class="name-ar">' + esc(p.nameAr) + '</div>' +
          '<div class="name-en">' + esc(p.nameEn) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="doc-title">' +
        '<span class="rule l"></span><span class="rule r"></span>' +
        '<p class="ttl-ar">' + esc(q.tAr) + '</p>' +
        '<p class="ttl-en">' + esc(q.tEn) + '</p>' +
      '</div>' +

      '<div class="info-wrap"><table class="info">' +
        '<colgroup><col style="width:22.6%"><col style="width:17.4%"><col style="width:42.1%"><col style="width:17.9%"></colgroup>' +
        '<tbody>' + infoRows + '</tbody>' +
      '</table></div>' +

      '<div class="items-wrap"><table class="items">' +
        '<colgroup>' + colGroup + '</colgroup>' +
        '<thead><tr>' + head + '</tr></thead>' +
        '<tbody>' + body + '</tbody>' +
      '</table></div>' +

      '<div class="doc-bottom">' +
        '<div class="stamp-box">' + stamp + '</div>' +
        '<div class="totals">' +
          '<div class="t-row"><div class="t-lbl">' + esc(q.subEn || 'Sub Total') + '</div>' +
            '<div class="t-val">' + fmt(t.sub, true) + '</div></div>' +
          '<div class="t-row"><div class="t-lbl">' + esc(vatLabel) + '</div>' +
            '<div class="t-val">' + fmt(t.vat, true) + '</div></div>' +
          '<div class="t-row grand"><div class="t-lbl">' + esc(q.totEn || 'Total Amount') + '</div>' +
            '<div class="t-val">' + fmt(t.total, true) + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="doc-footer">' +
        '<div class="f-item">' + ico(ICONS.phone) + '<span class="f-txt">' + esc(p.phone1) + '</span></div>' +
        '<div class="f-item">' + ico(ICONS.phone) + '<span class="f-txt">' + esc(p.phone2) + '</span></div>' +
        '<div class="f-item">' + ico(ICONS.mail)  + '<span class="f-txt">' + esc(p.email)  + '</span></div>' +
        '<div class="f-item">' + ico(ICONS.pin)   + '<span class="f-txt ar">' + esc(p.address) + '</span></div>' +
      '</div>' +

    '</div>';

  fitPage();
  updateReadouts();
}

/* the running totals under the form — cheap, and needed even while the
   document itself is not on screen */
function updateReadouts() {
  const q = state.quote, t = totals();
  $('#roSub').textContent   = fmt(t.sub, true);
  $('#roVat').textContent   = fmt(t.vat, true);
  $('#roTotal').textContent = fmt(t.total, true);
  $('#itemsCount').textContent = q.rows.length + (q.rows.length === 1 ? ' item' : ' items');
}

/* A long quotation is shrunk step by step until it fits the one A4 page;
   a short one is opened out instead, so the table always meets the totals
   block rather than leaving a bare white gap in the middle of the page. */
const FIT_STEPS = [[12.8,8],[12,7],[11.2,6],[10.5,5],[9.8,4.2],[9.2,3.6],[8.6,3],[8,2.5],[7.4,2],[6.9,1.6],[6.4,1.3],[6,1],[5.6,.8],[5.2,.6]];
const MAX_ROW_PAD = 20;
const overflows = doc => doc.scrollHeight > doc.clientHeight + 1;

function fitPage() {
  const page = $('#page'), doc = $('.doc', page);
  if (!doc || doc.clientHeight < 100) return;      /* hidden — nothing to measure */
  let step = 0;
  for (; step < FIT_STEPS.length; step++) {
    doc.style.setProperty('--item-fs',  FIT_STEPS[step][0] + 'px');
    doc.style.setProperty('--item-pad', FIT_STEPS[step][1] + 'px');
    if (!overflows(doc)) break;
  }
  if (!overflows(doc)) fillPage(doc);              /* room to spare — spread out into it */
  else tooLong();                                  /* smaller than this is unreadable */
}

/* one warning per document, not one per keystroke */
let warnedLong = false;
function tooLong() {
  if (warnedLong) return;
  warnedLong = true;
  toast('Too many items for one page — remove a few or shorten the descriptions.');
}

/* the empty band left between the items table and the stamp / totals block */
function freeBand(doc) {
  const items = $('.items-wrap', doc), bottom = $('.doc-bottom', doc);
  if (!items || !bottom) return 0;
  return bottom.getBoundingClientRect().top - items.getBoundingClientRect().bottom;
}

function fillPage(doc) {
  const tbody = $('table.items tbody', doc);
  if (!tbody || !tbody.rows.length) return;

  /* first, a little more air in every row — up to a sensible limit */
  const pad  = parseFloat(getComputedStyle(doc).getPropertyValue('--item-pad')) || 8;
  const grow = Math.min(MAX_ROW_PAD - pad, Math.max(0, freeBand(doc) - 2) / (tbody.rows.length * 2));
  if (grow > 0.5) {
    doc.style.setProperty('--item-pad', (pad + grow).toFixed(1) + 'px');
    if (overflows(doc)) doc.style.setProperty('--item-pad', pad + 'px');
  }

  /* then rule out whatever is still empty, one blank row at a time */
  const cols = tbody.rows[tbody.rows.length - 1].cells.length;
  for (let guard = 0; guard < 40; guard++) {
    const tr = document.createElement('tr');
    tr.className = 'filler' + (tbody.rows.length % 2 ? '' : ' alt');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      if (c === 0) td.className = 'c-no';
      td.innerHTML = '&nbsp;';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    if (freeBand(doc) < 0.5 || overflows(doc)) { tbody.removeChild(tr); break; }
  }

  /* and share out whatever sliver is left over, so the table meets the totals */
  const pad2  = parseFloat(getComputedStyle(doc).getPropertyValue('--item-pad')) || 8;
  const grow2 = Math.max(0, freeBand(doc) - 2) / (tbody.rows.length * 2);
  if (grow2 > 0.3) {
    doc.style.setProperty('--item-pad', (pad2 + grow2).toFixed(1) + 'px');
    if (overflows(doc)) doc.style.setProperty('--item-pad', pad2 + 'px');
  }
}

/* ═══════════════════════════════════════════════════════════
   RENDER — the editor
   ═══════════════════════════════════════════════════════════ */
/* The top table is 4 rows × 2 value+label pairs. The form shows one plain
   field per pair, captioned with that pair's own label — rename a label
   under Advanced and the caption here follows. */
function infoPairs() {
  const out = [];
  state.quote.info.forEach((r, ri) => {
    [[0, 1], [2, 3]].forEach(p => {
      const v = r[p[0]], l = r[p[1]];
      const cap = ((l.en || l.ar || '') + '').trim();
      if (!cap && !String(v.v || '').trim()) return;   /* unused cell stays hidden */
      out.push({ ri: ri, vi: p[0], li: p[1], cap: cap || 'Extra', cell: v });
    });
  });
  /* one-line fields pair up two-per-row first, the two long name cells after */
  return out.filter(f => f.cell.size !== 'sm').concat(out.filter(f => f.cell.size === 'sm'));
}

function renderInfoEditor() {
  $('#infoEditor').innerHTML = '<div class="field-grid">' + infoPairs().map(f => {
    const multi = f.cell.size === 'sm';           /* the two name cells */
    const rtl = isAr(f.cell.v) ? ' dir="rtl"' : '';
    const at  = ' data-info="' + f.ri + ',' + f.vi + ',v"';
    return '<label class="field' + (multi ? ' wide' : '') + '"><span>' + esc(f.cap) + '</span>' +
      (multi
        ? '<textarea rows="2"' + at + rtl + '>' + esc(f.cell.v) + '</textarea>'
        : '<input' + at + rtl + ' value="' + esc(f.cell.v) + '">') +
      '</label>';
  }).join('') + '</div>';
}

/* keep a caption in step while its label is being retyped under Advanced */
function syncCaption(ri, li) {
  const box = $('[data-info="' + ri + ',' + (li - 1) + ',v"]', $('#infoEditor'));
  const lab = box && box.closest('.field');
  if (!lab) return;
  const l = state.quote.info[ri][li];
  lab.querySelector('span').textContent = ((l.en || l.ar || '') + '').trim() || 'Extra';
}

function renderItemsEditor() {
  const q = state.quote;
  const extra = q.cols.filter(c => !c.fixed && c.key !== 'desc');

  $('#itemsEditor').innerHTML = q.rows.map((r, ri) => {
    const extraInputs = extra.map(c =>
      '<label class="field"><span>' + esc(c.en || c.ar) + '</span>' +
        '<input class="cellbox" data-cell="' + ri + ',' + c.key + '" value="' + esc(r[c.key] || '') + '"></label>').join('');
    return '<div class="item-card">' +
      '<div class="ic-pick"><select class="pick" data-pick="' + ri + '" aria-label="Pick an item">' +
        '<option value="">＋ Pick an item…</option>' +
        catalog.map((c, i) => '<option value="' + i + '">' + esc(catLabel(c)) + '</option>').join('') +
        '<option value="manage">✎ Edit my item list…</option>' +
      '</select></div>' +
      '<div class="ic-head">' +
        '<input class="n" data-cell="' + ri + ',no" value="' + esc(r.no || '') + '" aria-label="Item number">' +
        '<textarea class="desc" rows="2" data-cell="' + ri + ',desc"' +
          (isAr(r.desc) ? ' dir="rtl"' : '') + ' placeholder="Description">' + esc(r.desc || '') + '</textarea>' +
        '<button class="del" data-delrow="' + ri + '" title="Delete this item" aria-label="Delete item">✕</button>' +
      '</div>' +
      (extraInputs ? '<div class="ic-extra">' + extraInputs + '</div>' : '') +
      '<div class="ic-nums">' +
        '<label class="field"><span>Qty</span>' +
          '<input class="cellbox" inputmode="decimal" data-cell="' + ri + ',qty" value="' + esc(r.qty || '') + '"></label>' +
        '<label class="field"><span>Unit price</span>' +
          '<input class="cellbox" inputmode="decimal" data-cell="' + ri + ',unit" value="' + esc(r.unit || '') + '"></label>' +
        '<label class="field ic-total' + (r._over ? ' is-over' : '') + '"><span>Total' + (r._over ? '' : ' (auto)') + '</span>' +
          '<input class="cellbox" inputmode="decimal" data-total="' + ri + '" value="' + fmt(rowTotal(r), false) + '">' +
          (r._over ? '<button class="reset-total" data-resettotal="' + ri + '" title="Back to Qty × Unit price">auto</button>' : '') +
        '</label>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* picking from the list fills the line in — description, price, and a
   quantity of 1 — leaving only what is genuinely one-off to be typed */
$('#editor').addEventListener('change', e => {
  const sel = e.target.closest('select.pick');
  if (!sel) return;
  const pick = sel.value;
  sel.value = '';
  if (pick === 'manage') return openItems();
  if (pick === '') return;
  const c = catalog[+pick], r = state.quote.rows[+sel.dataset.pick];
  if (!c || !r) return;
  r.desc = c.d;
  if (c.u && !String(r.unit || '').trim()) r.unit = c.u;
  if (!String(r.qty || '').trim()) r.qty = '1';
  touched(true);
});

/* everything most quotations never need, folded away in one place */
function renderAdvanced() {
  const q = state.quote;

  const labels = '<h3 class="adv-h">Table labels</h3>' +
    '<p class="note">Relabel a cell in the top table for a different kind of job.</p>' +
    '<div class="adv-rows">' + q.info.map((r, ri) =>
      [[0, 1], [2, 3]].map(p => {
        const l = r[p[1]];
        const val = String(r[p[0]].v || '').split('\n')[0].trim();
        return '<div class="adv-row"><span class="adv-key">' + esc(val || '—') + '</span>' +
          '<input class="mini" dir="rtl" data-info="' + ri + ',' + p[1] + ',ar" value="' + esc(l.ar) + '" placeholder="عربي">' +
          '<input class="mini" data-info="' + ri + ',' + p[1] + ',en" value="' + esc(l.en) + '" placeholder="English">' +
        '</div>';
      }).join('')).join('') + '</div>';

  const cols = '<h3 class="adv-h">Item columns</h3>' +
    '<div class="adv-rows">' + q.cols.map((c, i) =>
      '<div class="adv-row"><span class="adv-key">' + esc(c.en || c.key) + '</span>' +
        '<input class="mini" dir="rtl" data-col="' + i + ',ar" value="' + esc(c.ar) + '" placeholder="عربي">' +
        '<input class="mini" data-col="' + i + ',en" value="' + esc(c.en) + '" placeholder="English">' +
      '</div>').join('') + '</div>' +
    '<div class="grid-tools">' +
      '<button class="chip" data-act="add-col">＋ Column</button>' +
      '<button class="chip" data-act="del-col">– Column</button>' +
    '</div>';

  $('#advEditor').innerHTML = labels + cols;
}

function renderEditor() {
  renderInfoEditor();
  renderItemsEditor();
  renderAdvanced();
  $('#vatInput').value = state.quote.vat;
}

/* ═══════════════════════════════════════════════════════════
   EDITING
   ═══════════════════════════════════════════════════════════ */
let saveT;
function touched(structural) {
  state.quote.updated = Date.now();
  if (docShown()) renderDoc(); else updateReadouts();
  clearTimeout(saveT);
  saveT = setTimeout(() => save(K_CURRENT, state.quote), 400);
  if (structural) renderEditor();
}

$('#editor').addEventListener('input', e => {
  const el = e.target, q = state.quote;

  if (el.dataset.info) {
    const [ri, ci, field] = el.dataset.info.split(',');
    q.info[+ri][+ci][field] = el.value;
    if (field !== 'v') syncCaption(+ri, +ci);
    return touched();
  }
  if (el.dataset.col) {
    const [ci, field] = el.dataset.col.split(',');
    q.cols[+ci][field] = el.value;
    return touched();
  }
  if (el.dataset.cell) {
    const [ri, key] = el.dataset.cell.split(',');
    q.rows[+ri][key] = el.value;
    /* keep the auto total in step */
    if ((key === 'qty' || key === 'unit') && !q.rows[+ri]._over) {
      const box = $('[data-total="' + ri + '"]', $('#itemsEditor'));
      if (box) box.value = fmt(rowTotal(q.rows[+ri]), false);
    }
    return touched();
  }
  if (el.dataset.total != null && el.dataset.total !== '') {
    const ri = +el.dataset.total, r = q.rows[ri];
    r.total = el.value;
    const auto = num(r.qty) * num(r.unit);
    const wasOver = r._over;
    r._over = Math.abs(num(el.value) - auto) > 0.004;
    if (wasOver !== r._over) {
      const lab = el.closest('.ic-total');
      if (lab) lab.classList.toggle('is-over', r._over);
      renderDoc();
      /* re-render just this card's footer state on the next structural pass */
      clearTimeout(saveT); saveT = setTimeout(() => { save(K_CURRENT, q); renderItemsEditor(); }, 700);
      return;
    }
    return touched();
  }
  if (el.id === 'vatInput') {
    q.vat = el.value === '' ? 0 : num(el.value);
    return touched();
  }
});

$('#editor').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const q = state.quote;

  if (b.dataset.delrow != null && b.dataset.delrow !== '') {
    if (q.rows.length <= 1) return toast('At least one line item is required.');
    q.rows.splice(+b.dataset.delrow, 1);
    renumber();
    return touched(true);
  }
  if (b.dataset.resettotal != null && b.dataset.resettotal !== '') {
    const r = q.rows[+b.dataset.resettotal];
    r._over = false; r.total = '';
    return touched(true);
  }
  const act = b.dataset.act;
  if (act === 'add-row') {
    const r = blankRow(q.cols);
    r.no = String(q.rows.length + 1);
    q.rows.push(r);
    touched(true);
    const cards = $$('.item-card', $('#itemsEditor'));
    const last = cards[cards.length - 1];
    if (last) { last.scrollIntoView({ block: 'center', behavior: 'smooth' });
                const ta = $('textarea', last); if (ta) ta.focus(); }
    return;
  }
  if (act === 'add-col') {
    const n = q.cols.filter(c => c.key.indexOf('x') === 0).length + 1;
    const key = 'x' + n;
    q.cols.splice(q.cols.length - 1, 0,
      { key, ar: 'عمود ' + n, en: 'Column ' + n, kind: 'text', fixed: false, w: 0 });
    q.rows.forEach(r => { r[key] = ''; });
    return touched(true);
  }
  if (act === 'del-col') {
    for (let i = q.cols.length - 1; i >= 0; i--) {
      if (!q.cols[i].fixed && q.cols[i].key !== 'desc') {
        const key = q.cols[i].key;
        q.cols.splice(i, 1);
        q.rows.forEach(r => { delete r[key]; });
        return touched(true);
      }
    }
    return toast('Only the default columns are left — nothing to remove.');
  }
});

function renumber() {
  state.quote.rows.forEach((r, i) => { r.no = String(i + 1); });
}

/* ═══════════════════════════════════════════════════════════
   COMPANY PROFILE
   ═══════════════════════════════════════════════════════════ */
const P_FIELDS = ['nameAr', 'nameEn', 'tel', 'phone1', 'phone2', 'email', 'address', 'navy', 'gold'];
function openSettings() {
  const p = state.profile;
  P_FIELDS.forEach(f => { const el = $('#p_' + f); if (el) el.value = p[f] || ''; });
  $('#logoPrev').innerHTML  = p.logo  ? '<img src="' + p.logo + '">'  : defaultLogo();
  $('#stampPrev').innerHTML = p.stamp ? '<img src="' + p.stamp + '">' : defaultStamp();
  $('#settingsPanel').hidden = false;
}
function readFile(input, cb) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (f.size > 1.6 * 1024 * 1024) return toast('Image too large — please use one under 1.5 MB.');
  const fr = new FileReader();
  fr.onload = () => cb(fr.result);
  fr.readAsDataURL(f);
  input.value = '';
}
$('#logoFile').addEventListener('change', e =>
  readFile(e.target, d => { state.profile.logo = d; $('#logoPrev').innerHTML = '<img src="' + d + '">'; renderDoc(); }));
$('#stampFile').addEventListener('change', e =>
  readFile(e.target, d => { state.profile.stamp = d; $('#stampPrev').innerHTML = '<img src="' + d + '">'; renderDoc(); }));

$('#settingsPanel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.pick)  { e.preventDefault(); $('#' + b.dataset.pick).click(); return; }
  if (b.dataset.clear) {
    e.preventDefault();
    const k = b.dataset.clear;
    state.profile[k] = '';
    $('#' + k + 'Prev').innerHTML = k === 'logo' ? defaultLogo() : defaultStamp();
    return renderDoc();
  }
  if (b.hasAttribute('data-close')) { $('#settingsPanel').hidden = true; return; }
  if (b.dataset.act === 'save-profile') {
    P_FIELDS.forEach(f => { const el = $('#p_' + f); if (el) state.profile[f] = el.value; });
    save(K_PROFILE, state.profile);
    renderDoc();
    $('#settingsPanel').hidden = true;
    toast('Company profile saved');
  }
});
$('#settingsPanel').addEventListener('input', e => {
  const id = e.target.id;
  if (id && id.indexOf('p_') === 0) {
    state.profile[id.slice(2)] = e.target.value;
    renderDoc();
  }
});

/* ═══════════════════════════════════════════════════════════
   SAVE · HISTORY · DUPLICATE
   ═══════════════════════════════════════════════════════════ */
function quoteRef(q)    { return (q.info[0][0].v || '').trim() || 'No Ref.'; }
function quoteClient(q)  {
  const c = (q.info[2][2].v || '').split('\n').filter(Boolean);
  return (c[c.length - 1] || c[0] || '—').trim();
}
function quoteDate(q)    { return (q.info[0][2].v || '').trim(); }

function saveQuote() {
  const list = load(K_QUOTES, []);
  const q = clone(state.quote);
  q.updated = Date.now();
  const i = list.findIndex(x => x.id === q.id);
  if (i >= 0) list[i] = q; else list.unshift(q);
  if (save(K_QUOTES, list)) {
    state.savedId = q.id;
    save(K_CURRENT, state.quote);
    try { learnItems(q); } catch (e) { /* the list is a convenience, never a blocker */ }
    $('#docStatus').textContent = quoteRef(q) + ' · saved';
    toast('Quotation saved');
  }
}
/* ═══════════════════════════════════════════════════════════
   MY ITEM LIST
   ═══════════════════════════════════════════════════════════ */
function saveCatalog() { save(K_CATALOG, catalog); }

function renderCatalog() {
  $('#catList').innerHTML = catalog.length
    ? catalog.map((c, i) =>
        '<div class="cat"' + (isAr(c.d) ? ' dir="rtl"' : '') + '>' +
          '<textarea class="cat-d" rows="2" data-cat="' + i + ',d" placeholder="What the job is called">' + esc(c.d) + '</textarea>' +
          '<input class="cat-u" inputmode="decimal" data-cat="' + i + ',u" value="' + esc(c.u || '') + '" placeholder="Price">' +
          '<button class="cat-x" data-catdel="' + i + '" title="Remove" aria-label="Remove">✕</button>' +
        '</div>').join('')
    : '<div class="empty">Your list is empty.<br>Tap <b>＋ Add an item</b>, or just save a quotation — its lines land here.</div>';
}
function openItems() {
  renderCatalog();
  $('#itemsPanel').hidden = false;
}
$('#itemsPanel').addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset.cat) return;
  const [i, field] = el.dataset.cat.split(',');
  if (!catalog[+i]) return;
  catalog[+i][field] = el.value;
  saveCatalog();
  renderItemsEditor();                      /* the dropdowns follow along */
});
$('#itemsPanel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.hasAttribute('data-close')) { $('#itemsPanel').hidden = true; return; }
  if (b.dataset.catdel != null && b.dataset.catdel !== '') {
    catalog.splice(+b.dataset.catdel, 1);
    saveCatalog(); renderCatalog(); renderItemsEditor();
    return;
  }
  if (b.dataset.act === 'cat-add') {
    catalog.unshift({ d: '', u: '' });
    saveCatalog(); renderCatalog();
    const first = $('.cat-d', $('#catList'));
    if (first) first.focus();
    return;
  }
  if (b.dataset.act === 'cat-reset') {
    clone(DEFAULT_CATALOG).forEach(c => { if (!findItem(c.d)) catalog.push(c); });
    saveCatalog(); renderCatalog(); renderItemsEditor();
    toast('Starter items are back in the list');
  }
});

function findItem(d) {
  const k = String(d || '').trim().toLowerCase();
  return k ? catalog.find(c => String(c.d || '').trim().toLowerCase() === k) : null;
}
/* every line typed on a saved quotation joins the list, newest first */
function learnItems(q) {
  let added = 0;
  q.rows.forEach(r => {
    const d = String(r.desc || '').trim();
    if (!d) return;
    const u = String(r.unit || '').trim();
    const hit = findItem(d);
    if (hit) { if (u) hit.u = u; catalog.splice(catalog.indexOf(hit), 1); catalog.unshift(hit); }
    else { catalog.unshift({ d: d, u: u }); added++; }
  });
  if (catalog.length > 80) catalog.length = 80;
  if (added) renderItemsEditor();
  saveCatalog();
}

function openHistory() {
  renderHistory('');
  $('#histSearch').value = '';
  $('#historyPanel').hidden = false;
}
function renderHistory(term) {
  const list = load(K_QUOTES, []).sort((a, b) => b.updated - a.updated);
  const t = (term || '').toLowerCase();
  const hit = list.filter(q => !t ||
    (quoteRef(q) + ' ' + quoteClient(q) + ' ' + quoteDate(q)).toLowerCase().indexOf(t) >= 0);
  $('#histList').innerHTML = hit.length ? hit.map(q => {
    const sub = q.rows.reduce((a, r) => a + (r._over ? num(r.total) : num(r.qty) * num(r.unit)), 0);
    const tot = sub + sub * num(q.vat) / 100;
    return '<div class="hist"><div class="meta">' +
      '<div class="r">' + esc(quoteRef(q)) + '</div>' +
      '<div class="c">' + esc(quoteClient(q)) + (quoteDate(q) ? ' · ' + esc(quoteDate(q)) : '') + '</div>' +
      '</div><div class="amt">' + fmt(tot, true) + '</div>' +
      '<div class="acts">' +
        '<button data-open="' + q.id + '">Open</button>' +
        '<button data-dup="' + q.id + '">Copy</button>' +
        '<button data-del="' + q.id + '">Delete</button>' +
      '</div></div>';
  }).join('') : '<div class="empty">No saved quotations yet.<br>Fill the form and tap <b>Save</b>.</div>';
}
$('#histSearch').addEventListener('input', e => renderHistory(e.target.value));
$('#historyPanel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.hasAttribute('data-close')) { $('#historyPanel').hidden = true; return; }
  const list = load(K_QUOTES, []);
  if (b.dataset.open) {
    const q = list.find(x => x.id === b.dataset.open);
    if (q) { loadQuote(q); $('#historyPanel').hidden = true; toast('Opened ' + quoteRef(q)); }
  } else if (b.dataset.dup) {
    const q = list.find(x => x.id === b.dataset.dup);
    if (q) { const c = clone(q); c.id = uid(); c.created = c.updated = Date.now();
             loadQuote(c); $('#historyPanel').hidden = true; toast('Copied — save it when ready'); }
  } else if (b.dataset.del) {
    save(K_QUOTES, list.filter(x => x.id !== b.dataset.del));
    renderHistory($('#histSearch').value);
    toast('Deleted');
  }
});
function loadQuote(q) {
  state.quote = q;
  if (!state.quote.cols) state.quote.cols = BASE_COLS();
  state.savedId = q.id;
  save(K_CURRENT, q);
  $('#docStatus').textContent = quoteRef(q);
  renderEditor();
  if (docShown()) renderDoc(); else { showForm(); updateReadouts(); }
}

/* ═══════════════════════════════════════════════════════════
   TWO SCREENS — the form, then the finished quotation
   The document is drawn only when it is asked for: Save, PDF / Print.
   ═══════════════════════════════════════════════════════════ */
function docShown() { return document.body.classList.contains('show-doc'); }

function showDoc(then) {
  document.body.classList.add('show-doc');
  window.scrollTo(0, 0);
  /* measure only now that the page has a size — a hidden one measures as zero.
     The timer is a backstop: a minimised, covered or background tab never runs
     an animation frame, and the document would otherwise never be drawn. */
  let drawn = false;
  const draw = () => {
    if (drawn) return;
    drawn = true;
    warnedLong = false;                 /* one warning each time the document is opened */
    renderDoc();
    applyZoom(fitZoom(), true);
    if (then) setTimeout(then, 150);
  };
  requestAnimationFrame(draw);
  setTimeout(draw, 80);
}
function showForm() {
  document.body.classList.remove('show-doc');
  window.scrollTo(0, 0);
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR · ZOOM · PRINT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.closest('#settingsPanel') || b.closest('#editor')) return;
  const act = b.dataset.act;
  if (act === 'new') {
    loadQuote(newQuote());
    $('#docStatus').textContent = 'New quotation';
    toast('Blank quotation ready');
  }
  else if (act === 'save')      { saveQuote(); showDoc(); }
  else if (act === 'edit')      showForm();
  else if (act === 'history')   openHistory();
  else if (act === 'settings')  openSettings();
  else if (act === 'items')     openItems();
  else if (act === 'duplicate') {
    const c = clone(state.quote);
    c.id = uid(); c.created = c.updated = Date.now();
    loadQuote(c);
    toast('Duplicated — edit and save as a new quotation');
  }
  else if (act === 'print' || act === 'pdf') doPrint();
});
/* editor's own save button */
$('#editor').addEventListener('click', e => {
  if (e.target.closest('[data-act="save"]')) { saveQuote(); showDoc(); }
});

/* Printing straight from Chrome's own menu (or Ctrl+P caught by the browser
   rather than by us) would otherwise print the empty page element. */
window.addEventListener('beforeprint', () => {
  if (docShown() && $('.doc')) return;
  document.body.classList.add('show-doc');
  renderDoc();
});

function doPrint() {
  toast('Choose "Save as PDF" in the dialog for a PDF, or a printer to print');
  showDoc(() => window.print());
}

/* zoom — one toggle: fit to the pane, or 100% */
let zoom = 1, autoFit = true;
function fitZoom() {
  const holder = $('#pageHolder');
  const avail = holder.clientWidth - 4;
  return Math.min(1, Math.max(0.25, avail / 794));
}
function applyZoom(z, auto) {
  zoom = z; autoFit = !!auto;
  $('#page').style.transform = 'scale(' + z + ')';
  $('#pageHolder').style.height = (1123 * z) + 'px';
  $('#zoomToggle').textContent = auto ? 'Zoom 100%' : 'Fit to width';
}
$('#zoomToggle').addEventListener('click', () => applyZoom(autoFit ? 1 : fitZoom(), !autoFit));
window.addEventListener('resize', () => { if (autoFit && docShown()) applyZoom(fitZoom(), true); });

/* the ⋯ menu closes when you pick something or tap away */
document.addEventListener('click', e => {
  const inMenu = e.target.closest('.menu');
  $$('details.menu[open]').forEach(m => {
    if (m !== inMenu || e.target.closest('.menu-list')) m.open = false;
  });
});

/* close overlays on backdrop tap */
$$('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.hidden = true; }));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const wasOpen = $$('.overlay:not([hidden])').length || $$('details.menu[open]').length;
    $$('.overlay').forEach(o => o.hidden = true);
    $$('details.menu[open]').forEach(m => { m.open = false; });
    if (!wasOpen && docShown()) showForm();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveQuote(); showDoc(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); doPrint(); }
});

/* ───────────── boot ───────────── */
renderEditor();
updateReadouts();
$('#docStatus').textContent = quoteRef(state.quote);
/* webfonts change metrics — re-measure once they land */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
  if (docShown()) { fitPage(); applyZoom(autoFit ? fitZoom() : zoom, autoFit); }
});

})();
