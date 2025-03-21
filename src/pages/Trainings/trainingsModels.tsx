export interface TrainingData {
  id: number;
  training: number; // training id
  training_name: string;
  training_description: string;
  training_publisher: string;
  training_tags: string[];
  category: number; // category id
  category_name: string;
  enrolled_count: number;
  completed_count: number;
}

export interface TrainingEnrollmentData {
  training: number; // training id
  user_ids: number[]; // user ids
  start_date: string;
  due_date: string;
  periodic: boolean;
  period_number: number | null;
  period_type: 'days' | 'weeks' | 'months' | 'year';
  skip_if_passed: boolean;
  update_due_date_if_assigned: boolean;
  notify_by_email: boolean;
}

export interface UserTrainingEnrollmentData {
  id: number;
  user: number;
  user_full_name: string;
  status: string;
  status_display: string;
  progress: number;
  fact_start_date: string;
  fact_end_date: string;
  attempt_no: number;
}
