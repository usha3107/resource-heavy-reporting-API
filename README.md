# Resource-Heavy Reporting API with the Proxy Pattern

A RESTful API built with TypeScript and Express that implements the **Virtual Proxy** and **Protection Proxy** structural design patterns.

## Overview & Architecture

Certain objects in enterprise software are expensive to create (e.g. high memory footprint, complex DB aggregations, network latency). Instantiating these objects prematurely leads to high startup latency and degraded server performance.

This project solves these issues using two key Proxy design patterns:
1. **Virtual Proxy (`VirtualReportProxy`)**: Defers instantiation of `HeavyReportGenerator` until its `generate()` method is explicitly invoked (lazy initialization) and caches the instance for subsequent calls.
2. **Protection Proxy (`ProtectionReportProxy`)**: Controls access based on user roles (`admin`, `manager`, `guest`). It rejects unauthorized requests with `403 Forbidden` without creating or calling the underlying `HeavyReportGenerator`.

### Proxy Chaining Architecture
```
Client Request -> API Controller -> Protection Proxy -> Virtual Proxy -> HeavyReportGenerator (Real Subject)
```

## Core Components

- **`Report` Interface (`src/core/Report.ts`)**: Common contract for proxies and the real subject.
- **`HeavyReportGenerator` (`src/core/HeavyReportGenerator.ts`)**: Real subject that simulates expensive initialization by calling `MetricsTracker.increment()` inside its constructor.
- **`MetricsTracker` (`src/core/MetricsTracker.ts`)**: Singleton counter that tracks total heavy object instantiations.
- **`VirtualReportProxy` (`src/proxies/VirtualReportProxy.ts`)**: Manages lazy initialization and instance caching.
- **`ProtectionReportProxy` (`src/proxies/ProtectionReportProxy.ts`)**: Enforces access control, throwing `AccessDeniedError` on unauthorized role access.

## Directory Structure

```
project-root/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── metricsController.ts
│   │   │   └── reportsController.ts
│   │   ├── server.ts
│   │   └── store.ts
│   ├── core/
│   │   ├── HeavyReportGenerator.ts
│   │   ├── MetricsTracker.ts
│   │   └── Report.ts
│   └── proxies/
│       ├── ProtectionReportProxy.ts
│       └── VirtualReportProxy.ts
├── tests/
│   └── proxyPattern.test.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── .env.example
```

## Seeded Data

On application startup, three reports are initialized as proxies:
- `report-1`: Title `"Financial Q1"`, Requires role: `admin`
- `report-2`: Title `"User Analytics"`, Requires role: `manager`
- `report-3`: Title `"System Status"`, Requires role: `guest`

## API Reference

### Health Check
- **`GET /health`**
  - Response `200 OK`: `{ "status": "ok" }`

### Metrics Endpoints
- **`GET /api/metrics`**
  - Response `200 OK`: `{ "total_instantiations": 0 }`
- **`POST /api/metrics/reset`**
  - Response `200 OK`: `{ "message": "Metrics reset successfully" }`

### Reports Endpoints
- **`GET /api/reports`**
  - Description: Returns metadata for all reports without instantiating heavy subjects.
  - Response `200 OK`:
    ```json
    [
      { "id": "report-1", "title": "Financial Q1", "required_role": "admin" },
      { "id": "report-2", "title": "User Analytics", "required_role": "manager" },
      { "id": "report-3", "title": "System Status", "required_role": "guest" }
    ]
    ```
- **`GET /api/reports/:id/generate?role=<role>`**
  - Query Params: `role` (required)
  - Success `200 OK`:
    ```json
    {
      "id": "report-3",
      "content": "Report content for System Status"
    }
    ```
  - Unauthorized `403 Forbidden`:
    ```json
    { "error": "Access Denied" }
    ```
  - Not Found `404 Not Found`:
    ```json
    { "error": "Report not found" }
    ```

## Local Setup & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Tests
```bash
npm test
```

### 3. Build & Run Locally
```bash
npm run build
npm start
```

## Docker Compose Setup

Run the application using Docker Compose on port 8080:

```bash
docker-compose up -d --build
```

Verify container health and API:
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/reports
```
