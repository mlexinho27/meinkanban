import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../data/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import KanbanItemCard from './KanbanItemCard';
import KanbanSheet from './KanbanSheet';

const API_BASE = 'https://hb-kanban-backend.hb-user.workers.dev';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Reine Fetch-Logik – kein React-State, kein Side-Effect-Toast.
// Dadurch kann der useEffect setState in .then/.catch/.finally machen,
// was der Lint-Regel als "subscribe to external system" durchgeht.
async function fetchItemsFromApi(signal?: AbortSignal): Promise<Item[]> {
  const response = await fetch(`${API_BASE}/items`, { signal });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return (await response.json()) as Item[];
}

function KanbanBoard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItemSheet, setShowNewItemSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refetch-Helper für Kind-Komponenten (KanbanSheet, KanbanItemCard) und handleDrop.
  // useCallback hält die Referenz stabil → keine unnötigen Re-Renders der Kinder.
  const fetchItems = useCallback(async () => {
    try {
      const data = await fetchItemsFromApi();
      setItems(data);
      setError(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(`Failed to reload items: ${msg}`);
    }
  }, []);

  // Initial load: setState läuft in Callbacks (.then/.catch/.finally), nicht
  // synchron im Effect-Body → Lint zufrieden. AbortController kümmert sich
  // um Cleanup, falls die Komponente vor Antwort unmountet.
  useEffect(() => {
    const controller = new AbortController();

    fetchItemsFromApi(controller.signal)
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleDrop = async (e: React.DragEvent, newState: Item['state']) => {
    const itemIdStr = e.dataTransfer.getData('itemId');
    if (!itemIdStr) return;
    const itemId = parseInt(itemIdStr, 10);

    const itemToMove = items.find((it) => it.id === itemId);
    if (!itemToMove || itemToMove.state === newState) return;

    const originalState = itemToMove.state;

    // Optimistisches Update – funktionale Form vermeidet stale closures
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, state: newState } : it)));

    try {
      const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemToMove, state: newState }),
      });

      if (!response.ok) {
        throw new Error(`Error updating item state: ${response.status}`);
      }

      toast.success(`Item ${itemId} moved to ${newState}`);
      void fetchItems(); // Konsistenz-Refresh
    } catch (err: unknown) {
      console.error('Error updating item state:', err);
      toast.error(`Failed to move item ${itemId}: ${getErrorMessage(err)}`);
      // Rollback
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, state: originalState } : it)),
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderItemsByState = (state: Item['state']) => {
    return items
      .filter((item) => item.state === state)
      .map((item) => <KanbanItemCard key={item.id} item={item} fetchItems={fetchItems} />);
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <KanbanSheet
            fetchItems={fetchItems}
            open={showNewItemSheet}
            onOpenChange={setShowNewItemSheet}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="bg-gray-100 p-4 rounded"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Open')}
          >
            <h2 className="text-xl font-semibold mb-3">Open</h2>
            {renderItemsByState('Open')}
          </div>
          <div
            className="bg-gray-100 p-4 rounded"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'In Progress')}
          >
            <h2 className="text-xl font-semibold mb-3">In Progress</h2>
            {renderItemsByState('In Progress')}
          </div>
          <div
            className="bg-gray-100 p-4 rounded"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'In Validation')}
          >
            <h2 className="text-xl font-semibold mb-3">In Validation</h2>
            {renderItemsByState('In Validation')}
          </div>
          <div
            className="bg-gray-100 p-4 rounded"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Done')}
          >
            <h2 className="text-xl font-semibold mb-3">Done</h2>
            {renderItemsByState('Done')}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default KanbanBoard;
