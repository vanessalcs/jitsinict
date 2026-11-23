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
  LabMaintenanceTicket,
  TeachingProgressRecord
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

export const initialAnnouncements: SchoolAnnouncement[] = [];

// 教学进度初始记录
export const initialTeachingProgress: TeachingProgressRecord[] = [];