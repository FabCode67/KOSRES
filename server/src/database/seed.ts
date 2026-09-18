import 'reflect-metadata';
import { AppDataSource } from './data-source';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const userRepo     = AppDataSource.getRepository('users');
  const propertyRepo = AppDataSource.getRepository('properties');

  // ── Admin user ──
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kosres.rw';
  const existing   = await userRepo.findOne({ where: { email: adminEmail } });

  let adminId: string;
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@Kosres2024', 10);
    const admin = await userRepo.save({
      name: 'KOSRES Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });
    adminId = admin.id;
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    adminId = existing.id;
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // ── Seed properties ──
  const count = await propertyRepo.count();
  if (count === 0) {
    const props = [
      {
        title: 'Elegant 3-Bedroom Apartment – Nyamirambo',
        description: 'Bright, fully-finished apartment in a secure compound. Open-plan living, tiled floors, modern kitchen. Walking distance to shops and public transport.',
        price: 1500000,
        priceUnit: 'RWF',
        priceFrequency: 'month',
        offerType: 'rent',
        category: 'residential',
        propertyType: 'Apartment',
        district: 'Nyarugenge',
        sector: 'Nyamirambo',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.36.jpeg', '/images/WhatsApp Image 2026-06-04 at 09.15.37.jpeg'],
        featured: true,
        createdBy: { id: adminId },
      },
      {
        title: 'Modern Villa with Garden – Kicukiro',
        description: 'Spacious 5-bedroom villa set on a 600 sqm plot with a private garden, double garage and 24/7 security. Ideal for families seeking comfort and prestige.',
        price: 350000000,
        priceUnit: 'RWF',
        offerType: 'sale',
        category: 'residential',
        propertyType: 'Villa',
        district: 'Kicukiro',
        sector: 'Niboye',
        bedrooms: 5,
        bathrooms: 4,
        area: 380,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg', '/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg'],
        featured: true,
        createdBy: { id: adminId },
      },
      {
        title: 'Commercial Office Space – Kigali CBD',
        description: 'Grade-A open-plan office floor in the heart of Kigali City Centre. 250 sqm, raised floors, fibre-ready, panoramic city views. Parking included.',
        price: 3500000,
        priceUnit: 'RWF',
        priceFrequency: 'month',
        offerType: 'rent',
        category: 'commercial',
        propertyType: 'Office',
        district: 'Nyarugenge',
        sector: 'Nyarugenge',
        area: 250,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.40.jpeg'],
        featured: false,
        createdBy: { id: adminId },
      },
      {
        title: '4-Bedroom Family Home – Gasabo',
        description: 'Well-maintained bungalow on a quiet street in Remera. Tiled throughout, fitted kitchen, large compound, two en-suite bedrooms.',
        price: 65000000,
        priceUnit: 'RWF',
        offerType: 'sale',
        category: 'residential',
        propertyType: 'Single Family Home',
        district: 'Gasabo',
        sector: 'Remera',
        bedrooms: 4,
        bathrooms: 3,
        area: 210,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.41.jpeg', '/images/WhatsApp Image 2026-06-04 at 09.15.36.jpeg'],
        featured: true,
        createdBy: { id: adminId },
      },
      {
        title: 'Investment Plot – Musanze',
        description: 'Flat 600 sqm residential plot in a fast-growing Musanze neighbourhood. Title deed clean, no encumbrances. Easy access to tarmac road.',
        price: 12000000,
        priceUnit: 'RWF',
        offerType: 'sale',
        category: 'residential',
        propertyType: 'Plot',
        district: 'Musanze',
        sector: 'Cyuve',
        area: 600,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg'],
        featured: false,
        createdBy: { id: adminId },
      },
      {
        title: 'Furnished Studio – Short Stay Kimihurura',
        description: 'Stylish self-contained studio for short-term guests. WiFi, hot water, secured parking, daily/weekly/monthly rates. Perfect for business travellers.',
        price: 80000,
        priceUnit: 'RWF',
        priceFrequency: 'month',
        offerType: 'short_stay',
        category: 'residential',
        propertyType: 'Apartment',
        district: 'Gasabo',
        sector: 'Kimihurura',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        images: ['/images/WhatsApp Image 2026-06-04 at 09.15.37.jpeg', '/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg'],
        featured: false,
        createdBy: { id: adminId },
      },
    ];

    for (const p of props) {
      await propertyRepo.save(propertyRepo.create(p));
    }
    console.log(`✅ Seeded ${props.length} properties`);
  } else {
    console.log(`ℹ️  Properties already seeded (${count} found)`);
  }

  // ── Valuation Platform: engines, example rate tables, calculation rules ──
  const engineRepo          = AppDataSource.getRepository('valuation_engines');
  const engineVersionRepo   = AppDataSource.getRepository('valuation_engine_versions');
  const rateTableRepo       = AppDataSource.getRepository('valuation_rate_tables');
  const rateTableEntryRepo  = AppDataSource.getRepository('valuation_rate_table_entries');
  const calcRuleRepo        = AppDataSource.getRepository('valuation_calculation_rules');

  let costEngine = await engineRepo.findOne({ where: { code: 'COST_APPROACH' } });
  if (!costEngine) {
    costEngine = await engineRepo.save({
      code: 'COST_APPROACH',
      name: 'Cost Approach (Depreciated Replacement Cost)',
      description: 'Land value (comparison) + Development value (depreciated replacement cost of buildings and external works).',
      methodology: 'RICS / IVS Cost Approach',
    });
    await engineVersionRepo.save({
      engine: { id: costEngine.id },
      version: 1,
      requiredFields: {
        land: ['plotSizeSqm', 'zoning', 'topography'],
        buildings: ['name', 'areaSqm', 'constructionYear', 'condition', 'walling', 'roofing', 'flooring', 'ceiling'],
        externalWorks: ['name', 'unit', 'quantity'],
      },
      requiredDocs: ['title_deed'],
      reportSections: [
        'cover_page', 'terms_of_engagement', 'property_features', 'construction_details',
        'accommodation', 'valuation_analysis', 'valuation_disclaimer', 'property_images', 'valuation_certificate',
      ],
    });
    console.log('✅ Seeded Cost Approach engine (v1)');
  } else {
    console.log('ℹ️  Cost Approach engine already seeded');
  }

  let salesEngine = await engineRepo.findOne({ where: { code: 'SALES_COMPARISON' } });
  if (!salesEngine) {
    salesEngine = await engineRepo.save({
      code: 'SALES_COMPARISON',
      name: 'Sales Comparison Approach',
      description: 'Compares the subject property against similar recent transactions.',
      methodology: 'RICS / IVS Market Approach',
    });
    await engineVersionRepo.save({
      engine: { id: salesEngine.id },
      version: 1,
      requiredFields: { comparables: ['minimum 3 comparable transactions within 12 months'] },
      requiredDocs: [],
      reportSections: ['cover_page', 'comparable_analysis', 'adjustments', 'indicated_value', 'valuation_certificate'],
    });
    console.log('✅ Seeded Sales Comparison engine (v1) — engine registered ahead of full implementation');
  } else {
    console.log('ℹ️  Sales Comparison engine already seeded');
  }

  let incomeEngine = await engineRepo.findOne({ where: { code: 'INCOME_APPROACH' } });
  if (!incomeEngine) {
    incomeEngine = await engineRepo.save({
      code: 'INCOME_APPROACH',
      name: 'Income Approach (Direct Capitalization)',
      description: 'Capitalizes net operating income into an indicated value using an adopted capitalization rate.',
      methodology: 'RICS / IVS Income Approach',
    });
    await engineVersionRepo.save({
      engine: { id: incomeEngine.id },
      version: 1,
      requiredFields: { units: ['name', 'unitType', 'monthlyRent', 'occupancyRate'], operatingExpenses: ['name', 'annualAmount'], adoptedCapRate: 'required' },
      requiredDocs: [],
      reportSections: ['cover_page', 'rental_analysis', 'income_expenses', 'noi_capitalization', 'indicated_value', 'valuation_certificate'],
    });
    console.log('✅ Seeded Income Approach engine (v1)');
  } else {
    console.log('ℹ️  Income Approach engine already seeded');
  }

  let avsEngine = await engineRepo.findOne({ where: { code: 'AVS' } });
  if (!avsEngine) {
    avsEngine = await engineRepo.save({
      code: 'AVS',
      name: 'Automated Valuation System',
      description: 'System-assisted comparable selection and similarity-weighted estimate. Always requires licensed valuer review before use.',
      methodology: 'Weighted-similarity comparable scoring',
    });
    await engineVersionRepo.save({
      engine: { id: avsEngine.id },
      version: 1,
      requiredFields: { subject: 'derived automatically from the property record' },
      requiredDocs: [],
      reportSections: ['cover_page', 'model_explanation', 'confidence_indicators', 'indicated_value', 'valuer_review', 'valuation_certificate'],
    });
    console.log('✅ Seeded AVS engine (v1)');
  } else {
    console.log('ℹ️  AVS engine already seeded');
  }

  const existingLandTable = await rateTableRepo.findOne({ where: { type: 'land', name: 'Kamonyi District Land Rates', version: 1 } });
  if (!existingLandTable) {
    const landTable = await rateTableRepo.save({
      type: 'land', name: 'Kamonyi District Land Rates', version: 1,
      source: 'Seed data — reference example only, adjust before real use',
    });
    await rateTableEntryRepo.save({
      rateTable: { id: landTable.id }, key: 'residential_agri_zone', unit: 'sqm', rate: 25000,
      province: 'Southern', district: 'Kamonyi', propertyCategory: 'residential',
    });
    console.log('✅ Seeded example land rate table');
  } else {
    console.log('ℹ️  Land rate table already seeded');
  }

  const existingBuildingTable = await rateTableRepo.findOne({ where: { type: 'building_component', name: 'Standard Residential Building Rates', version: 1 } });
  if (!existingBuildingTable) {
    const buildingTable = await rateTableRepo.save({
      type: 'building_component', name: 'Standard Residential Building Rates', version: 1,
      source: 'Seed data — reference example only, adjust before real use',
    });
    await rateTableEntryRepo.save([
      { rateTable: { id: buildingTable.id }, key: 'main_house', unit: 'sqm', rate: 240000 },
      { rateTable: { id: buildingTable.id }, key: 'annex_standard', unit: 'sqm', rate: 150000 },
      { rateTable: { id: buildingTable.id }, key: 'annex_basic', unit: 'sqm', rate: 30000 },
    ]);
    console.log('✅ Seeded example building-component rate table');
  } else {
    console.log('ℹ️  Building-component rate table already seeded');
  }

  const existingExternalTable = await rateTableRepo.findOne({ where: { type: 'external_work', name: 'Standard External Works Rates', version: 1 } });
  if (!existingExternalTable) {
    const externalTable = await rateTableRepo.save({
      type: 'external_work', name: 'Standard External Works Rates', version: 1,
      source: 'Seed data — reference example only, adjust before real use',
    });
    await rateTableEntryRepo.save([
      { rateTable: { id: externalTable.id }, key: 'site_leveling', unit: 'lump_sum', rate: 1200000 },
      { rateTable: { id: externalTable.id }, key: 'retaining_wall', unit: 'sqm', rate: 85000 },
      { rateTable: { id: externalTable.id }, key: 'fence', unit: 'linear_m', rate: 55000 },
      { rateTable: { id: externalTable.id }, key: 'entrance_gate', unit: 'item', rate: 900000 },
      { rateTable: { id: externalTable.id }, key: 'parking_shed', unit: 'lump_sum', rate: 1500000 },
      { rateTable: { id: externalTable.id }, key: 'paved_area', unit: 'sqm', rate: 18000 },
      { rateTable: { id: externalTable.id }, key: 'pavers', unit: 'sqm', rate: 25000 },
      { rateTable: { id: externalTable.id }, key: 'water_tank', unit: 'item', rate: 500000 },
      { rateTable: { id: externalTable.id }, key: 'foul_drainage', unit: 'lump_sum', rate: 1500000 },
    ]);
    console.log('✅ Seeded example external-works rate table');
  } else {
    console.log('ℹ️  External-works rate table already seeded');
  }

  const ruleDefs = [
    { type: 'depreciation_flat_rate', code: 'DEPRECIATION_FLAT_STANDARD', name: 'Standard flat-rate depreciation', params: { rate: 0.07 } },
    { type: 'developer_profit', code: 'DEVELOPER_PROFIT_STANDARD', name: "Standard developer's profit", params: { rate: 0.12 } },
    { type: 'forced_sale_percentage', code: 'FORCED_SALE_STANDARD', name: 'Standard forced sale percentage', params: { percentage: 0.6 } },
  ];
  for (const rule of ruleDefs) {
    const existingRule = await calcRuleRepo.findOne({ where: { code: rule.code, version: 1 } });
    if (!existingRule) {
      await calcRuleRepo.save({ ...rule, version: 1 });
      console.log(`✅ Seeded calculation rule: ${rule.code}`);
    } else {
      console.log(`ℹ️  Calculation rule already seeded: ${rule.code}`);
    }
  }

  // ── Test accounts for the Valuer/Technician roles ──
  const valuerEmail = 'valuer@kosres.com';
  let valuer = await userRepo.findOne({ where: { email: valuerEmail } });
  if (!valuer) {
    valuer = await userRepo.save({
      name: 'Joseph Barasebwa', email: valuerEmail,
      password: await bcrypt.hash('Valuer@Kosres2024', 10),
      role: 'valuer', licenseNumber: 'RC/IRPV/259/2023',
    });
    console.log(`✅ Valuer account created: ${valuerEmail} / Valuer@Kosres2024`);
  } else {
    console.log(`ℹ️  Valuer account already exists: ${valuerEmail}`);
  }

  const technicianEmail = 'technician@kosres.com';
  let technician = await userRepo.findOne({ where: { email: technicianEmail } });
  if (!technician) {
    technician = await userRepo.save({
      name: 'Epiphanie Bankundiye', email: technicianEmail,
      password: await bcrypt.hash('Technician@Kosres2024', 10),
      role: 'technician',
    });
    console.log(`✅ Technician account created: ${technicianEmail} / Technician@Kosres2024`);
  } else {
    console.log(`ℹ️  Technician account already exists: ${technicianEmail}`);
  }

  // ── Comparable properties ── gives Sales Comparison and AVS real data to work with immediately
  const comparableRepo    = AppDataSource.getRepository('comparable_properties');
  const comparableTxRepo  = AppDataSource.getRepository('comparable_transactions');

  const comparableCount = await comparableRepo.count();
  if (comparableCount === 0) {
    const comparableDefs = [
      { district: 'Kamonyi', sector: 'Rugarika', propertyCategory: 'residential', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4.2, price: 180_000_000, source: 'Agent network' },
      { district: 'Kamonyi', sector: 'Rugarika', propertyCategory: 'residential', plotAreaSqm: 600, buildingAreaSqm: 200, bedrooms: 4, ageYears: 3, condition: 'Good', cbdDistanceKm: 3.8, price: 210_000_000, source: 'Agent network' },
      { district: 'Kamonyi', sector: 'Musambira', propertyCategory: 'residential', plotAreaSqm: 450, buildingAreaSqm: 160, bedrooms: 3, ageYears: 8, condition: 'Fair', cbdDistanceKm: 5.0, price: 150_000_000, source: 'Public record' },
      { district: 'Kamonyi', sector: 'Rugarika', propertyCategory: 'residential', plotAreaSqm: 700, buildingAreaSqm: 240, bedrooms: 5, ageYears: 2, condition: 'Excellent', cbdDistanceKm: 3.0, price: 260_000_000, source: 'Agent network' },
      { district: 'Kamonyi', sector: 'Nyamiyaga', propertyCategory: 'residential', plotAreaSqm: 550, buildingAreaSqm: 190, bedrooms: 4, ageYears: 6, condition: 'Good', cbdDistanceKm: 4.0, price: 195_000_000, source: 'Public record' },
      { district: 'Gasabo', sector: 'Remera', propertyCategory: 'residential', plotAreaSqm: 400, buildingAreaSqm: 220, bedrooms: 4, ageYears: 4, condition: 'Very good', cbdDistanceKm: 6.5, price: 310_000_000, source: 'Agent network' },
    ];
    for (const c of comparableDefs) {
      const { price, ...propData } = c;
      const saved = await comparableRepo.save({ ...propData, verificationStatus: 'verified' });
      await comparableTxRepo.save({ comparablePropertyId: saved.id, transactionDate: '2026-06-15', price, pricePerSqm: Math.round(price / c.buildingAreaSqm) });
    }
    console.log(`✅ Seeded ${comparableDefs.length} comparable properties with transactions`);
  } else {
    console.log(`ℹ️  Comparable properties already seeded (${comparableCount} found)`);
  }

  // ── One fully-populated sample valuation request ── based on a real KOSRES report, so the
  // ledger reproduces familiar figures the moment you run a calculation on it.
  const requestRepo  = AppDataSource.getRepository('valuation_requests');
  const propRepo      = AppDataSource.getRepository('valuation_properties');
  const locationRepo  = AppDataSource.getRepository('valuation_property_locations');
  const landRepo      = AppDataSource.getRepository('valuation_property_land');
  const buildingRepo  = AppDataSource.getRepository('valuation_property_buildings');
  const workRepo      = AppDataSource.getRepository('valuation_external_works');
  const transitionRepo = AppDataSource.getRepository('valuation_workflow_transitions');

  const sampleReference = 'VAL-2026-SAMPLE-001';
  const existingSample = await requestRepo.findOne({ where: { reference: sampleReference } });
  if (!existingSample && valuer && technician) {
    const request = await requestRepo.save({
      reference: sampleReference,
      purpose: 'loan_application',
      beneficiary: 'Equity Bank Rwanda Ltd',
      instructor: 'Ndagijimana Felix',
      status: 'valuer_review',
      createdBy: { id: adminId },
      assignedValuer: { id: valuer.id },
      assignedTechnician: { id: technician.id },
    });
    await transitionRepo.save({ request: { id: request.id }, toStatus: 'valuer_review', actorId: adminId, reason: 'Seed data — ready for engine selection' });

    const property = await propRepo.save({
      request: { id: request.id },
      upi: '2/08/10/05/14181',
      plotNumber: '14181',
      titleRef: '14181',
      registeredProprietors: [
        { name: 'Ndagijimana Felix', sharePercentage: 50, gender: 'Male' },
        { name: 'Byukusenge Francoise Fanny', sharePercentage: 50, gender: 'Female' },
      ],
      propertyCategory: 'residential',
      propertySubtype: 'House',
      tenure: 'Leasehold',
      leaseTermYears: 99,
      occupancyStatus: 'Owner occupied',
      mortgageStatus: 'Under mortgage',
    });
    await locationRepo.save({
      property: { id: property.id },
      province: 'Southern', district: 'Kamonyi', sector: 'Rugarika', cell: 'Sheli', village: 'Kagangayire',
      latitude: -1.984088, longitude: 29.949738, distanceToCbdKm: 0.8,
      neighborhoodQuality: 'Safe, low-income area with upcoming middle-income development', accessibility: 'Murram',
    });
    await landRepo.save({
      property: { id: property.id },
      plotSizeSqm: 567, shape: 'Regular', topography: 'Gently sloping', zoning: 'A1-Agriculture zone',
      currentUse: 'Residential',
    });
    await buildingRepo.save([
      { property: { id: property.id }, name: 'Main house', areaSqm: 158.12, floors: 1, bedrooms: 4, bathrooms: 2, livingRooms: 1, kitchens: 1, stores: 1, constructionYear: 2010, condition: 'Good', walling: 'Adobe blocks, roughcast rendered', roofing: 'Multi-pitched iron sheets', flooring: 'Ceramic tiles', ceiling: 'PVC panels' },
      { property: { id: property.id }, name: 'Annex house I', areaSqm: 8.91, floors: 1, bedrooms: 1, condition: 'Fair', walling: 'Adobe blocks, roughcast rendered', roofing: 'Mono-pitched iron sheets', flooring: 'Cement screed' },
      { property: { id: property.id }, name: 'Annex house II', areaSqm: 27.3, floors: 1, condition: 'Fair', walling: 'Timber post, corrugated iron sheets', roofing: 'Mono-pitched iron sheets', flooring: 'Cement screed' },
    ]);
    await workRepo.save([
      { property: { id: property.id }, name: 'Site leveling', unit: 'lump_sum', quantity: 1 },
      { property: { id: property.id }, name: 'Retaining wall', unit: 'sqm', quantity: 44.66 },
      { property: { id: property.id }, name: 'Fence', unit: 'linear_m', quantity: 67.5 },
      { property: { id: property.id }, name: 'Main entrance gate', unit: 'item', quantity: 1 },
      { property: { id: property.id }, name: 'Parking shed', unit: 'lump_sum', quantity: 1 },
      { property: { id: property.id }, name: 'Paved area', unit: 'sqm', quantity: 142.56 },
      { property: { id: property.id }, name: 'Parking in pavers', unit: 'sqm', quantity: 10.72 },
      { property: { id: property.id }, name: 'Water tanks', unit: 'item', quantity: 2 },
      { property: { id: property.id }, name: 'Foul drainage system', unit: 'lump_sum', quantity: 1 },
    ]);

    // Services — matches the real report: "Water supply from WASAC is connected…
    // Power supply from EUCL is connected…"
    const serviceRepo = AppDataSource.getRepository('valuation_property_services');
    await serviceRepo.save([
      { property: { id: property.id }, type: 'water', status: 'connected', provider: 'WASAC' },
      { property: { id: property.id }, type: 'electricity', status: 'connected', provider: 'EUCL' },
      { property: { id: property.id }, type: 'drainage', status: 'not_connected', provider: null },
      { property: { id: property.id }, type: 'internet', status: 'connected', provider: 'MTN Rwanda' },
    ]);

    // Amenities — matches the real report: "Road Market, Schools, and Shops in
    // approximately a kilometer… 800 meters from ADEPR ITORERO RYAMUGOMERO"
    const amenityRepo = AppDataSource.getRepository('valuation_property_amenities');
    await amenityRepo.save([
      { property: { id: property.id }, name: 'ADEPR Itorero Ryamugomero (church)', distanceKm: 0.8 },
      { property: { id: property.id }, name: 'Local market', distanceKm: 1.0 },
      { property: { id: property.id }, name: 'Primary school', distanceKm: 1.0 },
      { property: { id: property.id }, name: 'Shops / trading center', distanceKm: 1.0 },
      { property: { id: property.id }, name: 'Kamonyi District Hospital', distanceKm: 4.5 },
      { property: { id: property.id }, name: 'Tarmac road (RN1)', distanceKm: 2.0 },
    ]);

    // Images — placeholder evidence photos, categorized as a real inspection would capture
    const imageRepo = AppDataSource.getRepository('valuation_property_images');
    await imageRepo.save([
      { property: { id: property.id }, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', category: 'exterior', description: 'Front elevation, main house' },
      { property: { id: property.id }, url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', category: 'interior', description: 'Living room' },
      { property: { id: property.id }, url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', category: 'exterior', description: 'Entrance gate and paved yard' },
      { property: { id: property.id }, url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200', category: 'external_works', description: 'Boundary wall and water tank' },
    ]);

    // Inspection — completed, with the real boundary/encroachment observation from
    // the reference report (a perfect example of "professional judgement no algorithm produces")
    const inspectionRepo = AppDataSource.getRepository('valuation_inspections');
    const inspectionNoteRepo = AppDataSource.getRepository('valuation_inspection_notes');
    const inspection = await inspectionRepo.save({
      request: { id: request.id }, technician: { id: technician.id },
      status: 'submitted', inspectionDate: '2026-08-27',
    });
    await inspectionNoteRepo.save([
      { inspection: { id: inspection.id }, field: 'Boundary', observation: 'Some annex structures fall under the boundary of the neighboring plot; part of the main house sits within the shared UPI. Recommend the owner engage a certified land surveyor to rectify boundaries before loan disbursement.', authorId: technician.id },
      { inspection: { id: inspection.id }, field: 'Utilities', observation: 'WASAC water and EUCL power both confirmed connected and functional on site visit.', authorId: technician.id },
      { inspection: { id: inspection.id }, field: 'General condition', observation: 'Main house well maintained; annex structures show fair condition, unlined ceilings and cement-screed floors throughout.', authorId: technician.id },
    ]);

    console.log(`✅ Seeded sample valuation request ${sampleReference} (ready for engine selection → Cost Approach), plus images and a completed inspection`);
  } else {
    console.log(`ℹ️  Sample valuation request already seeded or valuer/technician missing`);
  }

  await AppDataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
