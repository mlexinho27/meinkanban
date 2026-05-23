import type { Item } from '../data/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import KanbanItem from './KanbanItem';

interface KanbanSheetProps {
  item?: Item; // Optional item prop for editing
  fetchItems: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function KanbanSheet({ item, fetchItems, open, onOpenChange }: KanbanSheetProps) {
  const handleSave = () => {
    onOpenChange(false); // Close the sheet
    fetchItems(); // Refresh the items
  };

  const handleCancel = () => {
    onOpenChange(false); // Close the sheet
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Only show trigger button if not in edit mode (item prop is not provided) */}
      {!item && (
        <SheetTrigger asChild>
          <Button>Add New Item</Button>
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <div>
            <SheetTitle>{item ? 'Edit Kanban Item' : 'Create New Kanban Item'}</SheetTitle>
            <SheetDescription>
              {item
                ? 'Edit the details for the item and save the changes.'
                : 'Fill in the details for the new item and save it to the board.'}
            </SheetDescription>
          </div>
        </SheetHeader>
        <KanbanItem item={item} onSave={handleSave} onCancel={handleCancel} />
      </SheetContent>
    </Sheet>
  );
}

export default KanbanSheet;
