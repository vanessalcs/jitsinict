import React, { useMemo, useState } from 'react';
import { Wallet, Info, TrendingDown, PiggyBank, Receipt, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BUDGET_CATEGORIES, BUDGET_YEAR } from '../data/budget2027';

// 子类别下的一笔实际购买。数量、单价用字符串保存，避免输入小数点时被截断。
interface Purchase {
  id: string;
  at: string; // 本地日期时间 YYYY-MM-DDTHH:mm
  desc: string; // 购买内容说明
  qty: string;
  price: string;
}

const money = (n: number) =>
  n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (s: string) => {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
};

/** 一笔购买的金额 = 数量 × 单价（四舍五入到分） */
const purchaseTotal = (p: Purchase) => Math.round(num(p.qty) * num(p.price) * 100) / 100;

const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputCls =
  'w-full p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500';

export const BudgetPage: React.FC = () => {
  // 预览版：购买记录暂存在本浏览器（key = 子类别编号）
  const [purchases, setPurchases] = useLocalStorage<Record<string, Purchase[]>>(
    'eduit_budget_purchases_2027_v1',
    {}
  );
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const rows = useMemo(
    () =>
      BUDGET_CATEGORIES.map((c) => {
        const items = c.items.map((it) => {
          const list = purchases[it.id] ?? [];
          const budget = Math.round(it.unitPrice * it.qty * 100) / 100;
          const actual = list.reduce((s, p) => s + purchaseTotal(p), 0);
          return { ...it, list, budget, actual, remaining: budget - actual };
        });
        const actual = items.reduce((s, it) => s + it.actual, 0);
        const count = items.reduce((s, it) => s + it.list.length, 0);
        return { ...c, items, actual, count, remaining: c.budget - actual };
      }),
    [purchases]
  );

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const usedPct = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const toggle = (code: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  // 新增一笔购买：日期时间默认记下当下，之后可修改。
  const addPurchase = (itemId: string) =>
    setPurchases((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), { id: crypto.randomUUID(), at: nowLocal(), desc: '', qty: '1', price: '' }],
    }));

  const updatePurchase = (itemId: string, id: string, patch: Partial<Purchase>) =>
    setPurchases((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const removePurchase = (itemId: string, id: string) =>
    setPurchases((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? []).filter((p) => p.id !== id) }));

  const summary = [
    { label: '总预算', value: totalBudget, icon: PiggyBank, tone: 'text-sky-700 bg-sky-50 border-sky-100' },
    { label: '实际支出', value: totalActual, icon: Receipt, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
    {
      label: '剩余预算',
      value: totalRemaining,
      icon: TrendingDown,
      tone: totalRemaining < 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
          <span>{BUDGET_YEAR} 年资讯处预算</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          在每个子类别下点「添加」登记实际购买，子类别、类别的实际支出与剩余会自动计算（单位：RM）
        </p>
      </div>

      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>预览版：</b>预算与子类别取自「2027 BUDGET 资讯处.xlsx」，只列出有预算的类别。登记的购买记录目前只暂存在本浏览器里，其他老师看不到，也不会同步。确认版面后再改成全处共享。
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.tone}`}>
              <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
                <Icon className="h-4 w-4" />
                <span>{s.label}</span>
              </div>
              <div className="mt-1.5 text-xl sm:text-2xl font-bold tabular-nums">RM {money(s.value)}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span>整体使用率</span>
          <span className="font-semibold tabular-nums">{usedPct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${usedPct > 100 ? 'bg-rose-500' : usedPct > 80 ? 'bg-amber-500' : 'bg-sky-500'}`}
            style={{ width: `${Math.min(usedPct, 100)}%` }}
          />
        </div>
      </div>

      {/* 各类别：汇总 + 可展开的子类别 */}
      <div className="space-y-3 sm:space-y-4">
        {rows.map((r) => {
          const pct = r.budget > 0 ? (r.actual / r.budget) * 100 : 0;
          const over = r.remaining < 0;
          const isOpen = !collapsed.has(r.code);
          return (
            <div key={r.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* 类别汇总 */}
              <button
                onClick={() => toggle(r.code)}
                className="w-full text-left p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 hover:bg-slate-50/60 transition"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 md:w-72 shrink-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">
                      <span className="text-slate-400 font-medium mr-1.5">{r.code}.</span>
                      {r.zh}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {r.en} · {r.items.length} 个子类别 · {r.count} 笔购买
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 flex-1 text-xs">
                  <div>
                    <div className="text-[11px] text-slate-400">预算 (RM)</div>
                    <div className="font-semibold tabular-nums text-slate-800">{money(r.budget)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">实际支出 (RM)</div>
                    <div className="font-semibold tabular-nums text-slate-800">{money(r.actual)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">剩余 (RM)</div>
                    <div className={`font-semibold tabular-nums ${over ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {money(r.remaining)}
                      {over && <span className="ml-1 text-[10px] font-bold">超支</span>}
                    </div>
                  </div>
                </div>

                <div className="md:w-36 shrink-0">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-sky-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">已用 {pct.toFixed(0)}%</div>
                </div>
              </button>

              {/* 子类别清单 */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-700 min-w-[820px]">
                      <thead className="text-slate-500 font-semibold">
                        <tr>
                          <th className="pb-1.5 pr-2 text-left">子类别</th>
                          <th className="pb-1.5 pr-2 text-right w-24">预算单价</th>
                          <th className="pb-1.5 pr-2 text-right w-14">数量</th>
                          <th className="pb-1.5 pr-2 text-right w-28">预算金额</th>
                          <th className="pb-1.5 pr-2 text-right w-28">实际支出</th>
                          <th className="pb-1.5 pr-2 text-right w-28">剩余</th>
                          <th className="pb-1.5 w-20" />
                        </tr>
                      </thead>
                      <tbody>
                        {r.items.map((it) => (
                          <React.Fragment key={it.id}>
                            {/* 子类别行 */}
                            <tr className="border-t border-slate-200">
                              <td className="py-2 pr-2 font-semibold text-slate-900">{it.name}</td>
                              <td className="py-2 pr-2 text-right tabular-nums text-slate-500">{money(it.unitPrice)}</td>
                              <td className="py-2 pr-2 text-right tabular-nums text-slate-500">{it.qty}</td>
                              <td className="py-2 pr-2 text-right tabular-nums font-semibold">{money(it.budget)}</td>
                              <td className="py-2 pr-2 text-right tabular-nums font-semibold">{money(it.actual)}</td>
                              <td
                                className={`py-2 pr-2 text-right tabular-nums font-semibold ${
                                  it.remaining < 0 ? 'text-rose-600' : 'text-emerald-700'
                                }`}
                              >
                                {money(it.remaining)}
                              </td>
                              <td className="py-2 text-right">
                                <button
                                  onClick={() => addPurchase(it.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-semibold shadow-sm transition"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>添加</span>
                                </button>
                              </td>
                            </tr>

                            {/* 该子类别下的购买记录 */}
                            {it.list.length > 0 && (
                              <tr>
                                <td colSpan={7} className="pb-2">
                                  <div className="ml-3 sm:ml-5 pl-3 border-l-2 border-sky-200 bg-white rounded-lg border border-slate-200 p-2">
                                    <table className="w-full text-xs">
                                      <thead className="text-slate-500 font-semibold">
                                        <tr>
                                          <th className="pb-1 pr-2 text-left w-48">日期与时间</th>
                                          <th className="pb-1 pr-2 text-left">购买内容</th>
                                          <th className="pb-1 pr-2 text-right w-20">数量</th>
                                          <th className="pb-1 pr-2 text-right w-28">单价 (RM)</th>
                                          <th className="pb-1 pr-2 text-right w-28">金额 (RM)</th>
                                          <th className="pb-1 w-8" />
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {it.list.map((p) => (
                                          <tr key={p.id}>
                                            <td className="py-1 pr-2">
                                              <input
                                                type="datetime-local"
                                                value={p.at}
                                                onChange={(e) => updatePurchase(it.id, p.id, { at: e.target.value })}
                                                className={inputCls}
                                              />
                                            </td>
                                            <td className="py-1 pr-2">
                                              <input
                                                type="text"
                                                value={p.desc}
                                                onChange={(e) => updatePurchase(it.id, p.id, { desc: e.target.value })}
                                                placeholder="买了什么、型号或供应商"
                                                className={inputCls}
                                              />
                                            </td>
                                            <td className="py-1 pr-2">
                                              <input
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="any"
                                                value={p.qty}
                                                onChange={(e) => updatePurchase(it.id, p.id, { qty: e.target.value })}
                                                className={`${inputCls} text-right tabular-nums`}
                                              />
                                            </td>
                                            <td className="py-1 pr-2">
                                              <input
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="0.01"
                                                value={p.price}
                                                onChange={(e) => updatePurchase(it.id, p.id, { price: e.target.value })}
                                                placeholder="0.00"
                                                className={`${inputCls} text-right tabular-nums`}
                                              />
                                            </td>
                                            <td className="py-1 pr-2 text-right font-semibold tabular-nums text-slate-900">
                                              {money(purchaseTotal(p))}
                                            </td>
                                            <td className="py-1 text-right">
                                              <button
                                                onClick={() => removePurchase(it.id, p.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="删除这笔购买"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                          <td className="pt-2 pr-2" colSpan={3}>本类别合计</td>
                          <td className="pt-2 pr-2 text-right tabular-nums">
                            {money(r.items.reduce((s, it) => s + it.budget, 0))}
                          </td>
                          <td className="pt-2 pr-2 text-right tabular-nums">{money(r.actual)}</td>
                          <td className={`pt-2 pr-2 text-right tabular-nums ${over ? 'text-rose-600' : ''}`}>
                            {money(r.remaining)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 合计 */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[11px] text-slate-400">合计预算 (RM)</div>
            <div className="font-bold tabular-nums text-sm">{money(totalBudget)}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">合计支出 (RM)</div>
            <div className="font-bold tabular-nums text-sm">{money(totalActual)}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">合计剩余 (RM)</div>
            <div className={`font-bold tabular-nums text-sm ${totalRemaining < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {money(totalRemaining)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
