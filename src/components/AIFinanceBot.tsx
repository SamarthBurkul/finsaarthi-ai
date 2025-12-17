import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const AIFinanceBot: React.FC = () => {

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm FinSaarthi AI, your smart finance buddy! 💰 Ask me anything about budgeting, investments, loans, or financial planning!",
      sender: "bot",
      timestamp: new Date(),
    },

  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    const content = inputMessage.trim();
    if (!content || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {

      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Perplexity standard Sonar chat model
            model: "sonar",
            messages: [
              {
                role: "system",
                content:
                  "You are FinSaarthi AI, a friendly Indian financial advisor. Give clear, practical advice on budgeting, investing, loans, credit score, and savings. Keep answers under 150 words and stay on finance topics.",
              },
              { role: "user", content },
            ],
            max_tokens: 250,
            temperature: 0.7,
          }),
        }
      );

      console.log("Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Perplexity error body:", errorBody);
        throw new Error(`API error ${response.status}`);
      }



      const data = await response.json();
      const botText =
        data.choices?.[0]?.message?.content ??
        "I'm here to help with your financial questions! Could you please rephrase that? 💡";


      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {

      console.error("Perplexity fetch failed:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to my brain right now 😅. Please check your internet or API key and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [

    "How should I divide my salary between needs, wants, and savings?",
    "Create a simple monthly budget for a college student in India.",
    "Is it better to repay loans first or start investing?",
    "How much emergency fund should I keep?",
    "Best way to start investing with ₹5000 per month?",
  ];

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            FinSaarthi{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter">
            Your 24/7 AI-powered financial advisor. Ask anything about money,
            investments, and financial planning!
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Chat Interface */}
            <div className="bg-charcoal-gray rounded-2xl border border-slate-gray/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">FinSaarthi AI</h3>
                    <p className="text-cyan-100 text-sm">
                      Your Smart Finance Buddy
                    </p>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white text-xs">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesEndRef}
                className="h-96 overflow-y-auto p-4 space-y-4 bg-jet-black"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs ${
                        message.sender === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === "user"
                            ? "bg-blue-500"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-3 ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-charcoal-gray text-soft-white border border-slate-gray/20"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-blue-100"
                              : "text-slate-gray"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-charcoal-gray text-soft-white rounded-2xl p-3 border border-slate-gray/20">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick questions */}
              <div className="p-4 border-t border-slate-gray/20">
                <p className="text-slate-gray text-sm mb-3">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInputMessage(q)}
                      className="text-xs bg-charcoal-gray text-cyan-400 px-3 py-1 rounded-full hover:bg-slate-gray/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-gray/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me about budgeting, investments, loans..."
                    className="flex-1 bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right-side image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative -mt-16">
                <img
                  src="/airobot.jpg"
                  alt="FinSaarthi AI Assistant"
                  className="w-[600px] h-[600px] object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFinanceBot;
