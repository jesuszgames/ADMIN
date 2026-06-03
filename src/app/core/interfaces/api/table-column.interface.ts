export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'actions' | 'icon-text';
  iconField?: string;
}
