# Money Manager

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Dashboard with balance summary (total income, expenses, net balance)
- Transaction list with categories (Food, Transport, Shopping, Health, Entertainment, Salary, Other)
- Add transaction form (amount, type income/expense, category, note, date)
- Edit and delete transactions
- Monthly filter to view transactions by month
- Category breakdown with simple visual summary
- Persistent storage via backend canister

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store transactions with fields (id, amount, type, category, note, date, createdAt)
2. Backend: CRUD operations - addTransaction, getTransactions, updateTransaction, deleteTransaction
3. Frontend: mobile-first layout mimicking Android app feel
4. Dashboard screen: balance card, income/expense totals, recent transactions
5. Transactions screen: full list with filter by month
6. Add/Edit modal: form with all fields
7. Category icons and color coding
