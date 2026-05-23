export interface Item {
  id: number;
  title: string;
  description: string;
  type: 'User Story' | 'Defect' | 'Task';
  estimate: number;
  state: 'Open' | 'In Progress' | 'In Validation' | 'Done';
  assigned_user: string;
  priority: 'High' | 'Middle' | 'Low';
}
