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

  await AppDataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
