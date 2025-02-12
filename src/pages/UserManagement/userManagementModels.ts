export interface UserData{
    id: number;
    full_name: string;
    status_name: string;
    department_name: string;
}

export interface GroupData {
    id: number;
    name: string;
    tenant: number;
    users_count: number;
}

export interface DepartmentData {
  id: number;
  name: string;
  tenant: number;
  users_count: number;
  parent: number;
  children: DepartmentData[];
}