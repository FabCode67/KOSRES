# Raw cadastral parcel exports

These `.xlsx` files are NOT committed to git (see repo `.gitignore` — each is
40-70MB, and there'll be more as districts get added). Keep them here locally
whenever you need to (re)run the importer.

## What they are

ArcGIS/QGIS "Converted" exports, one per district, with one row per surveyed
land parcel: `province, district, sector, cell, village, upi, x, y,
Area(Sqm), LONG_DMS, LAT_DMS`. Column TEXT headers vary slightly between
files (`Area(Sqm)` vs `st_area_sh`, `LONG_DMS` vs `LONG__DMS_`, one file has
mojibake'd degree symbols) but the column ORDER is identical across every
file seen so far — the importer (`server/src/database/import-cadastral.ts`)
reads by position for exactly this reason.

## Currently covered districts

- Kamonyi (~438,000 parcels)
- Gakenke
- Gicumbi
- Muhanga
- Kigali City (Gasabo / Kicukiro / Nyarugenge)

## Adding a new district

1. Get the district's equivalent export, confirm it opens and has the same
   12-column layout (`OBJECTID_1/FID, province, district, sector, cell,
   village, upi, x, y, area, long_dms, lat_dms`) — a quick spot-check with
   Excel or `python -c "import openpyxl; ..."` is enough; you don't need to
   match header text exactly, only column order.
2. Drop the file in this folder.
3. Run the importer (from `server/`):
   ```
   npx ts-node -r tsconfig-paths/register src/database/import-cadastral.ts "data/cadastral-raw/<file>.xlsx"
   ```
4. It upserts on `upi`, so re-running it (e.g. after a corrected file) is
   always safe — no duplicates.

## Where this data ends up

`cadastral_parcels` table in the shared KOSRES database (see migration
`1724000000000-AddCadastralParcels.ts`). It's used by
`GET /valuation/cadastral/lookup?upi=...` to return a parcel's exact plot
area, administrative location, and distance to the Kigali CBD reference
point — see `server/src/valuation/cadastral/` for the implementation.
