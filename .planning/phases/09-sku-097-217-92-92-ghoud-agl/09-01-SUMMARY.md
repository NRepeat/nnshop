---
phase: 09-sku-097-217-92-92-ghoud-agl
plan: "01"
subsystem: checkout
tags: [checkout, receipt, payment, shipping, fee-removal]
dependency_graph:
  requires: []
  provides: [checkout-no-shipping-fee]
  affects: [OrderSummary, Payment]
tech_stack:
  added: []
  patterns: []
key_files:
  modified:
    - src/features/checkout/receipt/ui/OrderSummary.tsx
    - src/features/checkout/payment/ui/Payment.tsx
decisions:
  - grandTotal = totalAmount (no shippingFee) in OrderSummary — shipping removed from receipt sidebar per user decision
  - cartAmount = goodsTotal (no shippingFee) in Payment — payment amount no longer includes shipping calculation
metrics:
  duration: 5 min
  completed_date: "2026-03-04"
  tasks_completed: 2
  files_modified: 2
---

# Phase 09 Plan 01: Remove Shipping Fee from Checkout Summary

**One-liner:** Removed shipping fee (20 + 2% formula) from receipt sidebar and payment amount so totals show goods cost only.

## What Was Done

Removed the `shippingFee` variable and its associated UI row from two checkout files:

1. **OrderSummary.tsx** — The receipt sidebar no longer computes or displays a shipping row. `grandTotal` is now assigned directly from `totalAmount` (which is either the znizka-discounted subtotal or Shopify's authoritative total when a discount code is applied). The `<div>` block showing the shipping label and formatted fee was deleted.

2. **Payment.tsx** — The `cartAmount` passed to `PaymentForm` is now set to `goodsTotal` directly, without adding the `shippingFee` (previously `Math.round(20 + goodsTotal * 0.02)`). LiqPay will receive the goods-only amount.

## Tasks

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Remove shipping fee from OrderSummary receipt sidebar | Done | 99c16b8 |
| 2 | Remove shipping fee from Payment.tsx cart amount | Done | 1e7f8ae |

## Verification

- `grep -rn "shippingFee" src/features/checkout/` — no results
- `npx tsc --noEmit` — no TypeScript errors
- `grandTotal = totalAmount` confirmed in OrderSummary.tsx (line 181)
- `cartAmount = goodsTotal` confirmed in Payment.tsx (line 58)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/features/checkout/receipt/ui/OrderSummary.tsx — modified, committed 99c16b8
- src/features/checkout/payment/ui/Payment.tsx — modified, committed 1e7f8ae
- No shippingFee references remain in checkout feature directory
- TypeScript check: 0 errors
