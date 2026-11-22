# Paint Shop Dashboard

Inventory and sales management dashboard for a real paint shop (client work). Arabic RTL interface, built as a single-page app.

Live demo: https://managing-a-paint-shop.vercel.app/

## Features

- Dashboard overview with stock alerts and daily numbers
- Sales and invoices: multi-item invoices, discounts, cash or credit payment, partial payments, invoice edit/delete with automatic stock adjustment
- Inventory and products: paint and supplies categories, stock levels, low-stock alerts, stock movement log (sale / purchase / manual adjustment)
- Customers: regular customers and craftsmen (صنايعي), balances, payments and advances
- Suppliers and purchases: supplier balances, purchase invoices, supplier payments
- Expenses tracking
- Monthly reports
- Audit log of actions
- Full JSON backup: download a complete backup file and restore it on the same device

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui, lucide-react icons
- Data stored in the browser's Local Storage (no backend)

## Getting started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

## Notes and limitations

- All data lives in the browser's Local Storage on the device where it was entered. There is no server, account system, or sync between devices.
- Restoring a backup replaces all current data on that device.
