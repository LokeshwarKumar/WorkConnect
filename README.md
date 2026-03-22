# WorkConnect

## Project overview

WorkConnect is a **role-based service marketplace**: customers find skilled workers, send booking requests, complete jobs, and leave reviews; workers manage their professional profile and accept or decline work; administrators oversee users, workers, approvals, and high-level metrics.

### User roles

| Role | Capabilities |
|------|----------------|
| **Customer (`USER`)** | Register/login, search workers (trade, location, keywords, min rating, max minimum-charge), view profiles and reviews, create service requests (description + location required), mark accepted jobs complete, submit reviews after completion, view history. |
| **Worker (`WORKER`)** | Register/login, profile via `/api/profile`, set services/location/charges/availability, view incoming requests, **accept** or **reject** pending requests, view history; receives aggregated rating from reviews. |
| **Admin (`ADMIN`)** | Stored in `user_profiles` with `role = ADMIN` (not via public signup). Dashboard: analytics (customers, admins, workers, bookings, completed jobs, reviews, average rating), manage customer accounts, **list all workers**, **approve/unapprove** (unapproved workers are hidden from search), delete users/workers when safe. |

### Tech stack

- **Frontend:** React (Vite), React Router, Axios, JWT in `localStorage`.
- **Backend:** Spring Boot, Spring Security + JWT (subject `U{id}` / `W{id}`), JPA/Hibernate, MySQL.
- **API base:** `http://localhost:8080/api` (see controllers under `backend/.../controller`).

### Run locally

1. **MySQL:** database `workconnect` (see `backend/src/main/resources/application.properties`).
2. **Backend:** `cd backend` → `./mvnw spring-boot:run` (Windows: `mvnw.cmd`).
3. **Frontend:** `cd frontend` → `npm install` → `npm run dev`.

### Admin promotion (SQL example)

```sql
UPDATE user_profiles SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Log in again so the JWT includes `ROLE_ADMIN`.

### API highlights

- `POST /auth/signup`, `POST /auth/signin`
- `GET|PUT /profile` — unified profile for user/worker/admin (customer row)
- `GET /workers/search` — marketplace search (approved, available workers only); supports `keyword`, `minRating`, `serviceType`, `location`, `maxCharge`, pagination; **sort field whitelist** on backend
- `GET /workers/{id}` — worker card detail
- `POST /workers` — **admin only** (optional manual onboarding; normal workers also come from signup)
- `PUT /workers/{id}` — **that worker** or **admin**
- `POST /requests` — customer creates booking (`workerId`, `description`, `location`)
- `GET /requests/user` | `/requests/worker` — returns **DTOs** (`ServiceRequestResponse`) to avoid JSON cycles
- `PUT /requests/{id}/status?status=` — worker: pending → accepted/rejected only
- `PUT /requests/{id}/complete` — customer: accepted → completed
- `POST /reviews` — body `{ serviceRequestId, rating, comment }`
- `GET /reviews/worker/{workerId}` — list reviews for profile/search modal
- `GET /admin/stats`, `GET /admin/users`, `GET /admin/workers`, `PUT /admin/workers/{id}/approved`, `DELETE /admin/users/{id}`, `DELETE /admin/workers/{id}`

### Notes

- JWTs issued after **email or role changes** still work (subject is stable id + account kind).
- Deleting a worker with linked service requests may return **409** with a clear message (data integrity).
