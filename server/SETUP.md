# KOSRES Server — Setup & Run

## 1. Install dependencies
```bash
cd server
npm install
```

## 2. Run migrations (creates tables in Neon DB)
```bash
npm run migration:run
```

## 3. Seed the database (creates admin user + sample properties)
```bash
npm run seed
```

## 4. Start the server
```bash
npm run start:dev
```

API runs at: http://localhost:3001/api  
Swagger docs: http://localhost:3001/api/docs

## Default admin credentials
- Email: admin@kosres.rw  
- Password: Admin@Kosres2024

## Available API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/properties | ❌ | List properties (filterable) |
| GET | /api/properties/featured | ❌ | Featured properties |
| GET | /api/properties/:id | ❌ | Single property |
| GET | /api/properties/admin/stats | ✅ | Dashboard stats |
| POST | /api/properties | ✅ | Create property |
| PATCH | /api/properties/:id | ✅ | Update property |
| DELETE | /api/properties/:id | ✅ | Delete property |
| POST | /api/properties/:id/images | ✅ | Upload images |
| POST | /api/inquiries/property/:id | ❌ | Submit inquiry |
| GET | /api/inquiries | ✅ | All inquiries (admin) |
