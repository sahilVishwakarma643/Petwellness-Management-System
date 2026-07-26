# Pet Wellness Management System

> A full-stack platform for managing pet care workflows, including owner onboarding, appointments, marketplace products, carts, orders, vaccinations, and admin operations.

## Login

Use these default admin credentials for quick access during review:

- Email: `admin@petwellness.com`
- Password: `adminssakp`

## Overview

Pet Wellness Management System is a role-based web application built for pet owners and administrators. It combines a Spring Boot backend with a React frontend to support everyday pet-care operations in one place: registration, profile management, appointment booking, product browsing, cart and checkout flows, vaccination tracking, and admin review workflows.

The application is designed around a layered backend architecture and a UI that reflects the different responsibilities of each role:

- **Owners** can register, manage their profile, book appointments, browse marketplace products, place orders, and track pet-related records.
- **Admins** can review registrations, manage appointments and products, monitor marketplace activity, handle contact messages, and observe operational summaries from the dashboard.

For recruiter/demo access, the login page includes a small credential note panel where you can place the default admin email and password in one obvious spot. Update that text with your real demo credentials before sharing the project.

The codebase emphasizes separation of concerns, DTO-based API boundaries, validation, and production-oriented runtime behavior.

## Key Capabilities

- Role-based authentication and authorization with JWT
- Owner registration, profile completion, and admin approval flow
- Appointment scheduling and booking lifecycle
- Marketplace product management with cart and order processing
- Vaccination tracking and pet-care record management
- Admin dashboard with summary metrics, activity feed, and charts
- Contact message inbox for admin follow-up
- File uploads for profile images, ID proof, and product assets
- Email notifications for key account and workflow events
- Dockerized deployment path for container platforms such as Render

## Architecture

The backend follows a layered Spring architecture:

- **Controller layer** exposes HTTP endpoints and request/response contracts.
- **Service layer** contains business rules, validation flow, and transactional orchestration.
- **Repository layer** encapsulates persistence access using Spring Data JPA.
- **DTOs** are used for API boundaries so the internal entity model stays decoupled from request/response payloads.
- **Config classes** centralize web, security, and runtime settings.

This structure keeps domain logic out of controllers, reduces coupling between the UI and persistence model, and makes the API easier to evolve.

## Technology Stack

### Backend

- Java 24
- Spring Boot 4.0.2
- Spring Web
- Spring Security
- Spring Data JPA
- Validation
- JWT-based authentication
- File upload support
- Email integration

### Frontend

- React
- JavaScript / TypeScript mix
- Axios for API access
- Framer Motion for motion and transitions

### Infrastructure

- Maven Wrapper for reproducible builds
- Docker multi-stage build
- Render-friendly container startup

## Security Model

Security is handled with a role-aware design:

- Authentication uses JWT.
- Authorization is enforced at the endpoint and service level.
- Public endpoints are limited to intentionally open flows such as login, registration, and contact message submission.
- Admin routes are separated from owner routes.
- Validation is used to reject malformed input before it reaches business logic.

This keeps the API predictable and reduces the chance of unauthorized access or inconsistent state transitions.

## Production-Oriented Design

Several design choices were made to keep the application maintainable and deployment-ready:

- **DTO-based APIs** keep frontend contracts stable even when entities change.
- **Paginated endpoints** prevent unbounded data transfer and reduce memory pressure.
- **Validation-first request handling** catches bad input early.
- **File handling** is isolated in utility and service code rather than mixed into controllers.
- **Email workflows** are handled as part of service orchestration so account and workflow notifications remain consistent.
- **Scheduled/background jobs** are used where appropriate for operational tasks such as reconciliation or periodic checks.
- **Docker support** keeps deployment reproducible and isolates runtime dependencies from build dependencies.

## Main Modules

### Owner Flow

- Registration and login
- Profile completion
- Dashboard overview
- Pet management
- Appointment booking
- Marketplace browsing
- Cart and checkout
- Order history and order details
- Vaccination records

### Admin Flow

- Approval queue for new registrations
- Approved user management
- Appointment slot management
- Product management
- Order status handling
- Contact message inbox
- Dashboard trends and activity feed

### Contact Messages

Contact messages are stored for admin review and workflow management. This allows the admin team to respond from the application instead of relying on a separate external process.

## API Design Notes

The API is organized by domain:

- `/api/auth/**`
- `/api/user/**`
- `/api/admin/**`
- `/api/contact-messages/**`

This keeps the routing predictable and makes authorization rules easier to reason about.

Responses use explicit DTOs rather than raw entities, which helps with:

- stable client contracts
- lower coupling
- safer refactoring
- clearer serialization boundaries

## File Handling

The system supports file uploads for several workflows:

- profile images
- ID proof documents
- product images
- vaccination prescription files

File operations are kept out of controllers and handled in the service layer and file utility code. That makes upload validation, storage, and cleanup easier to test and reuse.

## Email Workflows

Email notifications are used for important account and workflow events such as:

- account approval
- rejection or deletion notices
- appointment notifications
- order-related updates
- contact message replies when applicable

Keeping notification logic in services rather than controllers makes it easier to control transactional behavior and failure handling.

## Database and Pagination

The application uses paginated queries for data-heavy screens such as users, appointments, orders, and products.

Why this matters:

- avoids loading large datasets into memory
- improves response time for admin lists
- keeps UI state manageable
- supports scalable list rendering in the frontend

For charts and dashboard summaries, the backend returns aggregated datasets instead of pushing raw tables to the client.

## Docker

The repository includes a production-oriented multi-stage Docker setup:

- a build stage that uses the Maven Wrapper
- a runtime stage built on a minimal Java 24 JRE image
- a non-root runtime user
- Render-compatible port handling
- `.dockerignore` rules to keep build context lean

If you are deploying on Render, the container should start via the provided entrypoint and read `PORT` from the environment.

## Local Development

### Prerequisites

- Java 24
- Maven Wrapper included in the repo
- Node.js for the frontend
- A relational database

### Backend

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### Frontend

Run the frontend from the frontend project directory using the package manager configured in the repo.


## Configuration

Typical environment-driven settings include:

- database URL, username, and password
- JWT secret and token settings
- mail server credentials
- upload/storage paths
- application profile
- optional runtime port

Keep secrets outside the repository and inject them through environment variables or the deployment platform.

## Suggested Repository Structure

```text
src/main/java/com/petcare/petwellness
├── Config
├── Controller
├── DTO
├── Domain
├── Enums
├── Exceptions
├── Repository
├── Service
├── Util
└── Events
```

## Why This Project Stands Out

This application is structured like a real production service rather than a single demo feature:

- role-based flows are separated cleanly
- data contracts are explicit
- background concerns such as email and file handling are not mixed into controllers
- admin and owner experiences are intentionally different
- pagination and API boundaries are used to keep the system scalable
- Docker support makes the project portable across local and cloud environments


## License

No license has been declared in the repository yet.
