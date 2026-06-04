# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### App.test.tsx
- [x] renders the ToolShelf header and pre-populated example items on first load
- [x] renders the item list when items are present in storage
- [x] displays the availability dashboard with correct counts per status
- [x] renders empty state when all items are deleted

### ItemForm.test.tsx
- [x] renders all input fields (name, category, condition) and submit button
- [x] submits a valid item and calls onAdd callback with correct data
- [x] shows validation error when item name is empty on submit
- [x] resets the form after successful submission

### ItemCard.test.tsx
- [x] renders item name, category, condition, and status badge
- [x] shows "Available" badge for items with no borrower
- [x] shows "Lent to [name]" badge and return date for borrowed items
- [x] shows "Overdue" badge when return date is in the past
- [x] borrow button opens inline borrow form
- [x] return button resets item to available status
- [x] edit button enables inline editing mode
- [x] delete button removes item and calls onDelete callback

### BorrowForm.test.tsx
- [x] renders borrower name input and optional return date input
- [x] shows validation error when borrower name is empty on submit
- [x] calls onBorrow with borrower name and return date on valid submit
- [x] cancel button hides the form without submitting

### Dashboard.test.tsx
- [x] displays total item count
- [x] displays available item count with correct badge color
- [x] displays lent item count with correct badge color
- [x] displays overdue item count with correct badge color
- [x] clicking a status filter calls onFilter callback

### SearchBar.test.tsx
> **REMOVED** — Search feature (Should Have) was cut to simplify scope. Not implemented.

### Print View
> **REMOVED** — Print View feature (Should Have) was cut to simplify scope. Not implemented.

### Notes Field
> **REMOVED** — Notes field was cut to simplify the item model. Items now have name, category, and condition only.

### DataManagement.test.tsx
- [x] renders export and import buttons
- [x] export button creates JSON blob with all items
- [x] import button opens file picker by clicking hidden file input
- [x] importing valid JSON calls onImport with parsed items
- [x] importing invalid JSON calls onError with message

### useLocalStorage.test.ts
- [x] returns initial value when localStorage is empty
- [x] returns stored value when localStorage has data
- [x] updates localStorage when setValue is called
- [x] handles JSON parse errors gracefully

## User Journey Tests

### Primary Workflow: Add and Borrow an Item
1. App loads → example items displayed, dashboard shows 3 items
2. User clicks "Add Item" → item form appears with empty fields
3. User types "Power Drill", selects "Power Tools" category, selects "Good" condition → form fields populated
4. User clicks "Add" → item appears in list with "Available" badge, dashboard updates
5. User clicks "Lend Out" on the item → inline borrow form appears
6. User types "Maria", selects tomorrow as return date → fields populated
7. User clicks "Confirm" → item shows "Lent to Maria" badge with return date, dashboard updates
8. User refreshes page → all data persists, item still shows as lent to Maria

### Secondary Workflow: Export and Import Data
1. User has 3 items in inventory (2 available, 1 lent)
2. User clicks "Export" → JSON file downloads containing all 3 items
3. User opens new browser/incognito window → app loads with example items
4. User clicks "Import" → file picker opens
5. User selects a valid JSON → items are replaced with imported data

### Edge Case: Overdue Detection
1. User borrows an item with a return date set to yesterday
2. App loads → item displays "Overdue" badge in distinct warning color
3. Dashboard overdue count is 1

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md Must Have features)
- [x] AC: User can add a new item in under 10 seconds; items appear in the list immediately; editing and deleting items works without page reload.
- [x] AC: Borrowing an item updates its status to "Lent" with borrower name visible; returning an item resets it to "Available"; all state changes persist in localStorage.
- [x] AC: Dashboard shows item counts per status; filtering updates the list in real-time; overdue items (past return date) are visually flagged.
- [x] AC: Exported JSON contains all items with their current status; importing a valid JSON file replaces current data; invalid JSON shows a clear error message.
- [x] AC: Refreshing the page preserves all items and their statuses; clearing and re-importing data restores full state.
