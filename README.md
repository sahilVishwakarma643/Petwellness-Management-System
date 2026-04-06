# Pet Wellness App Backend

Spring Boot backend that now powers the entire pet-wellness experience: OTP-based onboarding, owner onboarding workflows, pet and medical records, vaccination tracking, appointment scheduling, marketplace orders, Razorpay payments, and admin dashboards.

## Key Features
- **OTP onboarding + profile completion** – verify email with one-time passwords, submit documents, and receive approval/rejection emails before a JWT-protected session starts.
- **Pet, health & vaccination records** – owners can create/update their pets, upload medical history/vaccination files, and download consolidated health-report PDFs.
- **Appointments** – admins manage slots, while owners can view availability, book/cancel appointments, and see their booking history with pagination.
- **Marketplace + payments** – browse product catalogues, manage a cart, checkout with Razorpay orders, confirm or abort payments, and cancel pending orders.
- **Admin controls** – approve/reject users, create owner profiles, manage products/orders, and oversee appointment schedules from secure admin-only endpoints.

## Tech Stack
- Java 24 + Spring Boot 4.0.2
- Spring Security (JWT + role gating)
- Spring Data JPA (MySQL)
- Spring Mail (SMTP for OTP/password notifications)
- Springdoc OpenAPI (Swagger UI and schema)
- Razorpay SDK (payment orchestration)
- Template engine for reporting (`src/main/resources/templates`)

## Repository Layout
- `pom.xml`, `mvnw`, `.mvn/` keep Maven Wrapper and dependency management at the repo root.
- `src/main/java/com/petcare/petwellness` contains every controller/service/entity/DTO.
- `src/main/resources` holds `application.yml` and the report templates that feed PDF generation.
- `src/test/java` contains the automated suites; update them along with feature work.

## API Highlights

### Authentication & onboarding
- `POST /api/auth/send-otp` – audit email, generate + email OTP.
- `POST /api/auth/verify-otp` – validate 6-digit code before showing registration form.
- `POST /api/auth/registration` – `multipart/form-data` request with owner metadata, ID proof, and profile image.
- `POST /api/auth/login` – receives temporary password and returns JWT plus `changePasswordRequired` flag.
- `POST /api/auth/set-password` – first-login endpoint to finalize credentials.

### Owner profile & pets
- `GET /api/profile/me` – fetch the caller’s profile.
- `PATCH /api/profile/Edit` – partial updates (profile image optional) via multipart form.
- `POST /api/pets/add`, `PATCH /api/pets/Edit/{petId}`, `DELETE /api/pets/delete/{petId}` – maintain pets and attachments.
- `GET /api/pets/me` – list the owner’s pets for dashboard cards.

### Pet health, vaccinations & reports
- `POST /api/medical-history/pet/add/{petId}` – add documented history (supports files).
- `GET /api/medical-history/pet/{petId}` – paginated listing + `PATCH /api/medical-history/Edit/{id}`/`DELETE /api/medical-history/delete/{id}` for maintenance.
- `POST /api/vaccinations/pet/add/{petId}` – log vaccination events; `PATCH /api/vaccinations/Edit/{id}` and `DELETE /api/vaccinations/delete/{id}` edit/remove them.
- `POST /api/vaccinations/{id}/complete` – mark vaccination done.
- `GET /api/vaccinations/pet/{petId}` – paginate vaccine history.
- `GET /api/reports/pet/{petId}/health-report` – streams a PDF health report with `Content-Disposition` attachment headers.

### Appointments
- `GET /api/appointments/available` – browse slots with offset/limit.
- `POST /api/appointments/{id}/book` & `POST /api/appointments/{id}/cancel` – book/cancel using the logged-in user’s pets.
- `GET /api/appointments/my` – fetch user-specific bookings.
- **Admin** (`/api/admin/appointments`) – create, update, delete slots; list all/booked appointments with pagination.

### Marketplace, cart & orders
- `GET /api/user/products` – paginated product catalogue filtered by `ProductCategory`.
- `GET /api/cart` – view cart summary; add/update/delete via `/api/cart/items`.
- `POST /api/cart/checkout` – create an order (shipping + address capture).
- `POST /api/orders/{orderId}/razorpay-order` – create Razorpay payment intent.
- `POST /api/orders/{orderId}/verify-payment` – capture Razorpay signature + confirm payment.
- `POST /api/orders/{orderId}/confirm-payment` – manual confirmation.
- `POST /api/orders/{orderId}/cancel` – abort and issue refunds when applicable.
- `GET /api/orders/my` & `GET /api/orders/{orderId}` – user order history/detail.

### Admin operations
- `/api/admin/pending-users`, `/api/admin/approved-users` – paginated user lists.
- `/api/admin/approve/{userId}` and `/api/admin/reject/{userId}` – control onboarding state and send emails.
- `/api/admin/create-owner` – admin can register an owner (supports multipart uploads).
- `/api/admin/approved-users/{userId}` – delete approved owner profiles.
- `/api/admin/products` – full CRUD for product catalogue, including file uploads for images.
- `/api/admin/orders` – list, view, update status, and cancel any order.

## Error Shape & Security Notes
Errors follow a consistent payload:

```json
{
  "message": "Some error",
  "status": 400,
  "timestamp": "2026-02-14T12:34:56"
}
```

- Authentication errors return `401 Unauthorized`; authorization breaches return `403 Forbidden` with the same shape.
- JWT header must be `Authorization: Bearer <token>` for protected routes.
- Swagger and OpenAPI remain open at `/swagger-ui.html` and `/v3/api-docs`.

## Frontend Integration Checklist
1. Keep API calls under `/api/...`; the Axios base URL on the frontend already assumes that.
2. Send JWT from login via `Authorization` header; `changePasswordRequired` alerts the UI to show the password reset screen.
3. Use `multipart/form-data` for registration, pet uploads, profile edits, medical-history/vaccination uploads, and admin owner creation.
4. Validate pincodes (6 digits), OTPs (6 digits), and dates (`yyyy-MM-dd`) before sending.
5. Handle both text responses (`"Password set successfully"`) and JSON error payloads with `message` + `status`.
6. Make two separate UI flows: owner dashboards (pets, appointments, orders, cart) and admin dashboards (users, products, orders, appointments).

## Running Locally
1. Copy `secrets.properties.example` to `secrets.properties` in the repo root and supply MySQL, SMTP, and JWT secrets.
2. The backend is a single Maven module. Run it from the project root:
   ```powershell
   .\mvnw spring-boot:run
   ```
3. Swagger UI is available at `http://localhost:8080/swagger-ui.html`; OpenAPI at `/v3/api-docs`.
4. Health reports download from `/api/reports/pet/{petId}/health-report`.

> 
