export type UserRole = 'it_teacher' | 'it_admin';

export type SchoolSubject = '电脑资讯与工艺' | '资讯科技';

export type ComputerLabRoom = 'Lab A (60座)' | 'Lab B (50座)' | 'Lab C (55座)';

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatarColor: string;
  assignedClasses: string[];
}

// 授权成员档案 (对应 Firestore authorized_users/{email})
export interface AuthorizedUser {
  email: string; // 小写
  name: string;
  title: string;
  department: string;
  avatarColor: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  canPostAnnouncements: boolean;
  canComment: boolean;
  allowedReports: string[];
}

// 教学进度记录
export interface TeachingProgressRecord {
  id: string;
  subjectType: SchoolSubject;
  courseName: string;
  className: string;
  unitName: string;
  lessonNumber: number;
  totalLessons: number;
  currentStatus: 'in_progress' | 'completed' | 'pending';
  lastTaughtDate: string; // YYYY-MM-DD
  keyConcepts: string[];
  studentMasteryRate: number; // 0 ~ 100
  reflectionNotes: string;
  teacherName: string;
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
  fileFormat: 'PPTX' | 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | 'ZIP' | 'PY';
  fileSize: string;
  // 仅「真实上传的文件」才有：存放在 Firebase Storage 中的原始文件信息
  file?: {
    fileName: string;
    storagePath: string;
    downloadUrl: string;
    sizeBytes: number;
    uploadedByEmail: string;
  };
  downloadCount: number;
  description: string;
  contentOutline?: string;
  tags: string[];
}

// 教室教学日志 (周记与每堂课记录，支持查阅上周所教内容)
export interface TeachingJournalEntry {
  id: string;
  weekNumber: number; // 教学周次 (如第 8 周)
  date: string; // YYYY-MM-DD
  periodNumber: number; // 1 ~ 9 节
  className: string; // J1U1 ~ S3SE
  subjectType: SchoolSubject;
  labRoom: 'Lab A' | 'Lab B' | 'Lab C' | '教室';
  teacherName: string;
  topicTitle: string; // 本节课教学课题
  contentSummary: string; // 教学内容要点与上机练习
  homeworkAssigned: string; // 布置作业/随堂任务
  previousWeekSummary?: string; // 上周所教内容回顾参考
  studentFeedback: string; // 学生掌握状况与课堂纪律
  nextWeekPlan: string; // 下周教学规划与预习要求
  createdAt: string;
}

export interface StudentGrade {
  id: string;
  studentId: string; // 5位数字学号
  chineseName: string;
  englishName: string;
  classGrade: string;
  subjectName: SchoolSubject;
  exam1Score: number; // 第一期考 (20%)
  exam2Score: number; // 第二期考 (20%)
  exam3Score: number; // 第三期考 (30%)
  homeworkH1Score: number; // 上半年作业 (5%)
  homeworkH2Score: number; // 下半年作业 (5%)
  quizH1Score: number; // 上半年小考 (10%)
  quizH2Score: number; // 下半年小考 (10%)
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

// 9节课时配置与时间结构
export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1 (周一) - 5 (周五)
  period: number; // 1 到 9 节
  timeRange: string;
  subject: string;
  subjectType?: SchoolSubject | '网络维护';
  className: string;
  location: string; // Lab A (60座), Lab B (50座), Lab C (55座), 核心数据机房
  teacherName: string;
  roleType: 'teaching' | 'maintenance' | 'lab_reservation';
}

// 电脑室硬件/网络故障报修与工单记录
export interface LabMaintenanceTicket {
  id: string;
  labRoom: 'Lab A' | 'Lab B' | 'Lab C';
  stationNumber: string; // 如 "电脑号 A18" 或 "教师讲台主控" 或 "全室投影机"
  faultType: '硬件损坏' | '网络断连' | '系统蓝屏/死机' | '外设故障(键盘/鼠标/耳机)' | '软件/还原异常';
  priority: '紧急 (影响上课)' | '普通' | '低 (可候补)';
  reportedBy: string; // 报修老师
  reportedAt: string; // YYYY-MM-DD HH:mm
  description: string;
  status: '待维修' | '配件订购中' | '维修中' | '已修复验收';
  technicianNotes?: string; // 技术员维修反馈
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
  // 仅「上传的文件」才有：存放在 Firebase Storage 中的原始文件信息
  file?: {
    fileName: string;
    storagePath: string;
    downloadUrl: string;
    sizeBytes: number;
    uploadedByEmail: string;
    uploadedByName: string;
  };
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

export interface SchoolAnnouncement {
  id: string;
  title: string;
  author: string;
  role: string;
  date: string;
  pinned: boolean;
  type: 'urgent' | 'teaching' | 'facility' | 'general';
  content: string;
  readCount: number;
}
