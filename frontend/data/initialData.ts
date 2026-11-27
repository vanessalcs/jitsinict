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
    email: 'shng@jitsin-ind.edu.my',
    role: 'it_teacher',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-sky-500 to-indigo-600',
    assignedClasses: ['J1U1', 'J1U2', 'J2U1', 'S1A1', 'S2C1']
  },
  {
    id: 'u_lin',
    name: '林慈贤',
    email: 'cslim@jitsin-ind.edu.my',
    role: 'it_admin',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-emerald-500 to-teal-600',
    assignedClasses: ['J1U3', 'J2U2', 'J3U1', 'S1C1', 'S3SC']
  },
  {
    id: 'u_zheng',
    name: '郑毓铭',
    email: 'ymteh@jitsin-ind.edu.my',
    role: 'it_teacher',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-amber-500 to-orange-600',
    assignedClasses: []
  },
  {
    id: 'u_wu',
    name: '吴镇宏',
    email: 'chenhungng@jitsin-ind.edu.my',
    role: 'it_teacher',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-purple-500 to-pink-600',
    assignedClasses: []
  },
  {
    id: 'u_liang',
    name: '梁可桔',
    email: 'kjleong@jitsin-ind.edu.my',
    role: 'it_teacher',
    title: 'IT老师 / 资讯处助理',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-rose-500 to-red-600',
    assignedClasses: []
  },
  {
    id: 'u_liao',
    name: '廖梧茳',
    email: 'bkleow@jitsin-ind.edu.my',
    role: 'it_admin',
    title: 'IT老师 兼 资讯处主任',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-cyan-500 to-blue-600',
    assignedClasses: []
  },
  {
    id: 'u_ict',
    name: '资讯处',
    email: 'ict@jitsin-ind.edu.my',
    role: 'it_admin',
    title: '资讯处公共账号',
    department: '资讯处 / 电脑科',
    avatarColor: 'from-slate-500 to-slate-700',
    assignedClasses: []
  }
];

// 教室教学日志初始记录 (方便老师查看上周教了什么，每周清晰填报)
export const initialTeachingJournals: TeachingJournalEntry[] = [];

// 电脑室硬件/网络故障报修工单 (让资讯处技术人员一目了然)
export const initialLabTickets: LabMaintenanceTicket[] = [];

export const initialTeachingResources: TeachingResource[] = [];

export const initialGrades: StudentGrade[] = [];

export const initialHomework: HomeworkSubmission[] = [];

// 符合 9 节课时精准时间表（07:55 - 14:20，每节 35 分钟）
export const initialTimetable: TimetableSlot[] = [];

export const initialDocuments: SchoolDocument[] = [];

// =========================================================================================
// 2027 年官方行事历（第 6 版：25.11.2026），全学年上课日数 195 天
// =========================================================================================
type CalCat = CalendarEvent['category'];
const ev = (date: string, title: string, category: CalCat, endDate?: string, description = ''): CalendarEvent => ({
  id: `c27_${date.slice(5).replace('-', '')}${endDate ? '_span' : ''}_${title.length}`,
  title,
  date: `2027-${date}`,
  ...(endDate ? { endDate: `2027-${endDate}` } : {}),
  category,
  description,
});

export const initialCalendarEvents: CalendarEvent[] = [
  // ------------------------- 一月 (January) 上课天数: 18 -------------------------
  ev('01-01', '新年元旦', 'holiday'),
  ev('01-04', '开课日 / 召集团体主席', 'activity'),
  ev('01-05', '班会 1 / 新生乐理测试', 'activity'),
  ev('01-06', '常务会议', 'meeting'),
  ev('01-08', '开学典礼彩排', 'activity'),
  ev('01-09', '团体规划发表会 / 福德正神会老人红包分派活动筹备日', 'activity'),
  ev('01-10', '福德正神会老人红包分派活动', 'activity'),
  ev('01-11', '联课 1 - 团体招生', 'activity'),
  ev('01-12', '开学典礼', 'activity'),
  ev('01-13', '常务会议', 'meeting'),
  ev('01-15', '《南方文学之旅：马华诗文朗诵巡回表演》', 'activity'),
  ev('01-16', '日新董家教保龄球赛', 'activity'),
  ev('01-18', '联课 2 - 会员大会', 'activity'),
  ev('01-19', '班会 2', 'meeting'),
  ev('01-20', '常务会议', 'meeting'),
  ev('01-22', '大宝森节', 'holiday'),
  ev('01-23', '大山脚庙会', 'activity'),
  ev('01-25', '联课 3 - 财务文书研讨', 'meeting'),
  ev('01-26', '集会 1 / 科普讲座', 'activity'),
  ev('01-27', '常务会议', 'meeting'),
  ev('01-29', '教职员专业日 1', 'activity'),
  ev('01-30', '跨阅 7.0 - 摄影工作坊', 'activity'),

  // ------------------------- 二月 (February) 上课天数: 13 -------------------------
  ev('02-01', '联课 4 - 教练会议', 'meeting'),
  ev('02-02', '班会 3 / 迎新春彩排', 'activity', '02-03'),
  ev('02-03', '行政会议', 'meeting'),
  ev('02-04', '迎新春', 'activity'),
  ev('02-05', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('02-06', '农历新年 (正月初一)', 'holiday'),
  ev('02-07', '农历新年 (正月初二)', 'holiday'),
  ev('02-08', '补假', 'holiday'),
  ev('02-09', 'Cuti Tambahan KPM (教育部特假)', 'holiday', '02-11'),
  ev('02-12', 'Cuti Tambahan KPM / 春节亚洲文化访问团慈善演出', 'holiday'),
  ev('02-14', '天公诞', 'activity'),
  ev('02-15', '联课 5', 'activity'),
  ev('02-15', '日新文学奖征稿 (15/2 - 31/8)', 'activity', '08-31'),
  ev('02-16', '集会 2', 'meeting'),
  ev('02-17', '常务会议 / 华语辩论比赛 (初赛)', 'meeting'),
  ev('02-18', '布告栏设计比赛 / 华语辩论比赛 (复赛)', 'activity'),
  ev('02-20', 'English Debate Competition (元宵节)', 'activity'),
  ev('02-22', '联课 6 - 移交仪式 / 华语辩论比赛 (半决赛)', 'activity'),
  ev('02-23', '防火演习 / 华语辩论比赛 (决赛)', 'activity'),
  ev('02-24', '可兰经降世日', 'holiday'),
  ev('02-25', '家教协会大会', 'activity'),
  ev('02-26', 'English Debate Competition', 'activity'),
  ev('02-27', '大山脚福德正神会大团拜', 'activity'),

  // ------------------------- 三月 (March) 上课天数: 18 -------------------------
  ev('03-01', '联课 7', 'activity'),
  ev('03-02', '集会 3', 'meeting'),
  ev('03-03', '行政会议', 'meeting'),
  ev('03-06', '学校假期 (6/3 - 14/3)', 'holiday', '03-14'),
  ev('03-10', '开斋节', 'holiday', '03-11'),
  ev('03-15', '联课暂停', 'activity'),
  ev('03-16', '班会 4', 'meeting'),
  ev('03-17', '常务会议', 'meeting'),
  ev('03-18', '第一期考及作业抽查 (18/3 - 24/3)', 'exam', '03-24'),
  ev('03-20', '教职员专业日 2', 'activity'),
  ev('03-24', '常务会议 / 常识比赛 (J2 科学、J3 史地、S3 数学)', 'meeting'),
  ev('03-25', '合唱团音乐会彩排', 'activity', '03-26'),
  ev('03-27', '合唱团音乐会', 'activity'),
  ev('03-29', '联课 8', 'activity'),
  ev('03-30', '集会 4', 'meeting'),
  ev('03-31', '常务会议', 'meeting'),

  // ------------------------- 四月 (April) 上课天数: 21 -------------------------
  ev('04-02', '期考、小考及作业分数输入截止', 'exam'),
  ev('04-05', '清明节特假', 'holiday'),
  ev('04-06', '班会 5', 'meeting'),
  ev('04-06', '上学期观课周 (6/4 - 16/4)', 'activity', '04-16'),
  ev('04-07', '行政会议 / 校园霸凌及儿童保护法律宣导讲座', 'meeting'),
  ev('04-08', '全校说书比赛', 'activity'),
  ev('04-12', '联课 9 / 台湾高等教育展', 'activity'),
  ev('04-13', '集会 5 / 校内三语演讲比赛', 'activity'),
  ev('04-14', '常务会议', 'meeting'),
  ev('04-15', '管乐团音乐会彩排', 'activity', '04-16'),
  ev('04-17', '管乐团音乐会', 'activity'),
  ev('04-19', '联课 10 / 美展暨毕业展布置', 'activity'),
  ev('04-19', '日新黄花艺术季 (19/4 - 25/4)', 'activity', '04-25'),
  ev('04-22', '美展 / 毕业展 / 书展 (22/4 - 28/4)', 'activity', '04-28'),
  ev('04-20', '班会 6 / 台湾大有国中莅访', 'activity'),
  ev('04-21', '常务会议', 'meeting'),
  ev('04-25', '家长日 / J3 选科说明会 / 美展暨毕业展开幕', 'activity'),
  ev('04-26', '特假', 'holiday'),
  ev('04-27', '班会 7', 'meeting'),
  ev('04-28', '常务会议', 'meeting'),
  ev('04-29', '撤展 / Minggu BM', 'activity'),

  // ------------------------- 五月 (May) 上课天数: 10 -------------------------
  ev('05-01', '劳动节', 'holiday'),
  ev('05-03', '联课暂停 / 感恩华小会议 1', 'meeting'),
  ev('05-04', '集会 6', 'meeting'),
  ev('05-05', '行政会议', 'meeting'),
  ev('05-06', '华乐团音乐会彩排', 'activity', '05-07'),
  ev('05-07', '日新时代出版 1', 'activity'),
  ev('05-08', '华乐团音乐会', 'activity'),
  ev('05-10', '联课 11', 'activity'),
  ev('05-10', 'English Week 英语周 (10/5 - 12/5)', 'activity', '05-12'),
  ev('05-11', '班会 8', 'meeting'),
  ev('05-12', '常务会议', 'meeting'),
  ev('05-13', '教职员节彩排 / 槟州独中基金会周年庆节目彩排', 'activity', '05-14'),
  ev('05-14', '教职员节', 'activity'),
  ev('05-15', '槟州独中基金会 20 周年庆', 'activity'),
  ev('05-17', '哈芝节', 'holiday'),
  ev('05-17', '高中文商乡土考察 (17/5 - 19/5)', 'activity', '05-19'),
  ev('05-18', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('05-19', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('05-20', '卫塞节', 'holiday'),
  ev('05-21', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('05-22', '学校假期 (22/5 - 6/6)', 'holiday', '06-06'),

  // ------------------------- 六月 (June) 上课天数: 16 -------------------------
  ev('06-06', '回历元旦', 'holiday'),
  ev('06-07', '国家元首诞辰', 'holiday'),
  ev('06-08', '补假', 'holiday'),
  ev('06-09', '行政会议 (端午节)', 'meeting'),
  ev('06-12', '威省小学生阅读营', 'activity', '06-13'),
  ev('06-14', '联课 12', 'activity'),
  ev('06-15', '集会 7', 'meeting'),
  ev('06-16', '常务会议', 'meeting'),
  ev('06-17', '联课 13 / 感恩华小暨宣教', 'activity'),
  ev('06-18', '全校硬笔书法比赛', 'activity'),
  ev('06-19', '校园急救培训', 'activity'),
  ev('06-21', '联课暂停 / 北马区三语演讲 (韩江)', 'activity'),
  ev('06-22', '班会 9', 'meeting'),
  ev('06-23', '常务会议', 'meeting'),
  ev('06-26', '教职员专业日 3', 'activity'),
  ev('06-28', '第二期考 (28/6 - 8/7)', 'exam', '07-08'),
  ev('06-30', '常务会议', 'meeting'),

  // ------------------------- 七月 (July) 上课天数: 20 -------------------------
  ev('07-07', '乔治市世遗日', 'holiday'),
  ev('07-09', '五独中教师专业日', 'activity'),
  ev('07-10', '槟州元首诞辰', 'holiday'),
  ev('07-12', '联课 14', 'activity'),
  ev('07-13', '班会 10 / MUET: Ujian Lisan (13/7 - 15/7)', 'exam', '07-15'),
  ev('07-14', '行政会议', 'meeting'),
  ev('07-17', '02/07 届同学毕业 20 周年庆', 'activity'),
  ev('07-19', '联课 15', 'activity'),
  ev('07-19', '学科周 (历史、辅导) / 诗展 / 跨阅 7.0 展 (19/7 - 24/7)', 'activity', '07-24'),
  ev('07-20', '集会 8', 'meeting'),
  ev('07-21', '常务会议', 'meeting'),
  ev('07-23', '期考、小考及作业分数输入截止', 'exam'),
  ev('07-24', '校园开放日 / MUET: Ujian Bertulis', 'activity'),
  ev('07-26', '联课 16', 'activity'),
  ev('07-26', '科学周 (26/7 - 30/7)', 'activity', '07-30'),
  ev('07-27', '班会 11 / 跨阅 7.0 成果汇报会', 'activity'),
  ev('07-28', '常务会议 / FSI 生涯规划讲座', 'activity'),
  ev('07-29', 'FSI 教育展', 'activity'),

  // ------------------------- 八月 (August) 上课天数: 19 -------------------------
  ev('08-02', '联课 17 / J1 及 J2 会员申请转会 (2/8 - 27/8)', 'activity', '08-27'),
  ev('08-02', '下学期观课周 (2/8 - 13/8)', 'activity', '08-13'),
  ev('08-03', '集会 9', 'meeting'),
  ev('08-04', '行政会议', 'meeting'),
  ev('08-04', '爱校筹款 (4/8 - 18/8)', 'activity', '08-18'),
  ev('08-09', '联课 18', 'activity'),
  ev('08-10', '班会 12', 'meeting'),
  ev('08-11', '常务会议', 'meeting'),
  ev('08-15', '穆罕默德诞辰', 'holiday'),
  ev('08-16', '补假 (中元节)', 'holiday'),
  ev('08-17', '班会 13', 'meeting'),
  ev('08-18', '常务会议', 'meeting'),
  ev('08-21', '日新中学教育基金助学金颁发礼 (暂订)', 'activity'),
  ev('08-23', '联课 19', 'activity'),
  ev('08-24', '集会 10', 'meeting'),
  ev('08-25', '常务会议 / 防诈骗讲座', 'activity'),
  ev('08-27', '转会申请截止', 'activity'),
  ev('08-28', '学校假期 (28/8 - 5/9)', 'holiday', '09-05'),
  ev('08-31', '国庆日', 'holiday'),

  // ------------------------- 九月 (September) 上课天数: 17 -------------------------
  ev('09-06', '联课 20 - 团体会员大会', 'activity'),
  ev('09-07', '集会 11', 'meeting'),
  ev('09-08', '行政会议', 'meeting'),
  ev('09-10', '呈交联课分数 / 评语 / 表格 / S3 文学与文化常识比赛 (初赛)', 'activity'),
  ev('09-11', '新生入学考试', 'exam'),
  ev('09-13', '联课暂停', 'activity'),
  ev('09-13', 'J3 / S3 毕业考 (13/9 - 22/9)', 'exam', '09-22'),
  ev('09-14', '班会 14', 'meeting'),
  ev('09-15', '中秋节特假', 'holiday'),
  ev('09-16', '马来西亚日', 'holiday'),
  ev('09-20', '联课暂停 / 阅读护照审核截止', 'activity'),
  ev('09-21', '第三期考及作业抽查 (21/9 - 30/9)', 'exam', '09-30'),
  ev('09-22', '常务会议', 'meeting'),
  ev('09-24', '班级杰出学生提交名单截止', 'activity'),
  ev('09-27', '联课暂停', 'activity'),
  ev('09-29', '常务会议', 'meeting'),

  // ------------------------- 十月 (October) 上课天数: 18 -------------------------
  ev('10-01', '全校国语听力测验 / S3 文学与文化常识比赛 (决赛)', 'exam'),
  ev('10-04', '联课 21 / 桌面维修', 'maintenance', '10-05'),
  ev('10-05', '集会 12 / 全校杰出学生申请截止', 'activity'),
  ev('10-06', '面试团体正副主席 / 行政会议', 'meeting'),
  ev('10-07', '日新时代出版 2', 'activity'),
  ev('10-08', 'J3 / S3 毕业考、小考及作业分数输入截止 / 统考说明会', 'exam'),
  ev('10-09', '校庆宴会 (暂订)', 'activity'),
  ev('10-11', '联课 22 - 团体总结发表会 / 提交 2028 年各单位活动项目', 'activity'),
  ev('10-12', '班会 15', 'meeting'),
  ev('10-13', '常务会议', 'meeting'),
  ev('10-15', '期考、小考及作业分数输入截止 / 提交 2028 年预算案', 'exam'),
  ev('10-18', '预测统考 (18/10 - 26/10)', 'exam', '10-26'),
  ev('10-27', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('10-28', '屠妖节', 'holiday'),
  ev('10-29', 'Cuti Tambahan KPM (教育部特假)', 'holiday'),
  ev('10-31', '各处总结校外比赛成绩 / 提交毕业典礼校务汇报手册资料', 'activity'),

  // ------------------------- 十一月 (November) 上课天数: 22 -------------------------
  ev('11-01', '联课 23 / 日星颁奖礼彩排', 'activity'),
  ev('11-02', '集会 13', 'meeting'),
  ev('11-02', '全校杰出学生候选人拉票 (2/11 - 8/11)', 'activity', '11-08'),
  ev('11-03', '行政会议 / 班歌比赛筹备日', 'meeting'),
  ev('11-04', '班歌比赛', 'activity', '11-05'),
  ev('11-06', '教职员专业日 4 - 教学成果发表会', 'activity'),
  ev('11-08', '联课暂停', 'activity'),
  ev('11-08', '田径锦标赛 (8/11 - 12/11)', 'activity', '11-12'),
  ev('11-09', '班会 16 / 全校杰出学生奖投票', 'activity'),
  ev('11-10', '常务会议', 'meeting'),
  ev('11-13', '科学营', 'activity', '11-14'),
  ev('11-15', '联课 24 - 日星颁奖礼', 'activity'),
  ev('11-16', '班会 17 / 毕业典礼彩排', 'activity'),
  ev('11-17', '常务会议', 'meeting'),
  ev('11-20', '毕业典礼', 'activity'),
  ev('11-22', '联课 25 / 初中华文诗歌朗诵比赛', 'activity'),
  ev('11-23', '班会 18 / 温毓堂教育基金颁发礼 / S1 华文戏剧比赛彩排', 'activity'),
  ev('11-24', '常务会议 / S1 华文戏剧比赛', 'activity'),
  ev('11-25', '吾爱社区', 'activity'),
  ev('11-26', '休业仪式', 'activity'),
  ev('11-27', '年终假期辅导班 (27/11 - 3/12)', 'activity', '12-03'),
  ev('11-30', '各处提交总结报告及教职员手册资料', 'activity'),

  // ------------------------- 十二月 (December) 上课天数: 3 -------------------------
  ev('12-04', '学校假期 (4/12 - 31/12)', 'holiday', '12-31'),
  ev('12-11', '华教之旅 (日新负责)', 'activity', '12-12'),
  ev('12-22', '冬至', 'holiday'),
  ev('12-25', '圣诞节', 'holiday'),
  ev('12-27', '行政会议', 'meeting'),
  ev('12-28', '校务会议 / 班导师会议', 'meeting'),
  ev('12-29', '联课首席指导老师会议 / 学科主任会议', 'meeting'),
  ev('12-30', '各学科小组会议 / 新手老师会议', 'meeting'),
  ev('12-31', '2028 新生始业辅导营', 'activity'),
];

export const initialAnnouncements: SchoolAnnouncement[] = [];