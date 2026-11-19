import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  ChevronRight, 
  History, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import { TeachingJournalEntry, TeacherUser } from '../types';
import { SCHOOL_CLASS_GROUPS, getSubjectByClass } from '../data/classes';
import { DAILY_PERIOD_SCHEDULE } from '../data/scheduleSlots';
import { askGeminiAssistant } from '../services/geminiService';

interface TeachingJournalProps {
  journals: TeachingJournalEntry[];
  currentUser: TeacherUser;
  onAddJournal: (entry: TeachingJournalEntry) => void;
}

export const TeachingJournal: React.FC<TeachingJournalProps> = ({
  journals,
  currentUser,
  onAddJournal,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 表单状态：每周/每堂课登记教学日志
  const [weekNumber, setWeekNumber] = useState<number>(8);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [className, setClassName] = useState<string>('J1U1');
  const [labRoom, setLabRoom] = useState<'Lab A' | 'Lab B' | 'Lab C' | '教室'>('Lab A');
  const [topicTitle, setTopicTitle] = useState('');
  const [contentSummary, setContentSummary] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState('');
  const [studentFeedback, setStudentFeedback] = useState('');
  const [nextWeekPlan, setNextWeekPlan] = useState('');
  const [aiPolishing, setAiPolishing] = useState(false);

  // 查阅指定班级「上周/上一节所教内容」
  const getPreviousLessonForClass = (targetClass: string) => {
    const matched = journals.filter(j => j.className === targetClass);
    if (matched.length === 0) return null;
    // 取时间最近的一条
    return matched[0];
  };

  const previousLog = getPreviousLessonForClass(className);

  const filteredJournals = journals.filter((j) => {
    const matchClass = selectedClassFilter === 'all' || j.className === selectedClassFilter;
    const matchSearch = 
      j.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.contentSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  // AI 辅助提炼教后反思与下周备忘
  const handleAiAssistReflection = async () => {
    if (!topicTitle.trim() || !contentSummary.trim()) {
      alert('请先输入教学课题与内容要点，AI 才能为您生成反思与下周规划！');
      return;
    }
    setAiPolishing(true);
    try {
      const prompt = `你是一位中学信息科技教研专家。教师执教班级：${className} (${getSubjectByClass(className)})，场地：${labRoom}。
本节课教学课题：${topicTitle}
本节授课与上机内容：${contentSummary}
学生当堂表现：${studentFeedback || '正常'}

请为该教师撰写一段简练规范的「学生掌握状况评价」与「下周教学强化建议」（各约 50 字，以纯中文直接返回）。`;

      const response = await askGeminiAssistant(prompt, 'it_teacher');
      setNextWeekPlan(response);
    } catch {
      alert('AI 辅助生成失败，请稍后重试。');
    } finally {
      setAiPolishing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      alert('请输入教学课题名称！');
      return;
    }

    const prevSummary = previousLog 
      ? `【第 ${previousLog.weekNumber} 周记录】：${previousLog.topicTitle}（${previousLog.contentSummary.slice(0, 40)}...）`
      : '首堂新课记录，前序无登记';

    const newEntry: TeachingJournalEntry = {
      id: `jnl_${Date.now()}`,
      weekNumber: Number(weekNumber),
      date,
      periodNumber: Number(periodNumber),
      className,
      subjectType: getSubjectByClass(className),
      labRoom,
      teacherName: currentUser.name,
      topicTitle: topicTitle.trim(),
      contentSummary: contentSummary.trim(),
      homeworkAssigned: homeworkAssigned.trim() || '随堂代码已在电脑室完成提交',
      previousWeekSummary: prevSummary,
      studentFeedback: studentFeedback.trim() || '全班按机位就座，纪律良好，教学目标达成。',
      nextWeekPlan: nextWeekPlan.trim() || '按教学进度表继续推进后续单元。',
      createdAt: new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date())
    };

    onAddJournal(newEntry);
    setShowAddModal(false);
    setTopicTitle('');
    setContentSummary('');
    setHomeworkAssigned('');
    setStudentFeedback('');
    setNextWeekPlan('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 顶部标题与快速记录入口 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>教室教学日志 (周记与每堂课记录)</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              课后备忘 · 连贯教学
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            方便老师在每堂课后实时查阅「上周教了什么」，并在每周集中填写或逐堂更新教学内容与学生反馈
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>填写本节/本周教学日志</span>
        </button>
      </div>

      {/* 搜索与班级筛选 */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索课题名称、作业要点、授课教师或班级..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">筛选班级：</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs sm:text-sm p-1.5 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none"
          >
            <option value="all">全校全部班级 (查看所有日志)</option>
            {SCHOOL_CLASS_GROUPS.map((grp) => (
              <optgroup key={grp.gradeLabel} label={grp.gradeLabel}>
                {grp.classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* 教学日志卡片列表 */}
      <div className="space-y-3 sm:space-y-4">
        {filteredJournals.map((jnl) => (
          <div
            key={jnl.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition space-y-3"
          >
            {/* 卡片头部信息 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs font-mono">
                  第 {jnl.weekNumber} 周
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-white font-mono font-bold text-xs">
                  {jnl.className}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  第 {jnl.periodNumber} 节 ({DAILY_PERIOD_SCHEDULE[jnl.periodNumber - 1]?.timeRange || ''})
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {jnl.labRoom}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {jnl.subjectType}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-mono">{jnl.date}</span>
                <span>·</span>
                <span className="text-slate-600 font-medium">执教：{jnl.teacherName}</span>
              </div>
            </div>

            {/* 本节课教学课题 */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                {jnl.topicTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">
                {jnl.contentSummary}
              </p>
            </div>

            {/* 连贯回顾：上周教了什么 */}
            {jnl.previousWeekSummary && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                <History className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">连贯教学查阅（上周教学重点）：</span>
                  {jnl.previousWeekSummary}
                </div>
              </div>
            )}

            {/* 课堂学情与布置作业 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-sky-600" />
                  <span>课后布置作业 / 实践任务</span>
                </div>
                <div className="text-slate-600 leading-relaxed">{jnl.homeworkAssigned}</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>学生课堂掌握与反馈</span>
                </div>
                <div className="text-slate-600 leading-relaxed">{jnl.studentFeedback}</div>
              </div>
            </div>

            {/* 下周备课计划 */}
            {jnl.nextWeekPlan && (
              <div className="text-xs text-slate-500 pt-1 flex items-center gap-1.5">
                <span className="font-semibold text-sky-700">下周教学规划：</span>
                <span>{jnl.nextWeekPlan}</span>
              </div>
            )}
          </div>
        ))}

        {filteredJournals.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            暂无匹配的教学日志记录。点击右上角按钮即可登记最新教学周记！
          </div>
        )}
      </div>

      {/* 填写教学日志模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">填写教室教学日志</h3>
                <p className="text-xs text-slate-500">记录课堂教学重点、上机任务，自动载入该班上周教学备忘</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* 上周已教内容实时提示条 */}
            {previousLog && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <History className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">系统已查阅【{className}】上周授课记录：</span>
                  第 {previousLog.weekNumber} 周课题《{previousLog.topicTitle}》。
                  <div className="text-amber-800 text-[11px] mt-0.5">{previousLog.contentSummary}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 基础排课信息 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">教学周次</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">上课日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">课时节次 (1~9节)</label>
                  <select
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white font-medium"
                  >
                    {DAILY_PERIOD_SCHEDULE.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.label} ({p.timeRange})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">电脑室场地</label>
                  <select
                    value={labRoom}
                    onChange={(e) => setLabRoom(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Lab A">Lab A (60座)</option>
                    <option value="Lab B">Lab B (50座)</option>
                    <option value="Lab C">Lab C (55座)</option>
                    <option value="教室">原班普通教室</option>
                  </select>
                </div>
              </div>

              {/* 授课班级选择 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">授课班级</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white font-mono font-semibold"
                  >
                    {SCHOOL_CLASS_GROUPS.map((grp) => (
                      <optgroup key={grp.gradeLabel} label={grp.gradeLabel}>
                        {grp.classes.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">所属科目 (自动判定)</label>
                  <input
                    type="text"
                    disabled
                    value={getSubjectByClass(className)}
                    className="w-full text-xs p-2.5 border rounded-xl bg-slate-100 text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* 教学课题 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">本节教学课题名称</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="例如: Python 循环进阶：嵌套循环与二维乘法表绘制"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* 教学内容要点 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">本堂课教学内容与实操要点</label>
                <textarea
                  rows={3}
                  required
                  value={contentSummary}
                  onChange={(e) => setContentSummary(e.target.value)}
                  placeholder="记录讲授了哪些新语法/概念，在电脑室安排了哪些实操练习..."
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none leading-relaxed"
                />
              </div>

              {/* 作业与学生掌握 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">布置作业 / 上机练习任务</label>
                  <input
                    type="text"
                    value={homeworkAssigned}
                    onChange={(e) => setHomeworkAssigned(e.target.value)}
                    placeholder="例如: 课堂代码已在电脑室提交 / 课后习题 3-2"
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">学生课堂掌握情况与反馈</label>
                  <input
                    type="text"
                    value={studentFeedback}
                    onChange={(e) => setStudentFeedback(e.target.value)}
                    placeholder="例如: 90% 学生顺利过关，个别学生在缩进上需指导"
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* 下周规划与 AI 协助反思 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-600">下周教学规划与预习要求</label>
                  <button
                    type="button"
                    onClick={handleAiAssistReflection}
                    disabled={aiPolishing}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                    <span>{aiPolishing ? 'AI 分析中...' : 'Gemini 智能辅助下周建议'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={nextWeekPlan}
                  onChange={(e) => setNextWeekPlan(e.target.value)}
                  placeholder="填写下周预定授课内容或预习要求..."
                  className="w-full text-xs p-2.5 border rounded-xl outline-none leading-relaxed"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm"
                >
                  保存教学日志
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
