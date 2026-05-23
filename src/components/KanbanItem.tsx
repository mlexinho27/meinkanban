import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import KanbanItemPriority from './KanbanItemPriority';
import type { Item } from '../data/types';


interface ItemData {
  title: string;
  description?: string;
  type: "User Story" | "Defect" | "Task";
  estimate: number;
  state: "Open" | "In Progress" | "In Validation" | "Done";
  assigned_user: string;
  priority: "High" | "Middle" | "Low";
}

interface KanbanItemProps {
  item?: Item; // Optional item prop for editing
  onSave: () => void;
  onCancel: () => void;
}

// Helper: leitet den initialen Form-State aus dem (optionalen) Item ab
function getInitialData(item?: Item): ItemData {
  if (item) {
    return {
      title: item.title,
      description: item.description,
      type: item.type,
      estimate: item.estimate,
      state: item.state,
      assigned_user: item.assigned_user,
      priority: item.priority,
    };
  }
  return {
    title: '',
    description: '',
    type: 'User Story',
    estimate: 1,
    state: 'Open',
    assigned_user: '',
    priority: 'Low',
  };
}

function KanbanItem({ item, onSave, onCancel }: KanbanItemProps) {
  // State direkt aus der Prop initialisieren (lazy initializer)
  const [itemData, setItemData] = useState<ItemData>(() => getInitialData(item));

  // "Previous prop"-Pattern: bei Wechsel der Item-ID State während des Renders neu setzen.
  // Das ersetzt den useEffect und vermeidet den Cascading-Render.
  const [prevItemId, setPrevItemId] = useState<Item['id'] | undefined>(item?.id);
  if (item?.id !== prevItemId) {
    setPrevItemId(item?.id);
    setItemData(getInitialData(item));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setItemData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setItemData(prev => ({ ...prev, [id]: parseInt(value, 10) || 0 }));
  };

  const handleSelectChange = (id: keyof ItemData, value: ItemData[keyof ItemData]) => {
    setItemData(prev => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (!itemData.title || itemData.title.length > 80) {
      toast.error("Title is required and must be less than 80 characters.");
      return false;
    }
    if (itemData.description && itemData.description.length > 6000) {
      toast.error("Description must be less than 6000 characters.");
      return false;
    }
    if (!itemData.type || !["User Story", "Defect", "Task"].includes(itemData.type)) {
      toast.error("Invalid item type.");
      return false;
    }
    if (itemData.estimate < 1 || itemData.estimate > 100) {
      toast.error("Estimate must be between 1 and 100.");
      return false;
    }
    if (!itemData.state || !["Open", "In Progress", "In Validation", "Done"].includes(itemData.state)) {
      toast.error("Invalid item state.");
      return false;
    }
    if (!itemData.assigned_user || itemData.assigned_user.length > 60) {
      toast.error("Assigned user is required and must be less than 60 characters.");
      return false;
    }
    if (!itemData.priority || !["High", "Middle", "Low"].includes(itemData.priority)) {
      toast.error("Invalid priority.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const url = item
        ? `https://hb-kanban-backend.hb-user.workers.dev/items/${item.id}`
        : 'https://hb-kanban-backend.hb-user.workers.dev/items';
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Item saved:', result);
      toast.success(`Item ${item ? 'updated' : 'created'} successfully!`);
      onSave();

    } catch (error: unknown) {
      console.error('Error saving item:', error);
      toast.error(`Failed to save item: ${(error as Error).message}`);
    }
  };

  return (
    <div className="grid gap-4 py-4 px-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={itemData.title} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={itemData.description} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <Select value={itemData.type} onValueChange={(value: "User Story" | "Defect" | "Task") => handleSelectChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="User Story">User Story</SelectItem>
            <SelectItem value="Defect">Defect</SelectItem>
            <SelectItem value="Task">Task</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="estimate">Estimate</Label>
        <Input id="estimate" type="number" value={itemData.estimate} onChange={handleNumberInputChange} min="1" max="100" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="state">State</Label>
        <Select value={itemData.state} onValueChange={(value: "Open" | "In Progress" | "In Validation" | "Done") => handleSelectChange('state', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="In Validation">In Validation</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assigned_user">Assigned User</Label>
        <Input id="assigned_user" value={itemData.assigned_user} onChange={handleInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={itemData.priority} onValueChange={(value: "High" | "Middle" | "Low") => handleSelectChange('priority', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High"><KanbanItemPriority priority={"High"}/> - High</SelectItem>
            <SelectItem value="Middle"><KanbanItemPriority priority={"Middle"}/> - Middle</SelectItem>
            <SelectItem value="Low"><KanbanItemPriority priority={"Low"}/> - Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default KanbanItem;