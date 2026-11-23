import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Calendar,
} from 'lucide-react';
import { TeachingProgressRecord, TeacherUser } from '../types';
import { SCHOOL_CLASS_GROUPS, getSubjectByClass } from '../data/classes';
import { generateTeachingProgressAdvice } from '../services/geminiService';

interface TeachingProgressProps {
  progressList: TeachingProgressRecord[];
  currentUser: TeacherUser;
  onAddRecord: (record: TeachingProgressRecord) => void;
  onUpdateRecord: (record: TeachingProgressRecord) => void;
}

export const TeachingProgress: React.FC<TeachingProgressProps> = ({
  progressList,
  currentUser,
  onAddRecord,
  onUpdateRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'pending'>('all');
  
  // AI Advice state
  const [aiAdviceModal, setAiAdviceModal] = useState<TeachingProgressRecord | null>(null);
  const [aiAdviceContent, setAiAdviceContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // New Record Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [className, setClassName] = useState('J1U1');
  const [unitName, setUnitName] = useState('');
  const [lessonNumber, setLessonNumber] = useState(1);
  const [totalLessons, setTotalLessons] = useState(16);
  const [keyConcepts, setKeyConcepts] = useState('');
  const [masteryRate, setMasteryRate] = useState(80);
  const [reflection, setReflection] = useState('');

  const filteredList = progressList.filter((item) => {
    const matchesSearch = 
      item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.currentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAiAdvice = async (record: TeachingProgressRecord) => {
    setAiAdviceModal(record);
    setAiAdviceContent('');
    setAiLoading(true);

    try {
      const advice = await generateTeachingProgressAdvice(
        record.courseName,
        record.className,
        record.unitName,
        record.studentMasteryRate,
        record.keyConcepts,
        record.reflectionNotes
      );
      setAiAdviceContent(advice);
    } catch (err) {
      setAiAdviceContent('生成智能诊断建议失败，请稍后重试。');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    const subjectType = getSubjectByClass(className);
    const newRec: TeachingProgressRecord = {
      id: `prog_${Date.now()}`,
      subjectType,
      courseName: `${subjectType} (${className.startsWith('J') ? '初中' : '高中'})`,
      className,
      unitName,
      lessonNumber: Number(lessonNumber),
      totalLessons: Number(totalLessons),
      currentStatus: lessonNumber >= totalLessons ? 'completed' : 'in_progress',
      lastTaughtDate: new Date().toISOString().split('T')[0],
      keyConcepts: keyConcepts.split(',').map(s => s.trim()).filter(Boolean),
      studentMasteryRate: Number(masteryRate),
      reflectionNotes: reflection || '本课时教学按教学大纲推进完毕。',
      teacherName: currentUser.name
    };

    onAddRecord(newRec);
    setShowAddModal(false);
    setUnitName('');
    setKeyConcepts('');
    setReflection('');
  };

  const handleAdvanceLesson = (rec: TeachingProgressRecord) => {
    const nextLesson = Math.min(rec.lessonNumber + 1, rec.totalLessons);
    const updated: TeachingProgressRecord = {
      ...rec,
      lessonNumber: nextLesson,
      lastTaughtDate: new Date().toISOString().split('T')[0],
      currentStatus: nextLesson === rec.totalLessons ? 'completed' : 'in_progress'
    };
    onUpdateRecord(updated);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>智能教学进度与学情追踪</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold hidden md:inline">
              教学课时实景化
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            记录初中 (J1U1~J3U11)、高中 (S1A1~S3SE) 班级课时进度，由 Gemini 智能生成教学优化建议
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>登记新课时进度</span>
        </button>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400">进行中课程</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {progressList.filter(p => p.currentStatus === 'in_progress').length} <span className="text-xs font-normal text-slate-500">个教学班</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400">平均知识掌握度</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            {Math.round(progressList.reduce((acc, cur) => acc + cur.studentMasteryRate, 0) / (progressList.length || 1))}%
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400">已结课单元</span>
          <div className="text-xl sm:text-2xl font-bold text-sky-600 mt-1">
            {progressList.filter(p => p.currentStatus === 'completed').length} <span className="text-xs font-normal text-slate-500">个单元</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400">待推进新课</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {progressList.filter(p => p.currentStatus === 'pending').length} <span className="text-xs font-normal text-slate-500">个课时</span>
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索课程名称、班级（如 J1U1、S1A1）、单元或教师..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          {(['all', 'in_progress', 'completed', 'pending'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' && '全部记录'}
              {st === 'in_progress' && '教学进行中'}
              {st === 'completed' && '本单元已完结'}
              {st === 'pending' && '待启动新单元'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Cards List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredList.map((rec) => {
          const progressPercent = Math.round((rec.lessonNumber / rec.totalLessons) * 100);

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                    {rec.className}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {rec.courseName}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    rec.currentStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rec.currentStatus === 'in_progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rec.currentStatus === 'completed' ? '已达成计划' : rec.currentStatus === 'in_progress' ? '授课推进中' : '未开启'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>最后上课：{rec.lastTaughtDate}</span>
                  <span>·</span>
                  <span>执教：{rec.teacherName}</span>
                </div>
              </div>

              {/* Unit Title and Current Progress Bar */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">{rec.unitName}</h3>
                
                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>课时完成进度：第 <span className="font-bold text-sky-700">{rec.lessonNumber}</span> / {rec.totalLessons} 课时</span>
                    <span className="font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent >= 100 ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Concepts and Student Mastery Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <div className="md:col-span-8 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">本周重难点：</span>
                  {rec.keyConcepts.map((concept, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                      {concept}
                    </span>
                  ))}
                </div>

                <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-2 text-xs">
                  <span className="text-slate-400">全班掌握度：</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span className={rec.studentMasteryRate >= 80 ? 'text-emerald-600' : rec.studentMasteryRate >= 70 ? 'text-sky-600' : 'text-amber-600'}>
                      {rec.studentMasteryRate}%
                    </span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rec.studentMasteryRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${rec.studentMasteryRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Reflection Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-700">教学反思手记：</span>
                {rec.reflectionNotes}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleAdvanceLesson(rec)}
                  disabled={rec.lessonNumber >= rec.totalLessons}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>推进至下一课时</span>
                </button>

                <button
                  onClick={() => handleOpenAiAdvice(rec)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-semibold rounded-lg text-xs transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                  <span>Gemini 智能教学诊断建议</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">暂无匹配的教学进度记录</p>
          <p className="text-xs text-slate-400 mt-1">您可以点击右上角按钮登记新的课时与教学单元进度</p>
        </div>
      )}

      {/* AI Teaching Diagnosis Modal */}
      {aiAdviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Gemini 智能学情分析与教学策略</h3>
                  <p className="text-xs text-slate-500">{aiAdviceModal.className} · {aiAdviceModal.unitName}</p>
                </div>
              </div>
              <button
                onClick={() => setAiAdviceModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Sparkles className="h-8 w-8 text-sky-500 animate-spin" />
                  <p className="text-xs text-slate-500">Gemini 正在针对本班教学重难点与掌握度推演优化建议...</p>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiAdviceContent}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAiAdviceModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                我知道了，应用到备课
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">登记新课时与教学进度</h3>
            <p className="text-xs text-slate-500 mb-4">记录课堂重难点与学情反馈，便于全组协同与智能追踪</p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">授课班级</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white font-medium"
                  >
                    {SCHOOL_CLASS_GROUPS.map((group) => (
                      <optgroup key={group.gradeLabel} label={group.gradeLabel}>
                        {group.classes.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">自动识别科目</label>
                  <input
                    type="text"
                    disabled
                    value={getSubjectByClass(className)}
                    className="w-full text-xs p-2.5 border rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">单元课时名称</label>
                <input
                  type="text"
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="例如: 第四单元：Python 自定义函数与形参实参传递"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">当前完成课时</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">单元总课时</label>
                  <input
                    type="number"
                    min={1}
                    value={totalLessons}
                    onChange={(e) => setTotalLessons(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">预估掌握度(%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={masteryRate}
                    onChange={(e) => setMasteryRate(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">本节核心重难点（逗号隔开）</label>
                <input
                  type="text"
                  value={keyConcepts}
                  onChange={(e) => setKeyConcepts(e.target.value)}
                  placeholder="例如: def 关键字, return 返回值, 变量作用域"
                  className="w-full text-xs p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">课后反思手记与下周备忘</label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="记录学生课堂易错点、未听懂学生名单及下次需要强化的地方..."
                  className="w-full text-xs p-2.5 border rounded-xl outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl"
                >
                  保存教学进度
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
