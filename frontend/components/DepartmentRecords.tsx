import React, { useEffect, useMemo, useState } from 'react';
import { AlarmClock, ClipboardList, FileDown, FileSpreadsheet, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { AuthorizedUser, DepartmentRecord, RecordStatus } from '../types';
import { notify } from '../utils/toast';
import {
  DepartmentRecordInput,
  addDepartmentRecord,
  deleteDepartmentRecord,
  subscribeDepartmentRecords,
  updateDepartmentRecord,
} from '../services/departmentRecords';
import { RECORD_STATUS_LABELS as STATUS_LABELS, downloadRecordsAsCsv, downloadRecordsAsPdf } from '../utils/recordsExport';

interface DepartmentRecordsProps {
  authUser: AuthorizedUser;
}

const STATUS_STYLES: Record<RecordStatus, string> = {
  none: 'bg-slate-100 text-slate-500 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  doing: 'bg-sky-50 text-sky-700 border-sky-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_ORDER: RecordStatus[] = ['none', 'pending', 'doing', 'done'];

/** 到期前多少天开始提醒 */
const REMINDER_DAYS = 60;

const todayString = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** 两个 YYYY-MM-DD 日期相差的天数（b - a）。 */
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

interface FormState {
  date: string;
  content: string;
  handlers: string;
  status: RecordStatus;
  tag: string;
  expiryDate: string;
  note: string;
}

const emptyForm = (): FormState => ({
  date: todayString(),
  content: '',
  handlers: '',
  status: 'pending',
  tag: '',
  expiryDate: '',
  note: '',
});

export const DepartmentRecords: React.FC<DepartmentRecordsProps> = ({ authUser }) => {
  const [records, setRecords] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [year, setYear] = useState('all');
  const [month, setMonth] = useState('all');
  const [status, setStatus] = useState<'all' | RecordStatus>('all');
  const [person, setPerson] = useState('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const myEmail = authUser.email.toLowerCase();

  useEffect(() => {
    return subscribeDepartmentRecords(
      (list) => {
        setRecords(list);
        setLoading(false);
        setLoadError('');
      },
      (err) => {
        console.error('Failed to load department records:', err);
        setLoadError('无法加载事项记录，请确认已发布最新的 Firestore 规则。');
        setLoading(false);
      }
    );
  }, []);

  const canEdit = (r: DepartmentRecord) => authUser.isSuperAdmin || r.recorderEmail === myEmail;

  const years = useMemo(() => {
    const set = new Set(records.map((r) => r.date.slice(0, 4)));
    set.add(String(new Date().getFullYear()));
    return [...set].sort().reverse();
  }, [records]);

  const persons = useMemo(
    () => [...new Set(records.map((r) => r.recorderName).filter(Boolean))].sort(),
    [records]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      if (year !== 'all' && r.date.slice(0, 4) !== year) return false;
      if (month !== 'all' && r.date.slice(5, 7) !== month) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (person !== 'all' && r.recorderName !== person) return false;
      if (term) {
        const hay = `${r.content} ${r.handlers} ${r.recorderName} ${r.tag} ${r.note}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [records, year, month, status, person, search]);

  // 临近到期或已过期、且尚未标记「完成」的事项
  const reminders = useMemo(() => {
    const today = todayString();
    return records
      .filter((r) => r.expiryDate && r.status !== 'done')
      .map((r) => ({ record: r, days: daysBetween(today, r.expiryDate) }))
      .filter((x) => x.days <= REMINDER_DAYS)
      .sort((a, b) => a.days - b.days);
  }, [records]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (r: DepartmentRecord) => {
    setEditingId(r.id);
    setForm({
      date: r.date,
      content: r.content,
      handlers: r.handlers,
      status: r.status,
      tag: r.tag,
      expiryDate: r.expiryDate,
      note: r.note,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      notify('请填写记录事项', 'error');
      return;
    }
    if (!form.date) {
      notify('请选择日期', 'error');
      return;
    }
    const input: DepartmentRecordInput = {
      date: form.date,
      content: form.content.trim(),
      handlers: form.handlers.trim(),
      status: form.status,
      tag: form.tag.trim(),
      expiryDate: form.expiryDate,
      note: form.note.trim(),
    };
    setSaving(true);
    try {
      if (editingId) {
        await updateDepartmentRecord(editingId, input);
        notify('记录已更新', 'success');
      } else {
        await addDepartmentRecord(input, { name: authUser.name, email: authUser.email });
        notify('记录已添加', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save record failed:', err);
      notify(`保存失败：${err instanceof Error ? err.message : '未知错误'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: DepartmentRecord) => {
    if (!window.confirm('确定要删除这条记录吗？此操作无法撤销。')) return;
    try {
      await deleteDepartmentRecord(r.id);
      notify('记录已删除', 'success');
    } catch (err) {
      console.error('Delete record failed:', err);
      notify(`删除失败：${err instanceof Error ? err.message : '未知错误'}`, 'error');
    }
  };

  // 导出的是当前筛选结果；没有筛选时即为全部记录
  const filterSummary = () => {
    const parts = [
      year === 'all' ? '全部年份' : `${year} 年`,
      month === 'all' ? '全部月份' : `${Number(month)} 月`,
      status === 'all' ? '全部进度' : STATUS_LABELS[status],
      person === 'all' ? '全部记录者' : `记录者：${person}`,
    ];
    if (search.trim()) parts.push(`搜索：${search.trim()}`);
    return parts.join(' · ');
  };

  const handleExportCsv = () => {
    try {
      downloadRecordsAsCsv(visible);
    } catch (err) {
      console.error('CSV export failed:', err);
      notify(`导出 CSV 失败：${err instanceof Error ? err.message : '未知错误'}`, 'error');
    }
  };

  const handleExportPdf = () => {
    try {
      downloadRecordsAsPdf(visible, filterSummary());
    } catch (err) {
      console.error('PDF export failed:', err);
      notify(`导出 PDF 失败：${err instanceof Error ? err.message : '未知错误'}`, 'error');
    }
  };

  const reminderText = (days: number) =>
    days < 0 ? `已过期 ${-days} 天` : days === 0 ? '今天到期' : `还有 ${days} 天到期`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
            <span>资讯处事项记录</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            全年工作事项档案，所有成员共享 · 共 {records.length} 条 · 记录者可修改自己的记录，超级管理员可修改全部
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            disabled={visible.length === 0}
            title="导出当前筛选结果（未筛选时为全部记录）"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>导出 CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={visible.length === 0}
            title="导出当前筛选结果（未筛选时为全部记录）"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold"
          >
            <FileDown className="h-4 w-4 text-rose-600" />
            <span>导出 PDF</span>
          </button>
          <button
            onClick={openNew}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>新增记录</span>
          </button>
        </div>
      </div>

      {/* 到期提醒 */}
      {reminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
            <AlarmClock className="h-4 w-4" />
            <span>续期 / 到期提醒（{REMINDER_DAYS} 天内，共 {reminders.length} 项）</span>
          </div>
          <ul className="space-y-1.5">
            {reminders.map(({ record, days }) => (
              <li key={record.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-700">
                <span
                  className={`shrink-0 w-fit px-2 py-0.5 rounded-full font-bold border ${
                    days < 0 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {reminderText(days)}（{record.expiryDate}）
                </span>
                <span className="break-words min-w-0">{record.content.split('\n')[0]}</span>
                {canEdit(record) && (
                  <button onClick={() => openEdit(record)} className="shrink-0 text-sky-700 underline underline-offset-2 font-medium">
                    编辑 / 标记完成
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 搜索与筛选 */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索事项内容、处理人、记录者、标签..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" aria-label="年份">
            <option value="all">全部年份</option>
            {years.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" aria-label="月份">
            <option value="all">全部月份</option>
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
              <option key={m} value={m}>{Number(m)} 月</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | RecordStatus)} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" aria-label="进度">
            <option value="all">全部进度</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select value={person} onChange={(e) => setPerson(e.target.value)} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" aria-label="记录者">
            <option value="all">全部记录者</option>
            {persons.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="text-[11px] text-slate-400">符合条件：{visible.length} / {records.length} 条</div>
      </div>

      {/* 记录表格 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3 whitespace-nowrap">日期</th>
                <th className="p-3 min-w-[280px]">记录事项</th>
                <th className="p-3">处理事项</th>
                <th className="p-3">记录者</th>
                <th className="p-3">进度</th>
                <th className="p-3 whitespace-nowrap">到期日</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">正在加载记录…</td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-rose-600">{loadError}</td>
                </tr>
              )}
              {!loading && !loadError && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    {records.length === 0 ? '还没有记录，点击右上角「新增记录」开始。' : '没有符合条件的记录。'}
                  </td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition align-top">
                  <td className="p-3 whitespace-nowrap font-mono text-[11px]">{r.date}</td>
                  <td className="p-3">
                    <div className="whitespace-pre-wrap break-words text-slate-900 text-[13px] leading-relaxed">{r.content}</div>
                    {(r.tag || r.note) && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {r.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium">{r.tag}</span>
                        )}
                        {r.note && <span className="text-[11px] text-slate-500 break-words">{r.note}</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-3 break-words">{r.handlers || '—'}</td>
                  <td className="p-3 whitespace-nowrap">{r.recorderName || '—'}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono text-[11px]">{r.expiryDate || '—'}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {canEdit(r) ? (
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700" title="编辑" aria-label="编辑">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="删除" aria-label="删除">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增 / 编辑弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{editingId ? '编辑记录' : '新增记录'}</h3>
              <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-600">
                日期
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                进度
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RecordStatus })} className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500">
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-xs font-medium text-slate-600">
              记录事项
              <textarea required rows={5} maxLength={5000} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
            </label>

            <label className="block text-xs font-medium text-slate-600">
              处理事项（谁负责处理）
              <input type="text" value={form.handlers} onChange={(e) => setForm({ ...form, handlers: e.target.value })} placeholder="例如：慈贤、世泓" className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-600">
                标签（可选）
                <input type="text" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="例如：支付" className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                到期 / 续期日（可选）
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
              </label>
            </div>

            <label className="block text-xs font-medium text-slate-600">
              进度备注（可选）
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" />
            </label>

            <p className="text-[11px] text-slate-400">
              记录者：{editingId ? '保持原记录者不变' : authUser.name}　·　到期日填写后，临近到期（{REMINDER_DAYS} 天内）会在本页顶部提醒，标记「完成」后不再提醒。
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60">
                取消
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-xs sm:text-sm rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold">
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
