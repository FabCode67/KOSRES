/**
 * Seeds comparable_properties / comparable_transactions from
 * data/comparables-seed.json (cleaned from the firm's "DATABASE RESIDENTIAL
 * HOUSE" and "DATABASE RESIDENTIAL LAND" sheets).
 *
 *   npm run seed:comparables            # insert (safe to re-run: skips rows already present)
 *   npm run seed:comparables -- --dry   # parse + summary only, no database connection
 *
 * Distance to CBD is filled in from cadastral_parcels coordinates when the UPI is found there
 * (Kigali parcels), using the same reference point as the CBD checker.
 */
import 'reflect-metadata';
process.env.QUIET_SQL = '1';

import { readFileSync } from 'fs';
import { join } from 'path';
import { AppDataSource } from './data-source';
import { CBD_REFERENCE, haversineKm } from '../valuation/cadastral/cbd-distance.util';

type Seed = {
  kind: 'house' | 'land'; upi: string; province: string | null; district: string | null; sector: string | null;
  cell: string | null; village: string | null; category: string; subtype: string; plotAreaSqm: number | null;
  bedrooms: number | null; accommodation: string | null; condition: string | null; accessibility: string | null;
  price: number; transactionDate: string; pricePerSqm: number | null; attributes: Record<string, unknown>;
};

async function main() {
  const rows: Seed[] = JSON.parse(readFileSync(join(__dirname, '../../data/comparables-seed.json'), 'utf8'));
  const houses = rows.filter((r) => r.kind === 'house').length;
  console.log(`Seed file: ${rows.length} comparables (${houses} houses, ${rows.length - houses} land)`);
  if (process.argv.includes('--dry')) return;

  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  try {
    const parcels: { upi: string; latitude: string; longitude: string }[] = await qr.query(
      `SELECT upi, latitude, longitude FROM cadastral_parcels WHERE upi = ANY($1)`, [rows.map((r) => r.upi)],
    );
    const coords = new Map(parcels.map((p) => [p.upi, p]));
    let inserted = 0, skipped = 0, withCbd = 0;

    for (const r of rows) {
      const exists = await qr.query(
        `SELECT 1 FROM comparable_properties p JOIN comparable_transactions t ON t.comparable_property_id = p.id
          WHERE p.upi = $1 AND t.transaction_date = $2 AND t.price = $3 LIMIT 1`,
        [r.upi, r.transactionDate, r.price],
      );
      if (exists.length) { skipped++; continue; }

      const c = coords.get(r.upi);
      const cbd = c && c.latitude != null && c.longitude != null
        ? Math.round(haversineKm(Number(c.latitude), Number(c.longitude), CBD_REFERENCE.lat, CBD_REFERENCE.lng) * 100) / 100
        : null;
      if (cbd != null) withCbd++;

      const [prop] = await qr.query(
        `INSERT INTO comparable_properties
           (province, district, sector, cell, village, upi, property_category, property_subtype, plot_area_sqm,
            bedrooms, accommodation, condition, accessibility, cbd_distance_km, source, source_reliability, attributes)
         VALUES ($1,$2,$3,$4,$5,$6,$7::valuation_property_category_enum,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
        [r.province, r.district, r.sector, r.cell, r.village, r.upi, r.category, r.subtype, r.plotAreaSqm,
         r.bedrooms, r.accommodation, r.condition, r.accessibility, cbd,
         'KOSRES sales/valuation database', 'internal', JSON.stringify(r.attributes ?? {})],
      );
      await qr.query(
        `INSERT INTO comparable_transactions (comparable_property_id, transaction_date, price, price_per_sqm) VALUES ($1,$2,$3,$4)`,
        [prop.id, r.transactionDate, r.price, r.pricePerSqm],
      );
      inserted++;
    }
    console.log(`Done: inserted ${inserted}, already present ${skipped}, CBD distance filled for ${withCbd}`);
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

main().catch((e) => { console.error('Seeding failed:', e); process.exit(1); });
