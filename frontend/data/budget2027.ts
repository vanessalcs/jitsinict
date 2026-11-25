// 2027 年资讯处预算（来源：「2027 BUDGET 资讯处.xlsx」，2026-11-18 版本）
// 类别预算取自 MASTER BUDGET27 工作表，每个类别下的项目取自对应的分页。
// 只列出有预算的类别；预算为 0 的类别不显示。

export interface BudgetItem {
  /** 稳定的编号：「类别序号-项目序号」，用来保存实际支出，请勿随意改动 */
  id: string;
  name: string;
  unitPrice: number; // 预算单价 (RM)
  qty: number; // 预算数量
}

export interface BudgetCategory {
  code: number; // 类别序号
  zh: string;
  en: string;
  budget: number; // 类别预算 (RM)
  items: BudgetItem[];
}

export const BUDGET_YEAR = 2027;

const item = (code: number, no: number, name: string, unitPrice: number, qty: number): BudgetItem => ({
  id: `${code}-${no}`,
  name,
  unitPrice,
  qty,
});

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    code: 2,
    zh: '电脑用品',
    en: 'Computer & Printer Supplies',
    budget: 68345.6,
    items: [
      item(2, 1, '各处打印机toner', 15000, 1),
      item(2, 2, '滑鼠', 50, 10),
      item(2, 3, '键盘', 50, 10),
      item(2, 4, 'SSD硬盘', 500, 60),
      item(2, 5, '电脑荧幕', 500, 15),
      item(2, 6, '激光笔', 47.8, 2),
      item(2, 7, '电脑电池 CMOS', 3, 50),
      item(2, 8, '怀德楼打印机请购', 800, 1),
      item(2, 11, '伺服器交换器', 2500, 2),
      item(2, 12, '怀德楼电脑请购', 5000, 1),
      item(2, 13, '美术科Visualizer', 400, 3),
      item(2, 14, 'Hub', 300, 2),
      item(2, 15, '平板请购', 2000, 1),
    ],
  },
  {
    code: 5,
    zh: '器材、设施与维修',
    en: 'Equipment, Facilities & Maintenance',
    budget: 274800,
    items: [
      item(5, 1, '打印机维修', 2500, 1),
      item(5, 2, '礼堂投影机升降维修', 10000, 1),
      item(5, 4, '电子白板月租', 20900, 12),
      item(5, 5, 'CCTV维修', 4500, 1),
      item(5, 6, '学生证打卡机维修', 500, 1),
      item(5, 7, '各处电脑维修', 3500, 1),
      item(5, 8, '伺服器维修', 2000, 1),
      item(5, 9, '电子白板维修', 1000, 1),
    ],
  },
  {
    code: 14,
    zh: '系统软件平台费',
    en: 'System & Software Platform Fee',
    budget: 25700,
    items: [
      item(14, 1, '伺服器年费', 7800, 1),
      item(14, 2, '校园系统管理年费-Mr Lee', 1300, 12),
      item(14, 3, '支付平台年费-Mr Yap', 2000, 1),
      item(14, 4, 'DNS订阅年费', 300, 1),
    ],
  },
  {
    code: 16,
    zh: '通讯费',
    en: 'Communication Fee',
    budget: 9740,
    items: [
      item(16, 1, 'Unifi网络', 500, 12),
      item(16, 2, 'Maxis', 270, 12),
      item(16, 3, '多媒体处专线（RM40*12个月+SIM card）', 500, 1),
    ],
  },
  {
    code: 17,
    zh: '行政费用',
    en: 'Administrative Expenses',
    budget: 21606.52,
    items: [
      item(17, 1, 'Claude年费-行政', 1000, 2),
      item(17, 2, 'ChatGPT-行政(2账号）', 199.8, 12),
      item(17, 3, 'SQL年费-会计&人事', 648, 2),
      item(17, 4, '人事部 Batch Email Module（RM799 + SST 8%)', 862.92, 1),
      item(17, 5, 'Google Workspace for Education 年费', 250, 1),
      item(17, 6, '日新独中官网智能助理', 750, 1),
      item(17, 7, '校园系统功能添加-Mr Lee', 10000, 1),
      item(17, 9, '人事部 JobStreet刊登', 1300, 3),
      item(17, 10, '名片打印', 25, 6),
    ],
  },
  {
    code: 20,
    zh: '教师证/学生证',
    en: 'Staff & Student Identification Cards',
    budget: 9300,
    items: [
      item(20, 1, '学生证打卡颜料', 1100, 1),
      item(20, 2, 'RFID 卡', 2000, 1),
      item(20, 3, 'RFID-读卡机', 50, 4),
      item(20, 4, '学生读卡机', 1000, 6),
    ],
  },
];
