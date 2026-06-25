# SWIYU Ecosystem Portal SCS

## Project Overview
This project is the Self-Service Portal for the SWIYU Ecosystem. It is a full-stack application composed of a Java Spring Boot backend and an Angular frontend. It is built upon the JEAP (Just Enough Architecture Platform) framework, typical for Swiss Federal Administration projects.

## Architecture & Tech Stack

### Backend (`swiyu-ecosystem-portal-service`)
*   **Framework:** Spring Boot (via `jeap-spring-boot-parent`), Java 21.
*   **Build Tool:** Maven.
*   **API Generation:** strictly API-first. Client libraries and server stubs are generated from OpenAPI specifications located in `swiyu-ecosystem-portal-service/specs/` using `openapi-generator-maven-plugin`.
*   **Code Quality:**
    *   **Formatting:** `spotless-maven-plugin` (Prettier, Cleanthat).
    *   **Linting:** `maven-checkstyle-plugin` (Google Checks).
    *   **Testing:** JUnit 5, ArchUnit.
*   **Port:** 8501 (local development).

### Frontend (`swiyu-ecosystem-portal-ui`)
*   **Framework:** Angular 20 (Standalone Components), Angular Material.
*   **UI Library:** Oblique (`@oblique/oblique`).
*   **Build Tool:** NPM, Angular CLI.
*   **API Integration:** Angular services are generated from OpenAPI specs using `openapi-generator-cli`.
*   **Code Quality:**
    *   **Formatting:** Prettier.
    *   **Linting:** ESLint, Angular ESLint.
    *   **Testing:** Jest.
*   **Port:** 4501 (local development).

## Key Directories

*   `swiyu-ecosystem-portal-service/`: Backend source code and configuration.
    *   `specs/`: OpenAPI JSON specifications used for code generation.
    *   `src/main/resources/`: Configuration files (`application.yml`, `application-local.yml`).
*   `swiyu-ecosystem-portal-ui/`: Frontend source code.
    *   `src/app/api/generated/`: Auto-generated API clients (do not edit manually).
    *   `proxy.conf.js`: Development proxy configuration.

## Development Workflow

### Prerequisites
*   **Java:** JDK 21
*   **Node.js:** >= 22.0.0

### Building the Project
To build both the backend and frontend (the frontend is built and copied to `target/classes/static`):
```bash
mvn install
```

### Running Locally

**1. Start the Backend:**
Navigate to the root directory and run:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
*   The backend will run on `http://localhost:8501`.
*   Swagger UI is likely available at `http://localhost:8501/swagger-ui.html` (depending on JEAP config).

**2. Start the Frontend:**
Navigate to `swiyu-ecosystem-portal-ui/` and run:
```bash
npm start
# OR
ng serve
```
*   The frontend will run on `http://localhost:4501`.
*   API requests to `/api` are proxied to `http://localhost:8501`.

### Code Generation & Formatting

**Backend:**
*   **Generate API Code:** `mvn generate-sources`
*   **Format Code:** `mvn spotless:apply`

**Frontend:**
*   To generate the API code the backend needs to be running
*   **Generate API Code:** `npm run generate:api`
*   **Format Code:** `npm run format` (runs lint --fix and prettier)

## Common Tasks

*   **Update API:** If the API changes, update the spec files in `swiyu-ecosystem-portal-service/specs/` (or external sources), then run the generation commands for both backend and frontend.
*   **Testing:**
    *   Backend: `mvn test`
    *   Frontend: `npm test` (runs Jest)
