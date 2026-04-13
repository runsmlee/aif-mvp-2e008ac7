# ToolShelf — Product Requirements Document

## Problem
Neighbors frequently need tools for one-off projects (drill, ladder, pressure washer) but buying them is wasteful. Existing lending platforms require accounts, store data on remote servers, and introduce friction that kills adoption. People need a dead-simple way to share what they have and see what's available — with zero barriers to entry and full control over their own data.

## Target Users
Neighbors in residential communities (apartment buildings, cul-de-sacs, co-ops) who want to share tools and household items informally. Typically one "organizer" maintains the shelf on a shared device (tablet in a lobby, link shared in a group chat) and neighbors borrow/return on the honor system.

## Core Features

### Must Have
- **Item Inventory**: Add, edit, and remove lendable items with name, category, condition, and optional notes — Acceptance Criteria: User can add a new item in under 10 seconds; items appear in the list immediately; editing and deleting items works without page reload.

- **Borrow & Return Tracking**: Mark any item as borrowed by entering a borrower name and optional return date; mark items as returned — Acceptance Criteria: Borrowing an item updates its status to "Lent" with borrower name visible; returning an item resets it to "Available"; all state changes persist in localStorage.

- **Availability Dashboard**: Filter and view items by status (Available / Lent / Overdue) with at-a-glance visibility — Acceptance Criteria: Dashboard shows item counts per status; filtering updates the list in real-time; overdue items (past return date) are visually flagged.

- **Data Export & Import**: Export all inventory data as a JSON file; import a JSON file to restore or sync inventory — Acceptance Criteria: Exported JSON contains all items with their current status; importing a valid JSON file replaces current data; invalid JSON shows a clear error message.

- **Persistent Storage**: All data saved to localStorage automatically on every change — Acceptance Criteria: Refreshing the page preserves all items and their statuses; clearing and re-importing data restores full state.

### Should Have
- **Category Organization**: Items grouped by category (Power Tools, Hand Tools, Garden, Household) — Acceptance Criteria: User can assign a category when adding/editing; filter bar allows selecting one or more categories.

- **Search**: Instant text search across item names and notes — Acceptance Criteria: Typing in the search box filters the item list in real-time with no perceptible lag; search clears when the input is emptied.

- **Print View**: Generate a clean, printable summary of available items for posting in shared physical spaces — Acceptance Criteria: Print view opens in a new tab with a formatted list; only "Available" items are shown by default; print triggers the browser print dialog.

### Out of Scope (v1)
- User accounts or authentication of any kind — contradicts the core zero-account value proposition.
- Real-time multi-device sync — requires a backend; v1 relies on export/import and shared-device usage.
- Notifications or reminders — adds complexity; v1 uses visual overdue flags only.
- Image uploads for items — storage and bandwidth concerns for a local-first app.

## Success Metrics
- Primary: User adds first item and completes a borrow/return cycle in under 60 seconds.
- Secondary: User successfully exports and re-imports data without data loss.

## Design Principles
- **Zero learning curve**: A new user should understand the interface within 5 seconds of seeing it.
- **Honor-system transparency**: All actions are visible and undoable; nothing is hidden behind menus or modals.
- **Portable by design**: The app must work fully offline and the data must be easily movable between devices.
