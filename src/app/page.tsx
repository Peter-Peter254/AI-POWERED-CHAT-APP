'use client';
import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiEdit, FiArrowUpRight, FiCode, FiMail, FiSend, FiCopy  } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Sidebar from './components/Sidebar';
import { Dialog } from '@headlessui/react';
import { ToolCard } from './components/ToolCard';
import { apiService } from '@/services/api/service';


const ToolsGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ToolCard icon={FiEdit} label="Brainstorm ideas" color="blue" />
      <ToolCard icon={FiArrowUpRight} label="Summarize a text" color="green" />
      <ToolCard icon={FiCode} label="Write code" color="purple" />
      <ToolCard icon={FiMail} label="Draft an email" color="orange" />
    </div>
  );
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [confirmNewChat, setConfirmNewChat] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    title: string;
    updated_at?: string;
  }>>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations(); 
  }, []);

  const fetchConversations = async () => {
  setLoadingConversations(true);
  try {
    const data = await apiService.fetchConversations();
    setConversations(data);
  } catch (error) {
    console.error('Failed to load conversations:', error);
  } finally {
    setLoadingConversations(false);
  }
};

const loadConversation = async (id: string) => {
  try {
    const messages = await apiService.loadConversation(id);
    setMessages(messages);
    setActiveConversationId(id);
    setShowIntro(false);
  } catch (error) {
    console.error('Failed to load conversation:', error);
  }
};

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage: Message = { role: 'user', content: input.trim() };
  const updatedMessages = [...messages, userMessage];
  setMessages([...updatedMessages, { role: 'assistant', content: 'Thinking...' }]);
  setInput('');
  setLoading(true);
  setShowIntro(false);

  try {
    const data = await apiService.sendChatMessage(updatedMessages, activeConversationId);
    const botMessage: Message = { role: 'assistant', content: data.response };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);

    const conversations = await apiService.fetchConversations();
    setConversations(conversations);
    setActiveConversationId(data.conversation_id);
  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: 'assistant', content: 'Failed to send message. Please try again.' },
    ]);
  } finally {
    setLoading(false);
  }
};

  const startNewChat = () => {
    if (messages.length > 0) {
      setConfirmNewChat(true);
    } else {
      clearChat();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setShowIntro(true);
    setConfirmNewChat(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <div className="relative group">
      <ReactMarkdown
        children={content}
        components={{
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && content !== 'Thinking...') {
              return (
                <div className="relative bg-gray-900 rounded-md overflow-hidden mb-2">
                  <button
                    className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    onClick={() => handleCopy(String(children).trim())}
                  >
                    <FiCopy className="inline mr-1" /> Copy
                  </button>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match?.[1] || 'text'}
                    PreTag="div"
                    customStyle={{ padding: '1rem', fontSize: '0.85rem' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            } else if (content === 'Thinking...') {
              return (
                <div className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              );
            }
            return <code className="bg-gray-200 px-1 rounded text-sm">{children}</code>;
          },
        }}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen overflow-x-hidden font-sans bg-white relative">
      <Sidebar
        isOpen={sidebarOpen}
        isMinimized={sidebarMinimized}
        toggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        closeSidebar={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        conversations={conversations}
        onSelectConversation={loadConversation}
        activeConversationId={activeConversationId}
        loadingConversations={loadingConversations}
      />

      <main className="flex-1 flex flex-col p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden fixed top-4 left-4 z-50 text-gray-700 cursor-pointer"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {showIntro && (
          <div className="max-w-[72rem] w-full mx-auto text-center mt-5">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
              <ToolsGrid/>
          </div>
        )}

        <div className="flex-1 w-full max-w-[72rem] mx-auto mt-10 bg-gray-50 rounded-xl p-4">
          <div className="max-h-[65vh] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-md whitespace-pre-wrap text-left text-sm mb-2 ${msg.role === 'user'
                    ? 'text-blue-800 self-end text-right'
                    : 'bg-gray-100 text-gray-900 self-start'
                  }`}
              >
                <MarkdownRenderer content={msg.content} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="w-full max-w-[72rem] mx-auto pt-6">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 pl-5 pr-14 py-4 text-base bg-gray-50 border border-gray-500 text-gray-900 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Dialog
          open={confirmNewChat}
          onClose={() => setConfirmNewChat(false)}
          className="fixed inset-0 z-[60]"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a new chat?</h3>
              <p className="text-sm text-gray-600 mb-4">Conversion are not Permanently Saved</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmNewChat(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={clearChat}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Yes, Start New
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
}