export interface UserDataDetailed {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  department: number; // department id
  department_name: string;
  position_name: string;
  tenant: number; // tenant id
  is_active: boolean;
}

export interface UserData {
    id: number;
    full_name: string;
    status_name: string;
    department_name: string;
}

export interface GroupData {
    id: number;
    name: string;
    tenant: number; // tenant id
    users_count: number;
}

export interface DepartmentData {
  id: number;
  name: string;
  tenant: number; // tenant id
  users_count: number;
  parent: number; // parent department id
  children: DepartmentData[];
}