/**
 * Builds the KOSRES valuation report as a Word (.docx) document, laid out to
 * match the firm's established report format: green cover, title page with
 * photos, cover letter, table of contents, executive summary, terms of
 * engagement, property features, zoning, construction, valuation, property
 * images, certificate, valuation analysis table and appendices.
 *
 * Pure function: everything it needs arrives in `ReportInput`, so it can be
 * tested without a database. Images are fetched by URL (Cloudinary) and any
 * that cannot be fetched are skipped rather than failing the whole report.
 */
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, Header, HeadingLevel,
  ImageRun, LevelFormat, Packer, PageNumber, Paragraph, ShadingType, Table, TableCell,
  TableOfContents, TableRow, TextRun, VerticalAlign, WidthType, TabStopType, LeaderType,
} from 'docx';
import { imageSize } from 'image-size';
import {
  BASES_OF_VALUE, VALUATION_APPROACHES, VALUATION_ASSUMPTIONS, ZONING_CATEGORIES, ZoningCategory,
} from './reference-data';
import { LOGO_PNG_BASE64, STAMP_JPG_BASE64 } from './report-assets';

// ── Input ──────────────────────────────────────────────────────────────
export type ReportInput = {
  reference: string;
  purpose: string;                 // enum value, e.g. "loan_application"
  beneficiary?: string | null;
  instructor?: string | null;
  engagementDate: Date;
  inspectionDate?: Date | null;
  valuationDate: Date;
  engineCode?: string | null;      // COST_APPROACH | SALES_COMPARISON | INCOME_APPROACH | AVS
  property: {
    upi?: string | null;
    plotNumber?: string | null;
    propertyCategory?: string | null;
    propertySubtype?: string | null;
    tenure?: string | null;
    leaseTermYears?: number | null;
    occupancyStatus?: string | null;
    mortgageStatus?: string | null;
    restrictionsStatus?: string | null;
    processStatus?: string | null;
    registeredProprietors?: { name: string; sharePercentage?: number }[] | null;
    location?: {
      province?: string; district?: string; sector?: string; cell?: string; village?: string;
      latitude?: number | string; longitude?: number | string; distanceToCbdKm?: number | string;
      neighborhoodQuality?: string; accessibility?: string;
    } | null;
    land?: {
      plotSizeSqm?: number | string; shape?: string; topography?: string; zoning?: string;
      currentUse?: string; permittedUses?: string[]; prohibitedUses?: string[];
    } | null;
    buildings?: {
      name: string; areaSqm: number | string; floors?: number; constructionYear?: number; condition?: string;
      walling?: string; roofing?: string; flooring?: string; ceiling?: string; doors?: string; windows?: string;
      accommodation?: { floor: string; items: string[] }[];
    }[];
    services?: { type: string; status?: string; provider?: string }[];
    amenities?: { name: string; distanceKm?: number | string }[];
    images?: { url: string; description?: string; category?: string }[];
    documents?: { type: string; url: string }[];
  };
  breakdown?: any | null;          // cost approach outputsSnapshot
  results: { basis: string; amount: number | string }[];
  approval?: { signedName?: string; licenseNumber?: string; at?: Date | string; comment?: string } | null;
  extras: {
    locationMapUrl?: string;
    cadastralPlanUrl?: string;
    planningZoneMapUrl?: string;
    appendixUrls?: string[];
    logoUrl?: string;                // optional replacement for the built-in KOSRES logo
    generalRemarks?: string;
  };
};

// ── Look & feel (taken from the firm's reference report) ───────────────
const GREEN = '00B050';
const BLUE = '0070C0';
const RED = 'C00000';
const COVER_GREEN = '70AD47';
const FONT = 'Arial';
const CONTENT_W = 9360; // US Letter, 1" margins, in twips

const PURPOSE_LABEL: Record<string, string> = {
  loan_application: 'Loan application', sale_purchase: 'Sale / purchase', insurance: 'Insurance',
  investment: 'Investment', taxation: 'Taxation', accounting: 'Accounting',
  financial_reporting: 'Financial reporting', forced_sale: 'Forced sale', market_value: 'Market value', other: 'Other',
};
const REPORT_TITLE: Record<string, string> = {
  loan_application: 'SECURED LENDING VALUATION REPORT', sale_purchase: 'SALE & PURCHASE VALUATION REPORT',
  insurance: 'INSURANCE VALUATION REPORT', investment: 'INVESTMENT VALUATION REPORT',
  taxation: 'TAXATION VALUATION REPORT', accounting: 'ACCOUNTING VALUATION REPORT',
  financial_reporting: 'FINANCIAL REPORTING VALUATION REPORT', forced_sale: 'FORCED SALE VALUATION REPORT',
  market_value: 'MARKET VALUATION REPORT', other: 'VALUATION REPORT',
};
const APPROACH_LABEL: Record<string, string> = {
  COST_APPROACH: 'Depreciated Replacement Cost', SALES_COMPARISON: 'Sales Comparison (Market Approach)',
  INCOME_APPROACH: 'Income Capitalisation', AVS: 'Automated Valuation',
};

// ── Small helpers ──────────────────────────────────────────────────────
const num = (v: any): number => (v == null || v === '' ? NaN : Number(v));
const money = (n: number | string) => `RWF ${Math.round(Number(n)).toLocaleString('en-US')}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function ordinal(d: number) { const s = ['th', 'st', 'nd', 'rd']; const v = d % 100; return s[(v - 20) % 10] || s[v] || s[0]; }

/** "28th September, 2026" with a real superscript suffix. */
function dateRuns(d: Date, opts: { bold?: boolean; size?: number; color?: string } = {}): TextRun[] {
  const base = { font: FONT, bold: opts.bold, size: opts.size, color: opts.color };
  return [
    new TextRun({ ...base, text: String(d.getDate()) }),
    new TextRun({ ...base, text: ordinal(d.getDate()), superScript: true }),
    new TextRun({ ...base, text: ` ${MONTHS[d.getMonth()]}, ${d.getFullYear()}` }),
  ];
}
const dateText = (d: Date) => `${d.getDate()}${ordinal(d.getDate())} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n / 100)]} Hundred`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '')); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}
/** 319200000 -> "Three Hundred Nineteen Million, Two Hundred Thousand" */
export function numberToWords(value: number): string {
  let n = Math.round(value);
  if (n === 0) return 'Zero';
  const groups: [number, string][] = [[1e9, 'Billion'], [1e6, 'Million'], [1e3, 'Thousand'], [1, '']];
  const out: string[] = [];
  for (const [size, label] of groups) {
    const q = Math.floor(n / size);
    if (q > 0) { out.push(`${below1000(q)}${label ? ` ${label}` : ''}`); n -= q * size; }
  }
  return out.join(', ');
}
const wordsLine = (n: number | string) => `${numberToWords(Number(n))} Rwandan Francs`;

function distanceText(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} meters` : `${km.toFixed(km < 10 ? 2 : 1).replace(/\.?0+$/, '')} km`;
}
const clean = (s?: string | null) => (s ?? '').trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function locationLine(loc?: ReportInput['property']['location'] | null): string {
  if (!loc) return '';
  const parts = [
    loc.village ? `${loc.village} Village` : '', loc.cell ? `${loc.cell} Cell` : '',
    loc.sector ? `${loc.sector} Sector` : '', loc.district ? `${loc.district} District` : '',
  ].filter(Boolean);
  const head = parts.join(', ');
  return loc.province ? `${head} in ${loc.province}` : head;
}

// ── Images ─────────────────────────────────────────────────────────────
type Img = { data: Buffer; type: 'jpg' | 'png' | 'gif'; w: number; h: number };
const imgCache = new Map<string, Img | null>();

async function loadImage(url?: string | null): Promise<Img | null> {
  if (!url) return null;
  if (imgCache.has(url)) return imgCache.get(url)!;
  let result: Img | null = null;
  try {
    // Ask Cloudinary for a sensibly sized JPEG so the .docx stays small.
    const fetchUrl = /res\.cloudinary\.com/.test(url) && url.includes('/image/upload/') && !url.includes('/upload/f_')
      ? url.replace('/image/upload/', '/image/upload/f_jpg,q_auto:good,w_1400/') : url;
    const res = await fetch(fetchUrl);
    if (res.ok) {
      const data = Buffer.from(await res.arrayBuffer());
      const dim = imageSize(data);
      const t = dim.type === 'jpg' || dim.type === 'jpeg' ? 'jpg' : dim.type === 'png' ? 'png' : dim.type === 'gif' ? 'gif' : null;
      if (t && dim.width && dim.height) result = { data, type: t, w: dim.width, h: dim.height };
    }
  } catch { /* skip unreadable images */ }
  imgCache.set(url, result);
  return result;
}

function imageRun(img: Img, maxW: number, maxH: number): ImageRun {
  const scale = Math.min(maxW / img.w, maxH / img.h, 1);
  return new ImageRun({ type: img.type, data: img.data, transformation: { width: Math.round(img.w * scale), height: Math.round(img.h * scale) } });
}
const b64 = (s: string) => Buffer.from(s, 'base64');

// ── Paragraph builders ─────────────────────────────────────────────────
const body = (text: string | TextRun[], o: { align?: any; after?: number; bold?: boolean; italics?: boolean; size?: number; color?: string; before?: number } = {}) =>
  new Paragraph({
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 276 },
    children: typeof text === 'string'
      ? [new TextRun({ text, font: FONT, bold: o.bold, italics: o.italics, size: o.size ?? 22, color: o.color })]
      : text,
  });

const bullet = (text: string) =>
  new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text, font: FONT, size: 22 })] });

/** Headings in document order, collected while building so a static TOC can be produced. */
let HEADINGS: { text: string; level: 1 | 2 }[] = [];
const sectionHeading = (text: string, pageBreak = false) => (HEADINGS.push({ text, level: 1 }), new Paragraph({
    heading: HeadingLevel.HEADING_1, pageBreakBefore: pageBreak, keepNext: true,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 24, color: GREEN })],
  }));

const labelPara = (text: string) => (HEADINGS.push({ text, level: 2 }), new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 20, color: BLUE })],
  }));

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const LINE = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const BOX = { top: LINE, bottom: LINE, left: LINE, right: LINE };

/** Borderless two-column "Label: text" layout used by most narrative sections. */
function kvTable(rows: { label: string; content: (Paragraph | Table)[] }[]): Table {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [2300, CONTENT_W - 2300],
    borders: { ...NO_BORDERS, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
    rows: rows.map((r) => new TableRow({
      children: [
        new TableCell({ width: { size: 2300, type: WidthType.DXA }, borders: NO_BORDERS, margins: { top: 40, bottom: 40, left: 0, right: 120 }, children: [labelPara(r.label)] }),
        new TableCell({ width: { size: CONTENT_W - 2300, type: WidthType.DXA }, borders: NO_BORDERS, margins: { top: 40, bottom: 40, left: 120, right: 0 }, children: r.content as any }),
      ],
    })),
  });
}

function sp(n = 120) { return new Paragraph({ spacing: { after: n }, children: [] }); }

// ── Zoning lookup ──────────────────────────────────────────────────────
function findZoning(text?: string | null): ZoningCategory | null {
  const t = clean(text);
  if (!t) return null;
  let best: ZoningCategory | null = null;
  for (const z of ZONING_CATEGORIES) {
    if (!z.code) continue;
    const esc = z.code.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`(^|[^A-Za-z0-9-])${esc}([^A-Za-z0-9-]|$)`).test(t)) {
      if (!best || z.code.length > (best.code?.length ?? 0)) best = z;
    }
  }
  if (!best) {
    const lower = t.toLowerCase();
    best = ZONING_CATEGORIES.find((z) => lower.includes(z.category.toLowerCase().replace(/\s*\([^)]*\)\s*$/, ''))) ?? null;
  }
  return best;
}

// ── Main ───────────────────────────────────────────────────────────────
export type ReportBuild = { buffer: Buffer; headings: { text: string; level: 1 | 2 }[] };

export async function buildReportDocx(input: ReportInput): Promise<Buffer> {
  return (await buildReport(input)).buffer;
}

/**
 * @param tocPages heading text -> page number. When supplied, the table of
 * contents is written as plain text with page numbers (works in any viewer);
 * otherwise a Word TOC field is used, which Word fills in on open.
 */
export async function buildReport(input: ReportInput, tocPages?: Map<string, number>): Promise<ReportBuild> {
  imgCache.clear();
  HEADINGS = [];
  const p = input.property;
  const loc = p.location ?? null;
  const land = p.land ?? null;
  const buildings = p.buildings ?? [];
  const results = input.results ?? [];
  const market = results.find((r) => r.basis === 'market');
  const fsv = results.find((r) => r.basis === 'forced_sale');
  const ins = results.find((r) => r.basis === 'insurance');
  const subtype = clean(p.propertySubtype) || cap(clean(p.propertyCategory) || 'property');
  const tenure = clean(p.tenure);
  const instructor = clean(input.instructor) || clean(input.beneficiary) || 'the Client';
  const locText = locationLine(loc);
  const upi = clean(p.upi);
  const plotNo = clean(p.plotNumber);
  const grossArea = buildings.reduce((s, b) => s + (num(b.areaSqm) || 0), 0);
  const purposeLabel = PURPOSE_LABEL[input.purpose] ?? input.purpose;
  const engine = input.engineCode ?? 'COST_APPROACH';
  const isCost = engine === 'COST_APPROACH';
  const approval = input.approval ?? null;
  const signedName = clean(approval?.signedName);
  const licence = clean(approval?.licenseNumber);

  const photos = p.images ?? [];
  const [coverImgs, locMap, cadPlan, zoneMap] = await Promise.all([
    Promise.all(photos.slice(0, 3).map((i) => loadImage(i.url))),
    loadImage(input.extras.locationMapUrl),
    loadImage(input.extras.cadastralPlanUrl),
    loadImage(input.extras.planningZoneMapUrl),
  ]);

  const zoning = findZoning(land?.zoning);

  // ═══ Cover ═══
  const coverCell = (children: Paragraph[]) => new TableCell({
    width: { size: CONTENT_W, type: WidthType.DXA }, borders: NO_BORDERS, verticalAlign: VerticalAlign.TOP,
    shading: { type: ShadingType.CLEAR, fill: COVER_GREEN, color: 'auto' }, margins: { top: 0, bottom: 0, left: 200, right: 200 },
    children,
  });
  const wp = (t: string | TextRun[], size: number, o: { bold?: boolean; after?: number; before?: number; align?: any; color?: string } = {}) =>
    new Paragraph({
      alignment: o.align ?? AlignmentType.CENTER, spacing: { before: o.before ?? 0, after: o.after ?? 0 },
      children: typeof t === 'string' ? [new TextRun({ text: t, font: FONT, size, bold: o.bold, color: o.color ?? 'FFFFFF' })] : t,
    });
  const coverTable = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: { ...NO_BORDERS, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
    rows: [new TableRow({
      height: { value: 13300, rule: 'exact' as any },
      children: [coverCell([
        wp('', 22, { before: 2400 }),
        wp('VALUATION REPORT', 52, { bold: true, after: 1700 }),
        wp(`Prepared for ${instructor}`, 20, { bold: true, after: 300 }),
        wp([
          new TextRun({ text: 'Valuation date: ', font: FONT, size: 20, bold: true, color: 'FFFFFF' }),
          ...dateRuns(input.valuationDate, { bold: true, size: 20, color: 'FFFFFF' }),
        ], 20, { after: 1900 }),
        wp('Important notice to all readers of this valuation report', 20, { bold: true, after: 60 }),
        wp('Unless you are the client stated within this report, or have been identified by us as a part to', 14, { bold: true }),
        wp('Whom we owe a duty of care and who is entitled to rely on this report, KOSRES LTD does not owe or assume any duty of care to you in', 14, { bold: true }),
        wp('respect of the contents of this report and you are not qualified to rely upon it.', 14, { bold: true, after: 2600 }),
        wp('Locally Real Estate Expert,', 20, { align: AlignmentType.RIGHT, color: '000000' }),
        wp('Globally connected.', 20, { align: AlignmentType.RIGHT, color: '000000' }),
      ])],
    })],
  });

  // ═══ Title page ═══
  const titleChildren: (Paragraph | Table)[] = [];
  titleChildren.push(new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: REPORT_TITLE[input.purpose] ?? 'VALUATION REPORT', font: FONT, bold: true, size: 26 })] }));
  titleChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'UPON', font: FONT, bold: true, size: 26 })] }));
  titleChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 240 },
    children: [new TextRun({
      font: FONT, bold: true, size: 22,
      text: `A ${subtype} property${plotNo ? ` with plot No.${plotNo}` : ''}${upi ? `, UPI No. ${upi}` : ''}${locText ? ` situated at ${locText}` : ''}.`,
    })],
  }));
  if (coverImgs[0]) titleChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [imageRun(coverImgs[0], 560, 330)] }));
  const second = coverImgs.slice(1).filter(Boolean) as Img[];
  if (second.length) titleChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: second.flatMap((im, i) => [i ? new TextRun({ text: '  ', font: FONT }) : new TextRun({ text: '' }), imageRun(im, 275, 200)]) }));
  titleChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: `PREPARED FOR ${instructor.toUpperCase()}`, font: FONT, bold: true, size: 22 })] }));
  titleChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Valuation date: ', font: FONT, bold: true, size: 22 }), ...dateRuns(input.valuationDate, { bold: true, size: 22 })] }));

  // ═══ Cover letter ═══
  const letter: (Paragraph | Table)[] = [
    new Paragraph({ pageBreakBefore: true, spacing: { after: 240 }, children: [new TextRun({ text: 'To: ', font: FONT, size: 22 }), new TextRun({ text: instructor.toUpperCase(), font: FONT, size: 22 })] }),
    new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: `Subject: Valuation Report for A ${subtype} property`, font: FONT, size: 22, bold: true, color: GREEN, underline: {} })] }),
    body('Dear Madam,', { align: AlignmentType.LEFT, after: 160 }),
    body([
      new TextRun({ text: 'With your reference to your request and approval dated on ', font: FONT, size: 22 }),
      ...dateRuns(input.engagementDate, { size: 22 }),
      new TextRun({ text: ` to conduct valuation service of a ${subtype} property located at ${locText || 'the property described herein'}. Please find hereafter our detailed valuation report including other information related to the mentioned property.`, font: FONT, size: 22 }),
    ]),
    body('Issued without prejudice and liabilities', { align: AlignmentType.LEFT, before: 120, after: 120 }),
    body('KIGALI ONE STOP REAL ESTATE SERVICE /KOSRES LTD', { align: AlignmentType.LEFT, after: 60 }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Signed & stamped for and on behalf of KOSRES LTD', font: FONT, size: 22, bold: true, color: GREEN })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new ImageRun({ type: 'jpg', data: b64(STAMP_JPG_BASE64), transformation: { width: 130, height: 104 } })] }),
  ];
  if (signedName) letter.push(body(`${signedName}${licence ? ` – License No. ${licence}` : ''}`, { align: AlignmentType.LEFT, after: 60 }));
  for (const line of ['Property valuation and management', 'Property investment & Consultancy', 'Property Brokerage /Agency', 'Tel: 0792871729'])
    letter.push(body(line, { align: AlignmentType.LEFT, after: 20 }));
  letter.push(new Paragraph({ children: [new TextRun({ text: 'Email: ', font: FONT, size: 22 }), new ExternalHyperlink({ link: 'mailto:kosresltd@gmail.com', children: [new TextRun({ text: 'kosresltd@gmail.com', font: FONT, size: 22, color: BLUE, underline: {} })] })] }));

  // ═══ Table of contents ═══
  const makeToc = (): (Paragraph | Table | TableOfContents)[] => {
    const head = new Paragraph({ pageBreakBefore: true, spacing: { after: 160 }, children: [new TextRun({ text: 'TABLE OF CONTENTS', font: FONT, bold: true, size: 24, color: GREEN, underline: {} })] });
    if (!tocPages) return [head, new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2' })];
    const lines = HEADINGS.map((h) => new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W, leader: LeaderType.DOT }],
      indent: { left: h.level === 2 ? 360 : 0 }, spacing: { after: 20 },
      children: [
        new TextRun({ text: h.text, font: FONT, size: h.level === 1 ? 20 : 18, bold: h.level === 1 }),
        new TextRun({ text: `\t${tocPages.get(h.text) ?? ''}`, font: FONT, size: h.level === 1 ? 20 : 18 }),
      ],
    }));
    return [head, ...lines];
  };

  // ═══ Executive summary ═══
  const exCell = (children: Paragraph[], w: number, o: { shade?: string; span?: number; rowSpan?: number } = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA }, borders: BOX, margins: { top: 40, bottom: 40, left: 100, right: 100 },
      columnSpan: o.span, rowSpan: o.rowSpan,
      shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined, children,
    });
  const LW = 2200, VW = CONTENT_W - LW;
  const ep = (t: string, o: { bold?: boolean; italics?: boolean } = {}) =>
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, children: [new TextRun({ text: t, font: FONT, size: 20, bold: o.bold, italics: o.italics })] });
  const exRow = (label: string, values: string[]) =>
    new TableRow({ children: [exCell([ep(label, { bold: true, italics: true })], LW), exCell(values.map((v) => ep(v)), VW)] });

  const tenureSentence = /lease/i.test(tenure)
    ? `${tenure}. We assumed that the client owns the unencumbered leasehold interest in the subject property. We have further assumed a good and marketable title and that are no issues that will compromise any transaction undertaken regarding the title.`
    : `${tenure}. We have assumed a good and marketable title and that there are no issues that will compromise any transaction undertaken regarding the title.`;

  const proprietors = (p.registeredProprietors ?? []).filter((x) => clean(x.name));
  const exRows: TableRow[] = [];
  if (clean(input.instructor)) exRows.push(exRow('Instructor', [clean(input.instructor)]));
  if (clean(input.beneficiary)) exRows.push(exRow('Beneficiaries', [clean(input.beneficiary)]));
  if (proprietors.length) exRows.push(exRow('Registered Proprietors', [proprietors.map((x) => x.name).join(', ')]));

  // Location sentence: CBD + named landmarks, all from stored distances.
  const landmarks = (p.amenities ?? []).filter((a) => a.name && !isNaN(num(a.distanceKm))).slice(0, 3);
  const cbdKm = num(loc?.distanceToCbdKm);
  const locParts: string[] = [];
  if (!isNaN(cbdKm)) locParts.push(`approximately ${distanceText(cbdKm)} from Kigali CBD`);
  landmarks.forEach((a) => locParts.push(`approximately ${distanceText(num(a.distanceKm))} from ${a.name}`));
  const locSummary = `The property is located in ${loc?.province || 'Rwanda'}${locParts.length ? ` ${locParts.join(' and ')}` : ''}.`;
  exRows.push(exRow('Location', [locSummary]));
  if (tenure) exRows.push(exRow('Tenure', [tenureSentence]));
  exRows.push(exRow('Asset & Interest Valued', [`${subtype}${tenure ? ` with ${tenure.toLowerCase()} interest` : ''}`]));
  exRows.push(exRow('Property Type', [subtype]));
  if (!isNaN(num(land?.plotSizeSqm))) exRows.push(exRow('Plot Size', [`Approximately ${num(land?.plotSizeSqm)} Square meters`]));
  if (grossArea > 0) exRows.push(exRow('Gross Built Up Areas', [`Approximately ${grossArea.toFixed(2).replace(/\.00$/, '')} Square Meters`]));
  if (clean(land?.zoning)) exRows.push(exRow('Zoning', [clean(land?.zoning)]));
  if (plotNo || upi) exRows.push(exRow('Title Details', [plotNo ? `Plot No.${plotNo}` : '', upi ? `UPI: ${upi}` : ''].filter(Boolean)));
  if (buildings.length) {
    const imp: string[] = [`The property is developed with ${buildings.length === 1 ? 'a building' : `${buildings.length} buildings`}: ${buildings.map((b) => `${b.name} (${num(b.areaSqm)} Sqm)`).join(', ')}.`];
    exRows.push(exRow('Improvements', imp));
  }
  exRows.push(exRow('Valuation Date', [dateText(input.valuationDate)]));
  exRows.push(exRow('Valuation Approach', [APPROACH_LABEL[engine] ?? engine]));
  if (clean(p.occupancyStatus)) exRows.push(exRow('Occupancy Status', [clean(p.occupancyStatus)]));
  exRows.push(exRow('Valuation Purpose', [`${purposeLabel} purpose`]));
  exRows.push(exRow('Prepared For', [instructor]));
  exRows.push(exRow('Capacity', ['Independent Real Estate Expert']));
  exRows.push(new TableRow({ children: [exCell([ep('Compliant with', { bold: true, italics: true })], LW), exCell(['Terms of Engagement', 'International Valuation Standards (IVS)', 'RICS Valuation Standards (Redbook)', "Rwanda's Valuation Practice"].map((v) => ep(v)), VW)] }));
  exRows.push(new TableRow({ children: [exCell([ep('VALUATION SUMMARY', { bold: true })], CONTENT_W, { span: 2 })] }));

  const valueBlock = (title: string, sentence: string, amount?: { amount: number | string }) => amount ? [
    ep(title, { bold: true, italics: true }), ep(sentence),
    ep(`${money(amount.amount)} (${wordsLine(amount.amount)})`, { bold: true }),
  ] : null;
  const blocks = [
    valueBlock('Market value', `We are of the opinion that the market value of the ${/lease/i.test(tenure) ? 'leasehold interest in the property' : 'property'} at the valuation date is:`, market),
    valueBlock('Forced Sale Value', 'We are of the opinion that the Forced Sale value of the subject property at the valuation date is:', fsv),
    valueBlock('Insurance Value', 'We are of the opinion that the insurance value of the subject property at the valuation date is:', ins),
  ].filter(Boolean) as Paragraph[][];
  blocks.forEach((paras, i) => exRows.push(new TableRow({ children: [
    ...(i === 0 ? [exCell([ep('Estimated Values', { bold: true, italics: true })], LW, { rowSpan: blocks.length })] : []),
    exCell(paras, VW),
  ] })));
  const remarks = clean(input.extras.generalRemarks);
  if (remarks) exRows.push(new TableRow({ children: [exCell([ep('GENERAL REMARKS', { bold: true, italics: true })], LW), exCell(remarks.split(/\n+/).map((t) => ep(t)), VW)] }));

  const exec: (Paragraph | Table)[] = [
    (HEADINGS.push({ text: 'EXECUTIVE SUMMARY', level: 1 }), new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 120 }, children: [new TextRun({ text: 'EXECUTIVE SUMMARY', font: FONT, bold: true, size: 24, color: GREEN })] })),
    body('This executive summary is a brief overview of our valuation report and must not be relied upon isolation. It is intended to be read in conjunction with the whole report and is subject to any assumptions and comments stated within the body of this report.', { size: 20, italics: true }),
    new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [LW, VW], rows: exRows }),
  ];

  // ═══ Terms of engagement ═══
  const docsSupplied = Array.from(new Set((p.documents ?? []).map((d) => (d.type === 'land_title' ? 'Title deed' : cap(d.type.replace(/_/g, ' '))))));
  const terms: (Paragraph | Table)[] = [
    sectionHeading('TERMS OF ENGAGEMENT', true),
    kvTable([
      { label: 'Engagement:', content: [body([new TextRun({ text: 'We refer to our communication dated ', font: FONT, size: 22 }), ...dateRuns(input.engagementDate, { size: 22 }), new TextRun({ text: ` to provide a valuation report on a ${subtype} property${clean(input.beneficiary) ? ` to be used by ${clean(input.beneficiary)}` : ''}.`, font: FONT, size: 22 })])] },
      { label: 'Client instructions:', content: [body(`We have been instructed to prepare the valuation by ${instructor}.`)] },
      { label: 'Valuation Standards:', content: [body('This valuation has been undertaken in accordance with RICS Valuation-professional standards 2014, which incorporate the IVSC international valuation standards 2022. As required by the Red Book, some key matters relating to this valuation are set out below.')] },
      { label: 'Independence of valuer:', content: [
        body(`The valuer, on behalf of KOSRES LTD, with the responsibility for this report is ${signedName || 'the signing valuer'}.`),
        body(`We confirm that ${signedName || 'the valuer'} meets the requirement of the Red Book, having sufficient current knowledge of the particular market and the skills and understanding to undertake valuation professionally, objectively and competently.`),
        body('For the purpose of the Red Book, we are acting as External Valuers, as defined therein.'),
      ] },
      { label: 'Conflict of Interest:', content: [body('We confirm that we do not have any material connection or involvement giving rise to a conflict of interest and are providing an objective and unbiased valuation.')] },
      { label: 'Purpose of valuation:', content: [body(`The client requested to know the market value of the subject property for ${purposeLabel.toLowerCase()} purposes${clean(input.beneficiary) ? ` at ${clean(input.beneficiary)}` : ''}.`)] },
      { label: 'Limitations on liability:', content: [
        body('KOSRES LTD’S liability for any direct loss or damage (whether caused by negligence or breach of contract or otherwise) arising out in connection with this valuation is limited in accordance with terms of engagement. KOSRES LTD accepts no liability for any indirect or consequential loss or for loss of profits.'),
        body('No claim arising out of or in connection with this valuation may be brought against any member, employee, partner or consultant of KOSRES LTD. Those individuals will not have a personal duty of care to any party and any claim for losses must be brought against KOSRES LTD.'),
      ] },
      { label: 'Our own Investigations:', content: [
        body('In carrying out this valuation we have undertaken title search in Land information Inquiry Portal of National Land Authority, Zoning details and parcel boundary checks in Kigali City Master Plan website which referred in the relevant sections of this report. We have relied upon this information as being accurate and complete'),
        body('We have also carried out this valuation based on information and documents supplied by client which assumed to be correct and comprehensive.'),
        ...(docsSupplied.length ? [body('We have been provided with copies of the following documents:'), ...docsSupplied.map(bullet)] : []),
        body('Our Estimated opinion of market value has therefore been carried out based on the information provided and our own survey and analysis and it is assumed that this information is correct at the date of valuation and that documents supplied are legally valid.'),
      ] },
    ]),
  ];

  // ═══ Property features ═══
  const feat: { label: string; content: (Paragraph | Table)[] }[] = [];
  const locParas: Paragraph[] = [];
  if (locText) locParas.push(body(`The property is situated within ${locText}.`));
  {
    const bits: string[] = [];
    if (!isNaN(cbdKm)) bits.push(`The property is located about ${distanceText(cbdKm)} from Kigali CBD (straight-line distance)`);
    if (landmarks.length) bits.push(`${bits.length ? 'and ' : 'The property is located '}${landmarks.map((a) => `about ${distanceText(num(a.distanceKm))} from ${a.name}`).join(' and ')}`);
    const lat = num(loc?.latitude), lng = num(loc?.longitude);
    if (!isNaN(lat) && !isNaN(lng)) bits.push(`${bits.length ? ', ' : ''}one geographical coordinate within the subject property is ${lat}, ${lng}`);
    if (bits.length) locParas.push(body(`${bits.join(' ').replace(/ ,/g, ',')}.`));
  }
  if (locParas.length) feat.push({ label: 'Location:', content: locParas });
  if (locMap) feat.push({ label: 'Location map:', content: [new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(locMap, 400, 300)] })] });
  if (plotNo || upi) feat.push({ label: 'Title Details:', content: [body(`The property is described as ${plotNo ? `plot No.${plotNo}` : 'a parcel'}${upi ? ` with UPI ${upi}` : ''}.`)] });
  if (proprietors.length) feat.push({ label: 'Registered Proprietors:', content: [body(proprietors.length === 1
    ? `${proprietors[0].name} is solely a proprietor of the property with full shares of ${proprietors[0].sharePercentage ?? 100}%.`
    : `${proprietors.map((x) => `${x.name}${x.sharePercentage != null ? ` (${x.sharePercentage}%)` : ''}`).join(', ')} are the registered proprietors of the property.`)] });
  if (clean(p.mortgageStatus)) feat.push({ label: 'Mortgage Status:', content: [body(`${/^not|no/i.test(clean(p.mortgageStatus)) ? 'The parcel is not under mortgage' : `The parcel mortgage status: ${clean(p.mortgageStatus)}`};`)] });
  if (clean(p.restrictionsStatus)) feat.push({ label: 'Restrictions status:', content: [body(`${/^not|no/i.test(clean(p.restrictionsStatus)) ? 'The parcel is not under restrictions' : `The parcel restrictions: ${clean(p.restrictionsStatus)}`};`)] });
  if (clean(p.processStatus)) feat.push({ label: 'Process status:', content: [body(`${/^not|no/i.test(clean(p.processStatus)) ? 'The parcel is not under process' : `The parcel process status: ${clean(p.processStatus)}`};`)] });
  if (tenure) feat.push({ label: 'Land Tenure:', content: [body(`The plot is held under ${tenure.toLowerCase()} interest${p.leaseTermYears ? ` for a land lease term of ${p.leaseTermYears} years` : ''}.`)] });
  if (clean(land?.topography) || clean(land?.shape)) feat.push({ label: 'Topography:', content: [body(`The subject property comprises a ${[clean(land?.shape), clean(land?.topography)].filter(Boolean).join(' ').toLowerCase()} plot.`)] });
  const services = (p.services ?? []).filter((s) => clean(s.type));
  if (services.length) feat.push({ label: 'Utilities:', content: services.map((s) => body(`${cap(s.type.replace(/_/g, ' '))}${clean(s.provider) ? ` from ${clean(s.provider)}` : ''}${clean(s.status) ? `: ${clean(s.status)}` : ''}.`, { after: 60 })) });
  const amenities = (p.amenities ?? []).filter((a) => clean(a.name));
  if (amenities.length) feat.push({ label: 'Amenities:', content: [body(`The amenities available within the neighborhood include ${amenities.map((a) => `${a.name}${!isNaN(num(a.distanceKm)) ? ` (${distanceText(num(a.distanceKm))})` : ''}`).join(', ')}.`)] });
  if (clean(loc?.neighborhoodQuality)) feat.push({ label: 'Quality of neighborhood:', content: [body(`The neighborhood quality is ${clean(loc?.neighborhoodQuality).toLowerCase()}.`)] });
  if (clean(loc?.accessibility)) feat.push({ label: 'Accessibility:', content: [body(`The property is accessible via ${clean(loc?.accessibility).toLowerCase()} road.`)] });
  const conds = buildings.map((b) => clean(b.condition)).filter(Boolean);
  if (conds.length) feat.push({ label: 'State of repair:', content: [body(`The property is in ${Array.from(new Set(conds.map((c) => c.toLowerCase()))).join(' to ')} condition.`)] });

  const features: (Paragraph | Table)[] = [sectionHeading('PROPERTY FEATURES'), ...(feat.length ? [kvTable(feat)] : [])];

  // Land area, occupancy, zoning
  const landRows: { label: string; content: (Paragraph | Table)[] }[] = [];
  if (!isNaN(num(land?.plotSizeSqm))) {
    landRows.push({ label: 'Land Area', content: [
      body(`The land has a total land area of approximately ${num(land?.plotSizeSqm)}Sqm.`),
      ...(cadPlan ? [body('The subject property is identified on the cadastral plan below showing the boundaries bolded in black.'), new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(cadPlan, 420, 320)] })] : []),
    ] });
  }
  if (clean(p.occupancyStatus)) landRows.push({ label: 'Occupancy status:', content: [body(`The property was ${clean(p.occupancyStatus).toLowerCase()} as at the time of our inspection.`)] });
  if (clean(land?.zoning)) {
    landRows.push({ label: 'Current Zoning:', content: [
      body(`The property is located within ${clean(land?.zoning)}${clean(land?.currentUse) ? `, and its current use is ${clean(land?.currentUse).toLowerCase()}` : ''}.`),
    ] });
  }
  if (zoneMap) landRows.push({ label: 'Planning Zone Map:', content: [new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(zoneMap, 420, 320)] })] });
  if (zoning?.description) landRows.push({ label: 'Zone Purpose:', content: [body(zoning.description)] });
  const permitted = zoning?.permitted?.length ? zoning.permitted : (land?.permittedUses ?? []);
  const prohibited = zoning?.prohibited?.length ? zoning.prohibited : (land?.prohibitedUses ?? []);
  if (permitted.length) landRows.push({ label: 'Permitted Uses:', content: permitted.map(bullet) });
  if (prohibited.length) landRows.push({ label: 'Prohibited Uses:', content: prohibited.map(bullet) });
  landRows.push({ label: 'Environmental issues:', content: [
    body('Our inspection of the property did not reveal any obvious issues which would indicate the existence of site contamination.'),
    body('Our investigation does not reveal whether the Rwanda Environment Management Authority included the property in contaminated sites.'),
    body('KOSRES LTD is not an environmental expert and should specific information for testing be required in this regard we would recommend that the proprietor consult a specialist in this field.'),
  ] });
  features.push(kvTable(landRows));

  // ═══ Description, construction, accommodation ═══
  const desc: (Paragraph | Table)[] = [];
  if (buildings.length) {
    desc.push(kvTable([{ label: 'Property Description:', content: [body(`The subject property is improved with ${buildings.map((b) => `${b.name.toLowerCase()}${!isNaN(num(b.areaSqm)) ? ` of ${num(b.areaSqm)} Sqm` : ''}`).join(', ')}.`)] }]));
    const consRows: { label: string; content: (Paragraph | Table)[] }[] = [];
    consRows.push({ label: 'Construction Details:', content: [] });
    for (const b of buildings) {
      const lines: string[] = [];
      if (clean(b.walling)) lines.push(`Walling: ${clean(b.walling)}.`);
      if (clean(b.roofing)) lines.push(`Roof: ${clean(b.roofing)}.`);
      if (clean(b.doors) || clean(b.windows)) lines.push(`Doors and windows: ${[clean(b.doors) && `${clean(b.doors)} doors`, clean(b.windows) && `${clean(b.windows)} windows`].filter(Boolean).join(' and ')}.`);
      if (clean(b.flooring)) lines.push(`Floor: ${clean(b.flooring)}.`);
      if (clean(b.ceiling)) lines.push(`Ceiling: ${clean(b.ceiling)}.`);
      consRows.push({ label: b.name, content: lines.length ? lines.map((l) => body(l)) : [body('Construction details were not recorded.', { italics: true })] });
    }
    desc.push(kvTable(consRows));
    const acc = buildings.filter((b) => (b.accommodation ?? []).some((f) => f.items?.length));
    if (acc.length) {
      const accRows: { label: string; content: (Paragraph | Table)[] }[] = [{ label: 'Accommodation', content: [] }];
      for (const b of acc) {
        const paras: Paragraph[] = [];
        for (const f of b.accommodation ?? []) {
          if (!f.items?.length) continue;
          paras.push(new Paragraph({ spacing: { before: 60, after: 40 }, children: [new TextRun({ text: `${f.floor}:`, font: FONT, size: 22, bold: true, underline: {} })] }));
          f.items.forEach((it) => paras.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: it.toUpperCase(), font: FONT, size: 22 })] })));
        }
        accRows.push({ label: b.name, content: paras });
      }
      desc.push(kvTable(accRows));
    }
  }

  // ═══ Valuation ═══
  const basisMarket = BASES_OF_VALUE.find((b) => /market value/i.test(b.name));
  const basisLiq = BASES_OF_VALUE.find((b) => /liquidation/i.test(b.name));
  const approachRef = VALUATION_APPROACHES.find((a) => (isCost ? /cost/i : engine === 'INCOME_APPROACH' ? /income/i : /market/i).test(a.name));
  const valRows: { label: string; content: (Paragraph | Table)[] }[] = [];
  if (basisMarket) valRows.push({ label: 'Valuation bases:', content: [
    body('Market Value is defined within RICS Valuation – Professional Standards as:'),
    body(`“${basisMarket.description}”`),
    ...(fsv && basisLiq ? [body('Forced Sale Value is assessed on the basis of Liquidation Value, defined as:'), body(`“${basisLiq.description}”`)] : []),
  ] });
  if (input.inspectionDate) valRows.push({ label: 'Inspection date:', content: [body([new TextRun({ text: 'The property was inspected on ', font: FONT, size: 22 }), ...dateRuns(input.inspectionDate, { size: 22 })])] });
  valRows.push({ label: 'Valuation date:', content: [body([new TextRun({ text: 'The valuation date is ', font: FONT, size: 22 }), ...dateRuns(input.valuationDate, { size: 22 })])] });
  const approachParas: Paragraph[] = [];
  if (approachRef) approachParas.push(body(`${approachRef.name.replace(/\b(\w)(\w*)/g, (_m, a, b) => a + b.toLowerCase())} is defined within RICS International Valuation Standards – IVS, 2022 as:`), body(`“${approachRef.description}”`));
  if (isCost) {
    approachParas.push(
      body('In cost approach we evaluate the property being valued as two different assets; land and development.'),
      body('The land value is determined based on comparison method after considering factors affecting land value such as; location, plot shape, zoning, land size, quality of neighborhood, public amenities, infrastructures and current market price. Therefore, the reasonable price per square meter adopted is applied to the size of land to obtain land value.'),
      body('The development value is determined based on depreciated replacement cost.'),
      body('The total cost to create an exact copy of development that is being valued is estimated and then we take into consideration the actual age, economic age, condition of development in order to calculate a proper depreciation rate which is applied to development cost to obtain depreciated replacement value. A developer’s profit based on actual completion of developments shall be added on the depreciated replacement cost to obtain development value. The development value is added on land value to obtain the open market value.'),
    );
  }
  if (approachParas.length) valRows.push({ label: 'Valuation Approach:', content: approachParas });
  valRows.push({ label: 'Assumptions:', content: VALUATION_ASSUMPTIONS.map((a) => body(`“${a.description.replace(/\.?$/, '.')}”`)) });
  if (isCost) valRows.push({ label: 'Valuation Disclaimer:', content: [
    body('Cost Approach is applied and afforded significant weight to purpose-built property which are rarely traded, does not generate income and when no available market data for the use of Market approach or Income approach.'),
    body('Such property includes but not limited to School, libraries, hospitals, museums, churches, mosques, community or town halls, police stations, towers.'),
    body('During our valuation analysis, we adopted cost approach because the available market data are not appropriate to arrive at a credible valuation. However, after obtaining a replacement value using cost approach, we have made sound judgement considering price and rent currently paid for similar properties, the rent within same neighborhood. Design, state of repair, level of finishing, Accessibility, Quality of neighborhood, Distance from central business district or shopping center, amenities such as schools, hospitals or health facilities and churches which directly have an impact on residential property values to establish our market value believed to be true and accurate.'),
    body('KOSRES LTD accept no liability for any loss that may occur as a result of relying on opinion of value estimated in this report.'),
  ] });
  const valuation: (Paragraph | Table)[] = [sectionHeading('VALUATION', true), kvTable(valRows)];

  // ═══ Property images ═══
  const imgSection: (Paragraph | Table)[] = [];
  if (photos.length) {
    const loaded = await Promise.all(photos.map((ph) => loadImage(ph.url)));
    const items = photos.map((ph, i) => ({ img: loaded[i], caption: ph.description && !/submitted with client request/i.test(ph.description) ? ph.description : `Property photo ${i + 1}` })).filter((x) => x.img) as { img: Img; caption: string }[];
    imgSection.push(sectionHeading('PROPERTY IMAGES', true));
    const cellW = CONTENT_W / 2;
    const rows: TableRow[] = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(new TableRow({ cantSplit: true, children: [items[i], items[i + 1]].map((it) => new TableCell({
        width: { size: cellW, type: WidthType.DXA }, borders: NO_BORDERS, margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: it ? [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [imageRun(it.img, 290, 215)] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: it.caption, font: FONT, size: 18, italics: true, bold: true })] }),
        ] : [new Paragraph({ children: [] })],
      })) }));
    }
    if (rows.length) imgSection.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [cellW, cellW], borders: { ...NO_BORDERS, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER }, rows }));
  }

  // ═══ Certificate ═══
  const cert: (Paragraph | Table)[] = [
    sectionHeading('VALUATION CERTIFICATE', true),
    body('We hereby certify that we personally inspected the subject property on the date outlined and have carried out the assessments above as at that same date, with the benefit of being provided additional information and document from the client.'),
    body([new TextRun({ text: 'We have made all inquiries that we consider to be necessary and appropriate and to the best of our knowledge, the opinion of values as at ', font: FONT, size: 22 }), ...dateRuns(input.valuationDate, { size: 22 }), new TextRun({ text: ' are;', font: FONT, size: 22 })]),
  ];
  const certValue = (label: string, r?: { amount: number | string }, split?: boolean) => {
    if (!r) return;
    cert.push(new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ text: `${label}: `, font: FONT, size: 22, bold: true }), new TextRun({ text: `RWF. ${Math.round(Number(r.amount)).toLocaleString('en-US')}.`, font: FONT, size: 22, bold: true, color: BLUE })] }));
    if (split && isCost && input.breakdown?.land) {
      cert.push(body('Broken down as follows:', { after: 40 }));
      cert.push(body(`i. Land Elements @ Rwf. ${Math.round(Number(input.breakdown.land.value)).toLocaleString('en-US')}`, { after: 20, align: AlignmentType.LEFT }));
      cert.push(body(`ii. Development value @ Rwf. ${Math.round(Number(input.breakdown.developmentValue)).toLocaleString('en-US')}.`, { after: 60, align: AlignmentType.LEFT }));
    }
    cert.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `(WORDS: RWANDAN FRANCS ${numberToWords(Number(r.amount)).toUpperCase()} ONLY).`, font: FONT, size: 22, bold: true, color: GREEN })] }));
  };
  certValue('OPEN MARKET VALUE', market, true);
  certValue('FORCED SALE VALUE', fsv);
  certValue('INSURANCE VALUE', ins);
  cert.push(body('FOR: KOSRES LTD', { align: AlignmentType.LEFT, before: 240, after: 120, bold: true, color: RED }));
  cert.push(new Paragraph({ spacing: { after: 60 }, children: [new ImageRun({ type: 'jpg', data: b64(STAMP_JPG_BASE64), transformation: { width: 110, height: 88 } })] }));
  if (signedName) cert.push(body(`${signedName.toUpperCase()}${licence ? `; LICENSE No. ${licence}` : ''}`, { align: AlignmentType.LEFT, bold: true, after: 40 }));
  cert.push(body('MIRPV & Certified VALUER', { align: AlignmentType.LEFT, bold: true, after: 40 }));
  cert.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'DATED: ', font: FONT, size: 22, bold: true, color: RED }), ...dateRuns(input.valuationDate, { size: 22, bold: true, color: RED })] }));

  // ═══ Valuation analysis table ═══
  const analysis: (Paragraph | Table)[] = [sectionHeading('VALUATION ANALYSIS TABLE', true)];
  const aw = [3600, 1500, 1900, 2360];
  const ac = (t: string, i: number, o: { bold?: boolean; fill?: string; align?: any; color?: string } = {}) => new TableCell({
    width: { size: aw[i], type: WidthType.DXA }, borders: BOX, margins: { top: 40, bottom: 40, left: 80, right: 80 },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    children: [new Paragraph({ alignment: o.align ?? (i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT), children: [new TextRun({ text: t, font: FONT, size: 18, bold: o.bold, color: o.color })] })],
  });
  const aRow = (cells: string[], o: { bold?: boolean; fill?: string; color?: string } = {}) => new TableRow({ children: cells.map((c, i) => ac(c, i, o)) });
  const aRows: TableRow[] = [aRow(['Description', 'Area / Qty', 'Rate (RWF)', 'Value (RWF)'], { bold: true, fill: 'D9D9D9' })];
  const bd = input.breakdown;
  const f = (n: any) => Math.round(Number(n)).toLocaleString('en-US');
  if (isCost && bd?.land) {
    aRows.push(aRow(['LAND', '', '', ''], { bold: true, fill: 'FFF2CC' }));
    aRows.push(aRow(['Land value', `${bd.land.areaSqm} sqm`, f(bd.land.ratePerSqm), f(bd.land.value)]));
    if ((bd.buildingLines ?? []).length) aRows.push(aRow(['BUILDINGS (Replacement cost)', '', '', ''], { bold: true, fill: 'FFF2CC' }));
    (bd.buildingLines ?? []).forEach((l: any) => aRows.push(aRow([l.name, `${l.areaSqm} sqm`, f(l.ratePerSqm), f(l.replacementCost)])));
    if ((bd.externalWorkLines ?? []).length) aRows.push(aRow(['EXTERNAL WORKS', '', '', ''], { bold: true, fill: 'FFF2CC' }));
    (bd.externalWorkLines ?? []).forEach((l: any) => aRows.push(aRow([l.name, `${l.quantity}`, f(l.rate), f(l.cost)])));
    aRows.push(aRow(['Total development cost', '', '', f(bd.totalDevelopmentCost)], { bold: true, fill: 'FCE4D6' }));
    aRows.push(aRow([`Depreciation (${(bd.depreciation.rate * 100).toFixed(0)}%)`, '', '', `-${f(bd.depreciation.amount)}`]));
    aRows.push(aRow([`Developer's profit (${(bd.developerProfit.rate * 100).toFixed(0)}%)`, '', '', `+${f(bd.developerProfit.amount)}`]));
    aRows.push(aRow(['Development value', '', '', f(bd.developmentValue)], { bold: true, fill: 'FCE4D6' }));
    aRows.push(aRow(['Land value', '', '', f(bd.land.value)], { bold: true, fill: 'FCE4D6' }));
  }
  if (market) aRows.push(aRow(['OPEN MARKET VALUE', '', '', f(market.amount)], { bold: true, fill: 'C6E0B4' }));
  if (fsv) aRows.push(aRow(['FORCED SALE VALUE', '', '', f(fsv.amount)], { bold: true, fill: 'C6E0B4' }));
  if (ins) aRows.push(aRow(['INSURANCE VALUE', '', '', f(ins.amount)], { bold: true, fill: 'C6E0B4' }));
  analysis.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: aw, rows: aRows }));

  // ═══ Appendices ═══
  HEADINGS.push({ text: 'APPENDICES', level: 1 });
  const appendices: (Paragraph | Table)[] = [new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, spacing: { before: 3000 }, children: [new TextRun({ text: 'APPENDICES', font: FONT, size: 96 })] })];
  const appendixUrls = [...(input.extras.appendixUrls ?? [])];
  for (let i = 0; i < appendixUrls.length; i++) {
    const img = await loadImage(appendixUrls[i]);
    if (img) {
      appendices.push(new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, children: [imageRun(img, 600, 800)] }));
    } else {
      appendices.push(new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: `Appendix ${i + 1}: `, font: FONT, size: 22, bold: true }), new ExternalHyperlink({ link: appendixUrls[i], children: [new TextRun({ text: appendixUrls[i], font: FONT, size: 20, color: BLUE, underline: {} })] })] }));
    }
  }

  // ═══ Header / footer ═══
  const customLogo = await loadImage(input.extras.logoUrl);
  const logoRun = customLogo
    ? imageRun(customLogo, 150, 70)
    : new ImageRun({ type: 'png', data: b64(LOGO_PNG_BASE64), transformation: { width: 130, height: 64 } });
  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [logoRun] })] });
  const ft = (t: string, o: { bold?: boolean; color?: string; underline?: boolean } = {}) => new TextRun({ text: t, font: FONT, size: 16, bold: o.bold, color: o.color, underline: o.underline ? {} : undefined });
  const footer = new Footer({ children: [
    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 12, color: 'FF0000', space: 4 } }, spacing: { after: 0 }, children: [ft('KOSRES Office', { bold: true }), ft(':  '), ft('BEATITUDE', { bold: true }), ft(' Building opposite Hotel Okapi, '), ft('4th Floor, KN 87 street', { bold: true }), ft(' KIGALI-RWANDA')] }),
    new Paragraph({ spacing: { after: 0 }, children: [ft('Email: '), new ExternalHyperlink({ link: 'mailto:kosresltd@gmail.com', children: [ft('kosresltd@gmail.com', { color: BLUE, underline: true })] }), ft(' Tel No. +250792871729,')] }),
    new Paragraph({ spacing: { after: 0 }, children: [ft('Member:', { bold: true, color: 'FF0000', underline: true }), ft('  '), ft('#Institute of Real Property Valuers in Rwanda {IRPV}#', { bold: true, color: 'FF0000' })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [ft('Page '), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 }), ft(' of '), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16 })] }),
  ] });

  const page = (margins: { top: number; bottom: number }) => ({
    size: { width: 12240, height: 15840 }, margin: { top: margins.top, bottom: margins.bottom, left: 1440, right: 1440, header: 288, footer: 432 },
  });

  const doc = new Document({
    creator: 'KOSRES LTD', title: `Valuation Report ${input.reference}`, description: 'Property valuation report',
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: GREEN }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 20, bold: true, color: BLUE }, paragraph: { spacing: { before: 0, after: 60 }, outlineLevel: 1 } },
      ],
    },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
    sections: [
      { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, bottom: 720, left: 1440, right: 1440 } } }, children: [coverTable] },
      {
        properties: { page: page({ top: 1700, bottom: 1500 }) }, headers: { default: header }, footers: { default: footer },
        children: [...titleChildren, ...letter, ...makeToc(), ...exec, ...terms, ...features, ...desc, ...valuation, ...imgSection, ...cert, ...analysis, ...appendices],
      },
    ],
  });
  return { buffer: await Packer.toBuffer(doc), headings: HEADINGS.slice() };
}
