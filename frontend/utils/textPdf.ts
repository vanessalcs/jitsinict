import { FONT, buildPdfFromJpegPages, canvasToJpegBytes, triggerDownload, wrapText } from './recordsExport';

// 把一段文字（如 AI 生成的练习卷）排版成多页 A4 竖向 PDF。
// 与事项记录导出一致：用 Canvas 绘制，中文无需嵌入字体。
const PAGE_W = 1414;
const PAGE_H = 2000; // A4 竖向比例
const MARGIN_X = 110;
const MARGIN_TOP = 120;
const MARGIN_BOTTOM = 120;
const BODY_SIZE = 26;
const BODY_LINE_H = 42;
const HEADING_SIZE = 34;
const HEADING_LINE_H = 54;

interface Line {
  text: string;
  heading: boolean;
}

/** 去掉 Markdown 标记，保留可读文字；标题行单独标出。 */
function toLines(markdown: string): Line[] {
  const out: Line[] = [];
  let inCode = false;
  for (const raw of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*```/.test(raw)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push({ text: raw, heading: false });
      continue;
    }
    const headingMatch = raw.match(/^\s{0,3}#{1,6}\s+(.*)$/);
    let text = headingMatch ? headingMatch[1] : raw;
    text = text
      .replace(/^\s*[-*+]\s+/, '• ')
      .replace(/^\s*---+\s*$/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1');
    out.push({ text, heading: Boolean(headingMatch) });
  }
  return out;
}

/** 把文字导出为 PDF 并下载。fileName 不含扩展名。 */
export function downloadTextAsPdf(markdown: string, fileName: string): void {
  const pages: HTMLCanvasElement[] = [];

  const newPage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法初始化 Canvas 绘图环境');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    pages.push(canvas);
    return { ctx, y: MARGIN_TOP };
  };

  let { ctx, y } = newPage();
  const maxWidth = PAGE_W - MARGIN_X * 2;

  for (const line of toLines(markdown)) {
    const lineH = line.heading ? HEADING_LINE_H : BODY_LINE_H;
    ctx.font = `${line.heading ? 'bold' : 'normal'} ${line.heading ? HEADING_SIZE : BODY_SIZE}px ${FONT}`;
    const wrapped = line.text.trim() === '' ? [''] : wrapText(ctx, line.text, maxWidth);
    for (const piece of wrapped) {
      if (y + lineH > PAGE_H - MARGIN_BOTTOM) {
        ({ ctx, y } = newPage());
        ctx.font = `${line.heading ? 'bold' : 'normal'} ${line.heading ? HEADING_SIZE : BODY_SIZE}px ${FONT}`;
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillText(piece, MARGIN_X, y + lineH * 0.7);
      y += lineH;
    }
  }

  pages.forEach((canvas, i) => {
    const c = canvas.getContext('2d');
    if (!c) return;
    c.fillStyle = '#64748b';
    c.font = `normal 22px ${FONT}`;
    c.textAlign = 'center';
    c.fillText(`第 ${i + 1} 页 / 共 ${pages.length} 页`, PAGE_W / 2, PAGE_H - 50);
  });

  const pdf = buildPdfFromJpegPages(pages.map(canvasToJpegBytes), {
    pxW: PAGE_W,
    pxH: PAGE_H,
    ptW: 595.28,
    ptH: 841.89,
  });
  triggerDownload(new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }), `${fileName}.pdf`);
}
