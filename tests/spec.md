# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### App.test.tsx
- [ ] renders the ToolShelf header and empty state message when no items exist
- [ ] renders the item list when items are present in storage
- [ ] displays the availability dashboard with correct counts per status

### ItemForm.test.tsx
- [ ] renders all input fields (name, category, condition, notes) and submit button
- [ ] submits a valid item and calls onAdd callback with correct data
- [ ] shows validation error when item name is empty on submit
- [ ] resets the form after successful submission

### ItemCard.test.tsx
- [ ] renders item name, category, condition, and status badge
- [ ] shows "Available" badge for items with no borrower
- [ ] shows "Lent to [name]" badge and return date for borrowed items
- [ ] shows "Overdue" badge when return date is in the past
- [ ] borrow button opens inline borrow form
- [ ] return button resets item to available status
- [ ] edit button enables inline editing mode
- [ ] delete button removes item and calls onDelete callback

### BorrowForm.test.tsx
- [ ] renders borrower name input and optional return date input
- [ ] shows validation error when borrower name is empty on submit
- [ ] calls onBorrow with borrower name and return date on valid submit
- [ ] cancel button hides the form without submitting

### Dashboard.test.tsx
- [ ] displays total item count
- [ ] displays available item count with correct badge color
- [ ] displays lent item count with correct badge color
- [ ] displays overdue item count with correct badge color
- [ ] clicking a status filter calls onFilter callback

### SearchBar.test.tsx
> **REMOVED** — Search feature (Should Have) was cut to simplify scope. Not implemented.

### Print View
> **REMOVED** — Print View feature (Should Have) was cut to simplify scope. Not implemented.

### DataManagement.test.tsx
- [ ] export button triggers download of JSON file
- [ ] exported JSON contains all items from current state
- [ ] import button opens file picker
- [ ] importing valid JSON replaces current items
- [ ] importing invalid JSON displays error toast/message

### useLocalStorage.test.ts
- [ ] returns initial value when localStorage is empty
- [ ] returns stored value when localStorage has data
- [ ] updates localStorage when setValue is called
- [ ] handles JSON parse errors gracefully

## User Journey Tests

### Primary Workflow: Add and Borrow an Item
1. App loads → empty state message displayed, dashboard shows 0 items
2. User clicks "Add Item" → item form appears with empty fields
3. User types "Power Drill", selects "Power Tools" category, selects "Good" condition → form fields populated
4. User clicks "Add" → item appears in list with "Available" badge, dashboard updates to 1 available
5. User clicks "Borrow" on the item → inline borrow form appears
6. User types "Maria", selects tomorrow as return date → fields populated
7. User clicks "Confirm" → item shows "Lent to Maria" badge with return date, dashboard updates
8. User refreshes page → all data persists, item still shows as lent to Maria

### Secondary Workflow: Export and Import Data
1. User has 3 items in inventory (1 available, 1 lent, 1 overdue)
2. User clicks "Export" → JSON file downloads containing all 3 items
3. User opens new browser/incognito window → app loads with empty state
4. User clicks "Import" → file picker opens
5. User selects the exported JSON → all 3 items appear with correct statuses

### Edge Case: Overdue Detection
1. User borrows an item with a return date set to yesterday
2. App loads → item displays "Overdue" badge in distinct warning color
3. Dashboard overdue count is 1

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md Must Have features)
- [ ] AC: User can add a new item in under 10 seconds; items appear in the list immediately; editing and deleting items works without page reload.
- [ ] AC: Borrowing an item updates its status to "Lent" with borrower name visible; returning an item resets it to "Available"; all state changes persist in localStorage.
- [ ] AC: Dashboard shows item counts per status; filtering updates the list in real-time; overdue items (past return date) are visually flagged.
- [ ] AC: Exported JSON contains all items with their current status; importing a valid JSON file replaces current data; invalid JSON shows a clear error message.
- [ ] AC: Refreshing the page preserves all items and their statuses; clearing and re-importing data restores full state.
