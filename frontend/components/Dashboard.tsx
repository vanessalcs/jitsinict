import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Sparkles, 
  Send, 
  ArrowRight, 
  MonitorCheck, 
  CalendarCheck, 
  Clock, 
  BookOpen, 
  Monitor, 
  School,
  Pin,
  BellRing,
  Wrench,
  BookOpenCheck
} from 'lucide-react';
import { UserRole, TimetableSlot, SchoolAnnouncement } from '../types';
import { askGeminiAssistant } from '../services/geminiService';

interface DashboardProps {
  role: UserRole;
  onNavigate: (tab: string) => void;
  timetable: TimetableSlot[];
  announcements: SchoolAnnouncement[];
  onOpenAiWithPrompt: (prompt: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  role,
  onNavigate,
  timetable,
  announcements,
  onOpenAiWithPrompt,
}) => {
  const [quickAiInput, setQuickAiInput] = useState('');
  const [quickAiLoading, setQuickAiLoading] = useState(false);
  const [quickAiAnswer, setQuickAiAnswer] = useState('');

  const todaySlots = timetable.slice(0, 4);

  const handleQuickAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiInput.trim() || quickAiLoading) return;

    setQuickAiLoading(true);
    setQuickAiAnswer('');
    try {
      const result = await askGeminiAssistant(quickAiInput, role);
      setQuickAiAnswer(result);
    } catch (err: any) {
      setQuickAiAnswer('查询失败，请稍后重试。');
    } finally {
      setQuickAiLoading(false);
    }
  };

  const samplePrompts = [
    '为初中《电脑资讯与工艺》设计 3 道条件分支选择题附详解',
    '为高中《资讯科技》设计网络子网划分 35 分钟教案',
    'Lab A、Lab B、Lab C 批量镜像网络同传还原检查步骤',
    '帮我根据上周教过的循环概念，写本周教学日志备忘'
  ];

  // 3 间电脑室状态：Lab A, Lab B, Lab C
  const computerLabs = [
    {
      id: 'labA',
      name: 'Lab A',
      seats: '60座',
      currentCourse: '电脑资讯与工艺 (初中)',
      assignedClass: 'J1U1',
      status: '使用中',
      teacher: '黄世泓 (IT老师 / 资讯处助理)',
      health: '正常 (59/60 台在线, A18按键报修)'
    },
    {
      id: 'labB',
      name: 'Lab B',
      seats: '50座',
      currentCourse: '电脑资讯与工艺 (初中)',
      assignedClass: 'J2U2',
      status: '使用中',
      teacher: '林慈贤 (IT老师 / 资讯处助理)',
      health: '正常 (49/50 台可用, B14键盘待换)'
    },
    {
      id: 'labC',
      name: 'Lab C',
      seats: '55座',
      currentCourse: '资讯科技 (高中)',
      assignedClass: 'S1A2',
      status: '可预约/实训',
      teacher: '黄世泓 / 林慈贤',
      health: '维护中 (讲台投影机检修)'
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. 欢迎横幅：资讯处 / 电脑科 & 双师架构 */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium text-sky-200 mb-2 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>资讯处 / 电脑科 综合工作台</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              欢迎回到 资讯处 / 电脑科 管理中心
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              执教与运维责任人：<span className="font-semibold text-white">黄世泓</span>、<span className="font-semibold text-white">林慈贤</span>（IT老师 / 资讯处助理）。统筹初中【电脑资讯与工艺】、高中【资讯科技】教学、Lab A/B/C 三间电脑室排期及 9 节课时日程。
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            <button
              onClick={() => onNavigate('journal')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-slate-800 hover:bg-sky-50 rounded-xl text-xs sm:text-sm font-bold transition shadow text-center flex items-center justify-center gap-1.5"
            >
              <BookOpenCheck className="h-4 w-4 text-sky-600" />
              <span>填写教学日志</span>
            </button>
            <button
              onClick={() => onNavigate('timetable')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-500/30 hover:bg-sky-500/40 text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/20 transition text-center flex items-center justify-center gap-1.5"
            >
              <Wrench className="h-4 w-4" />
              <span>电脑室维修看板</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 校园通知与公告模块（位于欢迎栏正下方） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <BellRing className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">资讯处 / 电脑科 最新公告与通知</h3>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition"
          >
            <span>前往公告中心</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {announcements.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 bg-slate-50/50 transition cursor-pointer flex flex-col justify-between"
              onClick={() => onNavigate('announcements')}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm hover:text-sky-600 transition line-clamp-1">
                    {item.title}
                  </h4>
                  {item.pinned && (
                    <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Pin className="h-2.5 w-2.5" />
                      <span>置顶</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60">
                <span>发布人：{item.author} ({item.role})</span>
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 核心架构重点：科目体系与 Lab A, Lab B, Lab C 电脑室状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：学科体系分类卡片 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <School className="h-4 w-4 text-sky-600" />
              <span>学科课程体系架构</span>
            </h3>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">两种标准科目</span>
          </div>

          <div className="space-y-2.5">
            {/* 初中科目 */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white">初中 (J1~J3)</span>
                  <span className="font-bold text-slate-900 text-sm">电脑资讯与工艺</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  班级涵盖 J1U1~J3U11，核心掌握算法流程图、Python 入门与实用电教实训。
                </p>
                <div className="text-[11px] text-slate-400 mt-1">主要上课场地：Lab A、Lab B</div>
              </div>
            </div>

            {/* 高中科目 */}
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">高中 (S1~S3)</span>
                  <span className="font-bold text-slate-900 text-sm">资讯科技</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  班级涵盖 S1A1~S3SE，深度学习计算机网络子网划分、SQL 数据库与数据分析。
                </p>
                <div className="text-[11px] text-slate-400 mt-1">主要上课场地：Lab B、Lab C</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：Lab A、Lab B、Lab C 电脑室状态看板 */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-emerald-600" />
              <span>电脑室实时状态 (Lab A / Lab B / Lab C)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">总计 165 台学生上课机位</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {computerLabs.map((lab) => (
              <div key={lab.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-sky-200 bg-slate-50/60 hover:bg-white transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{lab.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">{lab.seats}</span>
                  </div>
                  <div className="text-xs font-medium text-sky-800 bg-sky-100/60 px-2 py-1 rounded-lg mb-1.5 truncate">
                    {lab.currentCourse}
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>当前班级：<span className="font-semibold text-slate-700 font-mono">{lab.assignedClass}</span></div>
                    <div>带班老师：<span className="text-slate-700">{lab.teacher.split(' ')[0]}</span></div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{lab.status}</span>
                  </span>
                  <span className="text-slate-400">{lab.health.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 指标卡片行 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">在册授课学生</span>
            <div className="p-1.5 sm:p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">186</span>
            <span className="text-xs text-slate-500 ml-1">人</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-emerald-600 flex items-center gap-1 truncate">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>初中(J)与高中(S)班级在学</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">作业待批阅</span>
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">42</span>
            <span className="text-xs text-slate-500 ml-1">份待改</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-amber-600 flex items-center gap-1 truncate">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>J1U1《电脑资讯与工艺》猜数</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">电脑室待处理维修</span>
            <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">3</span>
            <span className="text-xs text-slate-500 ml-1">项工单</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-rose-600 truncate">
            <span>Lab A(1)、Lab B(1)、Lab C(1)</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">每日教学节次</span>
            <div className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">9 节</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-purple-600 font-medium">
            <span>07:55 上课 ~ 14:20 放学</span>
          </div>
        </div>
      </div>

      {/* 5. 今日课表与维护 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">今日电脑室课表与运维时段 (07:55 - 14:20)</h3>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
          >
            <span>查看完整 9 节课表与维修</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {todaySlots.map((slot) => (
            <div
              key={slot.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-slate-50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="h-6 px-2 rounded bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center font-mono">
                    第 {slot.period} 节
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      slot.roleType === 'teaching'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'bg-indigo-50 text-indigo-700 font-semibold'
                    }`}
                  >
                    {slot.roleType === 'teaching' ? '授课' : '维护'}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">{slot.subject}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-mono">
                  {slot.className} · {slot.location}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                {slot.timeRange}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Gemini AI 交互卡片 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Gemini 智能教务与资讯处助手</h3>
              <p className="text-xs text-slate-500">
                支持《电脑资讯与工艺》与《资讯科技》双科智能备课、教学日志反思、试卷生成及 Lab 维修诊断
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            gemini-2.5-flash
          </span>
        </div>

        {/* 快捷推荐提示词 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          <span className="text-xs text-slate-400 shrink-0">示例：</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuickAiInput(p);
                onOpenAiWithPrompt(p);
              }}
              className="shrink-0 text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* AI 输入框 */}
        <form onSubmit={handleQuickAiSubmit} className="relative">
          <textarea
            value={quickAiInput}
            onChange={(e) => setQuickAiInput(e.target.value)}
            rows={2}
            placeholder="输入教学或电教疑问，例如：「帮我为 J1U1 写一份35分钟的循环实操教学反思」或「Lab C 投影机闪频排障步骤」..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-24 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition leading-relaxed"
          />
          <button
            type="submit"
            disabled={quickAiLoading || !quickAiInput.trim()}
            className="absolute right-2.5 bottom-3.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            {quickAiLoading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{quickAiLoading ? '生成中...' : '生成回答'}</span>
          </button>
        </form>

        {/* 内嵌回答展示区 */}
        {quickAiAnswer && (
          <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed animate-fadeIn">
            <div className="font-semibold text-sky-800 flex items-center gap-1.5 mb-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gemini 回答成果：</span>
            </div>
            {quickAiAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
