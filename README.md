\# LNS OMS — Order \& Inventory Management System



MVP 1.0 of the Order Management System (Phase 1 of an ERP project) for a wholesale food distributor. Submission for \*\*SDL Intern Software Engineer 2026\*\*.



\- \*\*Live demo:\*\* https://his-crm-system.vercel.app



> The backend runs on Render's free tier; the first request may take about 1 minute to wake it up.



\## Problem \& Solution



The company sells via wholesale invoices and marketplaces (Walmart, Amazon), while the warehouse tracks stock in a personal Excel file. Orders are scattered, stock is updated by hand, and stock-outs are found too late.



LNS OMS puts all orders in one place and updates stock automatically: shipping an order deducts stock, receiving a purchase order adds stock, and every movement is logged in an inventory ledger that replaces the Excel file.



\## Features



| Module | Description |

|---|---|

| Dashboard | Today's orders, shipping backlog, revenue, low-stock products |

| Orders | Wholesale / Walmart / Amazon orders, manual entry or CSV import, ship, cancel |

| Invoices | Generated from an order (`NEW` or `SHIPPED`), printable |

| Products | Catalogue with SKU, pack size, price per carton, minimum stock |

| Inventory | Stock levels, movement history (IN / OUT / DAMAGED), damaged goods |

| Purchase Orders | Restock low items, mark as received to add stock |

| Role switcher | Act as Sales, Warehouse or Manager |



\## Key Business Rules



\- Only `NEW` orders can be shipped or canceled.

\- Shipping is blocked if any line lacks stock; the order stays `NEW` and can be shipped again after restocking.

\- Shipping deducts stock, logs `OUT` and sets `SHIPPED` in one database transaction.

\- Receiving a PO adds stock and logs `IN`; damaged goods require a reason and log `DAMAGED`.

\- Stock never goes negative; products below minimum stock are flagged as low stock.



\## Tech Stack



| Layer | Technology | Why |

|---|---|---|

| Frontend | Next.js, Tailwind CSS | Fast to build, one-click deploy on Vercel |

| Backend | Java 21, Spring Boot 3, Spring Data JPA | `@Transactional` keeps stock, ledger and order status consistent |

| Database | PostgreSQL | Relational data that needs ACID transactions |

| Deploy | Vercel (frontend), Render + Docker (backend, database) | Free tier, auto-deploy on push |



Architecture: `Next.js (Vercel) → REST API (Spring Boot, Render) → PostgreSQL (Render)`



\## Project Structure



```

backend/    Spring Boot REST API (Dockerfile included)

frontend/   Next.js app

.env.example

docker-compose.yml

```



\## Run Locally



```bash

git clone https://github.com/DoNamQuang-SE192987/HIS\_CRM\_System.git



\# Backend — set env vars from .env.example first

cd backend

./mvnw spring-boot:run        # http://localhost:8080/swagger-ui.html



\# Frontend

cd frontend

npm install

npm run dev                   # http://localhost:3000

```



Tables are created automatically and the product catalogue is seeded on first start.



| Variable | Description |

|---|---|

| `DB\_URL`, `DB\_USERNAME`, `DB\_PASSWORD` | PostgreSQL connection (backend) |

| `CORS\_ALLOWED\_ORIGINS` | Allowed frontend origins (backend) |

| `NEXT\_PUBLIC\_API\_URL` | Backend base URL (frontend) |



\## Demo Scenario



1\. Dashboard: check low-stock products.

2\. Create an order and \*\*Ship\*\* it: stock drops, an `OUT` row is logged. Print its invoice.

3\. Ship an order larger than the stock: it is rejected and stays `NEW`.

4\. Create a purchase order and \*\*mark it received\*\*: stock goes up. Ship the order from step 3 again: it succeeds.

5\. Record damaged goods in Inventory: stock drops, a `DAMAGED` row is logged.



\## Roadmap



Authentication and real permissions · reorder suggestions from sales velocity · batch and expiry tracking (FEFO) · Walmart / Amazon API integration.



\## Author



\*\*Đỗ Nam Quang\*\* — \[GitHub](https://github.com/DoNamQuang-SE192987) 

