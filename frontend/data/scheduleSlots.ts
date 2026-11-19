// 9 节课时精准时间表：
// 07:55 开课，每节 35 分钟
// 第 2 节后早休 35 分钟 (09:05 - 09:40)
// 第 6 节后午休 35 分钟 (12:00 - 12:35)
// 第 9 节 14:20 准时放学
export interface PeriodTimeConfig {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  isRecessAfter?: boolean;
  recessName?: string;
  recessRange?: string;
}

export const DAILY_PERIOD_SCHEDULE: PeriodTimeConfig[] = [
  {
    period: 1,
    label: '第 1 节',
    startTime: '07:55',
    endTime: '08:30',
    timeRange: '07:55 - 08:30'
  },
  {
    period: 2,
    label: '第 2 节',
    startTime: '08:30',
    endTime: '09:05',
    timeRange: '08:30 - 09:05',
    isRecessAfter: true,
    recessName: '早休 (Recess 1)',
    recessRange: '09:05 - 09:40'
  },
  {
    period: 3,
    label: '第 3 节',
    startTime: '09:40',
    endTime: '10:15',
    timeRange: '09:40 - 10:15'
  },
  {
    period: 4,
    label: '第 4 节',
    startTime: '10:15',
    endTime: '10:50',
    timeRange: '10:15 - 10:50'
  },
  {
    period: 5,
    label: '第 5 节',
    startTime: '10:50',
    endTime: '11:25',
    timeRange: '10:50 - 11:25'
  },
  {
    period: 6,
    label: '第 6 节',
    startTime: '11:25',
    endTime: '12:00',
    timeRange: '11:25 - 12:00',
    isRecessAfter: true,
    recessName: '午休 (Recess 2)',
    recessRange: '12:00 - 12:35'
  },
  {
    period: 7,
    label: '第 7 节',
    startTime: '12:35',
    endTime: '13:10',
    timeRange: '12:35 - 13:10'
  },
  {
    period: 8,
    label: '第 8 节',
    startTime: '13:10',
    endTime: '13:45',
    timeRange: '13:10 - 13:45'
  },
  {
    period: 9,
    label: '第 9 节',
    startTime: '13:45',
    endTime: '14:20',
    timeRange: '13:45 - 14:20'
  }
];
