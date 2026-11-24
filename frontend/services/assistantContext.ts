import {
  CalendarEvent,
  DepartmentRecord,
  HomeworkSubmission,
  SchoolAnnouncement,
  SchoolDocument,
  TeachingJournalEntry,
  TeachingResource,
  TimetableSlot,
} from '../types';
import { RECORD_STATUS_LABELS } from '../utils/recordsExport';

/** 助手可读取的应用数据（不含学生成绩）。 */
export interface AssistantAppData {
  records: DepartmentRecord[];
  timetable: TimetableSlot[];
  calendarEvents: CalendarEvent[];
  announcements: SchoolAnnouncement[];
  journals: TeachingJournalEntry[];
  homework: HomeworkSubmission[];
  resources: TeachingResource[];
  documents: SchoolDocument[];
}

const WEEKDAYS = ['', '周一', '周二', '周三', '周四', '周五'];
const MAX_RECORDS = 400;
const MAX_JOURNALS = 60;
const MAX_ANNOUNCEMENTS = 40;
const MAX_TEXT = 300;

const clip = (s: string | undefined, n = MAX_TEXT) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

function section(title: string, lines: string[]): string {
  return `## ${title}（${lines.length} 条）\n${lines.length ? lines.join('\n') : '（暂无数据）'}`;
}

/** 把应用里的数据整理成一段给 Gemini 阅读的文字。 */
export function buildAppContext(data: AssistantAppData, now = new Date()): string {
  const today = now.toISOString().split('T')[0];

  const records = [...data.records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_RECORDS)
    .map((r) => {
      const parts = [
        `${r.date}`,
        clip(r.content),
        r.handlers ? `处理：${clip(r.handlers, 80)}` : '',
        `记录者：${r.recorderName || '—'}`,
        `进度：${RECORD_STATUS_LABELS[r.status]}`,
        r.tag ? `标签：${r.tag}` : '',
        r.expiryDate ? `到期：${r.expiryDate}` : '',
        r.note ? `备注：${clip(r.note, 120)}` : '',
      ].filter(Boolean);
      return `- ${parts.join(' | ')}`;
    });

  const timetable = [...data.timetable]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.period - b.period)
    .map(
      (s) =>
        `- ${WEEKDAYS[s.dayOfWeek] || `周${s.dayOfWeek}`} 第${s.period}节(${s.timeRange}) | ${s.subject} | 班级：${s.className} | 地点：${s.location} | 教师：${s.teacherName}`
    );

  const calendar = [...data.calendarEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (e) =>
        `- ${e.date}${e.endDate ? `~${e.endDate}` : ''} | ${e.title} | ${e.category}${e.location ? ` | ${e.location}` : ''}${e.description ? ` | ${clip(e.description, 100)}` : ''}`
    );

  const announcements = [...data.announcements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ANNOUNCEMENTS)
    .map((a) => `- ${a.date} | ${a.title} | 发布：${a.author} | ${clip(a.content, 200)}`);

  const journals = [...data.journals]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_JOURNALS)
    .map(
      (j) =>
        `- ${j.date} 第${j.periodNumber}节 | ${j.className} | ${j.teacherName} | 课题：${j.topicTitle} | 内容：${clip(j.contentSummary, 150)} | 作业：${clip(j.homeworkAssigned, 80)}`
    );

  const homework = data.homework.map(
    (h) =>
      `- ${h.title} | ${h.targetClass} | 布置 ${h.assignedDate} 截止 ${h.dueDate} | 已交 ${h.submittedCount}/${h.totalStudents} | ${h.status}`
  );

  const resources = data.resources.map(
    (r) =>
      `- ${r.title} | ${r.gradeLevel} | ${r.type} | ${r.fileFormat} | 上传：${r.authorTeacherName} ${r.uploadedAt}`
  );

  const documents = data.documents.map(
    (d) => `- ${d.title} | ${d.category} | ${d.department} | 更新 ${d.updatedAt}`
  );

  return [
    `今天日期：${today}`,
    '以下是教学管理系统里当前可读取的数据（不含学生成绩）。\n注意：事项记录、已上传文件的名单是全部成员共享的；课表、行事历、公告、教学日志、教材目录保存在这位用户当前使用的浏览器里，可能与其他老师看到的不同。',
    section('资讯处事项记录（新→旧）', records),
    section('电脑室周课表', timetable),
    section('2027年行事历', calendar),
    section('校园通知公告（新→旧）', announcements),
    section('教室教学日志（新→旧）', journals),
    section('作业布置情况', homework),
    section('教材·试卷·课件库（仅目录，不含文件内容）', resources),
    section('公文与表单（仅目录，不含文件内容）', documents),
  ].join('\n\n');
}
