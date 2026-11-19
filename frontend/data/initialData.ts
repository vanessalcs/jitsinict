import { 
  StudentGrade, 
  HomeworkSubmission, 
  TimetableSlot, 
  SchoolDocument, 
  CalendarEvent, 
  SchoolAnnouncement,
  TeachingResource,
  TeachingJournalEntry,
  LabMaintenanceTicket,
  AuthorizedUser
} from '../types';

// 初始化 10 人成员核心团队（存储于 authorized_users 集合）
export const initialAuthorizedUsers: AuthorizedUser[] = [
  {
    email: 'huang.sh@eduit.edu',
    name: '黄世泓',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-sky-500 to-indigo-600',
    isActive: true,
    isSuperAdmin: true,
    canPostAnnouncements: true,
    canComment: true,
    allowedReports: ['lab_maintenance', 'grade_summary', 'equipment_inventory', 'lab_utilization']
  },
  {
    email: 'lin.cx@eduit.edu',
    name: '林慈贤',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-emerald-500 to-teal-600',
    isActive: true,
    isSuperAdmin: true,
    canPostAnnouncements: true,
    canComment: true,
    allowedReports: ['lab_maintenance', 'grade_summary', 'equipment_inventory', 'lab_utilization']
  },
  {
    email: 'chen.km@eduit.edu',
    name: '陈光明',
    title: '高中资讯科技专任教师',
    department: '电脑科教研组',
    avatarColor: 'from-purple-500 to-indigo-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: true,
    canComment: true,
    allowedReports: ['grade_summary', 'lab_utilization']
  },
  {
    email: 'tan.wl@eduit.edu',
    name: '陈伟伦',
    title: '初中电脑资讯与工艺教师',
    department: '电脑科教研组',
    avatarColor: 'from-amber-500 to-orange-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: false,
    canComment: true,
    allowedReports: ['grade_summary']
  },
  {
    email: 'ng.sh@eduit.edu',
    name: '吴淑华',
    title: '初中电脑资讯与工艺教师',
    department: '电脑科教研组',
    avatarColor: 'from-pink-500 to-rose-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: false,
    canComment: true,
    allowedReports: ['grade_summary']
  },
  {
    email: 'lee.jh@eduit.edu',
    name: '李家豪',
    title: '资讯处网络工程师',
    department: '资讯处',
    avatarColor: 'from-blue-600 to-cyan-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: true,
    canComment: true,
    allowedReports: ['lab_maintenance', 'equipment_inventory']
  },
  {
    email: 'chong.my@eduit.edu',
    name: '张美云',
    title: '电教多媒体技术助理',
    department: '资讯处',
    avatarColor: 'from-teal-500 to-emerald-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: false,
    canComment: true,
    allowedReports: ['equipment_inventory']
  },
  {
    email: 'lim.zk@eduit.edu',
    name: '林子康',
    title: '创客科技实验室指导老师',
    department: '电脑科 / 创客社',
    avatarColor: 'from-violet-500 to-purple-600',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: true,
    canComment: true,
    allowedReports: ['lab_utilization']
  },
  {
    email: 'ong.sl@eduit.edu',
    name: '王少龙',
    title: '教务处考务组联络员',
    department: '教务处',
    avatarColor: 'from-slate-600 to-slate-800',
    isActive: true,
    isSuperAdmin: false,
    canPostAnnouncements: false,
    canComment: true,
    allowedReports: ['grade_summary']
  },
  {
    email: 'teoh.wh@eduit.edu',
    name: '张文辉',
    title: '微机硬件巡检助理 (试用期)',
    department: '资讯处',
    avatarColor: 'from-yellow-500 to-amber-600',
    isActive: false, // 默认停用状态，用于验证访问控制逻辑
    isSuperAdmin: false,
    canPostAnnouncements: false,
    canComment: false,
    allowedReports: []
  }
];

export const initialTeachingJournals: TeachingJournalEntry[] = [
  {
    id: 'jnl_1',
    weekNumber: 8,
    date: '2027-03-08',
    periodNumber: 1,
    className: 'J1U1',
    subjectType: '电脑资讯与工艺',
    labRoom: 'Lab A',
    teacherName: '黄世泓',
    topicTitle: 'Python 循环进阶：嵌套循环与二维乘法表绘制',
    contentSummary: '复习单层 for 循环范围定义，引入外层行与内层列的控制变量概念；在 Lab A 实机编写并调试 9x9 乘法表。',
    homeworkAssigned: '完成作业本实验题 3-2：倒三角形星号图案打印。',
    previousWeekSummary: '【上周已授】：第七周第1节讲解 if-elif-else 多条件选择分支，并完成成绩等第换算器编写。',
    studentFeedback: '全班60位学生均按机位就座，52位在当堂成功输出完整乘法表，8位学生在 print(end="") 参数理解上需要协助。',
    nextWeekPlan: '第九周将讲授 while 循环条件与死循环规避技巧。',
    createdAt: '2027-03-08 08:35'
  },
  {
    id: 'jnl_2',
    weekNumber: 8,
    date: '2027-03-09',
    periodNumber: 4,
    className: 'J2U2',
    subjectType: '电脑资讯与工艺',
    labRoom: 'Lab B',
    teacherName: '林慈贤',
    topicTitle: '网络信息素养：网络欺凌防范与数字足迹审查',
    contentSummary: '在 Lab B 引导学生使用模拟平台分析虚假社交账号特征，完成个人数字隐私权限核查演练。',
    homeworkAssigned: '提交反钓鱼邮件情境判断短文 (300字)。',
    previousWeekSummary: '【上周已授】：第七周第4节完成强密码构成要素实验，并测试散列加密强度。',
    studentFeedback: '课堂讨论热烈，互动问答达标率高。Lab B 14号机键盘退格键偶有卡顿，已提报维修工单。',
    nextWeekPlan: '第九周进入网页 HTML 骨架标签设计。',
    createdAt: '2027-03-09 11:55'
  }
];

export const initialLabTickets: LabMaintenanceTicket[] = [
  {
    id: 'tkt_001',
    labRoom: 'Lab A',
    stationNumber: '电脑号 A18',
    faultType: '硬件损坏',
    priority: '普通',
    reportedBy: '黄世泓',
    reportedAt: '2027-03-08 08:35',
    description: 'A18 学生电脑电源按键弹簧老化卡死，按压无法回弹开机，需要更换前置机箱按键开关。',
    status: '配件订购中',
    technicianNotes: '已由林慈贤检查，已向总务处登记领取备用开关总成。'
  },
  {
    id: 'tkt_002',
    labRoom: 'Lab B',
    stationNumber: '电脑号 B14',
    faultType: '外设故障(键盘/鼠标/耳机)',
    priority: '普通',
    reportedBy: '林慈贤',
    reportedAt: '2027-03-09 11:55',
    description: '机械键盘退格键(Backspace)轴体卡顿，学生无法正常删除输入代码。',
    status: '待维修',
    technicianNotes: '备用 USB 键盘已在器材柜就绪，预定今日午休更换。'
  },
  {
    id: 'tkt_003',
    labRoom: 'Lab C',
    stationNumber: '教师讲台主控投影机',
    faultType: '硬件损坏',
    priority: '紧急 (影响上课)',
    reportedBy: '黄世泓',
    reportedAt: '2027-03-09 14:30',
    description: '投影机 HDMI 2 号接口偶尔闪屏黑屏，重插信号线后维持数分钟又出现蓝底提示无信号。',
    status: '维修中',
    technicianNotes: '正在测试讲台地面弱电盒中的 HDMI 转接延长线，暂由备用 VGA 线临时转接。'
  }
];

export const initialTeachingResources: TeachingResource[] = [
  {
    id: 'res_1',
    title: '【课件PPT】初中《电脑资讯与工艺》：流程图绘制与分支判断语句',
    subjectCategory: '电脑资讯与工艺',
    type: 'powerpoint',
    gradeLevel: '初一',
    authorTeacherId: 'u_huang',
    authorTeacherName: '黄世泓 (IT老师 / 资讯处助理)',
    authorDepartment: '资讯处 / 电脑科',
    uploadedAt: '2027-01-15',
    fileFormat: 'PPTX',
    fileSize: '14.8 MB',
    downloadCount: 128,
    tags: ['初中', '电脑资讯与工艺', '流程图', '条件分支'],
    description: '适用于初中阶段教学，以生动图解演示 if-elif-else 逻辑分支，并在 Lab A 配套实战题。',
    contentOutline: `第 1 讲：生活中的逻辑选择（红绿灯、自动售货机）\n第 2 讲：流程图标准化符号认识\n第 3 讲：代码缩进规范与关系运算符\n第 4 讲：实战演练：学生成绩等第转换算法`
  }
];

export const initialGrades: StudentGrade[] = [
  { 
    id: 'g1', 
    studentId: '24101', 
    chineseName: '陈晓明', 
    englishName: 'Tan Siew Ming', 
    classGrade: 'J1U1', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 88, 
    exam2Score: 92, 
    exam3Score: 90, 
    homeworkH1Score: 95, 
    homeworkH2Score: 92, 
    quizH1Score: 86, 
    quizH2Score: 94 
  },
  { 
    id: 'g2', 
    studentId: '24102', 
    chineseName: '林美华', 
    englishName: 'Lim Mei Wah', 
    classGrade: 'J1U1', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 78, 
    exam2Score: 82, 
    exam3Score: 85, 
    homeworkH1Score: 88, 
    homeworkH2Score: 90, 
    quizH1Score: 76, 
    quizH2Score: 80 
  },
  { 
    id: 'g3', 
    studentId: '24103', 
    chineseName: '张子谦', 
    englishName: 'Chong Zi Qian', 
    classGrade: 'J1U1', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 94, 
    exam2Score: 96, 
    exam3Score: 95, 
    homeworkH1Score: 98, 
    homeworkH2Score: 100, 
    quizH1Score: 92, 
    quizH2Score: 96 
  }
];

export const initialHomework: HomeworkSubmission[] = [
  {
    id: 'hw1',
    title: '初中《电脑资讯与工艺》：条件分支趣味猜数游戏设计',
    course: '电脑资讯与工艺',
    assignedDate: '2027-03-01',
    dueDate: '2027-03-12',
    targetClass: 'J1U1',
    submittedCount: 42,
    totalStudents: 45,
    status: 'pending_review',
    description: '在 Lab A 完成猜数算法程序，包含上限判定、计数统计与防报错处理。'
  }
];

export const initialTimetable: TimetableSlot[] = [
  { id: 't1', dayOfWeek: 1, period: 1, timeRange: '07:55 - 08:30', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U1', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't2', dayOfWeek: 1, period: 2, timeRange: '08:30 - 09:05', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U1', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't3', dayOfWeek: 1, period: 4, timeRange: '10:15 - 10:50', subject: '资讯处：服务器巡检与机房维护', subjectType: '网络维护', className: '资讯处', location: '核心数据机房 B201', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'maintenance' }
];

export const initialDocuments: SchoolDocument[] = [
  {
    id: 'doc1',
    title: '【空白表单】学校 Lab A / Lab B / Lab C 电脑室与多媒体设备借用审批单',
    category: 'form',
    department: '资讯处 / 电脑科',
    updatedAt: '2027-02-28',
    fileSize: '48 KB',
    isTemplate: true,
    contentTemplate: `【电脑室与电教多媒体设备借用审批表】\n申请部门/学科组：______________\n申请人姓名：______________  联系电话：______________\n借用电脑室：□ Lab A (60座)  □ Lab B (50座)  □ Lab C (55座)\n借用时间：2027 年 ____ 月 ____ 日 第 ____ 节至第 ____ 节 (07:55 - 14:20)\n借用班级：□ 初中(J1U1~J3U11)  □ 高中(S1A1~S3SE)  具体班级：________\n借用事由（课程名称）：□ 电脑资讯与工艺  □ 资讯科技  □ 其它：________\n预计使用学生人数：______ 人\n\n【设备安全规范确认】\n1. 严禁携带各类外食与有色饮料进入电脑室。\n2. 使用完毕必须统一关闭总电源、投影机并规范填写《电脑室使用日志》。\n\n申请人签字：____________   资讯处审核：黄世泓 / 林慈贤  日期：2027/__/__`
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'c27_0101', title: '新年元旦', date: '2027-01-01', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_0104', title: '开课日 / 召集团体主席', date: '2027-01-04', category: 'activity', description: '新学年正式开课日，召集各联课团体主席。' }
];

export const initialAnnouncements: SchoolAnnouncement[] = [
  {
    id: 'a1',
    title: '【重要通知】Lab A、Lab B、Lab C 统一进行系统镜像同传与还原保护更新',
    author: '黄世泓',
    authorEmail: 'huang.sh@eduit.edu',
    role: 'IT老师 / 资讯处助理',
    date: '2027-03-08 09:30',
    pinned: true,
    type: 'facility',
    content: '各位教职员工好：本周三（3月12日）晚 20:00，资讯处将对 Lab A（60座）、Lab B（50座）与 Lab C（55座）共 165 台学生电脑执行操作系统补丁更新与还原系统重置。请上《电脑资讯与工艺》和《资讯科技》的任课老师提醒学生保存个人作品至云端，避免数据丢失。',
    readCount: 142,
    comments: [
      {
        id: 'cm_1',
        announcementId: 'a1',
        authorEmail: 'lin.cx@eduit.edu',
        authorName: '林慈贤',
        content: '已核查 Lab B 还原服务端镜像，今晚由我配合协助网络唤醒同传。',
        createdAt: '2027-03-08 10:15'
      }
    ]
  },
  {
    id: 'a2',
    title: '【教学通知】初中《电脑资讯与工艺》及高中《资讯科技》教学进度备忘',
    author: '林慈贤',
    authorEmail: 'lin.cx@eduit.edu',
    role: 'IT老师 / 资讯处助理',
    date: '2027-03-05 14:15',
    pinned: true,
    type: 'teaching',
    content: '请各位老师在工作台查看最新排课安排：初中阶段课程（J1U1~J3U11）统一使用《电脑资讯与工艺》大纲，高中阶段（S1A1~S3SE）使用《资讯科技》大纲。目前三间电脑室软硬件环境均已完成对应模块配置。',
    readCount: 215,
    comments: []
  }
];
