import { StudentGrade } from '../types';

/**
 * 将 JPEG 二进制数据打包为符合 PDF 1.4 规范的标准 PDF 文件
 * A4 尺寸：595.28 x 841.89 点 (Points)
 */
function buildA4PdfFromJpeg(jpegBytes: Uint8Array, imgWidth: number, imgHeight: number): Uint8Array {
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // PDF 对象定义
  const textEncoder = new TextEncoder();
  const header = textEncoder.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const obj1 = textEncoder.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const obj2 = textEncoder.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  const obj3 = textEncoder.encode(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Img1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  const imgObjHeader = textEncoder.encode(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  const imgObjFooter = textEncoder.encode('\nendstream\nendobj\n');

  // 将图片铺满 A4 页面
  const contentStreamData = textEncoder.encode(
    `q\n${pageWidth.toFixed(2)} 0 0 ${pageHeight.toFixed(2)} 0 0 cm\n/Img1 Do\nQ\n`
  );
  const obj5 = textEncoder.encode(
    `5 0 obj\n<< /Length ${contentStreamData.length} >>\nstream\n${new TextDecoder().decode(contentStreamData)}endstream\nendobj\n`
  );

  // 计算偏移量生成交叉引用表 (xref)
  const offsets: number[] = [];
  let currentOffset = header.length;

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += imgObjHeader.length + jpegBytes.length + imgObjFooter.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  const xrefOffset = currentOffset;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += off.toString().padStart(10, '0') + ' 00000 n \n';
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const xrefBytes = textEncoder.encode(xref);

  // 拼接完整的 PDF 字节
  const totalLength =
    header.length +
    obj1.length +
    obj2.length +
    obj3.length +
    imgObjHeader.length +
    jpegBytes.length +
    imgObjFooter.length +
    obj5.length +
    xrefBytes.length;

  const result = new Uint8Array(totalLength);
  let pos = 0;

  result.set(header, pos); pos += header.length;
  result.set(obj1, pos); pos += obj1.length;
  result.set(obj2, pos); pos += obj2.length;
  result.set(obj3, pos); pos += obj3.length;
  result.set(imgObjHeader, pos); pos += imgObjHeader.length;
  result.set(jpegBytes, pos); pos += jpegBytes.length;
  result.set(imgObjFooter, pos); pos += imgObjFooter.length;
  result.set(obj5, pos); pos += obj5.length;
  result.set(xrefBytes, pos);

  return result;
}

/**
 * 计算总分公式:
 * 一考(20%) + 二考(20%) + 三考(30%) + 上作业(5%) + 下作业(5%) + 上小考(10%) + 下小考(10%)
 */
export function calculateStudentTotal(g: StudentGrade): number {
  const e1 = Number(g.exam1Score ?? 0) * 0.20;
  const e2 = Number(g.exam2Score ?? 0) * 0.20;
  const e3 = Number(g.exam3Score ?? 0) * 0.30;
  const hw1 = Number(g.homeworkH1Score ?? 0) * 0.05;
  const hw2 = Number(g.homeworkH2Score ?? 0) * 0.05;
  const q1 = Number(g.quizH1Score ?? 0) * 0.10;
  const q2 = Number(g.quizH2Score ?? 0) * 0.10;
  return Math.round((e1 + e2 + e3 + hw1 + hw2 + q1 + q2) * 10) / 10;
}

/**
 * 核心导出函数：将班级成绩直接生成为无乱码的标准 A4 .pdf 文件并下载保存到电脑
 */
export async function downloadGradeListAsPdfFile(
  className: string,
  subjectName: string,
  grades: StudentGrade[]
): Promise<void> {
  // A4 标准比例 (1 : 1.4142)，建立超高清绘制画布 (1414 x 2000 px)
  const canvasWidth = 1414;
  const canvasHeight = 2000;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法初始化 Canvas 绘图环境');
  }

  // 1. 铺设白色纯净底色
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 绘制校徽/顶部抬头
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('日新独立中学 · 资讯处 / 电脑科', canvasWidth / 2, 85);

  ctx.font = 'bold 22px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`学生学科成绩总评汇总表 (A4 官方存根)`, canvasWidth / 2, 125);

  // 3. 绘制分割线
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 150);
  ctx.lineTo(canvasWidth - 80, 150);
  ctx.stroke();

  // 4. 元数据信息栏
  const today = new Date().toISOString().split('T')[0];
  ctx.font = 'normal 18px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  ctx.fillText(`所在班级：${className}`, 80, 185);
  ctx.fillText(`学科名称：${subjectName}`, 380, 185);

  ctx.textAlign = 'right';
  ctx.fillText(`打印日期：${today}`, canvasWidth - 80, 185);

  // 5. 评分权重说明栏背景
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(80, 205, canvasWidth - 160, 42);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 205, canvasWidth - 160, 42);

  ctx.font = 'normal 15px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  ctx.fillText('评分细则：一考(20%) + 二考(20%) + 三考(30%) + 上作业(5%) + 下作业(5%) + 上小考(10%) + 下小考(10%) = 100%', 95, 232);

  const avg = grades.length > 0 
    ? (grades.reduce((s, g) => s + calculateStudentTotal(g), 0) / grades.length).toFixed(1)
    : '0';
  ctx.textAlign = 'right';
  ctx.fillText(`在册人数: ${grades.length} 人 | 班级平均分: ${avg} 分`, canvasWidth - 95, 232);

  // 6. 表格参数
  const tableTop = 265;
  const tableLeft = 80;
  const tableWidth = canvasWidth - 160;
  const rowHeight = 44;

  // 列定义与宽度分配 (总计 1254px)
  const columns = [
    { title: '学号', width: 110, align: 'center' },
    { title: '中文姓名', width: 160, align: 'left' },
    { title: '英文姓名', width: 224, align: 'left' },
    { title: '一考(20%)', width: 110, align: 'center' },
    { title: '二考(20%)', width: 110, align: 'center' },
    { title: '三考(30%)', width: 110, align: 'center' },
    { title: '上作业(5%)', width: 110, align: 'center' },
    { title: '下作业(5%)', width: 110, align: 'center' },
    { title: '小考(20%)', width: 110, align: 'center' },
    { title: '总分', width: 100, align: 'center' },
  ];

  // 绘制表头
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(tableLeft, tableTop, tableWidth, rowHeight);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tableLeft, tableTop, tableWidth, rowHeight);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';

  let currentX = tableLeft;
  for (const col of columns) {
    if (col.align === 'center') {
      ctx.textAlign = 'center';
      ctx.fillText(col.title, currentX + col.width / 2, tableTop + 28);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(col.title, currentX + 10, tableTop + 28);
    }
    // 列垂直分割线
    ctx.beginPath();
    ctx.moveTo(currentX + col.width, tableTop);
    ctx.lineTo(currentX + col.width, tableTop + rowHeight);
    ctx.stroke();

    currentX += col.width;
  }

  // 绘制学生数据行
  let currentY = tableTop + rowHeight;
  grades.forEach((g, idx) => {
    const total = calculateStudentTotal(g);

    // 斑马条纹背景
    ctx.fillStyle = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
    ctx.fillRect(tableLeft, currentY, tableWidth, rowHeight);

    // 单元格边框
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(tableLeft, currentY, tableWidth, rowHeight);

    let cellX = tableLeft;

    const cells = [
      { text: g.studentId, width: columns[0].width, align: 'center', bold: true, mono: true },
      { text: g.chineseName, width: columns[1].width, align: 'left', bold: true, mono: false },
      { text: g.englishName, width: columns[2].width, align: 'left', bold: false, mono: false },
      { text: String(g.exam1Score), width: columns[3].width, align: 'center', bold: false, mono: true },
      { text: String(g.exam2Score), width: columns[4].width, align: 'center', bold: false, mono: true },
      { text: String(g.exam3Score), width: columns[5].width, align: 'center', bold: true, mono: true },
      { text: String(g.homeworkH1Score), width: columns[6].width, align: 'center', bold: false, mono: true },
      { text: String(g.homeworkH2Score), width: columns[7].width, align: 'center', bold: false, mono: true },
      { text: `${g.quizH1Score}/${g.quizH2Score}`, width: columns[8].width, align: 'center', bold: false, mono: true },
      { text: String(total), width: columns[9].width, align: 'center', bold: true, mono: true, highlight: true },
    ];

    cells.forEach((cell) => {
      if (cell.highlight) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(cellX, currentY, cell.width, rowHeight);
        ctx.strokeRect(cellX, currentY, cell.width, rowHeight);
      }

      ctx.fillStyle = '#0f172a';
      ctx.font = `${cell.bold ? 'bold' : 'normal'} 16px ${cell.mono ? '"Consolas", "Courier New", monospace' : '"Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif'}`;

      if (cell.align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(cell.text, cellX + cell.width / 2, currentY + 28);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(cell.text, cellX + 10, currentY + 28);
      }

      // 单元格竖线
      ctx.beginPath();
      ctx.moveTo(cellX + cell.width, currentY);
      ctx.lineTo(cellX + cell.width, currentY + rowHeight);
      ctx.stroke();

      cellX += cell.width;
    });

    currentY += rowHeight;
  });

  // 7. 底部签名栏
  const signY = Math.max(currentY + 80, canvasHeight - 220);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;

  // 签名线 1: 任课教师
  ctx.beginPath();
  ctx.moveTo(120, signY);
  ctx.lineTo(380, signY);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = 'normal 16px "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('任课教师签名', 250, signY + 30);
  ctx.font = 'normal 14px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('黄世泓 / 林慈贤 (IT老师/资讯处助理)', 250, signY + 54);

  // 签名线 2: 资讯处审核
  ctx.beginPath();
  ctx.moveTo(560, signY);
  ctx.lineTo(820, signY);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = 'normal 16px "Microsoft YaHei", sans-serif';
  ctx.fillText('资讯处审核盖章', 690, signY + 30);
  ctx.font = 'normal 14px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('资讯处 / 电脑科', 690, signY + 54);

  // 签名线 3: 教务处核准
  ctx.beginPath();
  ctx.moveTo(1000, signY);
  ctx.lineTo(1260, signY);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = 'normal 16px "Microsoft YaHei", sans-serif';
  ctx.fillText('教务处核准', 1130, signY + 30);
  ctx.font = 'normal 14px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('教务科研处', 1130, signY + 54);

  // 8. 转换为无损高质 JPEG 字节流
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas 导出 JPEG 失败'));
    }, 'image/jpeg', 0.95);
  });

  const arrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBytes = new Uint8Array(arrayBuffer);

  // 9. 打包为真正的二进制合法 .pdf 文档
  const pdfBytes = buildA4PdfFromJpeg(jpegBytes, canvasWidth, canvasHeight);
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

  // 10. 触发下载为真正带有 .pdf 后缀的本地档案
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${className}_学生成绩总评表_A4.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
