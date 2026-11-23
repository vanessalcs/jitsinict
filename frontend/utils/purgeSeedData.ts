/**
 * 一次性清理：删除浏览器 localStorage 中遗留的「内置示例记录」（按 id 匹配），
 * 保留用户自己新增的记录。执行后写入标记，不会重复运行。
 */
const PURGE_FLAG = 'eduit_seed_purged_v1';

const SEED_IDS: Record<string, string[]> = {
  eduit_teaching_journals_v5: ['jnl_1', 'jnl_2', 'jnl_3'],
  eduit_resources_v5: ['res_1', 'res_2', 'res_3', 'res_4'],
  eduit_grades_v5: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'],
  eduit_homework_v5: ['hw1', 'hw2'],
  eduit_timetable_v5: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 't13'],
  eduit_documents_v5: ['doc1', 'doc2', 'doc3'],
  eduit_announcements_v5: ['a1', 'a2'],
  eduit_lab_tickets: ['tkt_001', 'tkt_002', 'tkt_003', 'tkt_004'],
  eduit_teaching_progress_v1: ['prog_1', 'prog_2'],
};

export function purgeSeedData(): void {
  try {
    if (localStorage.getItem(PURGE_FLAG)) return;
    for (const [key, seedIds] of Object.entries(SEED_IDS)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const list: unknown = JSON.parse(raw);
      if (!Array.isArray(list)) continue;
      const seeds = new Set(seedIds);
      const kept = list.filter((item) => !(item && typeof item === 'object' && seeds.has((item as { id?: string }).id ?? '')));
      localStorage.setItem(key, JSON.stringify(kept));
    }
    localStorage.setItem(PURGE_FLAG, '1');
  } catch {
    // 存储不可用或数据损坏：忽略，应用会使用空白默认值
  }
}
