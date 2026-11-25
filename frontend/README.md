# LNS OMS — Wholesale Food Order Management (Frontend)

Next.js 16 (App Router) + Tailwind CSS v4, converted from the Stitch mockups in
`../stitch_lns_wholesale_oms_dashboard`.

## Scripts

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Folder structure (`src/`)

| Folder        | Purpose |
| ------------- | ------- |
| `app/`        | Routing only. `(main)` group uses the shared sidebar layout, `(print)` group is chrome-less (invoice). Pages fetch data via `services` and render a view. |
| `layouts/`    | `MainLayout` (Sidebar + Header + content) and `PrintLayout`. |
| `views/`      | Page-level screens (the "pages" of the app). Named `views` because Next.js reserves `src/pages` for the Pages Router. |
| `components/` | `ui/` primitives (Icon, Badge, Modal, Pagination, FormField) and feature components (`dashboard`, `orders`, `products`, `inventory`, `purchase-orders`, `invoice`). |
| `constants/`  | Routes, sidebar navigation, status → style maps, app info, `mock-data/`. |
| `services/`   | Data access (currently returns mock data — replace with API calls). |
| `interfaces/` | TypeScript domain types. |
| `hooks/`      | `useDisclosure`, `usePagination`, `useSelection`. |
| `stores/`     | Zustand stores (`useAuthStore`). |
| `styles/`     | `globals.css` — design tokens (`@theme`) from DESIGN.md. |
| `utils/`      | `cn`, formatting, stock/order helpers. |

## Routes

| Route | Screen |
| ----- | ------ |
| `/dashboard` | Operations dashboard |
| `/orders` | Orders list (tabs, channel filter, search, bulk select, pagination) |
| `/orders/[orderId]` | Order detail |
| `/orders/[orderId]/invoice` | Printable invoice (no sidebar) |
| `/products` | Products catalogue (search + brand/status filters) |
| `/inventory` | Inventory on hand / stock history + Stock In & Damaged modals |
| `/purchase-orders` | PO register + create PO card |
