'use client';
import { FiPlus, FiChevronLeft, FiClock } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface SidebarProps {
  isOpen: boolean;
  isMinimized: boolean;
  toggleMinimize: () => void;
  closeSidebar: () => void;
  onNewChat: () => void;
  conversations: Array<{
    id: string;
    title: string;
    updated_at?: string;
  }>;
  onSelectConversation: (id: string) => void;
  activeConversationId: string | null;
  loadingConversations: boolean;
}

export default function Sidebar({
  isOpen,
  isMinimized,
  toggleMinimize,
  closeSidebar,
  onNewChat,
  conversations,
  onSelectConversation,
  activeConversationId,
  loadingConversations
}: SidebarProps) {
  const handleNewChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNewChat();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={closeSidebar} />
      )}

      <aside className={`flex flex-col justify-between h-screen overflow-y-auto fixed z-40 md:relative bg-gray-50 border-r border-gray-200 p-4 transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isMinimized ? 'w-18' : 'w-64 md:w-72'}`}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-3 ${isMinimized ? 'justify-center' : ''}`}>
              <div className="p-2 bg-blue-600 rounded-full text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-6.5S17 4.5 17 4.5s-1 1.5-1.5 3.5c-1.5 6 4.5 6 4.5 6s-1.5-3-1.343-4.343z" />
                </svg>
              </div>
              {!isMinimized && <h1 className="text-xl font-bold text-gray-900 hidden sm:block">AI Assistant</h1>}
            </div>
            <button onClick={toggleMinimize} className="md:inline-block hidden text-gray-900 hover:text-gray-800 mr-2 cursor-pointer">
              <FiChevronLeft className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {!isMinimized && (
            <>
              <button onClick={handleNewChatClick} className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-colors cursor-pointer w-full mb-4">
                <FiPlus className="w-5 h-5" />
                <span>New Chat</span>
              </button>

              <nav className="mt-2 space-y-1 max-h-[60vh] overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex justify-center py-4">
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No conversations yet</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        closeSidebar();
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-md hover:bg-blue-100 transition-colors cursor-pointer truncate ${
                        activeConversationId === conv.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-700'
                      }`}
                    >
                      <div className="font-medium truncate">{conv.title}</div>
                      {conv.updated_at && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <FiClock className="mr-1" />
                          {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </nav>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-1">
          {!isMinimized && (
            <>
              <a href="#" onClick={closeSidebar} className="block px-4 py-2.5 rounded-md text-gray-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer">Upgrade Plan</a>
              <a href="#" onClick={closeSidebar} className="block px-4 py-2.5 rounded-md text-gray-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer">Settings</a>
            </>
          )}
          <div className="flex justify-center items-center pt-4">
            <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold cursor-pointer">N</div>
          </div>
        </div>
      </aside>
    </>
  );
}