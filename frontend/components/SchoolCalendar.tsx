import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  List,
  Grid,
  CalendarCheck2,
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface SchoolCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export const SchoolCalendar: React.FC<SchoolCalendarProps> = ({ events, onAddEvent }) => {
  // 默认查看 2027 年 3 月 (第一期考及作业抽查月份)
  const [currentYear, setCurrentYear] = useState(2027);
  const [currentMonth, setCurrentMonth] = useState(2); // 0-indexed: 2 代表三月
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // 表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2027-03-20');
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('activity');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const monthNames = [
    '一月 (January)', '二月 (February)', '三月 (March)', '四月 (April)', '五月 (May)', '六月 (June)',
    '七月 (July)', '八月 (August)', '九月 (September)', '十月 (October)', '十一月 (November)', '十二月 (December)'
  ];

  // 2027 年官方上课天数对应表 (全学年总计 195 天，严格根据图表核实)
  const schoolTeachingDays: Record<number, number> = {
    0: 18, // 1月: 18天
    1: 13, // 2月: 13天
    2: 18, // 3月: 18天
    3: 21, // 4月: 21天
    4: 10, // 5月: 10天
    5: 16, // 6月: 16天
    6: 20, // 7月: 20天
    7: 19, // 8月: 19天
    8: 17, // 9月: 17天
    9: 18, // 10月: 18天
    10: 22, // 11月: 22天
    11: 3, // 12月: 3天
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((e) => {
      if (e.date === dateStr) return true;
      if (e.endDate) {
        return dateStr >= e.date && dateStr <= e.endDate;
      }
      return false;
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newEvt: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: newTitle,
      date: newDate,
      category: newCategory,
      description: newDesc,
      location: newLocation,
    };
    onAddEvent(newEvt);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const categoryBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'exam':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'holiday':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'activity':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 顶部标题栏：2027年行事历 (未定稿) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>2027年行事历 (第6版)</span>
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200 font-mono">
              上课日数: 195天
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              更新日期：25.11.2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            日新独中 2027 全学年各月份教学日数、三期期考、统考模拟考、联课演练、休假与电脑室维护时程
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 月份导航 */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="上一月"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-xs px-2.5 text-slate-800 whitespace-nowrap font-mono">
              {currentYear}年 {monthNames[currentMonth]}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="下一月"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 本月上课天数统计 */}
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-mono text-xs font-bold">
            {currentYear === 2027 && schoolTeachingDays[currentMonth] !== undefined
              ? `上课天数: ${schoolTeachingDays[currentMonth]} 天`
              : '校务月历'}
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              title="日历网格视图"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              title="日程列表视图"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>添加校历日程</span>
          </button>
        </div>
      </div>

      {/* 2027年官方主要教学与考查周期直达标签 (包含第一/二/三期考、毕业考、统考模拟、艺术季) */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 border border-sky-100 p-3 rounded-2xl space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <CalendarCheck2 className="h-4 w-4 text-sky-600" />
          <span>2027学年重点教学与考查节点 (点击切换月份)：</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(2); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 2 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            3月：第一期考及作业抽查 (18/3 - 24/3)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(3); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 3 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            4月：观课周 (6/4 - 16/4) / 黄花艺术季 / 家长日 (25/4)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(4); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 4 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            5月：独中基金会20周年庆 / 年中假期 (22/5 - 6/6)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(5); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 5 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            6月：第二期考启动 (28/6 - 8/7)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(6); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 6 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            7月：MUET考试 / 校园开放日 (24/7)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(8); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 8 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            9月：J3/S3 毕业考 (13/9 - 22/9) / 第三期考及抽查 (21/9 - 30/9)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(9); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 9 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            10月：初三/高三 预测统考 (18/10 - 26/10)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(10); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 10 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            11月：田径锦标赛 / 毕业典礼 (20/11) / 休业仪式 (26/11)
          </button>
          <button 
            onClick={() => { setCurrentYear(2027); setCurrentMonth(11); }}
            className={`px-2.5 py-1 rounded-lg transition text-xs ${currentMonth === 11 ? 'bg-sky-600 text-white font-bold shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            12月：年终辅导班 / 学校长假 (4/12 - 31/12)
          </button>
        </div>
      </div>

      {/* 分类过滤器 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: '全部行事日程' },
          { id: 'exam', label: '期考 / 测验 / 统考' },
          { id: 'activity', label: '集会 / 典礼 / 竞赛 / 联课' },
          { id: 'maintenance', label: 'IT机房维护' },
          { id: 'holiday', label: '假期 / 节日' },
          { id: 'meeting', label: '行政 / 常务会议' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
              selectedCategory === c.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 视图 1：月历网格 */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-full">
            {/* 星期表头 (从周一到周日) */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2.5">
              <div>星期一</div>
              <div>星期二</div>
              <div>星期三</div>
              <div>星期四</div>
              <div>星期五</div>
              <div className="text-red-500">星期六</div>
              <div className="text-red-500">星期日</div>
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={idx} className="min-h-[85px] sm:min-h-[110px] bg-slate-50/40 p-1.5" />;
                }

                const dayEvents = getEventsForDay(day);

                return (
                  <div
                    key={idx}
                    className="min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col transition hover:bg-sky-50/20 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono rounded-full w-5 h-5 flex items-center justify-center text-slate-800">
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayEvents.length} 项
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[85px]">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-[9px] sm:text-[10px] font-semibold px-1 py-0.5 rounded border leading-tight truncate ${categoryBadge(
                            evt.category
                          )}`}
                          title={`${evt.title} - ${evt.description}`}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 视图 2：清单备忘列表 */}
      <div className={`${viewMode === 'list' ? 'block' : 'mt-4'} space-y-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {currentYear} 年 {monthNames[currentMonth]} 行程备忘明细
          </h3>
          <span className="text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full font-mono font-bold">
            {currentYear === 2027 ? `官方上课天数: ${schoolTeachingDays[currentMonth] || 0} 天` : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events
            .filter((e) => {
              const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
              return e.date.startsWith(monthPrefix) || (e.endDate && e.endDate.startsWith(monthPrefix));
            })
            .map((e) => (
              <div key={e.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 hover:border-sky-300 transition">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryBadge(e.category)}`}>
                    {e.category === 'exam' && '期考/测验'}
                    {e.category === 'maintenance' && '机房运维'}
                    {e.category === 'activity' && '竞赛与活动'}
                    {e.category === 'holiday' && '放假/补假'}
                    {e.category === 'meeting' && '行政会议'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {e.endDate ? `${e.date} ~ ${e.endDate}` : e.date}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{e.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{e.description}</p>
                {e.location && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{e.location}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* 模态框：添加日程 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">排入 2027 年行事历日程</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">事件名称</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如: 初中《电脑资讯与工艺》上机实操测评"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">日期 (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">事件分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CalendarEvent['category'])}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white"
                  >
                    <option value="exam">期考 / 测验 / 登分</option>
                    <option value="activity">典礼 / 竞赛 / 联课</option>
                    <option value="maintenance">IT机房维护</option>
                    <option value="holiday">假期 / 特假</option>
                    <option value="meeting">教研 / 常务会议</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">举办地点 / 电脑室</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="例如: Lab A、Lab B、Lab C 或大礼堂"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">详细说明与注意事项</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="详细活动安排与说明..."
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                >
                  确认加入2027年行事历
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
