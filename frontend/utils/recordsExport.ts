import { DepartmentRecord, RecordStatus } from '../types';

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  none: '未标注',
  pending: '待处理',
  doing: '进行中',
  done: '完成',
};

const todayString = () => new Date().toISOString().split('T')[0];

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 防止 Excel 把以 = + @ 开头的文本当作公式执行。 */
function csvCell(value: string): string {
  const safe = /^[=+@]/.test(value) || /^-\S/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** 导出为 CSV（UTF-8 带 BOM，Excel 直接打开不乱码）。 */
export function downloadRecordsAsCsv(records: DepartmentRecord[]): void {
  const header = ['日期', '记录事项', '处理事项', '记录者', '进度', '标签', '到期日', '进度备注'];
  const lines = [header.map(csvCell).join(',')];
  for (const r of records) {
    lines.push(
      [r.date, r.content, r.handlers, r.recorderName, RECORD_STATUS_LABELS[r.status], r.tag, r.expiryDate, r.note]
        .map(csvCell)
        .join(',')
    );
  }
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `资讯处事项记录_${todayString()}.csv`);
}

// ---------------------------------------------------------------------------
// PDF：用 Canvas 绘制每一页（中文无需嵌入字体），再把每页 JPEG 打包成多页 A4 横向 PDF。
// ---------------------------------------------------------------------------

export const FONT = '"Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
const PAGE_W = 2000;
const PAGE_H = 1414; // A4 横向比例
const MARGIN = 60;
const LINE_H = 32;
const MAX_LINES_PER_ROW = 24;

const COLUMNS = [
  { title: '日期', width: 150 },
  { title: '记录事项', width: 1000 },
  { title: '处理事项', width: 260 },
  { title: '记录者', width: 150 },
  { title: '进度', width: 120 },
  { title: '到期日', width: 160 },
];

/** 按像素宽度逐字换行（中英文混排都适用），并保留原有换行。 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const ch of paragraph) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function canvasToJpegBytes(canvas: HTMLCanvasElement): Uint8Array {
  const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** 把若干页 JPEG 打包成多页 PDF（默认 A4 横向；可传入像素与 pt 尺寸以生成竖向页面）。 */
export function buildPdfFromJpegPages(
  pages: Uint8Array[],
  size: { pxW: number; pxH: number; ptW: number; ptH: number } = { pxW: PAGE_W, pxH: PAGE_H, ptW: 841.89, ptH: 595.28 }
): Uint8Array {
  const enc = new TextEncoder();
  const pw = size.ptW;
  const ph = size.ptH;
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: Uint8Array | string) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const beginObject = (n: number) => {
    offsets[n] = length;
  };

  push('%PDF-1.4\n');
  // 对象编号：1 目录，2 页面树，之后每页 3 个对象（页面 / 图片 / 内容）
  beginObject(1);
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const pageObjIds = pages.map((_, i) => 3 + i * 3);
  beginObject(2);
  push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`);

  pages.forEach((jpeg, i) => {
    const pageId = 3 + i * 3;
    const imgId = pageId + 1;
    const contentId = pageId + 2;
    const content = `q\n${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm\n/Img${i} Do\nQ\n`;

    beginObject(pageId);
    push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] ` +
        `/Resources << /XObject << /Img${i} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    );
    beginObject(imgId);
    push(
      `${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${size.pxW} /Height ${size.pxH} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
    );
    push(jpeg);
    push('\nendstream\nendobj\n');
    beginObject(contentId);
    push(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  });

  const objectCount = 2 + pages.length * 3;
  const xrefOffset = length;
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= objectCount; n++) {
    xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  push(xref);

  const out = new Uint8Array(length);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

/** 导出为 PDF 报告（A4 横向，自动分页）。filterText 说明当前的筛选条件，会印在抬头上。 */
export function downloadRecordsAsPdf(records: DepartmentRecord[], filterText: string): void {
  const canvasPages: HTMLCanvasElement[] = [];
  const tableWidth = COLUMNS.reduce((s, c) => s + c.width, 0);
  const colX: number[] = [];
  COLUMNS.reduce((x, c) => {
    colX.push(x);
    return x + c.width;
  }, MARGIN);

  const newPage = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; y: number } => {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法初始化 Canvas 绘图环境');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    canvasPages.push(canvas);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 38px ${FONT}`;
    ctx.fillText('日新独立中学 · 资讯处事项记录', MARGIN, 82);
    ctx.font = `normal 22px ${FONT}`;
    ctx.fillStyle = '#475569';
    ctx.fillText(`${filterText}　·　共 ${records.length} 条`, MARGIN, 120);
    ctx.textAlign = 'right';
    ctx.fillText(`导出日期：${todayString()}`, PAGE_W - MARGIN, 120);
    ctx.textAlign = 'left';

    // 表头
    const top = 145;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(MARGIN, top, tableWidth, 46);
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 22px ${FONT}`;
    COLUMNS.forEach((c, i) => ctx.fillText(c.title, colX[i] + 12, top + 31));
    return { canvas, ctx, y: top + 46 };
  };

  let { ctx, y } = newPage();
  const bottomLimit = PAGE_H - 70;

  records.forEach((r) => {
    ctx.font = `normal 22px ${FONT}`;
    const contentText = r.content + (r.note ? `\n（${r.note}）` : '') + (r.tag ? `\n【${r.tag}】` : '');
    let contentLines = wrapText(ctx, contentText, COLUMNS[1].width - 24);
    if (contentLines.length > MAX_LINES_PER_ROW) {
      contentLines = contentLines.slice(0, MAX_LINES_PER_ROW);
      contentLines[MAX_LINES_PER_ROW - 1] += ' …（内容过长已截断，完整内容请导出 CSV）';
    }
    const handlerLines = wrapText(ctx, r.handlers || '—', COLUMNS[2].width - 24);
    const rowLines = Math.max(contentLines.length, handlerLines.length, 1);
    const rowHeight = rowLines * LINE_H + 18;

    if (y + rowHeight > bottomLimit) {
      ({ ctx, y } = newPage());
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `normal 22px ${FONT}`;
    const baseY = y + 31;
    ctx.fillText(r.date, colX[0] + 12, baseY);
    contentLines.forEach((line, i) => ctx.fillText(line, colX[1] + 12, baseY + i * LINE_H));
    handlerLines.forEach((line, i) => ctx.fillText(line, colX[2] + 12, baseY + i * LINE_H));
    ctx.fillText(r.recorderName || '—', colX[3] + 12, baseY);
    ctx.fillText(RECORD_STATUS_LABELS[r.status], colX[4] + 12, baseY);
    ctx.fillText(r.expiryDate || '—', colX[5] + 12, baseY);

    y += rowHeight;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(MARGIN + tableWidth, y);
    ctx.stroke();
  });

  // 页脚页码
  canvasPages.forEach((canvas, i) => {
    const c = canvas.getContext('2d');
    if (!c) return;
    c.fillStyle = '#64748b';
    c.font = `normal 20px ${FONT}`;
    c.textAlign = 'center';
    c.fillText(`第 ${i + 1} 页 / 共 ${canvasPages.length} 页`, PAGE_W / 2, PAGE_H - 28);
  });

  const pdf = buildPdfFromJpegPages(canvasPages.map(canvasToJpegBytes));
  triggerDownload(new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }), `资讯处事项记录_${todayString()}.pdf`);
}
