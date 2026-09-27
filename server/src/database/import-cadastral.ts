/**
 * One-time (repeatable) importer: district cadastral "Converted" Excel
 * exports -> cadastral_parcels table.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/database/import-cadastral.ts <file1.xlsx> [file2.xlsx ...]
 *
 * Design notes (read before touching the column indices below):
 *  - Every district export we've seen so far shares the exact same COLUMN
 *    ORDER even though header TEXT varies ("Area(Sqm)" vs "st_area_sh",
 *    "LONG_DMS" vs "LONG__DMS_", etc., and one file has mojibake'd degree
 *    symbols). So this reads by POSITION, not by header name — far more
 *    robust than trying to fuzzy-match inconsistent headers. The header
 *    row is still logged per file so a genuinely different layout is
 *    obvious immediately rather than silently importing garbage.
 *  - Columns (0-indexed, as found in every file so far):
 *      0 id | 1 province | 2 district | 3 sector | 4 cell | 5 village
 *      6 upi | 7 x (UTM) | 8 y (UTM) | 9 area_sqm | 10 long_dms | 11 lat_dms
 *  - Uses exceljs's STREAMING reader deliberately: these files run up to
 *    ~68MB / ~438,000 rows, and a non-streaming parse would try to hold
 *    the whole workbook in memory at once.
 *  - Upserts on `upi` (unique index), so re-running the same file, or a
 *    corrected version of it, never creates duplicates.
 */
import 'reflect-metadata';
import * as ExcelJS from 'exceljs';
import { AppDataSource } from './data-source';
import { CadastralParcel } from '../valuation/entities/cadastral-parcel.entity';

const BATCH_SIZE = 2000;

function toNumberOrNull(v: any): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

/**
 * Parses a DMS string like `29° 54' 54.908"" E` (or the mojibake'd
 * `29Â° 47' 18.017"" E` variant seen in one file) into decimal degrees.
 * We deliberately don't care what the degree/minute/second symbols look
 * like -- just the digit groups and the trailing compass letter -- so
 * encoding artifacts don't break parsing.
 */
function parseDms(raw: any): number | null {
  const str = toStringOrNull(raw);
  if (!str) return null;

  const numbers = str.match(/(\d+(?:\.\d+)?)/g);
  if (!numbers || numbers.length < 3) return null;

  const [deg, min, sec] = numbers.map(Number);
  let dd = deg + min / 60 + sec / 3600;

  const dirMatch = str.match(/([NSEW])\s*$/i);
  const dir = dirMatch ? dirMatch[1].toUpperCase() : null;
  if (dir === 'S' || dir === 'W') dd = -dd;

  return Number.isFinite(dd) ? dd : null;
}

async function importFile(filePath: string) {
  const fileName = filePath.split(/[\\/]/).pop() || filePath;
  console.log(`\n=== ${fileName} ===`);

  const repo = AppDataSource.getRepository(CadastralParcel);

  const workbookReader = new (ExcelJS as any).stream.xlsx.WorkbookReader(filePath, {
    entries: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'ignore',
    styles: 'ignore',
    worksheets: 'emit',
  });

  let headerLogged = false;
  let totalRows = 0;
  let imported = 0;
  let skippedNoUpi = 0;
  let skippedNoCoords = 0;
  let batch: Partial<CadastralParcel>[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    await repo.upsert(batch as CadastralParcel[], ['upi']);
    batch = [];
  };

  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      const values = row.values as any[]; // 1-indexed; values[0] is unused

      if (row.number === 1) {
        console.log('Header row:', values.slice(1, 13));
        headerLogged = true;
        continue;
      }

      totalRows++;

      const upi = toStringOrNull(values[7]);
      if (!upi) {
        skippedNoUpi++;
        continue;
      }

      const latitude = parseDms(values[12]);
      const longitude = parseDms(values[11]);
      if (latitude == null || longitude == null) skippedNoCoords++;

      batch.push({
        upi,
        province: toStringOrNull(values[2]),
        district: toStringOrNull(values[3]),
        sector: toStringOrNull(values[4]),
        cell: toStringOrNull(values[5]),
        village: toStringOrNull(values[6]),
        plotAreaSqm: toNumberOrNull(values[10]),
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        utmX: toNumberOrNull(values[8]) ?? undefined,
        utmY: toNumberOrNull(values[9]) ?? undefined,
        sourceFile: fileName,
      });
      imported++;

      if (batch.length >= BATCH_SIZE) {
        await flush();
      }

      if (totalRows % 50000 === 0) {
        console.log(`  ...${totalRows} rows read, ${imported} queued/imported so far`);
      }
    }
  }
  await flush();

  if (!headerLogged) {
    console.warn('  WARNING: no header row detected -- check this file manually.');
  }

  console.log(
    `Done: ${totalRows} data rows | imported ${imported} | skipped (no UPI) ${skippedNoUpi} | ` +
    `missing coordinates ${skippedNoCoords} (still imported with null lat/lng)`,
  );
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: ts-node src/database/import-cadastral.ts <file1.xlsx> [file2.xlsx ...]');
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log('Connected to database.');

  for (const file of files) {
    await importFile(file);
  }

  await AppDataSource.destroy();
  console.log('\nAll files processed. Connection closed.');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
