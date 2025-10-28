
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import type { InventoryItem, Supplier, Branch } from '../types';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface ChatbotProps {
    inventoryData: InventoryItem[];
    suppliers: Supplier[];
    branches: Branch[];
}

const Chatbot: React.FC<ChatbotProps> = ({ inventoryData, suppliers, branches }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm Invo, your AI inventory assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(userInput, inventoryData, suppliers, branches);
      setMessages([...newMessages, { sender: 'ai', text: response }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const UserMessage: React.FC<{text: string}> = ({text}) => (
    <div className="flex justify-end">
        <div className="bg-blue-500 text-white rounded-lg rounded-br-none py-2 px-3 max-w-xs break-words">
            {text}
        </div>
    </div>
  );

  const AiMessage: React.FC<{text: React.ReactNode}> = ({text}) => (
    <div className="flex">
        <div className="bg-white/20 text-gray-100 rounded-lg rounded-bl-none py-2 px-3 max-w-xs break-words">
            {text}
        </div>
    </div>
  );
  
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce"></div>
    </div>
  );


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500/50 backdrop-blur-lg border border-white/30 text-white rounded-full p-4 shadow-lg hover:bg-blue-500/80 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-transform transform hover:scale-110 z-20"
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.2323 12.0001L14.2324 11.9999L14.2324 11.9999C14.1565 11.4363 13.921 10.9123 13.5654 10.4939C13.2098 10.0754 12.7547 9.78216 12.2514 9.65482V6.5C12.2514 6.22386 12.0275 6 11.7514 6C11.4752 6 11.2514 6.22386 11.2514 6.5V9.65482C10.7481 9.78216 10.2929 10.0754 9.93739 10.4939C9.58182 10.9123 9.34636 11.4363 9.27041 11.9999L9.27038 12.0001L9.27038 12.0001C8.79026 12.0001 8.35139 12.1835 8.0189 12.5029C7.68641 12.8223 7.5 13.2435 7.5 13.6876V15.7501C7.5 16.1942 7.68641 16.6154 8.0189 16.9348C8.35139 17.2542 8.79026 17.4376 9.27038 17.4376H14.2323C14.7125 17.4376 15.1513 17.2542 15.4838 16.9348C15.8163 16.6154 16.0027 16.1942 16.0027 15.7501V13.6876C16.0027 13.2435 15.8163 12.8223 15.4838 12.5029C15.1513 12.1835 14.7125 12.0001 14.2323 12.0001Z" />
          <path d="M4.5 9.75C4.5 8.36929 5.61929 7.25 7 7.25C8.38071 7.25 9.5 8.36929 9.5 9.75V11.137C9.33614 11.1091 9.17025 11.0951 9.00416 11.0951C8.11953 11.0951 7.29177 11.4284 6.69708 11.9999L6.69715 12L6.69715 12.0001C6.11542 12.0001 5.58434 12.2195 5.21312 12.5907C4.8419 12.9619 4.62256 13.493 4.62256 14.0747V15.9254C4.62256 16.5071 4.8419 17.0382 5.21312 17.4094C5.58434 17.7806 6.11542 18.0001 6.69715 18.0001H7.12752C7.30607 18.5292 7.6033 19.0016 7.99304 19.3789C7.4566 19.4582 6.92429 19.5 6.39861 19.5C4.19519 19.5 2.37861 17.7165 2.37861 15.5V14.25C2.37861 12.0335 4.19519 10.25 6.39861 10.25C6.59858 10.25 6.79717 10.2644 6.99304 10.2925V9.75Z" />
          <path d="M19.5 9.75V10.2925C19.7028 10.2644 19.9014 10.25 20.1014 10.25C22.3048 10.25 24.1214 12.0335 24.1214 14.25V15.5C24.1214 17.7165 22.3048 19.5 20.1014 19.5C19.5757 19.5 19.0434 19.4582 18.507 19.3789C18.8967 19.0016 19.1939 18.5292 19.3725 18.0001H19.8028C20.3846 18.0001 20.9157 17.7806 21.2869 17.4094C21.6581 17.0382 21.8774 16.5071 21.8774 15.9254V14.0747C21.8774 13.493 21.6581 12.9619 21.2869 12.5907C20.9157 12.2195 20.3846 12.0001 19.8028 12.0001L19.8029 12L19.8029 11.9999C19.2082 11.4284 18.3805 11.0951 17.4958 11.0951C17.3297 11.0951 17.1638 11.1091 17.0000 11.137V9.75C17.0000 8.36929 18.1193 7.25 19.5000 7.25C20.8807 7.25 22.0000 8.36929 22.0000 9.75" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] sm:w-full sm:max-w-sm h-[600px] z-50">
        <div className="bg-black/20 backdrop-blur-xl rounded-xl shadow-2xl flex flex-col h-full border border-white/20">
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/10 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-100">AI Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white" aria-label="Close chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => 
                    msg.sender === 'user' ? <UserMessage key={index} text={msg.text} /> : <AiMessage key={index} text={msg.text} />
                )}
                {isLoading && <AiMessage text={<TypingIndicator />} />}
                <div ref={messagesEndRef} />
            </div>
            {/* Input Form */}
            <div className="p-4 border-t border-white/20 bg-white/10 rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask about inventory..."
                        className="w-full px-4 py-2 bg-transparent text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400"
                        aria-label="Chat input"
                    />
                    <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold p-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 disabled:bg-blue-300/50" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default Chatbot;