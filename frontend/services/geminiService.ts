import { GoogleGenAI } from '@google/genai';

// Initialize the GoogleGenAI client with the environment API key and vertexai set to true
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY || '',
  vertexai: true,
});

/**
 * 向 Gemini 助手发起咨询（服务于信息技术教学备课、成绩评价、教学进度设计及机房运维）
 */
export async function askGeminiAssistant(
  prompt: string,
  contextRole: 'it_teacher' | 'it_admin' = 'it_teacher'
): Promise<string> {
  const systemInstruction = contextRole === 'it_teacher'
    ? `你是一位专为中小学与高中信息科技（IT）教师服务的资深教研员与教学 AI 助手。
你的主要职责包括：
1. 辅助分析智能教学进度、为薄弱班级提供教学重难点突破建议与后进生辅导方案。
2. 快速生成学生编程作业批改评语、期末综合素养评语。
3. 协助设计中学生信息科技课期中期末试卷题目、配套详解、备课课件 PPT 详细大纲。
4. 使用规范、严谨、生动、排版优雅的简体中文回答，善用分点与 Markdown 格式。`
    : `你是一位资深的校园网络与信息系统管理员（School IT Admin）专家 AI 助手。
你的主要职责包括：
1. 校园网络故障排查（VLAN 划分、DHCP 故障、无线 AP 漫游、交换机防环路等）。
2. 计算机教室批量运维、镜像网络同传还原、智慧黑板与电教设备故障排查。
3. 撰写清晰正规的维保工单回执、网络停机公告、信息化采购需求说明与安全应急预案。
4. 使用通俗严谨、条理清晰的简体中文回答。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || '（AI 暂无返回内容）';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return `抱歉，在与 Gemini 智能引擎通信时发生异常：${error?.message || '未知错误'}。请确认 API Key 配置与网络连接状态。`;
  }
}

/**
 * 智能生成教学进度分析与下阶段授课提升策略
 */
export async function generateTeachingProgressAdvice(
  courseName: string,
  className: string,
  unitName: string,
  masteryRate: number,
  keyConcepts: string[],
  reflection: string
): Promise<string> {
  const prompt = `课程名称：${courseName}
授课班级：${className}
当前教学单元：${unitName}
全班核心重难点掌握度预估：${masteryRate}%
单元核心知识点：${keyConcepts.join('、')}
教师课后手记反思：${reflection}

请根据中学信息技术新课标要求，从“重难点针对性强化手段”、“分层异步教学分流”、“下节课课堂 5 分钟速测题目（2道）”三个维度，提供精准、可落地的智能教学优化建议（约 200-300 字，简练专业）。`;

  return askGeminiAssistant(prompt, 'it_teacher');
}

/**
 * AI 快捷动作：起草规范校园电教与网络通知公告
 */
export async function generateAnnouncementDraft(topic: string, details: string): Promise<{ title: string; content: string }> {
  const prompt = `请以学校信息中心或 IT 教研组身份，为以下主题拟定一份正式、友善的校园通知：
通知主题：${topic}
核心要求及细节：${details}

请以纯 JSON 格式返回，包含两个字段：
- "title": 公告标题（包含合适的前缀如【重要通知】或【维护提示】）
- "content": 详细正文（包括原由、影响范围、应对说明、技术咨询方式）
只输出标准 JSON，不要包裹其他说明文字。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      title: parsed.title || `【通知】${topic}`,
      content: parsed.content || details
    };
  } catch (e) {
    return {
      title: `【校园通知】${topic}`,
      content: `${details}\n\n如有任何疑问，请随时联系现代教育技术中心。`
    };
  }
}
