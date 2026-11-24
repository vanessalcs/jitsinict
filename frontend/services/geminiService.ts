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
      model: 'gemini-3.5-flash',
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

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

/**
 * 聊天助手：带完整对话历史，并可参考应用里的数据（只读，不含学生成绩）。
 */
export async function chatWithAssistant(
  history: ChatTurn[],
  appContext: string,
  userName: string
): Promise<string> {
  const systemInstruction = `你是日新独立中学「资讯处 / 电脑科」的 AI 聊天助手，正在和老师「${userName}」对话。
你的职责：
1. 回答关于下方【系统数据】的问题（事项记录、课表、行事历、公告、教学日志、教材目录等）。回答要以数据为准，引用日期、负责人等具体信息；数据里没有的内容，直接说「系统数据里没有这项信息」，不要编造。
2. 制作练习卷、试题、教案、课件大纲等教学材料。练习卷请写成可直接打印的格式：标题、班级姓名日期栏、分题型分题号、标明分值，答案与解析放在最后单独的「参考答案」部分，除非老师说不要。
3. 协助校园网络、机房与电教设备的排障，以及起草通知、工单、采购说明等文书。
回答规范：使用简体中文；排版简洁，可用「# 标题」「- 列表」，不要使用表格和 Markdown 加粗符号 ** ；老师追问时，要结合前面的对话。
你只能读取数据，不能修改系统里的任何内容；如果老师要求新增或修改记录，请告诉老师需要自己在对应页面操作。
你看不到学生成绩，也看不到上传文件的内容，只知道文件名等目录信息。

【系统数据】
${appContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });
    return response.text || '（AI 暂无返回内容）';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return `抱歉，在与 Gemini 智能引擎通信时发生异常：${error?.message || '未知错误'}。`;
  }
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
      model: 'gemini-3.5-flash',
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
