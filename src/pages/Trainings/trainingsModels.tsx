interface TrainingData{
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

interface TrainingEnrollmentData{
    training: number; // training id
    user_ids: number[]; // user ids
    start_date: string;
    due_date_type: 'none' | 'periodic' | 'due_date';
    due_date: string;
    period_number: number | null;
    period_type: 'days' | 'weeks' | 'months' | 'year'; 
    notify_by_email: boolean;
}
