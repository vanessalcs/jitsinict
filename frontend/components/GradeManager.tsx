import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Check, 
  FileCheck, 
  BarChart3, 
  ChevronDown, 
  Award, 
  Printer, 
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Download
} from 'lucide-react';
import { StudentGrade, HomeworkSubmission, SchoolSubject } from '../types';
import { SCHOOL_CLASS_GROUPS, getSubjectByClass } from '../data/classes';
import { calculateStudentTotal } from '../utils/pdfExport';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface GradeManagerProps {
  grades: StudentGrade[];
  onUpdateGrade: (updated: StudentGrade) => void;
  onAddGrade: (newGrade: StudentGrade) => void;
  homeworkList: HomeworkSubmission[];
  onAddHomework: (hw: HomeworkSubmission) => void;
}

export const GradeManager: React.FC<GradeManagerProps> = ({
  grades,
  onUpdateGrade,
  onAddGrade,
  homeworkList,
  onAddHomework,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grades' | 'homework' | 'stats'>('grades');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 顶部班级下拉选择，默认定位到初一 J1U1
  const [selectedClass, setSelectedClass] = useState<string>('J1U1');

  // 当前正在修改的学生 ID 及编辑草稿
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StudentGrade>>({});

  // 录入新学生模态框
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newChineseName, setNewChineseName] = useState('');
  const [newEnglishName, setNewEnglishName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('J1U1');

  // A4 打印预览模态框
  const [showPdfModal, setShowPdfModal] = useState(false);
  // 提示 Toast
  const [notice, setNotice] = useState<string | null>(null);

  // 发布作业模态框
  const [showAddHwModal, setShowAddHwModal] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwCourse, setNewHwCourse] = useState<SchoolSubject>('电脑资讯与工艺');
  const [newHwClass, setNewHwClass] = useState('J1U1');
  const [newHwDue, setNewHwDue] = useState('2025-03-25');
  const [newHwDesc, setNewHwDesc] = useState('');

  // 根据当前顶部选择的班级与搜索词过滤名单
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchClass = selectedClass === 'all' || g.classGrade === selectedClass;
      const matchSearch =
        g.studentId.includes(searchTerm) ||
        g.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.englishName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [grades, selectedClass, searchTerm]);

  // 当前班级平均总分
  const classAvgScore = useMemo(() => {
    if (filteredGrades.length === 0) return 0;
    const total = filteredGrades.reduce((sum, g) => sum + calculateStudentTotal(g), 0);
    return Math.round((total / filteredGrades.length) * 10) / 10;
  }, [filteredGrades]);

  // 当前班级对应的科目名称
  const currentSubject = useMemo(() => {
    return getSubjectByClass(selectedClass);
  }, [selectedClass]);

  // 触发气泡通知
  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  // 生成标准的 A4 独立打印页面
  const generateA4HtmlContent = () => {
    const today = new Date().toISOString().split('T')[0];
    const rowsHtml = filteredGrades.map((g, idx) => {
      const total = calculateStudentTotal(g);
      const bg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 6px 8px; text-align: center; font-family: monospace; font-weight: bold;">${g.studentId}</td>
          <td style="padding: 6px 8px; font-weight: bold;">${g.chineseName}</td>
          <td style="padding: 6px 8px; font-family: monospace; font-size: 11px;">${g.englishName}</td>
          <td style="padding: 6px 8px; text-align: center;">${g.exam1Score}</td>
          <td style="padding: 6px 8px; text-align: center;">${g.exam2Score}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${g.exam3Score}</td>
          <td style="padding: 6px 8px; text-align: center;">${Math.round((g.homeworkH1Score + g.homeworkH2Score) / 2)}</td>
          <td style="padding: 6px 8px; text-align: center;">${Math.round((g.quizH1Score + g.quizH2Score) / 2)}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; background-color: #f1f5f9;">${total}</td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${selectedClass}_学生成绩汇总单_A4</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-top: 4px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 11px;
      color: #475569;
    }
    .rule-bar {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 10.5px;
      color: #334155;
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #94a3b8;
    }
    th {
      background-color: #e2e8f0;
      border: 1px solid #94a3b8;
      padding: 7px 6px;
      font-size: 11px;
      font-weight: bold;
    }
    td {
      border: 1px solid #cbd5e1;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      font-size: 11px;
    }
    .sign-box {
      border-top: 1px solid #64748b;
      width: 28%;
      text-align: center;
      padding-top: 6px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">日新独立中学 · 资讯处 / 电脑科</div>
    <div class="subtitle">${selectedClass} 学生学科成绩总评汇总表 (A4 标准存根)</div>
    <div class="meta-bar">
      <span>学科名称：${currentSubject}</span>
      <span>责任教职员：黄世泓 / 林慈贤 (IT老师 / 资讯处助理)</span>
      <span>打印归档日期：${today}</span>
    </div>
  </div>

  <div class="rule-bar">
    <span><b>评分细则：</b>第一期考(20%) + 第二期考(20%) + 第三期考(30%) + 上半年作业(5%) + 下半年作业(5%) + 上半年小考(10%) + 下半年小考(10%) = 100%</span>
    <span><b>在册人数：</b>${filteredGrades.length} 人 &nbsp;|&nbsp; <b>班级平均分：</b>${classAvgScore} 分</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 11%;">学号</th>
        <th style="width: 14%;">中文姓名</th>
        <th style="width: 18%;">英文姓名</th>
        <th style="width: 9%;">一考(20%)</th>
        <th style="width: 9%;">二考(20%)</th>
        <th style="width: 9%;">三考(30%)</th>
        <th style="width: 10%;">作业(10%)</th>
        <th style="width: 10%;">小考(20%)</th>
        <th style="width: 10%; background-color: #cbd5e1;">总分</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sign-box">
      <div>任课教师签名</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 3px;">黄世泓 / 林慈贤</div>
    </div>
    <div class="sign-box">
      <div>资讯处审核盖章</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 3px;">资讯处 / 电脑科</div>
    </div>
    <div class="sign-box">
      <div>教务处核准</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 3px;">教务科研处</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
  };

  // 调起纯净 A4 独立窗口直接打印
  const handlePrintCleanA4 = () => {
    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(generateA4HtmlContent());
        printWin.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  // 导出 Excel / CSV 格式表格到电脑
  const handleExportCsv = () => {
    try {
      let csv = '﻿学号,中文姓名,英文姓名,班级,科目,第一期考(20%),第二期考(20%),第三期考(30%),上半年作业(5%),下半年作业(5%),上半年小考(10%),下半年小考(10%),综合总分\n';
      filteredGrades.forEach(g => {
        const total = calculateStudentTotal(g);
        csv += `"${g.studentId}","${g.chineseName}","${g.englishName}","${g.classGrade}","${g.subjectName}",${g.exam1Score},${g.exam2Score},${g.exam3Score},${g.homeworkH1Score},${g.homeworkH2Score},${g.quizH1Score},${g.quizH2Score},${total}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedClass}_学生成绩花名册.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerNotice(`已成功导出「${selectedClass}_学生成绩花名册.csv」到您的电脑！`);
    } catch (e) {
      alert('导出 CSV 失败！');
    }
  };

  // 下载特定作业提交名单到电脑
  const handleDownloadHomeworkList = (hw: HomeworkSubmission) => {
    try {
      let content = `【日新独中 · 资讯处 / 电脑科】作业提交批改总表\n`;
      content += `作业标题：${hw.title}\n`;
      content += `所属科目：${hw.course}\n`;
      content += `对象班级：${hw.targetClass}\n`;
      content += `布置日期：${hw.assignedDate}  |  截止日期：${hw.dueDate}\n`;
      content += `提交状态：${hw.submittedCount} / ${hw.totalStudents} 人已交 (批改状态: ${hw.status === 'graded' ? '已全数批改' : '批阅中'})\n`;
      content += `作业说明：${hw.description}\n`;
      content += `---------------------------------------------------------\n`;
      content += `学号\t中文姓名\t英文姓名\t提交状态\t得分建议\n`;

      filteredGrades.forEach(g => {
        content += `${g.studentId}\t${g.chineseName}\t${g.englishName}\t已提交\t优秀\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${hw.targetClass}_${hw.title}_提交名册.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      triggerNotice(`已成功下载「${hw.title}」批改名册到电脑！`);
    } catch {
      alert('下载作业名册失败！');
    }
  };

  // 开始编辑某位学生
  const handleStartEdit = (g: StudentGrade) => {
    setEditingId(g.id);
    setEditFormData({ ...g });
  };

  // 保存成绩编辑
  const handleSaveEdit = (id: string) => {
    const original = grades.find((g) => g.id === id);
    if (!original) return;
    const updated: StudentGrade = {
      ...original,
      studentId: editFormData.studentId ? editFormData.studentId.slice(0, 5) : original.studentId,
      chineseName: editFormData.chineseName ?? original.chineseName,
      englishName: editFormData.englishName ?? original.englishName,
      exam1Score: Number(editFormData.exam1Score ?? original.exam1Score),
      exam2Score: Number(editFormData.exam2Score ?? original.exam2Score),
      exam3Score: Number(editFormData.exam3Score ?? original.exam3Score),
      homeworkH1Score: Number(editFormData.homeworkH1Score ?? original.homeworkH1Score),
      homeworkH2Score: Number(editFormData.homeworkH2Score ?? original.homeworkH2Score),
      quizH1Score: Number(editFormData.quizH1Score ?? original.quizH1Score),
      quizH2Score: Number(editFormData.quizH2Score ?? original.quizH2Score),
    };
    onUpdateGrade(updated);
    setEditingId(null);
  };

  // 录入新学生（5位数工号学号）
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newStudentId.replace(/\D/g, '').slice(0, 5);
    if (cleanId.length !== 5) {
      alert('学号必须为 5 位纯数字，例如：24101');
      return;
    }
    if (!newChineseName.trim() || !newEnglishName.trim()) {
      alert('请完整填写中文姓名和英文姓名');
      return;
    }

    const newG: StudentGrade = {
      id: `g_${Date.now()}`,
      studentId: cleanId,
      chineseName: newChineseName.trim(),
      englishName: newEnglishName.trim(),
      classGrade: newClassGrade,
      subjectName: getSubjectByClass(newClassGrade),
      exam1Score: 80,
      exam2Score: 80,
      exam3Score: 80,
      homeworkH1Score: 85,
      homeworkH2Score: 85,
      quizH1Score: 80,
      quizH2Score: 80,
    };

    onAddGrade(newG);
    setSelectedClass(newClassGrade);
    setShowAddModal(false);
    setNewStudentId('');
    setNewChineseName('');
    setNewEnglishName('');
  };

  // 发布新作业
  const handleCreateHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle) return;
    const newHw: HomeworkSubmission = {
      id: `hw_${Date.now()}`,
      title: newHwTitle,
      course: getSubjectByClass(newHwClass),
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newHwDue,
      targetClass: newHwClass,
      submittedCount: 0,
      totalStudents: 45,
      status: 'pending_review',
      description: newHwDesc,
    };
    onAddHomework(newHw);
    setShowAddHwModal(false);
    setNewHwTitle('');
    setNewHwDesc('');
  };

  // 图表数据
  const chartData = filteredGrades.map((g) => ({
    name: g.chineseName,
    '第1期考(20%)': g.exam1Score,
    '第2期考(20%)': g.exam2Score,
    '第3期考(30%)': g.exam3Score,
    '作业(10%)': Math.round((g.homeworkH1Score + g.homeworkH2Score) / 2),
    '小考(20%)': Math.round((g.quizH1Score + g.quizH2Score) / 2),
    '综合总分': calculateStudentTotal(g),
  }));

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* 气泡通知 Toast */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-sm text-emerald-400">操作成功</div>
            <div className="text-slate-300 mt-0.5">{notice}</div>
          </div>
        </div>
      )}

      {/* 顶部标题栏、班级下拉选择器与选项卡 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>学生成绩录入与作业管理</span>
            </h2>

            {/* 班级选择下拉菜单 */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-300 font-bold text-xs sm:text-sm px-3.5 py-1.5 pr-8 rounded-xl outline-none cursor-pointer shadow-sm transition"
              >
                <option value="all">全校全部班级 (查看汇总)</option>
                {SCHOOL_CLASS_GROUPS.map((group) => (
                  <optgroup key={group.gradeLabel} label={`▼ ${group.gradeLabel}（${group.subjectType}）`}>
                    {group.classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} - {group.subjectType}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-sky-700 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            当前班级科目：<span className="font-semibold text-slate-800">{currentSubject}</span> · 
            学号5位数字 · 中英文双语 · 支持各班级成绩单 A4 打印与另存为 PDF
          </p>
        </div>

        {/* 标签切换栏与打印按钮 */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* 各班级 A4 打印按钮（已移除不需要的下载为 PDF 档案按钮，只保留打印） */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
            title="查看当前班级 A4 标准存根并直接打印"
          >
            <Printer className="h-4 w-4 text-sky-400" />
            <span>打印班级成绩单</span>
          </button>

          {/* 导出 CSV 表格按钮 */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition active:scale-95"
            title="导出 Excel / CSV 格式表格"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>导出表格</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl overflow-x-auto shrink-0 max-w-full">
            <button
              onClick={() => setActiveSubTab('grades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeSubTab === 'grades'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              成绩花名册
            </button>
            <button
              onClick={() => setActiveSubTab('homework')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeSubTab === 'homework'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              作业批改
            </button>
            <button
              onClick={() => setActiveSubTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeSubTab === 'stats'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              成绩统计分布
            </button>
          </div>
        </div>
      </div>

      {/* 评分权重说明栏 */}
      {activeSubTab === 'grades' && (
        <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Award className="h-4 w-4 text-sky-600" />
              <span>当前成绩评分权重体系：</span>
            </span>
            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-medium">第一期考 20%</span>
            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-medium">第二期考 20%</span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">第三期考 30%</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">作业 10% (上5% / 下5%)</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">小考 20% (上10% / 下10%)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            班级：<span className="font-bold text-slate-900">{selectedClass === 'all' ? '全部班级' : selectedClass}</span> · 
            人数：<span className="font-bold text-slate-800">{filteredGrades.length}</span> 人 · 
            平均总分：<span className="font-bold text-sky-700">{classAvgScore}</span> 分
          </div>
        </div>
      )}

      {/* 子标签 1：成绩花名册 (列表不出现班级列，统一由顶部班级选择控制) */}
      {activeSubTab === 'grades' && (
        <div className="space-y-4">
          {/* 工具栏：搜索与录入 */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索5位数纯数字学号、中文或英文姓名..."
                className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={() => {
                setNewClassGrade(selectedClass === 'all' ? 'J1U1' : selectedClass);
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="h-4 w-4" />
              <span>录入新学生 ({selectedClass === 'all' ? 'J1U1' : selectedClass})</span>
            </button>
          </div>

          {/* 手机端卡片视图 (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredGrades.map((g) => {
              const isEditing = editingId === g.id;
              const totalScore = calculateStudentTotal(isEditing ? (editFormData as StudentGrade) : g);

              return (
                <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{g.chineseName}</span>
                        <span className="text-xs text-slate-500 font-medium">{g.englishName}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">学号：{g.studentId} · {g.classGrade}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      totalScore >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : totalScore >= 70
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      总分 {totalScore}
                    </span>
                  </div>

                  {/* 手机端成绩输入网格 */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">一考(20%)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.exam1Score}
                          onChange={(e) => setEditFormData({ ...editFormData, exam1Score: Number(e.target.value) })}
                          className="w-full text-center border rounded p-1 font-bold text-xs mt-0.5 bg-white"
                        />
                      ) : (
                        <div className="font-bold text-slate-800 mt-0.5">{g.exam1Score}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">二考(20%)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.exam2Score}
                          onChange={(e) => setEditFormData({ ...editFormData, exam2Score: Number(e.target.value) })}
                          className="w-full text-center border rounded p-1 font-bold text-xs mt-0.5 bg-white"
                        />
                      ) : (
                        <div className="font-bold text-slate-800 mt-0.5">{g.exam2Score}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">三考(30%)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.exam3Score}
                          onChange={(e) => setEditFormData({ ...editFormData, exam3Score: Number(e.target.value) })}
                          className="w-full text-center border rounded p-1 font-bold text-xs mt-0.5 bg-white"
                        />
                      ) : (
                        <div className="font-bold text-slate-800 mt-0.5">{g.exam3Score}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-slate-400 text-[10px]">上作业(5%)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.homeworkH1Score}
                          onChange={(e) => setEditFormData({ ...editFormData, homeworkH1Score: Number(e.target.value) })}
                          className="w-full text-center border rounded p-1 font-bold text-xs mt-0.5 bg-white"
                        />
                      ) : (
                        <div className="font-semibold text-slate-700 mt-0.5">{g.homeworkH1Score}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">下作业(5%)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.homeworkH2Score}
                          onChange={(e) => setEditFormData({ ...editFormData, homeworkH2Score: Number(e.target.value) })}
                          className="w-full text-center border rounded p-1 font-bold text-xs mt-0.5 bg-white"
                        />
                      ) : (
                        <div className="font-semibold text-slate-700 mt-0.5">{g.homeworkH2Score}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">小考(上10/下10)</div>
                      <div className="font-semibold text-slate-700 mt-0.5">{g.quizH1Score} / {g.quizH2Score}</div>
                    </div>
                  </div>

                  {/* 仅保留修改按钮 */}
                  <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(g.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>保存成绩</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(g)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>修改</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 桌面端与平板端完整表格 (>= 640px) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-3.5 text-center font-mono">学号</th>
                    <th className="py-3 px-4">姓名 (中文 / 英文)</th>
                    <th className="py-3 px-2 text-center bg-sky-50/50">第一期考<br /><span className="text-[10px] font-normal text-sky-800">20%</span></th>
                    <th className="py-3 px-2 text-center bg-sky-50/50">第二期考<br /><span className="text-[10px] font-normal text-sky-800">20%</span></th>
                    <th className="py-3 px-2 text-center bg-indigo-50/50">第三期考<br /><span className="text-[10px] font-normal text-indigo-800">30%</span></th>
                    <th className="py-3 px-2 text-center bg-amber-50/40">上半年作业<br /><span className="text-[10px] font-normal text-amber-800">5%</span></th>
                    <th className="py-3 px-2 text-center bg-amber-50/40">下半年作业<br /><span className="text-[10px] font-normal text-amber-800">5%</span></th>
                    <th className="py-3 px-2 text-center bg-emerald-50/40">上半年小考<br /><span className="text-[10px] font-normal text-emerald-800">10%</span></th>
                    <th className="py-3 px-2 text-center bg-emerald-50/40">下半年小考<br /><span className="text-[10px] font-normal text-emerald-800">10%</span></th>
                    <th className="py-3 px-3 text-center font-bold text-sky-900 bg-sky-100/60">综合总分</th>
                    <th className="py-3 px-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.map((g) => {
                    const isEditing = editingId === g.id;
                    const totalScore = calculateStudentTotal(isEditing ? (editFormData as StudentGrade) : g);

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/70 transition">
                        {/* 5位纯数字学号 */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              maxLength={5}
                              value={editFormData.studentId}
                              onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                              className="w-16 p-1 border rounded text-center text-xs font-mono font-bold"
                            />
                          ) : (
                            g.studentId
                          )}
                        </td>

                        {/* 中文与英文姓名 */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editFormData.chineseName}
                                onChange={(e) => setEditFormData({ ...editFormData, chineseName: e.target.value })}
                                placeholder="中文姓名"
                                className="w-24 p-1 border rounded text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={editFormData.englishName}
                                onChange={(e) => setEditFormData({ ...editFormData, englishName: e.target.value })}
                                placeholder="英文姓名"
                                className="w-28 p-1 border rounded text-xs block"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-900 text-sm leading-tight">{g.chineseName}</div>
                              <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{g.englishName}</div>
                            </div>
                          )}
                        </td>

                        {/* 第一期考 20% */}
                        <td className="py-3 px-2 text-center bg-sky-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.exam1Score}
                              onChange={(e) => setEditFormData({ ...editFormData, exam1Score: Number(e.target.value) })}
                              className="w-14 p-1 border rounded text-center text-xs font-bold"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800">{g.exam1Score}</span>
                          )}
                        </td>

                        {/* 第二期考 20% */}
                        <td className="py-3 px-2 text-center bg-sky-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.exam2Score}
                              onChange={(e) => setEditFormData({ ...editFormData, exam2Score: Number(e.target.value) })}
                              className="w-14 p-1 border rounded text-center text-xs font-bold"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800">{g.exam2Score}</span>
                          )}
                        </td>

                        {/* 第三期考 30% */}
                        <td className="py-3 px-2 text-center bg-indigo-50/20 font-bold text-indigo-950">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.exam3Score}
                              onChange={(e) => setEditFormData({ ...editFormData, exam3Score: Number(e.target.value) })}
                              className="w-14 p-1 border rounded text-center text-xs font-bold"
                            />
                          ) : (
                            g.exam3Score
                          )}
                        </td>

                        {/* 上半年作业 5% */}
                        <td className="py-3 px-2 text-center bg-amber-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.homeworkH1Score}
                              onChange={(e) => setEditFormData({ ...editFormData, homeworkH1Score: Number(e.target.value) })}
                              className="w-12 p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            <span className="text-slate-700">{g.homeworkH1Score}</span>
                          )}
                        </td>

                        {/* 下半年作业 5% */}
                        <td className="py-3 px-2 text-center bg-amber-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.homeworkH2Score}
                              onChange={(e) => setEditFormData({ ...editFormData, homeworkH2Score: Number(e.target.value) })}
                              className="w-12 p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            <span className="text-slate-700">{g.homeworkH2Score}</span>
                          )}
                        </td>

                        {/* 上半年小考 10% */}
                        <td className="py-3 px-2 text-center bg-emerald-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.quizH1Score}
                              onChange={(e) => setEditFormData({ ...editFormData, quizH1Score: Number(e.target.value) })}
                              className="w-12 p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            <span className="text-slate-700">{g.quizH1Score}</span>
                          )}
                        </td>

                        {/* 下半年小考 10% */}
                        <td className="py-3 px-2 text-center bg-emerald-50/20">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editFormData.quizH2Score}
                              onChange={(e) => setEditFormData({ ...editFormData, quizH2Score: Number(e.target.value) })}
                              className="w-12 p-1 border rounded text-center text-xs"
                            />
                          ) : (
                            <span className="text-slate-700">{g.quizH2Score}</span>
                          )}
                        </td>

                        {/* 综合总分自动计算 */}
                        <td className="py-3 px-3 text-center bg-sky-100/40">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-block ${
                            totalScore >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : totalScore >= 70
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {totalScore}
                          </span>
                        </td>

                        {/* 操作栏：只保留修改/保存按钮 */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(g.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-[11px] shadow-sm inline-flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>保存</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(g)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 transition"
                            >
                              <Edit3 className="h-3 w-3 text-slate-500" />
                              <span>修改</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredGrades.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              当前班级「{selectedClass}」暂无学生记录，请点击上方按钮录入。
            </div>
          )}
        </div>
      )}

      {/* 子标签 2：作业批改列表 */}
      {activeSubTab === 'homework' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">班级作业进度与提交名册</h3>
            <button
              onClick={() => setShowAddHwModal(true)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>发布作业</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {homeworkList.map((hw) => {
              const submissionRate = Math.round((hw.submittedCount / hw.totalStudents) * 100);

              return (
                <div key={hw.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono">
                        {hw.targetClass} · {hw.course}
                      </span>
                      <span className={`text-[11px] font-medium ${
                        hw.status === 'graded' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {hw.status === 'graded' ? '已全数批改' : '批阅中'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">{hw.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{hw.description}</p>

                    {/* 进度条 */}
                    <div className="space-y-1 my-3">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>提交进度</span>
                        <span className="font-bold font-mono">{hw.submittedCount} / {hw.totalStudents} ({submissionRate}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">截止：{hw.dueDate}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownloadHomeworkList(hw)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs flex items-center gap-1 transition"
                        title="下载此项作业提交批改总表到电脑"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>下载名单</span>
                      </button>
                      <button
                        onClick={() => alert(`已开启「${hw.title}」学生代码线上批阅面板`)}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>查看提交</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 子标签 3：统计图表 */}
      {activeSubTab === 'stats' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span>【{selectedClass === 'all' ? '全校全部班级' : selectedClass}】各项评分构成分析图</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                包含一考(20%)、二考(20%)、三考(30%)、作业(10%)与小考(20%)之成绩对比
              </p>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="第1期考(20%)" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="第2期考(20%)" fill="#0284c7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="第3期考(30%)" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="作业(10%)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="小考(20%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="综合总分" fill="#ec4899" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* A4 格式导出预览与打印模态框（仅保留打印功能） */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">班级成绩单 A4 格式打印存根</h3>
                  <p className="text-xs text-slate-400">点击「立即打印 / 另存为 PDF」可调出打印机或直接另存为 PDF 档案</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* 调起打印按钮 */}
                <button
                  onClick={handlePrintCleanA4}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition active:scale-95"
                  title="调起打印机对话框或另存为 PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span>立即打印 / 另存为 PDF</span>
                </button>

                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* A4 模拟纸张区域 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-xl border border-slate-300 w-full max-w-3xl p-6 sm:p-10 font-sans text-slate-900 min-h-[700px]">
                {/* 抬头 */}
                <div className="text-center pb-4 border-b-2 border-slate-800">
                  <h1 className="text-xl font-bold tracking-wider">日新独立中学 · 资讯处 / 电脑科</h1>
                  <h2 className="text-base font-semibold text-slate-700 mt-1">
                    {selectedClass} 学生学科成绩总评汇总表 (A4 标准存根)
                  </h2>
                  <div className="flex justify-between items-center text-xs text-slate-600 mt-3 font-mono">
                    <span>学科名称：{currentSubject}</span>
                    <span>责任教职员：黄世泓 / 林慈贤 (IT老师/资讯处助理)</span>
                    <span>生成日期：{new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                {/* 权重标注 */}
                <div className="py-2.5 text-[11px] text-slate-600 border-b border-slate-200 flex justify-between">
                  <span>评分规则：第一期考(20%) + 第二期考(20%) + 第三期考(30%) + 上半年作业(5%) + 下半年作业(5%) + 上半年小考(10%) + 下半年小考(10%) = 100%</span>
                  <span className="font-bold">班级人数: {filteredGrades.length}人</span>
                </div>

                {/* 表格 */}
                <table className="w-full text-left text-xs mt-4 border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-semibold text-slate-800">
                    <tr className="border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center">学号</th>
                      <th className="p-2 border-r border-slate-300">中文姓名</th>
                      <th className="p-2 border-r border-slate-300">英文姓名</th>
                      <th className="p-2 border-r border-slate-300 text-center">一考 (20%)</th>
                      <th className="p-2 border-r border-slate-300 text-center">二考 (20%)</th>
                      <th className="p-2 border-r border-slate-300 text-center">三考 (30%)</th>
                      <th className="p-2 border-r border-slate-300 text-center">作业 (10%)</th>
                      <th className="p-2 border-r border-slate-300 text-center">小考 (20%)</th>
                      <th className="p-2 text-center font-bold bg-slate-200">总分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((g, idx) => {
                      const total = calculateStudentTotal(g);
                      return (
                        <tr key={g.id} className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{g.studentId}</td>
                          <td className="p-2 border-r border-slate-200 font-bold">{g.chineseName}</td>
                          <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{g.englishName}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{g.exam1Score}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{g.exam2Score}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-semibold">{g.exam3Score}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{Math.round((g.homeworkH1Score + g.homeworkH2Score) / 2)}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{Math.round((g.quizH1Score + g.quizH2Score) / 2)}</td>
                          <td className="p-2 text-center font-bold bg-slate-100">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* 签名栏 */}
                <div className="grid grid-cols-3 gap-6 pt-12 mt-8 text-xs text-slate-700">
                  <div className="border-t border-slate-400 pt-2 text-center">
                    <div>任课教师签名</div>
                    <div className="text-slate-400 text-[10px] mt-1">黄世泓 / 林慈贤</div>
                  </div>
                  <div className="border-t border-slate-400 pt-2 text-center">
                    <div>资讯处审核盖章</div>
                    <div className="text-slate-400 text-[10px] mt-1">资讯处 / 电脑科</div>
                  </div>
                  <div className="border-t border-slate-400 pt-2 text-center">
                    <div>教务处核准</div>
                    <div className="text-slate-400 text-[10px] mt-1">教务科研处</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模态框：录入新学生 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">录入学生学籍资料</h3>
            <p className="text-xs text-slate-500 mb-4">学号为 5 位纯数字，并填写规范的中英文双语姓名</p>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  学号 <span className="text-sky-600 font-normal">(必须为 5 位纯数字)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value.replace(/\D/g, ''))}
                  placeholder="例如: 24106"
                  className="w-full text-xs sm:text-sm font-mono p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">中文姓名</label>
                  <input
                    type="text"
                    required
                    value={newChineseName}
                    onChange={(e) => setNewChineseName(e.target.value)}
                    placeholder="例如: 林家成"
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">英文姓名</label>
                  <input
                    type="text"
                    required
                    value={newEnglishName}
                    onChange={(e) => setNewEnglishName(e.target.value)}
                    placeholder="例如: Lim Jia Cheng"
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">所在班级</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white font-medium"
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
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm"
                >
                  确认保存入库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框：发布作业 */}
      {showAddHwModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">发布信息学科新作业与题目要求</h3>
            <form onSubmit={handleCreateHw} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">作业标题</label>
                <input
                  type="text"
                  required
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  placeholder="例如: 条件分支趣味猜数游戏"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">班级所属科目</label>
                  <input
                    type="text"
                    disabled
                    value={getSubjectByClass(newHwClass)}
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-lg bg-slate-100 text-slate-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">提交截止日期</label>
                  <input
                    type="date"
                    value={newHwDue}
                    onChange={(e) => setNewHwDue(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">对象班级</label>
                <select
                  value={newHwClass}
                  onChange={(e) => setNewHwClass(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg outline-none bg-white font-medium"
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
                <label className="block text-xs font-medium text-slate-600 mb-1">作业说明与要求</label>
                <textarea
                  rows={3}
                  value={newHwDesc}
                  onChange={(e) => setNewHwDesc(e.target.value)}
                  placeholder="说明上机测试点、提交格式等..."
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHwModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm"
                >
                  确认发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
