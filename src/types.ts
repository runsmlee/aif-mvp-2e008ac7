export type ItemCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type ItemCategory = 'Power Tools' | 'Hand Tools' | 'Garden' | 'Household';

export type ItemStatus = 'available' | 'lent' | 'overdue';

export interface BorrowRecord {
  borrowerName: string;
  borrowDate: string;
  returnDate: string;
}

export interface ToolItem {
  id: string;
  name: string;
  category: ItemCategory;
  condition: ItemCondition;
  notes: string;
  borrow: BorrowRecord | null;
}

export type StatusFilter = 'all' | 'available' | 'lent' | 'overdue';

export const CATEGORIES: ItemCategory[] = ['Power Tools', 'Hand Tools', 'Garden', 'Household'];

export const CONDITIONS: ItemCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];

export function getItemStatus(item: ToolItem): ItemStatus {
  if (!item.borrow) return 'available';
  if (item.borrow.returnDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.borrow.returnDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) return 'overdue';
  }
  return 'lent';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
