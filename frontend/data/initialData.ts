import { 
  StudentGrade, 
  HomeworkSubmission, 
  TimetableSlot, 
  SchoolDocument, 
  CalendarEvent, 
  SchoolAnnouncement,
  TeacherUser,
  TeachingResource,
  TeachingJournalEntry,
  LabMaintenanceTicket
} from '../types';

export const initialTeachers: TeacherUser[] = [
  {
    id: 'u_huang',
    name: '黄世泓',
    email: 'huang.sh@eduit.edu',
    role: 'it_teacher',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-sky-500 to-indigo-600',
    assignedClasses: ['J1U1', 'J1U2', 'J2U1', 'S1A1', 'S2C1']
  },
  {
    id: 'u_lin',
    name: '林慈贤',
    email: 'lin.cx@eduit.edu',
    role: 'it_admin',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-emerald-500 to-teal-600',
    assignedClasses: ['J1U3', 'J2U2', 'J3U1', 'S1C1', 'S3SC']
  }
];

// 教室教学日志初始记录 (方便老师查看上周教了什么，每周清晰填报)
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
  },
  {
    id: 'jnl_3',
    weekNumber: 8,
    date: '2027-03-10',
    periodNumber: 3,
    className: 'S1A2',
    subjectType: '资讯科技',
    labRoom: 'Lab C',
    teacherName: '黄世泓',
    topicTitle: '计算机网络协议：IPv4 子网掩码与 CIDR 计算',
    contentSummary: '讲解 IP 地址网络号与主机号拆分方法，通过二进制 AND 运算推导子网广播地址；在 Lab C 运行 Packet Tracer 进行 Ping 测试。',
    homeworkAssigned: '完成 5 道不同掩码(/24, /26, /28)子网有效主机数量换算。',
    previousWeekSummary: '【上周已授】：第七周第3节梳理 OSI 体系模型与 TCP/IP 体系映射关系。',
    studentFeedback: '高一同学理解迅速，Packet Tracer 实验完成度 95%。',
    nextWeekPlan: '第九周安排路由器静态路由表配置实战。',
    createdAt: '2027-03-10 10:20'
  }
];

// 电脑室硬件/网络故障报修工单 (让资讯处技术人员一目了然)
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
  },
  {
    id: 'tkt_004',
    labRoom: 'Lab A',
    stationNumber: '电脑号 A05',
    faultType: '系统蓝屏/死机',
    priority: '普通',
    reportedBy: '黄世泓',
    reportedAt: '2027-03-05 10:15',
    description: '开机载入 Windows 时出现内存分页错误蓝屏代码 0x00000050。',
    status: '已修复验收',
    technicianNotes: '重新插拔清理两条 8GB DDR4 内存条金手指并跑 memtest 正常，已还原系统镜像。',
    resolvedAt: '2027-03-06 16:00'
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
  },
  {
    id: 'res_2',
    title: '【期末试卷】初中《电脑资讯与工艺》第一学期机房实机操作考卷 A/B卷',
    subjectCategory: '电脑资讯与工艺',
    type: 'exam_paper',
    gradeLevel: '初一',
    authorTeacherId: 'u_huang',
    authorTeacherName: '黄世泓 (IT老师 / 资讯处助理)',
    authorDepartment: '资讯处 / 电脑科',
    uploadedAt: '2027-01-18',
    fileFormat: 'PDF',
    fileSize: '2.4 MB',
    downloadCount: 245,
    tags: ['初中真题', '电脑资讯与工艺', '机试实操', '附标准答案'],
    description: 'Lab A、Lab B、Lab C 上机考试统一试卷，含 10 题基础选择题与 3 道实操题目。',
    contentOutline: `一、选择题（30分，每题3分，共10题）\n二、上机操作题（70分）\n1. 规范排版与表格统计（20分）\n2. 简易程序算法实现（25分）\n3. 综合创意实操（25分）`
  },
  {
    id: 'res_3',
    title: '【校本讲义】高中《资讯科技》：计算机网络与现代信息安全讲义',
    subjectCategory: '资讯科技',
    type: 'textbook',
    gradeLevel: '高一',
    authorTeacherId: 'u_lin',
    authorTeacherName: '林慈贤 (IT老师 / 资讯处助理)',
    authorDepartment: '资讯处 / 电脑科',
    uploadedAt: '2027-02-15',
    fileFormat: 'PDF',
    fileSize: '32.5 MB',
    downloadCount: 184,
    tags: ['高中教材', '资讯科技', '网络协议', '信息安全'],
    description: '高中资讯科技学科校本拓展讲义，深度剖析 OSI 体系模型、IP 寻址与校园网络防火墙架构。',
    contentOutline: `第一章：物理介质与局域网拓扑\n第二章：IP地址分类与子网划分计算\n第三章：DNS 域名解析与网络通信路由\n第四章：日常信息安全防护与密码学常识`
  },
  {
    id: 'res_4',
    title: '【课件PPT】高中《资讯科技》：Python 关系型数据库与SQL联表查询',
    subjectCategory: '资讯科技',
    type: 'powerpoint',
    gradeLevel: '高二',
    authorTeacherId: 'u_lin',
    authorTeacherName: '林慈贤 (IT老师 / 资讯处助理)',
    authorDepartment: '资讯处 / 电脑科',
    uploadedAt: '2027-02-22',
    fileFormat: 'PPTX',
    fileSize: '28.2 MB',
    downloadCount: 102,
    tags: ['高中课件', '资讯科技', '数据库', 'SQL查询'],
    description: '适用于高中资讯科技数据库单项教学，Lab C 实训必备课件。',
    contentOutline: `第 1 讲：数据库基本概念与表结构\n第 2 讲：SELECT / INSERT / UPDATE 核心语句\n第 3 讲：INNER JOIN 联表查询实战\n第 4 讲：图书管理数据检索综合大作业`
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
  },
  { 
    id: 'g4', 
    studentId: '24104', 
    chineseName: '王若晴', 
    englishName: 'Ong Ruo Qing', 
    classGrade: 'J1U1', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 68, 
    exam2Score: 72, 
    exam3Score: 75, 
    homeworkH1Score: 80, 
    homeworkH2Score: 82, 
    quizH1Score: 70, 
    quizH2Score: 74 
  },
  { 
    id: 'g5', 
    studentId: '24105', 
    chineseName: '李俊杰', 
    englishName: 'Lee Jun Jie', 
    classGrade: 'J1U1', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 82, 
    exam2Score: 85, 
    exam3Score: 88, 
    homeworkH1Score: 90, 
    homeworkH2Score: 88, 
    quizH1Score: 84, 
    quizH2Score: 86 
  },
  { 
    id: 'g6', 
    studentId: '24201', 
    chineseName: '黄子涵', 
    englishName: 'Ng Zi Han', 
    classGrade: 'J1U2', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 90, 
    exam2Score: 88, 
    exam3Score: 92, 
    homeworkH1Score: 95, 
    homeworkH2Score: 96, 
    quizH1Score: 88, 
    quizH2Score: 90 
  },
  { 
    id: 'g7', 
    studentId: '23201', 
    chineseName: '周家豪', 
    englishName: 'Chew Jia Hao', 
    classGrade: 'J2U2', 
    subjectName: '电脑资讯与工艺', 
    exam1Score: 85, 
    exam2Score: 87, 
    exam3Score: 89, 
    homeworkH1Score: 92, 
    homeworkH2Score: 94, 
    quizH1Score: 80, 
    quizH2Score: 85 
  },
  { 
    id: 'g8', 
    studentId: '22101', 
    chineseName: '刘宇航', 
    englishName: 'Lau Yu Hang', 
    classGrade: 'S1A1', 
    subjectName: '资讯科技', 
    exam1Score: 91, 
    exam2Score: 93, 
    exam3Score: 94, 
    homeworkH1Score: 96, 
    homeworkH2Score: 98, 
    quizH1Score: 90, 
    quizH2Score: 92 
  },
  { 
    id: 'g9', 
    studentId: '21101', 
    chineseName: '黄俊杰', 
    englishName: 'Wong Jun Jie', 
    classGrade: 'S2C1', 
    subjectName: '资讯科技', 
    exam1Score: 86, 
    exam2Score: 88, 
    exam3Score: 90, 
    homeworkH1Score: 92, 
    homeworkH2Score: 94, 
    quizH1Score: 85, 
    quizH2Score: 88 
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
  },
  {
    id: 'hw2',
    title: '高中《资讯科技》：校园网络子网划分方案设计与模拟抓包',
    course: '资讯科技',
    assignedDate: '2027-03-05',
    dueDate: '2027-03-15',
    targetClass: 'S1A1',
    submittedCount: 38,
    totalStudents: 40,
    status: 'graded',
    description: '在 Lab C 完成虚拟拓扑搭建，配置 3 个子网并验证各网段互通性。'
  }
];

// 符合 9 节课时精准时间表（07:55 - 14:20，每节 35 分钟）
export const initialTimetable: TimetableSlot[] = [
  { id: 't1', dayOfWeek: 1, period: 1, timeRange: '07:55 - 08:30', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U1', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't2', dayOfWeek: 1, period: 2, timeRange: '08:30 - 09:05', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U1', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't3', dayOfWeek: 1, period: 4, timeRange: '10:15 - 10:50', subject: '资讯处：服务器巡检与机房维护', subjectType: '网络维护', className: '资讯处', location: '核心数据机房 B201', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'maintenance' },
  
  { id: 't4', dayOfWeek: 2, period: 3, timeRange: '09:40 - 10:15', subject: '资讯科技 (高中)', subjectType: '资讯科技', className: 'S1A2', location: 'Lab C (55座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't5', dayOfWeek: 2, period: 5, timeRange: '10:50 - 11:25', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J2U2', location: 'Lab B (50座)', teacherName: '林慈贤 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't6', dayOfWeek: 2, period: 8, timeRange: '13:10 - 13:45', subject: '资讯处：Lab B 键盘与网络巡视', subjectType: '网络维护', className: '资讯处', location: 'Lab B (50座)', teacherName: '林慈贤 (IT老师 / 资讯处助理)', roleType: 'maintenance' },

  { id: 't7', dayOfWeek: 3, period: 1, timeRange: '07:55 - 08:30', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U2', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't8', dayOfWeek: 3, period: 4, timeRange: '10:15 - 10:50', subject: '资讯处：全校 AP 固件升级与漫游调试', subjectType: '网络维护', className: '资讯处', location: 'Lab B (50座)', teacherName: '林慈贤 (IT老师 / 资讯处助理)', roleType: 'maintenance' },
  { id: 't9', dayOfWeek: 3, period: 7, timeRange: '12:35 - 13:10', subject: '资讯科技 (高中)', subjectType: '资讯科技', className: 'S2C1', location: 'Lab C (55座)', teacherName: '林慈贤 (IT老师 / 资讯处助理)', roleType: 'teaching' },

  { id: 't10', dayOfWeek: 4, period: 3, timeRange: '09:40 - 10:15', subject: '电脑资讯与工艺 (初中)', subjectType: '电脑资讯与工艺', className: 'J1U3', location: 'Lab A (60座)', teacherName: '黄世泓 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't11', dayOfWeek: 4, period: 6, timeRange: '11:25 - 12:00', subject: '资讯处例行技术排障工作会', subjectType: '网络维护', className: '资讯处', location: '资讯处会议室', teacherName: '黄世泓、林慈贤', roleType: 'maintenance' },
  
  { id: 't12', dayOfWeek: 5, period: 2, timeRange: '08:30 - 09:05', subject: '资讯科技 (高中)', subjectType: '资讯科技', className: 'S3SC', location: 'Lab C (55座)', teacherName: '林慈贤 (IT老师 / 资讯处助理)', roleType: 'teaching' },
  { id: 't13', dayOfWeek: 5, period: 9, timeRange: '13:45 - 14:20', subject: '资讯处：Lab A、Lab B、Lab C 镜像同传与周消毒', subjectType: '网络维护', className: '资讯处', location: 'Lab A / Lab B / Lab C', teacherName: '黄世泓、林慈贤', roleType: 'maintenance' }
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
  },
  {
    id: 'doc2',
    title: '【空白表单】学校信息化设备与弱电网络线路故障报修单',
    category: 'form',
    department: '资讯处 / 电脑科',
    updatedAt: '2027-03-01',
    fileSize: '36 KB',
    isTemplate: true,
    contentTemplate: `【校园网络与电脑室设备故障报修单】\n报修科室/班级：____________  报修位置（如 Lab C 12号机）：____________\n报修教师：____________  报修日期：2027/____/____\n故障硬件类别：□ 电脑室学生机  □ 教师讲台主控电脑  □ 投影仪/白板  □ 校园网络/Wi-Fi\n故障现象简述：________________________________________\n\n【资讯处处理栏】\n受理处理人：黄世泓 / 林慈贤 (IT老师 / 资讯处助理)\n维修状态：□ 排障中  □ 已修复  □ 需采购更换备件\n处理记录备注：________________________________  验收人签字：____________`
  },
  {
    id: 'doc3',
    title: '【规章制度】Lab A、Lab B、Lab C 电脑室安全使用守则与应急处置预案',
    category: 'regulation',
    department: '资讯处 / 电脑科',
    updatedAt: '2027-01-15',
    fileSize: '1.2 MB',
    isTemplate: false,
    contentTemplate: `第一条 总则：为保障初中《电脑资讯与工艺》、高中《资讯科技》教学秩序，特制定本守则。\n第二条 学生上机守则：学生按座号对号入座，严禁私自拔插主机线缆或更改电脑设置。\n第三条 突发断电与应急预案：任课老师需第一时间切断该电脑室总配电箱电闸，引导学生有序疏散。`
  }
];

// =========================================================================================
// 2027 年官方完整行事历 (根据所附 OCR 文本与图片 1:1 完整录入，全学年上课日数 195 天)
// 更新日期：14.10.2026
// =========================================================================================
export const initialCalendarEvents: CalendarEvent[] = [
  // ------------------------- 跨期长线/全校重大主题周期 -------------------------
  {
    id: 'evt_span_wenxue',
    title: '日新文学奖征文 (15/2 - 31/8)',
    date: '2027-02-15',
    endDate: '2027-08-31',
    category: 'activity',
    description: '日新文学奖全校征文与评审评奖阶段。'
  },
  {
    id: 'evt_span_qikao1',
    title: '第一期考及作业抽查 (15/3 - 26/3)',
    date: '2027-03-15',
    endDate: '2027-03-26',
    category: 'exam',
    description: '全校第一期期考及课后作业抽查。电脑科在各电脑室组织上机测评。'
  },
  {
    id: 'evt_span_guanke1',
    title: '上学期观课周 (12/4 - 16/4)',
    date: '2027-04-12',
    endDate: '2027-04-16',
    category: 'activity',
    description: '全校教师课堂教学公开观课研讨周。'
  },
  {
    id: 'evt_span_huanghua',
    title: '日新黄花艺术季 (19/4 - 23/4)',
    date: '2027-04-19',
    endDate: '2027-04-23',
    category: 'activity',
    description: '日新黄花艺术季校园文化展演。'
  },
  {
    id: 'evt_span_english_week',
    title: 'English Week 英语周 (10/5 - 14/5)',
    date: '2027-05-10',
    endDate: '2027-05-14',
    category: 'activity',
    description: '全校英语沉浸式学习体验周。'
  },
  {
    id: 'evt_span_wenshang',
    title: '高中文商乡土考察 (17/5 - 21/5)',
    date: '2027-05-17',
    endDate: '2027-05-21',
    category: 'activity',
    description: '高中部文商班开展实地乡土调研考察。'
  },
  {
    id: 'evt_span_qikao2',
    title: '第二期考 (28/6 - 8/7)',
    date: '2027-06-28',
    endDate: '2027-07-08',
    category: 'exam',
    description: '全校第二期大考。电脑室对应时段开启期考实操环境。'
  },
  {
    id: 'evt_span_xuekezhou',
    title: '学科周：科学、辅导、历史 (19/7 - 23/7)',
    date: '2027-07-19',
    endDate: '2027-07-23',
    category: 'activity',
    description: '全校学科周专题活动：科学、辅导与历史展展映。'
  },
  {
    id: 'evt_span_choukuan',
    title: '爱校筹款 (4/8 - 18/8)',
    date: '2027-08-04',
    endDate: '2027-08-18',
    category: 'activity',
    description: '全校年度爱校筹款运动。'
  },
  {
    id: 'evt_span_guanke2',
    title: '下学期观课周 (9/8 - 13/8)',
    date: '2027-08-09',
    endDate: '2027-08-13',
    category: 'activity',
    description: '下半学期教师公开课观课周。'
  },
  {
    id: 'evt_span_biye_exam',
    title: 'J3 / S3 毕业考 (17/9 - 28/9)',
    date: '2027-09-17',
    endDate: '2027-09-28',
    category: 'exam',
    description: '初三 (J3) 及 高三 (S3) 毕业资格大考。'
  },
  {
    id: 'evt_span_qikao3',
    title: '第三期考及作业抽查 (20/9 - 1/10)',
    date: '2027-09-20',
    endDate: '2027-10-01',
    category: 'exam',
    description: '非毕业年级第三期期末大考及全年作业终审抽查。'
  },
  {
    id: 'evt_span_tongkao',
    title: '初三 / 高三 预测统考 (18/10 - 26/10)',
    date: '2027-10-18',
    endDate: '2027-10-26',
    category: 'exam',
    description: '全真模拟董总华文独中统一考试。'
  },
  {
    id: 'evt_span_tianjing',
    title: '田径锦标赛 / 诗展 / Minggu BM / 班歌比赛 (1/11 - 5/11)',
    date: '2027-11-01',
    endDate: '2027-11-05',
    category: 'activity',
    description: '包含校际田径赛、初高中诗展、国语周演说与全校班歌合唱比赛。'
  },
  {
    id: 'evt_span_nianzhong_fudao',
    title: '年终假期辅导班 (27/11 - 3/12)',
    date: '2027-11-27',
    endDate: '2027-12-03',
    category: 'activity',
    description: '针对学业强化需求的年终假期辅导班。'
  },

  // ------------------------- 一月 (January) 上课天数: 16 -------------------------
  { id: 'c27_0101', title: '新年元旦', date: '2027-01-01', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_0104', title: '开课日 / 召集团体主席', date: '2027-01-04', category: 'activity', description: '新学年正式开课日，召集各联课团体主席。' },
  { id: 'c27_0105', title: '班会 / 新生乐理测试', date: '2027-01-05', category: 'activity', description: '各班召开班会，初一新生乐理测试。' },
  { id: 'c27_0106', title: '常务会议', date: '2027-01-06', category: 'meeting', description: '周常务会议。' },
  { id: 'c27_0108', title: '开学典礼彩排', date: '2027-01-08', category: 'activity', description: '开学典礼全流程彩排。' },
  { id: 'c27_0109', title: '团体规划发表会', date: '2027-01-09', category: 'activity', description: '各联课社团年度规划发布会。' },
  { id: 'c27_0110', title: '福德正神会老人红包分派活动', date: '2027-01-10', category: 'activity', description: '社区慈善关怀活动。' },
  { id: 'c27_0111', title: '联课 1 - 团体招生', date: '2027-01-11', category: 'activity', description: '全校联课团体纳新招生日。' },
  { id: 'c27_0112', title: '开学典礼', date: '2027-01-12', category: 'activity', description: '2027学年度开学典礼隆重举行。' },
  { id: 'c27_0113', title: '常务会议', date: '2027-01-13', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0116', title: '日新董家教保龄球赛', date: '2027-01-16', category: 'activity', description: '董家教联谊体育赛事。' },
  { id: 'c27_0118', title: '联课 2 - 会员大会', date: '2027-01-18', category: 'activity', description: '各团体召开会员大会。' },
  { id: 'c27_0119', title: '班会', date: '2027-01-19', category: 'meeting', description: '班会课。' },
  { id: 'c27_0120', title: '常务会议', date: '2027-01-20', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0122', title: '大宝森节 (Thaipusam)', date: '2027-01-22', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0123', title: '大山脚庙会', date: '2027-01-23', category: 'activity', description: '参与大山脚社区庙会。' },
  { id: 'c27_0125', title: '联课 3 - 财务研讨', date: '2027-01-25', category: 'meeting', description: '联课团体财务管理研讨会。' },
  { id: 'c27_0126', title: '集会', date: '2027-01-26', category: 'meeting', description: '全校大集会。' },
  { id: 'c27_0127', title: '常务会议', date: '2027-01-27', category: 'meeting', description: '常务会议。' },

  // ------------------------- 二月 (February) 上课天数: 13 -------------------------
  { id: 'c27_0201', title: '联课 4 - 教练会议', date: '2027-02-01', category: 'meeting', description: '各团体教练例行会议。' },
  { id: 'c27_0202', title: '班会 / 迎新春彩排', date: '2027-02-02', category: 'activity', description: '班会课及迎新春文娱演出彩排。' },
  { id: 'c27_0203', title: '行政会议', date: '2027-02-03', category: 'meeting', description: '行政领导会议。' },
  { id: 'c27_0204', title: '迎新春', date: '2027-02-04', category: 'activity', description: '校园迎新春联欢庆典。' },
  { id: 'c27_0205', title: 'Cuti Tambahan KPM (教育部特假)', date: '2027-02-05', category: 'holiday', description: '教育部新年特假。' },
  { id: 'c27_0206', title: '农历新年 (正月初一)', date: '2027-02-06', category: 'holiday', description: '农历新年大年初一。' },
  { id: 'c27_0207', title: '农历新年 (正月初二)', date: '2027-02-07', category: 'holiday', description: '农历新年大年初二。' },
  { id: 'c27_0208', title: '新年补假', date: '2027-02-08', category: 'holiday', description: '农历新年公共补假。' },
  { id: 'c27_0209', title: 'Cuti Tambahan KPM (春假)', date: '2027-02-09', endDate: '2027-02-12', category: 'holiday', description: '教育部特别春假连续假期 (9-12日)。' },
  { id: 'c27_0214', title: '天公诞', date: '2027-02-14', category: 'activity', description: '传统民俗天公诞。' },
  { id: 'c27_0215', title: '联课 5', date: '2027-02-15', category: 'activity', description: '社团联课。' },
  { id: 'c27_0216', title: '集会', date: '2027-02-16', category: 'meeting', description: '周二全校集会。' },
  { id: 'c27_0217', title: '常务会议', date: '2027-02-17', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0218', title: '布告栏设计比赛', date: '2027-02-18', category: 'activity', description: '各班级布告栏环境评比比赛。' },
  { id: 'c27_0220', title: 'English Debate Competition (元宵节)', date: '2027-02-20', category: 'activity', description: '英语辩论比赛，元宵佳节。' },
  { id: 'c27_0222', title: '联课 6 - 移交仪式', date: '2027-02-22', category: 'activity', description: '各社团执委移交仪式。' },
  { id: 'c27_0223', title: '班会 / 防火演习', date: '2027-02-23', category: 'activity', description: '班会课及全校消防疏散演习。' },
  { id: 'c27_0224', title: '可兰经降世日', date: '2027-02-24', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0225', title: 'English Debate Competition', date: '2027-02-25', category: 'activity', description: '英语辩论比赛。' },
  { id: 'c27_0227', title: '校园急救培训', date: '2027-02-27', category: 'activity', description: '红十字/救伤急救素养培训。' },

  // ------------------------- 三月 (March) 上课天数: 18 -------------------------
  { id: 'c27_0301', title: '联课 7', date: '2027-03-01', category: 'activity', description: '社团联课。' },
  { id: 'c27_0302', title: '集会', date: '2027-03-02', category: 'meeting', description: '全校大集会。' },
  { id: 'c27_0303', title: '行政会议', date: '2027-03-03', category: 'meeting', description: '行政统筹会议。' },
  { id: 'c27_0306', title: '学校假期 (6/3 - 14/3)', date: '2027-03-06', endDate: '2027-03-14', category: 'holiday', description: '第一学期期中假。资讯处检修 Lab A、Lab B、Lab C。' },
  { id: 'c27_0310', title: '开斋节 (Hari Raya Aidilfitri)', date: '2027-03-10', endDate: '2027-03-11', category: 'holiday', description: '开斋节公共假期。' },
  { id: 'c27_0315', title: '联课暂停', date: '2027-03-15', category: 'activity', description: '配合第一期考暂停联课。' },
  { id: 'c27_0316', title: '班会', date: '2027-03-16', category: 'meeting', description: '班会课。' },
  { id: 'c27_0317', title: '常务会议', date: '2027-03-17', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0324', title: '常务会议', date: '2027-03-24', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0325', title: '合唱团音乐会采排', date: '2027-03-25', category: 'activity', description: '合唱团年度成果音乐会彩排。' },
  { id: 'c27_0327', title: '合唱团音乐会', date: '2027-03-27', category: 'activity', description: '日新合唱团音乐晚会演出。' },
  { id: 'c27_0329', title: '联课 8', date: '2027-03-29', category: 'activity', description: '社团联课。' },
  { id: 'c27_0330', title: '集会', date: '2027-03-30', category: 'meeting', description: '全校集会。' },
  { id: 'c27_0331', title: '常务会议', date: '2027-03-31', category: 'meeting', description: '常务会议。' },

  // ------------------------- 四月 (April) 上课天数: 21 -------------------------
  { id: 'c27_0402', title: '期考、小考及作业分数输入截止', date: '2027-04-02', category: 'exam', description: '第一期成绩登分截止日。' },
  { id: 'c27_0405', title: '清明节特假', date: '2027-04-05', category: 'holiday', description: '学校清明节特别假期。' },
  { id: 'c27_0406', title: '班会', date: '2027-04-06', category: 'meeting', description: '班会课。' },
  { id: 'c27_0407', title: '行政会议 / 全校说书比赛 / 校园霸凌及儿童保护法律宣导讲座', date: '2027-04-07', category: 'meeting', description: '多项校级专题法制与德育宣导活动。' },
  { id: 'c27_0412', title: '联课 9', date: '2027-04-12', category: 'activity', description: '社团联课。' },
  { id: 'c27_0413', title: '集会 / 校内三语演讲比赛', date: '2027-04-13', category: 'activity', description: '三语演说竞技比赛。' },
  { id: 'c27_0414', title: '常务会议', date: '2027-04-14', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0415', title: '管乐团音乐会采排', date: '2027-04-15', category: 'activity', description: '管乐团演出大彩排。' },
  { id: 'c27_0417', title: '管乐团音乐会', date: '2027-04-17', category: 'activity', description: '日新管乐团音乐会。' },
  { id: 'c27_0419', title: '联课 10', date: '2027-04-19', category: 'activity', description: '社团联课。' },
  { id: 'c27_0420', title: '班会 / 台湾大有国中莅访', date: '2027-04-20', category: 'activity', description: '台湾友好学校来校教育交流参访。' },
  { id: 'c27_0421', title: '常务会议', date: '2027-04-21', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0422', title: '常识比赛 (J2 科学、J3 史地、S3 数学)', date: '2027-04-22', category: 'activity', description: '重点学科综合常识竞赛。' },
  { id: 'c27_0425', title: '家长日 / 美展毕业展开幕', date: '2027-04-25', category: 'meeting', description: '家长会领成绩单，毕业美展盛大开幕。' },
  { id: 'c27_0426', title: '特假 (家长日后补休)', date: '2027-04-26', category: 'holiday', description: '学校特假一日。' },
  { id: 'c27_0427', title: '班会', date: '2027-04-27', category: 'meeting', description: '班会。' },
  { id: 'c27_0428', title: '常务会议', date: '2027-04-28', category: 'meeting', description: '常务会议。' },

  // ------------------------- 五月 (May) 上课天数: 10 -------------------------
  { id: 'c27_0501', title: '劳动节 (Labour Day)', date: '2027-05-01', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_0503', title: '联课暂停 / 感恩华小会议', date: '2027-05-03', category: 'meeting', description: '华小合作联席会议。' },
  { id: 'c27_0504', title: '集会', date: '2027-05-04', category: 'meeting', description: '全校大集会。' },
  { id: 'c27_0505', title: '行政会议', date: '2027-05-05', category: 'meeting', description: '行政会议。' },
  { id: 'c27_0506', title: '华乐团音乐会采排', date: '2027-05-06', category: 'activity', description: '华乐团排练。' },
  { id: 'c27_0507', title: '日新时代出版 1', date: '2027-05-07', category: 'activity', description: '校刊第一期出刊。' },
  { id: 'c27_0508', title: '华乐团音乐会', date: '2027-05-08', category: 'activity', description: '日新华乐团音乐晚会演出。' },
  { id: 'c27_0510', title: '联课 11', date: '2027-05-10', category: 'activity', description: '社团联课。' },
  { id: 'c27_0511', title: '班会', date: '2027-05-11', category: 'meeting', description: '班会。' },
  { id: 'c27_0512', title: '常务会议', date: '2027-05-12', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0513', title: '教职员节 / 传灯独中情采排', date: '2027-05-13', category: 'activity', description: '教师节活动，传灯晚会彩排。' },
  { id: 'c27_0515', title: '传灯独中情文娱晚会', date: '2027-05-15', category: 'activity', description: '大型独中情文娱晚会。' },
  { id: 'c27_0517', title: '哈芝节 (Hari Raya Haji)', date: '2027-05-17', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0518', title: 'Cuti Tambahan KPM', date: '2027-05-18', category: 'holiday', description: '学校特假。' },
  { id: 'c27_0519', title: 'Cuti Tambahan KPM', date: '2027-05-19', category: 'holiday', description: '学校特假。' },
  { id: 'c27_0520', title: '卫塞节 (Wesak Day)', date: '2027-05-20', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0521', title: 'Cuti Tambahan KPM', date: '2027-05-21', category: 'holiday', description: '学校特假。' },
  { id: 'c27_0522', title: '学校假期 (22/5 - 6/6)', date: '2027-05-22', endDate: '2027-06-06', category: 'holiday', description: '第一学期年中学校长假。' },

  // ------------------------- 六月 (June) 上课天数: 16 -------------------------
  { id: 'c27_0606', title: '回历元旦', date: '2027-06-06', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0607', title: '国家元首诞辰', date: '2027-06-07', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_0608', title: '补假', date: '2027-06-08', category: 'holiday', description: '国家元首诞辰补假一日。' },
  { id: 'c27_0609', title: '行政会议 (端午节)', date: '2027-06-09', category: 'meeting', description: '行政会议，农历端午节。' },
  { id: 'c27_0612', title: '威省小学生阅读营', date: '2027-06-12', category: 'activity', description: '社区小学生阅读拓展营。' },
  { id: 'c27_0614', title: '联课 12', date: '2027-06-14', category: 'activity', description: '社团联课。' },
  { id: 'c27_0615', title: '集会', date: '2027-06-15', category: 'meeting', description: '集会。' },
  { id: 'c27_0616', title: '常务会议', date: '2027-06-16', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0617', title: '联课 13 / 感恩华小暨宣教', date: '2027-06-17', category: 'activity', description: '宣教联络活动。' },
  { id: 'c27_0621', title: '联课 14', date: '2027-06-21', category: 'activity', description: '社团联课。' },
  { id: 'c27_0622', title: '班会', date: '2027-06-22', category: 'meeting', description: '班会。' },
  { id: 'c27_0623', title: '常务会议', date: '2027-06-23', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0628', title: '联课暂停', date: '2027-06-28', category: 'activity', description: '配合第二期考暂停联课。' },
  { id: 'c27_0630', title: '常务会议', date: '2027-06-30', category: 'meeting', description: '常务会议。' },

  // ------------------------- 七月 (July) 上课天数: 21 -------------------------
  { id: 'c27_0707', title: '乔治市世遗日', date: '2027-07-07', category: 'holiday', description: '槟城州公共假期。' },
  { id: 'c27_0710', title: '槟州元首诞辰', date: '2027-07-10', category: 'holiday', description: '槟城州公共假期。' },
  { id: 'c27_0712', title: '联课 15 / MUET 口试 (MUET: Ujian Lisan)', date: '2027-07-12', category: 'exam', description: 'MUET 英语水平测试口试。' },
  { id: 'c27_0713', title: '班会', date: '2027-07-13', category: 'meeting', description: '班会。' },
  { id: 'c27_0714', title: '行政会议', date: '2027-07-14', category: 'meeting', description: '行政会议。' },
  { id: 'c27_0717', title: '02/07 届同学毕业 20 周年庆', date: '2027-07-17', category: 'activity', description: '校友返校日庆典。' },
  { id: 'c27_0719', title: '联课 16', date: '2027-07-19', category: 'activity', description: '社团联课。' },
  { id: 'c27_0720', title: '集会', date: '2027-07-20', category: 'meeting', description: '大集会。' },
  { id: 'c27_0721', title: '常务会议', date: '2027-07-21', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0723', title: '期考、小考及作业分数输入截止', date: '2027-07-23', category: 'exam', description: '第二期成绩登分截止日。' },
  { id: 'c27_0724', title: '校园开放日 / MUET 笔试 (MUET: Ujian Bertulis)', date: '2027-07-24', category: 'activity', description: '全校开放日；MUET 笔试。' },
  { id: 'c27_0726', title: '联课 17', date: '2027-07-26', category: 'activity', description: '社团联课。' },
  { id: 'c27_0727', title: '班会', date: '2027-07-27', category: 'meeting', description: '班会。' },
  { id: 'c27_0728', title: '常务会议 / FSI 生涯规划讲座', date: '2027-07-28', category: 'activity', description: '高三升学辅导讲座。' },
  { id: 'c27_0729', title: 'FSI 教育展', date: '2027-07-29', category: 'activity', description: '高校教育展博览会。' },

  // ------------------------- 八月 (August) 上课天数: 19 -------------------------
  { id: 'c27_0802', title: '联课 18 / J1 及 J2 会员申请转会 (2/8 - 27/8)', date: '2027-08-02', category: 'activity', description: '初一初二联课转会申请启动。' },
  { id: 'c27_0803', title: '集会 / 书法展', date: '2027-08-03', category: 'activity', description: '师生书法展。' },
  { id: 'c27_0804', title: '行政会议', date: '2027-08-04', category: 'meeting', description: '行政会议。' },
  { id: 'c27_0809', title: '联课 19', date: '2027-08-09', category: 'activity', description: '社团联课。' },
  { id: 'c27_0810', title: '班会', date: '2027-08-10', category: 'meeting', description: '班会。' },
  { id: 'c27_0811', title: '常务会议', date: '2027-08-11', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0815', title: '穆罕默德诞辰', date: '2027-08-15', category: 'holiday', description: '公共假期。' },
  { id: 'c27_0816', title: '中元节补假', date: '2027-08-16', category: 'holiday', description: '中元节特假补休。' },
  { id: 'c27_0817', title: '班会', date: '2027-08-17', category: 'meeting', description: '班会。' },
  { id: 'c27_0818', title: '常务会议', date: '2027-08-18', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0823', title: '联课 20 / 桌面维修', date: '2027-08-23', category: 'activity', description: '班级公物及微机室桌椅维修。' },
  { id: 'c27_0824', title: '集会', date: '2027-08-24', category: 'meeting', description: '集会。' },
  { id: 'c27_0825', title: '常务会议', date: '2027-08-25', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0827', title: '转会申请截止', date: '2027-08-27', category: 'activity', description: '社团转会申请收件截止。' },
  { id: 'c27_0828', title: '学校假期 (28/8 - 5/9)', date: '2027-08-28', endDate: '2027-09-05', category: 'holiday', description: '第二学期期中假。' },
  { id: 'c27_0831', title: '国庆日', date: '2027-08-31', category: 'holiday', description: '马来西亚国庆日公共假期。' },

  // ------------------------- 九月 (September) 上课天数: 18 -------------------------
  { id: 'c27_0906', title: '联课 21 - 团体会员大会', date: '2027-09-06', category: 'activity', description: '团体会员大会。' },
  { id: 'c27_0907', title: '集会', date: '2027-09-07', category: 'meeting', description: '集会。' },
  { id: 'c27_0908', title: '行政会议', date: '2027-09-08', category: 'meeting', description: '行政会议。' },
  { id: 'c27_0910', title: '呈交联课分数 / 评语 / 表格', date: '2027-09-10', category: 'activity', description: '联课分数汇总提交。' },
  { id: 'c27_0911', title: '新生入学考试', date: '2027-09-11', category: 'exam', description: '2028初一新生入学招考。' },
  { id: 'c27_0913', title: '联课暂停 / S3 文学与文化常识比赛 (初)', date: '2027-09-13', category: 'activity', description: '高三常识初赛。' },
  { id: 'c27_0914', title: '班会', date: '2027-09-14', category: 'meeting', description: '班会。' },
  { id: 'c27_0915', title: '常务会议 (中秋节)', date: '2027-09-15', category: 'meeting', description: '常务会议，中秋佳节。' },
  { id: 'c27_0916', title: '马来西亚日', date: '2027-09-16', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_0920', title: '联课暂停 / 阅读护照审核截止', date: '2027-09-20', category: 'activity', description: '大考期间联课暂停，阅读护照审核。' },
  { id: 'c27_0922', title: '常务会议', date: '2027-09-22', category: 'meeting', description: '常务会议。' },
  { id: 'c27_0924', title: '班级杰出学生提交名单截止', date: '2027-09-24', category: 'activity', description: '杰出学生班级推举截止。' },
  { id: 'c27_0927', title: '联课暂停', date: '2027-09-27', category: 'activity', description: '配合期末考。' },
  { id: 'c27_0929', title: '常务会议', date: '2027-09-29', category: 'meeting', description: '常务会议。' },

  // ------------------------- 十月 (October) 上课天数: 18 -------------------------
  { id: 'c27_1001', title: 'S3 文学与文化常识比赛 (决赛)', date: '2027-10-01', category: 'activity', description: '高三常识决赛。' },
  { id: 'c27_1004', title: '联课 22', date: '2027-10-04', category: 'activity', description: '社团联课。' },
  { id: 'c27_1005', title: '集会 / 全校杰出学生申请截止', date: '2027-10-05', category: 'activity', description: '杰出学生个人申请截止。' },
  { id: 'c27_1006', title: '面试团体正副主席 / 行政会议', date: '2027-10-06', category: 'meeting', description: '面试选拔2028新届社团主席。' },
  { id: 'c27_1007', title: '日新时代出版 2', date: '2027-10-07', category: 'activity', description: '校刊第二期出刊。' },
  { id: 'c27_1008', title: '毕业考、小考及作业分数输入截止', date: '2027-10-08', category: 'exam', description: '高三初三毕业成绩结算。' },
  { id: 'c27_1009', title: '暂订校庆宴会', date: '2027-10-09', category: 'activity', description: '日新校庆晚宴。' },
  { id: 'c27_1011', title: '联课 23 - 团体总结发表会', date: '2027-10-11', category: 'activity', description: '全年联课成果发表。' },
  { id: 'c27_1012', title: '班会', date: '2027-10-12', category: 'meeting', description: '班会。' },
  { id: 'c27_1013', title: '常务会议', date: '2027-10-13', category: 'meeting', description: '常务会议。' },
  { id: 'c27_1015', title: '第三期考、小考及作业分数输入截止', date: '2027-10-15', category: 'exam', description: '全校学生学年总评登分截止。' },
  { id: 'c27_1027', title: 'Cuti Tambahan KPM (屠妖节特假)', date: '2027-10-27', category: 'holiday', description: '学校特别假期。' },
  { id: 'c27_1028', title: '屠妖节', date: '2027-10-28', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_1029', title: 'Cuti Tambahan KPM', date: '2027-10-29', category: 'holiday', description: '学校特别假期。' },

  // ------------------------- 十一月 (November) 上课天数: 22 -------------------------
  { id: 'c27_1101', title: '联课 24 / 日星颁奖礼采排', date: '2027-11-01', category: 'activity', description: '日星颁奖典礼流程彩排。' },
  { id: 'c27_1102', title: '集会', date: '2027-11-02', category: 'meeting', description: '大集会。' },
  { id: 'c27_1103', title: '行政会议', date: '2027-11-03', category: 'meeting', description: '行政会议。' },
  { id: 'c27_1104', title: '全校杰出学生候选人拉票', date: '2027-11-04', category: 'activity', description: '杰出学生候选人政见发表与竞选。' },
  { id: 'c27_1108', title: '联课 25 / 初中华文诗歌朗诵比赛', date: '2027-11-08', category: 'activity', description: '初中年级朗诵观摩赛。' },
  { id: 'c27_1109', title: '班会 / 全校杰出学生奖投票', date: '2027-11-09', category: 'activity', description: '全校师生一人一票民主投票。' },
  { id: 'c27_1110', title: '常务会议 / S1 华文戏剧比赛', date: '2027-11-10', category: 'activity', description: '高一华文短剧展演。' },
  { id: 'c27_1112', title: 'S2 华文戏剧比赛', date: '2027-11-12', category: 'activity', description: '高二华文戏剧比赛。' },
  { id: 'c27_1113', title: '科学营', date: '2027-11-13', category: 'activity', description: '青少年科技实验体验营。' },
  { id: 'c27_1115', title: '联课 26 - 日星颁奖礼', date: '2027-11-15', category: 'activity', description: '隆重表彰杰出联课代表。' },
  { id: 'c27_1116', title: '集会', date: '2027-11-16', category: 'meeting', description: '集会。' },
  { id: 'c27_1117', title: '常务会议', date: '2027-11-17', category: 'meeting', description: '常务会议。' },
  { id: 'c27_1118', title: '毕业典礼采排', date: '2027-11-18', category: 'activity', description: '毕业典礼彩排。' },
  { id: 'c27_1120', title: '毕业典礼', date: '2027-11-20', category: 'activity', description: '2027届初中暨高中毕业典礼。' },
  { id: 'c27_1122', title: '联课 27', date: '2027-11-22', category: 'activity', description: '全年最后一次社团联课活动。' },
  { id: 'c27_1123', title: '班会 / 温毓堂教育基金颁发礼', date: '2027-11-23', category: 'activity', description: '奖助学金颁发仪式。' },
  { id: 'c27_1124', title: '常务会议', date: '2027-11-24', category: 'meeting', description: '常务会议。' },
  { id: 'c27_1125', title: '吾爱社区', date: '2027-11-25', category: 'activity', description: '走出校园开展社区服务与劳动清洁。' },
  { id: 'c27_1126', title: '休业仪式', date: '2027-11-26', category: 'activity', description: '2027学年全校正式休业式。' },

  // ------------------------- 十二月 (December) 上课天数: 3 -------------------------
  { id: 'c27_1204', title: '学校假期 (4/12 - 31/12)', date: '2027-12-04', endDate: '2027-12-31', category: 'holiday', description: '全国中小学年终长假。' },
  { id: 'c27_1222', title: '冬至', date: '2027-12-22', category: 'holiday', description: '传统民俗冬至。' },
  { id: 'c27_1225', title: '圣诞节', date: '2027-12-25', category: 'holiday', description: '全国公共假期。' },
  { id: 'c27_1227', title: '行政会议', date: '2027-12-27', category: 'meeting', description: '行政领导会议。' },
  { id: 'c27_1228', title: '校务会议 / 班导师会议', date: '2027-12-28', category: 'meeting', description: '新学年工作布达与班导师会议。' },
  { id: 'c27_1229', title: '联课首席指导老师会议 / 学科主任会议', date: '2027-12-29', category: 'meeting', description: '教研与联课统筹。' },
  { id: 'c27_1230', title: '各学科小组会议 / 新手老师会议', date: '2027-12-30', category: 'meeting', description: '资讯科集体备课研习。' },
  { id: 'c27_1231', title: '2028 新生始业辅导营', date: '2027-12-31', category: 'activity', description: '迎接2028学年初一新生。' }
];

export const initialAnnouncements: SchoolAnnouncement[] = [
  {
    id: 'a1',
    title: '【重要通知】Lab A、Lab B、Lab C 统一进行系统镜像同传与还原保护更新',
    author: '黄世泓',
    role: 'IT老师 / 资讯处助理',
    date: '2027-03-08 09:30',
    pinned: true,
    type: 'facility',
    content: '各位教职员工好：本周三（3月12日）晚 20:00，资讯处将对 Lab A（60座）、Lab B（50座）与 Lab C（55座）共 165 台学生电脑执行操作系统补丁更新与还原系统重置。请上《电脑资讯与工艺》和《资讯科技》的任课老师提醒学生保存个人作品至云端，避免数据丢失。',
    readCount: 142
  },
  {
    id: 'a2',
    title: '【教学通知】初中《电脑资讯与工艺》及高中《资讯科技》教学进度备忘',
    author: '林慈贤',
    role: 'IT老师 / 资讯处助理',
    date: '2027-03-05 14:15',
    pinned: true,
    type: 'teaching',
    content: '请各位老师在工作台查看最新排课安排：初中阶段课程（J1U1~J3U11）统一使用《电脑资讯与工艺》大纲，高中阶段（S1A1~S3SE）使用《资讯科技》大纲。目前三间电脑室软硬件环境均已完成对应模块配置。',
    readCount: 215
  }
];
