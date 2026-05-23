import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUp, faCircleRight, faCircleDown } from '@fortawesome/free-regular-svg-icons';

interface KanbanItemPriorityProps {
  priority: 'High' | 'Middle' | 'Low';
}

function KanbanItemPriority({ priority }: KanbanItemPriorityProps) {
  const iconsMap = new Map([
    ['High', faCircleUp],
    ['Middle', faCircleRight],
    ['Low', faCircleDown],
  ]);

  const colorMap = new Map([
    ['High', 'red'],
    ['Middle', 'orange'],
    ['Low', 'green'],
  ]);

  return (
    <div>
      <FontAwesomeIcon
        color={colorMap.get(priority) || 'red'}
        icon={iconsMap.get(priority) || faCircleUp}
      />
    </div>
  );
}

export default KanbanItemPriority;
