export interface Fee {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  dueDate: string;        // ISO string
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;   // ISO string
  academicYear: {
    _id: string;
    name: string;
  };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  date: string;          // ISO string
  category: 'salary' | 'utilities' | 'maintenance' | 'supplies' | 'other';
  description: string;
  amount: number;
  academicYear: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Salary {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  month: number;        // 1-12
  year: number;
  status: 'paid' | 'pending';
  paymentDate?: string; // ISO string if paid
  academicYear: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolSettings {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;        // URL or path
  primaryColor?: string; // hex code
  academicYearId?: string; // current academic year ID
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  module: string;
  actions: string[]; // e.g., ["create", "read", "update", "delete"]
}

export interface Role {
  _id: string;
  name: string; // 'admin', 'teacher', 'student', 'parent'
  label?: string; // display name
  permissions: Permission[];
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  class: {
    _id: string;
    name: string;
  };
  teacher: {
    _id: string;
    name: string;
  };
  dueDate: string; // ISO
  totalPoints: number;
  attachments?: string[]; // file URLs
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string | Assignment;
  student: {
    _id: string;
    name: string;
  };
  attachments: string[]; // submitted file URLs
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  type: 'pdf' | 'doc' | 'video' | 'link' | 'other';
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  class?: {
    _id: string;
    name: string;
  };
  uploadedBy: {
    _id: string;
    name: string;
  };
  uploadedAt: string;
  isActive: boolean;
}

export interface Attendance {
  _id: string;
  student: {
    _id: string;
    name: string;
  };
  class: {
    _id: string;
    name: string;
  };
  date: string; // ISO
  status: 'present' | 'absent' | 'late';
  markedBy: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface Team {
  _id: string;
  name: string;
  logo?: string; // could be a Lucide icon name or URL
}

export interface Visual {
  _id: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  generatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isSaved: boolean;
}