import { PaymentRecord } from '../types';

export interface StudentProfile {
  name: string;
  rollNumber: string;
  department: string;
  semester: string;
  academicYear: string;
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
  attendancePercent: number;
}

export interface AcademicCourse {
  code: string;
  title: string;
  credits: number;
  grade: string;
  gradePoint: number;
  attendance: number;
}

export const STUDENT_PROFILE: StudentProfile = {
  name: 'Ananya Sharma',
  rollNumber: '2024-CS-0428',
  department: 'Computer Science & Engineering',
  semester: 'Semester 5 (Fall 2026)',
  academicYear: '2026-2027',
  cgpa: 8.92,
  creditsEarned: 94,
  totalCredits: 160,
  attendancePercent: 88.4,
};

export const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay-sem5',
    title: 'Semester 5 Tuition & Exam Fee',
    category: 'Tuition Fee',
    amount: 45000,
    formattedAmount: '₹45,000',
    status: 'Paid',
    txnReference: 'TXN-2026-8812',
    paymentDate: '12 Jan 2026, 14:22',
    paymentMode: 'Net Banking (HDFC Bank)',
    receiptFileName: 'Receipt_Semester_2026.pdf',
    isTargetReceipt: true,
  },
  {
    id: 'pay-lib',
    title: 'Digital Library & Journal Subscriptions',
    category: 'Library Fee',
    amount: 2000,
    formattedAmount: '₹2,000',
    status: 'Paid',
    txnReference: 'TXN-2025-4109',
    paymentDate: '05 Aug 2025, 09:15',
    paymentMode: 'UPI / Razorpay',
    receiptFileName: 'Receipt_Library_2025.pdf',
  },
  {
    id: 'pay-hostel',
    title: 'Hostel Accommodation & Mess Charges (Term 1)',
    category: 'Hostel & Mess',
    amount: 32000,
    formattedAmount: '₹32,000',
    status: 'Paid',
    txnReference: 'TXN-2025-1022',
    paymentDate: '02 Aug 2025, 16:40',
    paymentMode: 'Debit Card (SBI)',
    receiptFileName: 'Receipt_Hostel_2025.pdf',
  },
];

export const COURSES_SEM5: AcademicCourse[] = [
  { code: 'CS501', title: 'Design and Analysis of Algorithms', credits: 4, grade: 'A+', gradePoint: 10, attendance: 92 },
  { code: 'CS502', title: 'Database Management Systems', credits: 4, grade: 'A', gradePoint: 9, attendance: 88 },
  { code: 'CS503', title: 'Computer Networks & Protocols', credits: 4, grade: 'A', gradePoint: 9, attendance: 85 },
  { code: 'CS504', title: 'Theory of Computation', credits: 3, grade: 'B+', gradePoint: 8, attendance: 82 },
  { code: 'CS505', title: 'Artificial Intelligence & Search', credits: 3, grade: 'A+', gradePoint: 10, attendance: 95 },
  { code: 'CS506', title: 'DBMS & Algorithms Laboratory', credits: 2, grade: 'O', gradePoint: 10, attendance: 96 },
];

export const RECENT_ACTIVITIES = [
  { id: '1', title: 'Tuition Fee Payment verified by Bursar', time: 'Yesterday at 3:30 PM', tag: 'Finance' },
  { id: '2', title: 'Mid-term results published for CS501 & CS502', time: '3 days ago', tag: 'Academics' },
  { id: '3', title: 'IEEE Digital Xplore access renewed', time: '1 week ago', tag: 'Library' },
  { id: '4', title: 'Biometric attendance synchronized', time: '2 weeks ago', tag: 'Attendance' },
];
