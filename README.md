# Smart City Waste Collection Management System

A full-stack waste reporting and collection management platform built using React, Spring Boot microservices, and PostgreSQL.

## Features

- Submit and view waste reports.
- Categorize reports by waste type.
- Track report status: `REPORTED`, `IN_PROGRESS`, and `RESOLVED`.
- View dashboard statistics and recent reports.
- Store report data in PostgreSQL.
- Discover and register microservices using Eureka.

## Technology Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Java, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL
- **Microservices:** Eureka Server, API Gateway, User Service, Waste Service
- **Tools:** VS Code, Maven, Git, GitHub, Postman

## Services and Ports

| Component | Port |
|---|---:|
| Frontend | 5173 |
| API Gateway | 8080 |
| User Service | 8081 |
| Waste Service | 8082 |
| Eureka Server | 8761 |

## Running the Project

1. Start PostgreSQL and configure the database credentials using local environment variables.
2. Start the Eureka Server.
3. Start the User Service and Waste Service.
4. Start the API Gateway.
5. In the `frontend` directory, run `npm install`, followed by `npm run dev`.
6. Open `http://localhost:5173`.

Configure each service's database connection before starting it. Never commit passwords, tokens, or other secrets.

## Repository Structure

- `backend/` — Spring Boot microservices
- `frontend/` — React user interface
- `.gitignore` — Excludes local configuration and build artifacts

## Project Purpose

This project demonstrates a microservices-based approach to reporting waste collection issues and tracking their resolution for a smart city environment.