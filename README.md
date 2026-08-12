# ⌁ WebLog Telemetry & Observability Dashboard

> A high-performance, real-time HTTP log analytics and host infrastructure hardware observability dashboard inspired by Datadog and Grafana. Built with **ASP.NET Core 10**, **Angular 21**, **ClickHouse**, and **Docker**.

---

## 🌟 Key Features

- 📊 **Real-Time Traffic Analytics**: Monitor daily traffic trends, hourly distribution, request rates, and data volume transfers.
- 🖥️ **Host Infrastructure Health**: Dedicated host hardware monitoring for cluster nodes (`web-01`, `web-02`, `proxy-east`, `api-gateway`) displaying live CPU %, RAM Memory %, and Storage Disk % utilization.
- 🚀 **ClickHouse Analytical Engine**: Lightning-fast SQL aggregations over millions of access log records.
- ⚡ **Dual-Port Automatic Failover**: Resilient API client with automatic failover between local development (`:5268`) and Docker container (`:5072`) environments.
- 🎨 **Production Glassmorphic Design**: Sleek dark/light theme toggle, optional animated video background, responsive Datadog-style left sidebar, and animated hardware progress meters.
- 📱 **Mobile & Bandwidth Optimized**: Video unmounting controls and responsive CSS media query rules to optimize mobile data consumption.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 21 (Standalone Components), Chart.js, RxJS, Vanilla SCSS |
| **Backend API** | ASP.NET Core 10 Web API, C# Dapper ORM |
| **Database** | ClickHouse Columnar Database (Port `8123`) |
| **Infrastructure** | Docker, Docker Compose |

---

## 📐 Architecture Overview

```text
  [ User Browser / Angular 21 UI ]
                │
                │ (HTTP / REST API)
                ▼
  [ ASP.NET Core 10 Web API ]
                │
                │ (Dapper SQL Queries)
                ▼
  [ ClickHouse Columnar Database ] ──► (Stores weblogs.access_logs)
```

---

## 🚀 Quickstart Guide

### Prerequisites
- [Docker Desktop](https://www.docker.com/)
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js (v18+) & Angular CLI](https://angular.dev/)

### 1. Clone the Repository
```bash
git clone https://github.com/lingesh-bit/weblog-dashboard.git
cd weblog-dashboard
```

### 2. Launch Infrastructure with Docker Compose
```bash
docker compose up -d
```
*This starts the ClickHouse analytical database on port `8123` and the backend API container on port `5072`.*

### 3. Run Frontend Development Server
```bash
cd weblog-dashboard
npm install
npm start
```
Open **`http://localhost:4200`** in your browser.

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/analytics/daily-traffic` | `GET` | Aggregated request volume by date |
| `/api/analytics/hourly-traffic` | `GET` | 24-hour traffic distribution |
| `/api/analytics/top-paths?limit=8` | `GET` | Top requested HTTP URL paths |
| `/api/analytics/status-breakdown` | `GET` | HTTP response status codes (200, 404, 500, etc.) |
| `/api/analytics/top-hosts?limit=8` | `GET` | Top requesting client IP hosts |
| `/api/analytics/error-rate` | `GET` | 4xx/5xx HTTP error rates over time |
| `/api/analytics/host-health` | `GET` | Live cluster hardware metrics (CPU, RAM, Disk) |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
