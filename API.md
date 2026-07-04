# Karmen Kosmetik Akademie — API Reference

Base URL: `http://localhost:4000/api/v1`
Swagger UI: `http://localhost:4000/api/docs`
Static files: `http://localhost:4000/uploads/...` (e.g. `/uploads/media/treatments/microneedling.png`)

## Conventions

- **Localized strings** are objects: `{ "de": "...", "ar": "..." }` (referred to as `L10n` below).
- **Auth**: `Authorization: Bearer <accessToken>` header. Roles: `superadmin` | `admin` | `editor`. "Admin" below means role `admin` or `superadmin` required.
- **Paginated lists** accept `?page=1&limit=20&search=&sort=` (`sort` e.g. `-createdAt`) and return:
  `{ "data": [...], "meta": { "total", "page", "limit", "pages" } }`
- **Errors**: `404` not found, `409` duplicate slug/code/email, `400` validation, `401` unauthenticated, `403` wrong role, `429` rate-limited. Global rate limit 100 req/60s; stricter limits noted per endpoint.
- IDs in paths are Mongo ObjectIds (`_id` field of the documents).

## Seeded credentials & demo data

| What | Value |
|---|---|
| Admin login | `admin@karmen-kosmetik.de` / `Admin#2026` (role `superadmin`) |
| Demo certificate code | `KK-2026-9FY4G` (student "Beispiel Teilnehmerin", PMU course) |

---

## Auth (`/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | public (5/min) | Body `{ email, password }` → `{ accessToken, user: { id, email, name, role } }`. Sets httpOnly cookie `refresh_token` (path `/api/v1/auth`, 7d). |
| POST | `/auth/refresh` | cookie | Rotates the refresh token (old one is invalidated) → same shape as login. |
| POST | `/auth/logout` | cookie | Invalidates refresh token, clears cookie → `{ success: true }`. |
| GET | `/auth/me` | bearer | → `{ userId, email, name, role }`. |

Access token TTL 15m — refresh on 401.

## Users (`/users`) — admin

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users` | admin | Body `{ email, password (min 8), name, role?, isActive? }`. Assigning `role` requires superadmin. |
| GET | `/users` | admin | Paginated. `passwordHash` never returned. |
| GET | `/users/:id` | admin | Single user. |
| PATCH | `/users/:id` | admin | Partial update (incl. `password`). Changing `role` requires superadmin. |
| DELETE | `/users/:id` | superadmin | → `{ deleted: true }`. |

## Treatments (`/treatments`)

Shape: `{ slug, order, name: L10n, excerpt: L10n, description: L10n, benefits: L10n[], image, isPublished, seo?: { title: L10n, description: L10n } }`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/treatments` | public | Published only, sorted by `order`. Array (12 seeded). |
| GET | `/treatments/:slug` | public | Published treatment by slug. |
| GET | `/treatments/admin` | admin | All treatments, paginated. |
| GET | `/treatments/admin/:id` | admin | By id. |
| POST | `/treatments` | admin | Create (duplicate slug → 409). |
| PATCH | `/treatments/:id` | admin | Partial update. |
| PATCH | `/treatments/:id/publish` | admin | Body `{ isPublished: boolean }`. |
| PATCH | `/treatments/reorder` | admin | Body `{ items: [{ id, order }] }` → `{ updated: n }`. |
| DELETE | `/treatments/:id` | admin | Delete. |

## Courses (`/courses`)

Shape: `{ slug, order, name: L10n, subtitle?: L10n, duration: L10n, schedule: L10n, priceFrom: number|null, excerpt: L10n, description: L10n, curriculum: L10n[], certificate: L10n, audience: L10n, image?, isPublished, seo? }`

Endpoints identical in pattern to treatments: `GET /courses` (8 seeded), `GET /courses/:slug`, `GET /courses/admin`, `GET /courses/admin/:id`, `POST /courses`, `PATCH /courses/:id`, `PATCH /courses/:id/publish`, `PATCH /courses/reorder`, `DELETE /courses/:id`.

## Content (`/content`) — singleton docs

Keys: `homepage` | `courses-intro` | `about`. Shape: `{ key, data: <arbitrary object> }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/content/:key` | public | e.g. `homepage.data = { heroIntro: L10n, heroPoints: L10n[] }`; `about.data = { title, body, image }`; `courses-intro.data = { description, completeCourse, singleCourses, courseList[], whyUs[] }`. |
| PUT | `/content/:key` | admin | Body `{ data: {...} }` — replaces `data` (upsert). |

## Pages (`/pages`) — legal pages

Shape: `{ slug, title: L10n, sections: [{ heading: L10n, body: L10n }] }`. Seeded: `datenschutz`, `agb`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/pages` | public | All pages. |
| GET | `/pages/:slug` | public | By slug. |
| POST | `/pages` | admin | Create. |
| PATCH | `/pages/:id` | admin | Update. |
| DELETE | `/pages/:id` | admin | Delete. |

## Settings (`/settings`) — singleton

Shape: `{ siteName: L10n, tagline: L10n, contact: { ownerName, address: { street, zip, city, country: L10n }, email, phone, whatsapp }, social: { instagram, tiktok, facebook, whatsapp }, openingHours: [{ day, open, close, closed }], foundedYear }`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/settings` | public | Site settings. |
| PUT | `/settings` | admin | Partial upsert (send only changed top-level fields). |

## Navigation (`/navigation`) — singleton

Shape: `{ quickMenu: NavItem[], legalMenu: NavItem[] }`, `NavItem = { key, label: L10n, href, hidden }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/navigation` | public | Menus. |
| PUT | `/navigation` | admin | Partial upsert. |

## FAQs (`/faqs`)

Shape: `{ order, question: L10n, answer: L10n, isPublished }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/faqs` | public | Published, sorted by order (8 seeded). |
| GET | `/faqs/admin` | admin | Paginated, all. |
| POST | `/faqs` | admin | Create. |
| PATCH | `/faqs/:id` | admin | Update. |
| PATCH | `/faqs/:id/publish` | admin | `{ isPublished }`. |
| PATCH | `/faqs/reorder` | admin | `{ items: [{ id, order }] }`. |
| DELETE | `/faqs/:id` | admin | Delete. |

## Testimonials (`/testimonials`)

Shape: `{ name, text: L10n | string, rating: 1-5, source: 'google'|'website', isApproved, order, createdAt }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/testimonials` | public | Approved only. |
| POST | `/testimonials` | public (10/min) | Body `{ name, text: string, rating }` → created with `isApproved: false`, `source: 'website'`. |
| GET | `/testimonials/admin` | admin | Paginated, all. |
| POST | `/testimonials/admin` | admin | Full create (text may be L10n or string). |
| PATCH | `/testimonials/:id` | admin | Update. |
| PATCH | `/testimonials/:id/approve` | admin | `{ isApproved: boolean }`. |
| DELETE | `/testimonials/:id` | admin | Delete. |

## Gallery (`/gallery`)

Album shape: `{ slug, title: L10n, order, images: [{ src, alt: L10n, order }] }`. Seeded album: `academy` (3 images).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/gallery` | public | All albums sorted by order. |
| GET | `/gallery/:slug` | public | Album by slug. |
| POST | `/gallery` | admin | Create album. |
| PATCH | `/gallery/:id` | admin | Update (replace `images` array to manage images). |
| PATCH | `/gallery/reorder` | admin | `{ items: [{ id, order }] }`. |
| DELETE | `/gallery/:id` | admin | Delete album. |

## Appointments (`/appointments`)

Shape: `{ name, phone, email?, type: 'treatment'|'course', serviceSlug, serviceName, preferredDate (ISO date), preferredTime?, message?, locale, status: 'pending'|'confirmed'|'completed'|'cancelled', adminNote?, createdAt }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/appointments` | public (10/min) | Create request; `status` forced to `pending`. |
| GET | `/appointments` | admin | Paginated + filters: `?status=`, `?from=`/`?to=` (preferredDate range, ISO), `?search=` (name/phone/email/serviceName). |
| GET | `/appointments/stats` | admin | → `{ byStatus: { pending, confirmed, completed, cancelled }, upcomingThisWeek, total }`. |
| PATCH | `/appointments/:id` | admin | Body `{ status?, adminNote? }`. |
| DELETE | `/appointments/:id` | admin | Delete. |

## Contact (`/contact`)

Shape: `{ name, email, phone?, subject?, message, locale, isRead, createdAt }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact` | public (10/min) | Send message. |
| GET | `/contact` | admin | Paginated; filters `?isRead=`, `?search=`. |
| PATCH | `/contact/:id/read` | admin | `{ isRead: boolean }`. |
| DELETE | `/contact/:id` | admin | Delete. |

## Certificates (`/certificates`)

Shape: `{ code (unique, e.g. KK-2026-9FY4G), studentName, courseName: L10n | string, courseSlug?, issueDate, expiryDate?, pdfUrl?, isValid }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/certificates/verify/:code` | public | → `{ valid: true, studentName, courseName, issueDate }` or `{ valid: false }` (never 404; invalid/expired/revoked all return `valid: false`). |
| POST | `/certificates` | admin | Issue; `code` auto-generated (`KK-YYYY-XXXXX`) if omitted. |
| GET | `/certificates` | admin | Paginated; `search` matches code/studentName/courseSlug. |
| GET | `/certificates/:id` | admin | By id. |
| PATCH | `/certificates/:id` | admin | Update (set `isValid: false` to revoke). |
| DELETE | `/certificates/:id` | admin | Delete. |

## Media (`/media`) — admin only

Doc shape: `{ filename, url, thumbUrl?, mimeType, size, width?, height?, alt?: L10n, folder }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/media/upload` | admin | `multipart/form-data`: `file` (required, max 10MB; jpeg/png/webp/gif/svg/pdf/mp4), `altDe?`, `altAr?`. jpeg/png/webp are converted to webp (q82) + 400px-wide `.thumb.webp`. Stored under `/uploads/media/YYYY-MM/`. Returns the media doc. |
| GET | `/media` | admin | Paginated, newest first; `search` matches filename/mimeType. |
| DELETE | `/media/:id` | admin | Deletes doc and files from disk. |

## Audit (`/audit`) — admin

Every successful authenticated mutation (POST/PUT/PATCH/DELETE, except `/auth/*`) is logged: `{ userId, userEmail, method, path, entity, entityId, timestamp }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/audit` | admin | Paginated, newest first; `search` matches path/entity/userEmail. |

---

## Ops

```powershell
npm run start:dev   # dev server (port 4000)
npm run build       # compile
npm run seed        # idempotent seed from seed/content.json
```

Environment: see `.env.example` (`PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `CORS_ORIGINS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`). CORS allows `http://localhost:3000` and `http://localhost:3001` with credentials.
