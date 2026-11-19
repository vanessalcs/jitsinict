export type UserRole = 'it_teacher' | 'it_admin';

export type SchoolSubject = '电脑资讯与工艺' | '资讯科技';

export type ComputerLabRoom = 'Lab A (60座)' | 'Lab B (50座)' | 'Lab C (55座)';

// 授权 10 人成员门户账号档案（对应 Firestore authorized_users/{email}）
export interface AuthorizedUser {
  email: string; // 统一小写
  name: string;
  title: string; // IT老师 / 资讯处助理等
  department: string;
  avatarColor: string;
  isActive: boolean; // 是否处于启用状态
  isSuperAdmin: boolean; // 是否为超级管理员
  canPostAnnouncements: boolean; // 是否具有发帖/编辑/删除公告权限
  canComment: boolean; // 是否具有评论权限
  allowedReports: string[]; // 允许查看和加载的报告 ID 列表
}

export type ResourceType = 'textbook' | 'exam_paper' | 'powerpoint' | 'lab_project';

export interface TeachingResource {
  id: string;
  title: string;
  subjectCategory: SchoolSubject;
  type: ResourceType;
  gradeLevel: '初一' | '初二' | '初三' | '高一' | '高二' | '高三' | '全校通用';
  authorTeacherId: string;
  authorTeacherName: string;
  authorDepartment: string;
  uploadedAt: string;
  fileFormat: 'PPTX' | 'PDF' | 'DOCX' | 'ZIP' | 'PY';
  fileSize: string;
  downloadCount: number;
  description: string;
  contentOutline?: string;
  tags: string[];
}

// 教室教学日志
export interface TeachingJournalEntry {
  id: string;
  weekNumber: number;
  date: string;
  periodNumber: number;
  className: string;
  subjectType: SchoolSubject;
  labRoom: 'Lab A' | 'Lab B' | 'Lab C' | '教室';
  teacherName: string;
  topicTitle: string;
  contentSummary: string;
  homeworkAssigned: string;
  previousWeekSummary?: string;
  studentFeedback: string;
  nextWeekPlan: string;
  createdAt: string;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  chineseName: string;
  englishName: string;
  classGrade: string;
  subjectName: SchoolSubject;
  exam1Score: number;
  exam2Score: number;
  exam3Score: number;
  homeworkH1Score: number;
  homeworkH2Score: number;
  quizH1Score: number;
  quizH2Score: number;
}

export interface HomeworkSubmission {
  id: string;
  title: string;
  course: SchoolSubject;
  assignedDate: string;
  dueDate: string;
  targetClass: string;
  submittedCount: number;
  totalStudents: number;
  status: 'pending_review' | 'graded' | 'published';
  description: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  period: number;
  timeRange: string;
  subject: string;
  subjectType?: SchoolSubject | '网络维护';
  className: string;
  location: string;
  teacherName: string;
  roleType: 'teaching' | 'maintenance' | 'lab_reservation';
}

export interface LabMaintenanceTicket {
  id: string;
  labRoom: 'Lab A' | 'Lab B' | 'Lab C';
  stationNumber: string;
  faultType: '硬件损坏' | '网络断连' | '系统蓝屏/死机' | '外设故障(键盘/鼠标/耳机)' | '软件/还原异常';
  priority: '紧急 (影响上课)' | '普通' | '低 (可候补)';
  reportedBy: string;
  reportedAt: string;
  description: string;
  status: '待维修' | '配件订购中' | '维修中' | '已修复验收';
  technicianNotes?: string;
  resolvedAt?: string;
}

export interface SchoolDocument {
  id: string;
  title: string;
  category: 'form' | 'regulation' | 'manual' | 'application';
  department: string;
  updatedAt: string;
  fileSize: string;
  isTemplate: boolean;
  contentTemplate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: 'exam' | 'activity' | 'holiday' | 'maintenance' | 'meeting';
  description: string;
  location?: string;
}

// 公告评论数据模型
export interface AnnouncementComment {
  id: string;
  announcementId: string;
  authorEmail: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// 校园通知公告
export interface SchoolAnnouncement {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  role: string;
  date: string;
  pinned: boolean;
  type: 'urgent' | 'teaching' | 'facility' | 'general';
  content: string;
  readCount: number;
  comments?: AnnouncementComment[];
}
