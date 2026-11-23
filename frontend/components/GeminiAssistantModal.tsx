import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
} from 'lucide-react';
import { UserRole } from '../types';
import { askGeminiAssistant } from '../services/geminiService';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  time: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  role,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'gemini',
          text: role === 'it_teacher'
            ? `您好！我是您的信息科技教研 AI 助手 🤖。\n我可以协助您：\n• 智能分析班级教学进度并提供重难点突破策略\n• 设计信息科技期中期末考试题与标准答案\n• 撰写期末学生个性化综合评语\n• 设计 45 分钟微机课完整教案与互动练习\n• 编程作业代码逻辑批改与排错诊断\n请问今天有什么我可以协助您的？`
            : `您好！我是您的校园网络与信息系统管理员 AI 助手 🛡️。\n我可以协助您：\n• 校园网络故障诊断（DHCP、VLAN、无线 AP、交换机）\n• 机房电教设备日常巡检 SOP 与备份策略规划\n• 起草信息化采购需求、设备借用及安全停网通告\n• 计算机机房网络同传镜像分发与批量还原建议\n请描述您目前遇到的网络或电教设备状况！`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [role]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const responseText = await askGeminiAssistant(text, role);
      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'gemini',
        text: responseText,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'gemini',
        text: '通信失败，请检查网络连接或 API Key 状态。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickSnippets = role === 'it_teacher' ? [
    '设计 5 道高中 Python 循环选择题附详解',
    '为进步明显的后进生写 80 字期末评语',
    '如何帮助初一学生理解双重嵌套循环？',
  ] : [
    '机房电脑能连网关但无法访问外网排查步骤',
    '学校微机室暑假深度保养检修计划书',
    '核心交换机固件夜间升级停机通知',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[92vh] sm:h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate">Gemini 智能教务与 IT 对话</h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 font-semibold px-1.5 py-0.2 rounded-full border border-sky-400/30 whitespace-nowrap">
                  {role === 'it_teacher' ? '教师' : '网管'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                由 Google Gemini 2.5 Flash 驱动
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 快捷提问药丸按钮 */}
        <div className="px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 scrollbar-none">
          <span className="text-slate-400 shrink-0 text-[11px]">快捷：</span>
          {quickSnippets.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-600 text-slate-600 transition text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* 消息对话主体 */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-sky-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 text-xs leading-relaxed relative group ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`mt-1.5 text-[10px] flex items-center justify-between gap-2 ${
                      isUser ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.time}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition hover:text-slate-600 flex items-center gap-1"
                        title="复制内容"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === m.id ? '已复制' : '复制'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-spin" />
                <span>Gemini 正在推演与组织内容...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入栏 */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入消息，与 Gemini 探讨教学进度、备课出题或机房排障..."
              className="flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">发送</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
