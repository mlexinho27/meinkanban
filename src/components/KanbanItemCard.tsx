import type { Item } from '../data/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import KanbanItemPriority from './KanbanItemPriority';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import KanbanSheet from './KanbanSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface KanbanItemProps {
  item: Item;
  fetchItems: () => void;
}

function KanbanItem({ item, fetchItems }: KanbanItemProps) {
  const maxLengthTitle: number = 24;
  const maxLengthDescription: number = 70;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleEditClick = () => {
    setShowEditSheet(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `https://hb-kanban-backend.hb-user.workers.dev/items/${item.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`Error deleting item: ${response.statusText}`);
      }

      fetchItems();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Optionally show an error message to the user
      setShowDeleteDialog(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('itemId', item.id.toString());
  };

  return (
    <Card className="mb-2" draggable="true" onDragStart={handleDragStart}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          {item.id} -{' '}
          {item.title.length > maxLengthTitle
            ? item.title.substring(0, maxLengthTitle - 3).concat('...')
            : item.title}
        </CardTitle>
        <div>
          <FontAwesomeIcon
            icon={faPencil}
            onClick={handleEditClick}
            className="cursor-pointer mr-4"
          />
          <FontAwesomeIcon icon={faTrash} onClick={handleDeleteClick} className="cursor-pointer" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm ">
              {item.description.length > maxLengthDescription
                ? item.description.substring(0, maxLengthDescription - 3).concat('...')
                : item.description}
            </p>
          </div>
          <Avatar>
            <AvatarImage />
            <AvatarFallback>{item.assigned_user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <KanbanItemPriority priority={item.priority} />
        <Badge>{item.estimate}</Badge>
      </CardFooter>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* KanbanSheet for editing */}
      <KanbanSheet
        item={item}
        fetchItems={fetchItems}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
      />
    </Card>
  );
}

export default KanbanItem;
