import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Plus, 
  Filter, 
  Monitor, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Printer, 
  Sparkles,
  Coffee
} from 'lucide-react';
import { TimetableSlot, LabMaintenanceTicket } from '../types';
import { SCHOOL_CLASS_GROUPS, getSubjectByClass } from '../data/classes';
import { DAILY_PERIOD_SCHEDULE } from '../data/scheduleSlots';
import { initialLabTickets } from '../data/initialData';

interface TimetableProps {
  slots: TimetableSlot[];
  onAddSlot: (slot: TimetableSlot) => void;
}

export const Timetable: React.FC<TimetableProps> = ({ slots, onAddSlot }) => {
  const [activeTab, setActiveTab] = useState<'timetable' | 'maintenance'>('timetable');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 电脑室维护工单数据
  const [tickets, setTickets] = useState<LabMaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('eduit_lab_tickets');
    return saved ? JSON.parse(saved) : initialLabTickets;
  });

  // 手机端单日选择器: 1 (周一) 到 5 (周五)
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(1);

  // 排课表单状态
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [period, setPeriod] = useState(1);
  const [className, setClassName] = useState('J1U1');
  const [location, setLocation] = useState('Lab A (60座)');
  const [teacherName, setTeacherName] = useState('黄世泓 (IT老师 / 资讯处助理)');
  const [roleType, setRoleType] = useState<'teaching' | 'maintenance'>('teaching');

  // 新增维修工单表单
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [tktLab, setTktLab] = useState<'Lab A' | 'Lab B' | 'Lab C'>('Lab A');
  const [tktStation, setTktStation] = useState('');
  const [tktFaultType, setTktFaultType] = useState<LabMaintenanceTicket['faultType']>('硬件损坏');
  const [tktPriority, setTktPriority] = useState<LabMaintenanceTicket['priority']>('普通');
  const [tktDesc, setTktDesc] = useState('');
  const [tktReporter, setTktReporter] = useState('黄世泓 (IT老师 / 资讯处助理)');

  // 打印/导出维修汇总报告模态框
  const [showReportModal, setShowReportModal] = useState(false);

  const days = [
    { day: 1, label: '周一', full: '星期一' },
    { day: 2, label: '周二', full: '星期二' },
    { day: 3, label: '周三', full: '星期三' },
    { day: 4, label: '周四', full: '星期四' },
    { day: 5, label: '周五', full: '星期五' },
  ];

  const filteredSlots = slots.filter((s) => {
    if (filterLocation === 'all') return true;
    return s.location.includes(filterLocation);
  });

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedConfig = DAILY_PERIOD_SCHEDULE.find(p => p.period === period);
    const subjectName = roleType === 'teaching' 
      ? `${getSubjectByClass(className)} (${className.startsWith('J') ? '初中' : '高中'})`
      : '资讯处机房运维检修';

    const newSlot: TimetableSlot = {
      id: `slot_${Date.now()}`,
      dayOfWeek,
      period,
      timeRange: matchedConfig ? matchedConfig.timeRange : '07:55 - 08:30',
      subject: subjectName,
      subjectType: roleType === 'teaching' ? getSubjectByClass(className) : '网络维护',
      className: roleType === 'teaching' ? className : '资讯处',
      location,
      teacherName,
      roleType,
    };

    onAddSlot(newSlot);
    setShowAddModal(false);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktStation.trim() || !tktDesc.trim()) {
      alert('请填写电脑号机位及故障现象！');
      return;
    }

    const newTicket: LabMaintenanceTicket = {
      id: `tkt_${Date.now()}`,
      labRoom: tktLab,
      stationNumber: tktStation.trim(),
      faultType: tktFaultType,
      priority: tktPriority,
      reportedBy: tktReporter,
      reportedAt: new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date()),
      description: tktDesc.trim(),
      status: '待维修'
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('eduit_lab_tickets', JSON.stringify(updated));
    setShowAddTicketModal(false);
    setTktStation('');
    setTktDesc('');
  };

  const handleUpdateTicketStatus = (id: string, newStatus: LabMaintenanceTicket['status']) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          resolvedAt: newStatus === '已修复验收' ? new Date().toISOString().split('T')[0] : t.resolvedAt
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem('eduit_lab_tickets', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 头部标题与切换标签 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>电脑室 9 节课表与维修管理中心</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              07:55 - 14:20 · 2个35分钟休息
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lab A (60座)、Lab B (50座)、Lab C (55座) 课表排期 · 早休 (09:05-09:40) · 午休 (12:00-12:35) · 电脑设备维修工单看板
          </p>
        </div>

        {/* 课表 / 维修报告切换 */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'timetable'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            周课表排期
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-3.5 w-3.5 text-rose-500" />
            <span>电脑室维修看板 ({tickets.filter(t => t.status !== '已修复验收').length})</span>
          </button>
        </div>
      </div>

      {/* 选项卡 1：周课表排期 (9 节课 + 2 次 35 分钟休息) */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* 筛选与添加 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">场地筛选：</span>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="text-xs sm:text-sm p-1.5 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none"
              >
                <option value="all">全部电脑室与机房</option>
                <option value="Lab A">Lab A (60座)</option>
                <option value="Lab B">Lab B (50座)</option>
                <option value="Lab C">Lab C (55座)</option>
                <option value="核心数据机房">核心数据机房</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>排入课时时段</span>
            </button>
          </div>

          {/* 手机端便捷视图：按星期切换 (< 768px) */}
          <div className="block md:hidden">
            <div className="flex rounded-xl bg-slate-200/80 p-1 mb-3">
              {days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedMobileDay(d.day)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center ${
                    selectedMobileDay === d.day
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* 手机端单日课时卡片（含休息提示） */}
            <div className="space-y-2.5">
              {DAILY_PERIOD_SCHEDULE.map((p) => {
                const currentSlots = filteredSlots.filter(
                  (s) => s.dayOfWeek === selectedMobileDay && s.period === p.period
                );

                return (
                  <React.Fragment key={p.period}>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-start gap-3">
                      <div className="h-10 w-14 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-800">{p.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{p.startTime}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {currentSlots.length === 0 ? (
                          <div className="py-2 text-xs text-slate-400">目前空堂（可安排实机上机）</div>
                        ) : (
                          currentSlots.map((slot) => (
                            <div key={slot.id} className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-900 text-xs truncate">{slot.subject}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 font-mono ${
                                  slot.roleType === 'teaching' ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {slot.className}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate font-mono">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{slot.location}</span>
                                <span>·</span>
                                <span>{slot.teacherName.split(' ')[0]}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* 手机端早休 / 午休横条 */}
                    {p.isRecessAfter && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-mono">
                        <span className="font-bold flex items-center gap-1.5">
                          <Coffee className="h-3.5 w-3.5 text-amber-600" />
                          <span>{p.recessName}</span>
                        </span>
                        <span>{p.recessRange} (35分钟)</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 桌面端 9 节完整大排课网格 (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="min-w-[760px]">
              {/* 表头 */}
              <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                <div className="p-3 text-center border-r border-slate-200 text-slate-400 font-mono">
                  节次 / 时间 (35m)
                </div>
                {days.map((d) => (
                  <div key={d.day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                    {d.full}
                  </div>
                ))}
              </div>

              {/* 9 节循环渲染 */}
              <div className="divide-y divide-slate-100">
                {DAILY_PERIOD_SCHEDULE.map((p) => {
                  return (
                    <React.Fragment key={p.period}>
                      <div className="grid grid-cols-6 min-h-[88px]">
                        {/* 节次时间标头 */}
                        <div className="p-2 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center items-center text-center">
                          <span className="font-bold text-slate-800 text-xs font-mono">{p.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.timeRange}</span>
                        </div>

                        {/* 周一至周五各个时段 */}
                        {days.map((d) => {
                          const currentSlots = filteredSlots.filter(
                            (s) => s.dayOfWeek === d.day && s.period === p.period
                          );

                          return (
                            <div
                              key={d.day}
                              className="p-1.5 border-r border-slate-200 last:border-r-0 hover:bg-slate-50/50 transition flex flex-col gap-1"
                            >
                              {currentSlots.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-[10px] text-slate-300">
                                  空堂
                                </div>
                              ) : (
                                currentSlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={`p-2 rounded-xl border text-xs shadow-sm flex flex-col justify-between ${
                                      slot.roleType === 'teaching'
                                        ? 'bg-sky-50/90 border-sky-200/80 text-sky-950'
                                        : 'bg-indigo-50/90 border-indigo-200/80 text-indigo-950'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1 gap-1">
                                      <span className="font-bold leading-tight line-clamp-1 text-[11px]">{slot.subject}</span>
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 font-mono bg-sky-200/70 text-sky-900">
                                        {slot.className}
                                      </span>
                                    </div>
                                    <div className="pt-1 border-t border-black/5 text-[9px] text-slate-600 truncate font-mono">
                                      <span>{slot.location}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 早休 / 午休大横栏 (35分钟) */}
                      {p.isRecessAfter && (
                        <div className="bg-amber-50/80 border-y border-amber-200/80 px-6 py-2 flex items-center justify-between text-xs text-amber-900 font-mono">
                          <div className="flex items-center gap-2 font-bold">
                            <Coffee className="h-4 w-4 text-amber-600" />
                            <span>【{p.recessName}】休息时间 35 分钟</span>
                          </div>
                          <span>时间区间：{p.recessRange}</span>
                          <span className="text-[11px] text-amber-800 hidden sm:inline">微机室常规通风与设备巡视</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 选项卡 2：电脑室设备故障维修表格与报告生成 */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-600" />
                <span>Lab A / Lab B / Lab C 电脑室设备报修维修工单</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                供资讯处技术人员实时查看故障位置并跟踪维修状态，支持生成打印维修报告
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FileText className="h-4 w-4" />
                <span>生成电脑室维修报告</span>
              </button>

              <button
                onClick={() => setShowAddTicketModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                <span>登记新报修工单</span>
              </button>
            </div>
          </div>

          {/* 维修表格 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">电脑室</th>
                    <th className="p-3">故障机位/设备</th>
                    <th className="p-3">故障类型</th>
                    <th className="p-3">紧急程度</th>
                    <th className="p-3">故障描述</th>
                    <th className="p-3">报修人/时间</th>
                    <th className="p-3">维修处理状态</th>
                    <th className="p-3 text-right">技术员操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {tkt.labRoom}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-800">{tkt.stationNumber}</td>
                      <td className="p-3">{tkt.faultType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tkt.priority.includes('紧急')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tkt.priority}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs leading-relaxed text-slate-600">
                        <div>{tkt.description}</div>
                        {tkt.technicianNotes && (
                          <div className="text-[11px] text-sky-700 mt-0.5">备注：{tkt.technicianNotes}</div>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        <div>{tkt.reportedBy.split(' ')[0]}</div>
                        <div className="font-mono text-slate-400">{tkt.reportedAt}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                          tkt.status === '已修复验收'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tkt.status === '维修中'
                            ? 'bg-sky-100 text-sky-800'
                            : tkt.status === '配件订购中'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tkt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <select
                          value={tkt.status}
                          onChange={(e) => handleUpdateTicketStatus(tkt.id, e.target.value as any)}
                          className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-white font-medium"
                        >
                          <option value="待维修">标记：待维修</option>
                          <option value="配件订购中">标记：配件订购中</option>
                          <option value="维修中">标记：维修中</option>
                          <option value="已修复验收">标记：已修复验收</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 1：排入课时 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">排入电脑室课程 / 维护时段</h3>
            <p className="text-xs text-slate-500 mb-4">按 9 节课制（07:55 - 14:20）安排 Lab A、Lab B、Lab C 课表</p>

            <form onSubmit={handleCreateSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">星期</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                  >
                    <option value={1}>星期一</option>
                    <option value={2}>星期二</option>
                    <option value={3}>星期三</option>
                    <option value={4}>星期四</option>
                    <option value={5}>星期五</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">节次 (共9节)</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                  >
                    {DAILY_PERIOD_SCHEDULE.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.label} ({p.timeRange})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">授课班级</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-mono font-medium"
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">性质类型</label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="teaching">电脑课授课</option>
                    <option value="maintenance">资讯处机房维护</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">电脑室场地</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                >
                  <option value="Lab A (60座)">Lab A (60座)</option>
                  <option value="Lab B (50座)">Lab B (50座)</option>
                  <option value="Lab C (55座)">Lab C (55座)</option>
                  <option value="核心数据机房 B201">核心数据机房 B201</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">任课 / 维护负责人</label>
                <select
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                >
                  <option value="黄世泓 (IT老师 / 资讯处助理)">黄世泓 (IT老师 / 资讯处助理)</option>
                  <option value="林慈贤 (IT老师 / 资讯处助理)">林慈贤 (IT老师 / 资讯处助理)</option>
                  <option value="黄世泓、林慈贤">黄世泓、林慈贤 (资讯处联合)</option>
                </select>
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
                  确认排入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框 2：登记维修工单 */}
      {showAddTicketModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">登记电脑室维修工单</h3>
            <p className="text-xs text-slate-500 mb-4">准确记录故障机位，让资讯处运维人员迅速跟进备件与排障</p>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">电脑室</label>
                  <select
                    value={tktLab}
                    onChange={(e) => setTktLab(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-semibold"
                  >
                    <option value="Lab A">Lab A (60座)</option>
                    <option value="Lab B">Lab B (50座)</option>
                    <option value="Lab C">Lab C (55座)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">故障机位/位置</label>
                  <input
                    type="text"
                    required
                    value={tktStation}
                    onChange={(e) => setTktStation(e.target.value)}
                    placeholder="如: 电脑号 A22 或 讲台投影仪"
                    className="w-full text-xs p-2.5 border rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">故障类型</label>
                  <select
                    value={tktFaultType}
                    onChange={(e) => setTktFaultType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="硬件损坏">硬件损坏</option>
                    <option value="网络断连">网络断连</option>
                    <option value="系统蓝屏/死机">系统蓝屏/死机</option>
                    <option value="外设故障(键盘/鼠标/耳机)">外设故障(键盘/鼠标/耳机)</option>
                    <option value="软件/还原异常">软件/还原异常</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">紧急程度</label>
                  <select
                    value={tktPriority}
                    onChange={(e) => setTktPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="紧急 (影响上课)">紧急 (影响上课)</option>
                    <option value="普通">普通</option>
                    <option value="低 (可候补)">低 (可候补)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">故障现象详细描述</label>
                <textarea
                  rows={3}
                  required
                  value={tktDesc}
                  onChange={(e) => setTktDesc(e.target.value)}
                  placeholder="说明开机异响、无显示、错误代码或硬件松脱情况..."
                  className="w-full text-xs p-2.5 border rounded-lg outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">报修登记人</label>
                <input
                  type="text"
                  value={tktReporter}
                  onChange={(e) => setTktReporter(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg outline-none bg-slate-50 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow"
                >
                  提交报修单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框 3：生成并打印电脑室维修报告 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">电脑室设备运维检修阶段报告</h3>
                  <p className="text-xs text-slate-400">汇总 Lab A、Lab B、Lab C 维修进度，便于技术人员备件采购与校方核准</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>打印报告 / 存为 PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 报告纸张预览 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-xl border border-slate-300 w-full max-w-3xl p-6 sm:p-10 font-sans text-slate-900">
                <div className="text-center pb-4 border-b-2 border-slate-800">
                  <h1 className="text-xl font-bold tracking-wider">日新独立中学 · 资讯处</h1>
                  <h2 className="text-base font-semibold text-slate-700 mt-1">
                    Lab A / Lab B / Lab C 电脑室设备故障检修与维护报告
                  </h2>
                  <div className="flex justify-between items-center text-xs text-slate-600 mt-3 font-mono">
                    <span>报告编号：IT-LAB-2027-{new Date().getMonth() + 1}</span>
                    <span>责任技术员：黄世泓、林慈贤 (IT老师/资讯处助理)</span>
                    <span>统计日期：{new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <div className="text-slate-500">总报修工单数</div>
                    <div className="text-lg font-bold font-mono mt-0.5">{tickets.length} 件</div>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                    <div>待维修 / 配件采购中</div>
                    <div className="text-lg font-bold font-mono mt-0.5">
                      {tickets.filter(t => t.status !== '已修复验收').length} 件
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                    <div>已排障修复</div>
                    <div className="text-lg font-bold font-mono mt-0.5">
                      {tickets.filter(t => t.status === '已修复验收').length} 件
                    </div>
                  </div>
                </div>

                <table className="w-full text-left text-xs mt-4 border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">机房</th>
                      <th className="p-2 border-r border-slate-300">机位</th>
                      <th className="p-2 border-r border-slate-300">故障说明</th>
                      <th className="p-2 border-r border-slate-300">报修日期</th>
                      <th className="p-2 border-r border-slate-300">技术员维修记录</th>
                      <th className="p-2 text-center">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, idx) => (
                      <tr key={t.id} className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                        <td className="p-2 border-r border-slate-200 font-bold">{t.labRoom}</td>
                        <td className="p-2 border-r border-slate-200 font-mono">{t.stationNumber}</td>
                        <td className="p-2 border-r border-slate-200">{t.description}</td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{t.reportedAt.split(' ')[0]}</td>
                        <td className="p-2 border-r border-slate-200 text-slate-600">{t.technicianNotes || '跟进处理中'}</td>
                        <td className="p-2 text-center font-bold">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-8 pt-12 mt-8 text-xs text-slate-700">
                  <div className="border-t border-slate-400 pt-2 text-center">
                    <div>资讯处维修技术员签字</div>
                    <div className="text-slate-400 text-[10px] mt-1">黄世泓 / 林慈贤 (IT老师/资讯处助理)</div>
                  </div>
                  <div className="border-t border-slate-400 pt-2 text-center">
                    <div>资讯处主管核准签字</div>
                    <div className="text-slate-400 text-[10px] mt-1">资讯处 / 电脑科</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
