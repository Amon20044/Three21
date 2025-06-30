import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';

export function Three21Bot({ 
    isOpen, 
    onClose, 
    modelInfo, 
    selectedPart, 
    onScreenshot 
}) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [screenshot, setScreenshot] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Initial greeting when bot opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = {
                role: 'assistant',
                content: `# 🤖 Three21Bot - Your 3D Model Analysis Assistant

Welcome! I'm here to help you understand and reverse engineer your 3D model.

${modelInfo ? `## Current Model: **${modelInfo.filename || 'Unnamed Model'}**
${modelInfo.description ? `*${modelInfo.description}*` : ''}

` : ''}**What I can help you with:**
- 🔍 **Analyze model components** and their functions
- ⚙️ **Explain assembly mechanisms** and how parts connect
- 🛠️ **Reverse engineering insights** and methodologies  
- 📐 **Material and manufacturing** analysis
- 🎯 **Part-specific information** when you click on components

**Quick Actions:**
- 📷 Take a screenshot for visual analysis
- 🗣️ Ask me about specific parts or the overall design
- 🔧 Get reverse engineering tips

What would you like to explore first?`,
                timestamp: Date.now()
            };
            setMessages([greeting]);
        }
    }, [isOpen, modelInfo]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const captureScreenshot = async () => {
        try {
            if (onScreenshot) {
                const screenshotData = await onScreenshot();
                setScreenshot(screenshotData);
                return screenshotData;
            }
            return null;
        } catch (error) {
            console.error('Screenshot failed:', error);
            return null;
        }
    };

    const sendMessage = async (messageText, includeScreenshot = false) => {
        if (!messageText.trim() && !includeScreenshot) return;

        setIsLoading(true);
        
        let screenshotData = screenshot;
        if (includeScreenshot && !screenshotData) {
            screenshotData = await captureScreenshot();
        }

        const userMessage = {
            role: 'user',
            content: messageText || 'Analyze this screenshot of the model',
            timestamp: Date.now(),
            hasScreenshot: !!screenshotData
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputMessage('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    modelInfo,
                    selectedPart,
                    screenshot: screenshotData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.content,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
            
            // Clear screenshot after use
            if (screenshotData) {
                setScreenshot(null);
            }

        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: `❌ **Error**: ${error.message}\n\nPlease try again or rephrase your question.`,
                timestamp: Date.now(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputMessage);
    };

    const handleScreenshotAnalysis = async () => {
        await sendMessage('', true);
    };

    if (!isOpen) return null;

    return (
        <div className="three21-bot-overlay">
            <div className="three21-bot-container" ref={chatContainerRef}>
                {/* Header */}
                <div className="three21-bot-header">
                    <div className="header-content">
                        <div className="bot-avatar">
                            <span>🤖</span>
                        </div>
                        <div className="bot-info">
                            <h3>Three21Bot</h3>
                            <span className="bot-status">
                                {isLoading ? '🔄 Analyzing...' : '✅ Ready'}
                            </span>
                        </div>
                        {selectedPart && (
                            <div className="selected-part">
                                <span>🎯 Focus: {selectedPart}</span>
                            </div>
                        )}
                    </div>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="three21-bot-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            <div className="message-content">
                                {message.role === 'assistant' ? (
                                    <ReactMarkdown 
                                        components={{
                                            h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
                                            h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
                                            h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
                                            p: ({children}) => <p className="markdown-p">{children}</p>,
                                            ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
                                            li: ({children}) => <li className="markdown-li">{children}</li>,
                                            strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
                                            code: ({children}) => <code className="markdown-code">{children}</code>,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <div>
                                        {message.content}
                                        {message.hasScreenshot && (
                                            <div className="screenshot-indicator">
                                                📷 Screenshot included
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="message-timestamp">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="three21-bot-input">
                    <div className="quick-actions">
                        <button 
                            className="quick-action-btn screenshot-btn"
                            onClick={handleScreenshotAnalysis}
                            disabled={isLoading}
                        >
                            📷 Analyze Current View
                        </button>
                        {screenshot && (
                            <span className="screenshot-ready">📷 Screenshot ready</span>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="input-form">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask about the model, parts, or engineering insights..."
                            disabled={isLoading}
                            className="message-input"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !inputMessage.trim()}
                            className="send-button"
                        >
                            {isLoading ? '⏳' : '➤'}
                        </button>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .three21-bot-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    animation: overlayFadeIn 0.4s ease;
                }

                @keyframes overlayFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .three21-bot-container {
                    width: 100%;
                    max-width: 56rem;
                    height: 90vh;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    animation: containerSlideIn 0.3s ease;
                }

                .three21-bot-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #3b82f6;
                }

                @keyframes containerSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .three21-bot-header {
                    background: #f8fafc;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 1.5rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .three21-bot-header::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #3b82f6;
                    opacity: 0.2;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .bot-avatar {
                    width: 3.5rem;
                    height: 3.5rem;
                    background: #3b82f6;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }

                .bot-info h3 {
                    color: #111827;
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .bot-status {
                    color: #6b7280;
                    font-size: 0.875rem;
                    display: block;
                    margin-top: 0.25rem;
                    font-weight: 500;
                }

                .selected-part {
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    padding: 0.5rem 0.875rem;
                    border-radius: 12px;
                    color: #3b82f6;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .close-button {
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    color: #6b7280;
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-button:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .three21-bot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    background: #ffffff;
                }

                .message {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .message.user {
                    align-items: flex-end;
                }

                .message.assistant {
                    align-items: flex-start;
                }

                .message-content {
                    max-width: 85%;
                    padding: 1.25rem 1.5rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }

                .message.user .message-content {
                    background: #3b82f6;
                    color: white;
                    border-bottom-right-radius: 8px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }

                .message.assistant .message-content {
                    background: #f8fafc;
                    color: #111827;
                    border: 1px solid #e5e7eb;
                    border-bottom-left-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .message-timestamp {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin: 0 1.5rem;
                    font-weight: 500;
                }

                .screenshot-indicator {
                    margin-top: 0.75rem;
                    padding: 0.5rem 0.875rem;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    color: #3b82f6;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .typing-indicator {
                    display: flex;
                    gap: 0.375rem;
                    align-items: center;
                    padding: 1rem;
                }

                .typing-indicator span {
                    width: 0.5rem;
                    height: 0.5rem;
                    background: #3b82f6;
                    border-radius: 50%;
                    animation: typingBounce 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typingBounce {
                    0%, 80%, 100% { 
                        opacity: 0.4; 
                        transform: scale(0.8) translateY(0);
                    }
                    40% { 
                        opacity: 1; 
                        transform: scale(1.1) translateY(-4px);
                    }
                }

                .three21-bot-input {
                    background: #f8fafc;
                    border-top: 1px solid #e5e7eb;
                    padding: 1.5rem 2rem;
                }

                .quick-actions {
                    display: flex;
                    gap: 0.875rem;
                    margin-bottom: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .quick-action-btn {
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    color: #374151;
                    padding: 0.625rem 1.125rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .quick-action-btn:hover:not(:disabled) {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .quick-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .screenshot-ready {
                    color: #10b981;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .input-form {
                    display: flex;
                    gap: 0.875rem;
                    align-items: flex-end;
                }

                .message-input {
                    flex: 1;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 16px;
                    padding: 1rem 1.25rem;
                    color: #111827;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s ease;
                    resize: none;
                    min-height: 3rem;
                    max-height: 8rem;
                    line-height: 1.5;
                }

                .message-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .message-input::placeholder {
                    color: #9ca3af;
                }

                .send-button {
                    background: #3b82f6;
                    border: none;
                    color: white;
                    width: 3rem;
                    height: 3rem;
                    border-radius: 16px;
                    font-size: 1.125rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
                }

                .send-button:hover:not(:disabled) {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Enhanced Markdown Styles */
                .markdown-h1 {
                    color: #111827;
                    font-size: 1.5rem;
                    margin: 0 0 1rem 0;
                    font-weight: 700;
                    line-height: 1.3;
                }

                .markdown-h2 {
                    color: #111827;
                    font-size: 1.25rem;
                    margin: 1.5rem 0 0.75rem 0;
                    font-weight: 600;
                    line-height: 1.3;
                }

                .markdown-h3 {
                    color: #374151;
                    font-size: 1rem;
                    margin: 1.25rem 0 0.5rem 0;
                    font-weight: 600;
                    line-height: 1.4;
                }

                .markdown-p {
                    margin: 0.75rem 0;
                    line-height: 1.7;
                    color: #111827;
                }

                .markdown-ul {
                    margin: 0.75rem 0;
                    padding-left: 1.5rem;
                }

                .markdown-li {
                    margin: 0.5rem 0;
                    line-height: 1.6;
                    color: #111827;
                }

                .markdown-strong {
                    color: #3b82f6;
                    font-weight: 700;
                }

                .markdown-code {
                    background: #f3f4f6;
                    color: #374151;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.8rem;
                    border: 1px solid #e5e7eb;
                }

                /* Custom Scrollbar */
                .three21-bot-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .three21-bot-messages::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 3px;
                }

                .three21-bot-messages::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                    transition: background 0.2s ease;
                }

                .three21-bot-messages::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .three21-bot-overlay {
                        padding: 1rem;
                    }
                    
                    .three21-bot-container {
                        height: 95vh;
                        border-radius: 20px;
                        max-width: none;
                    }
                    
                    .three21-bot-header {
                        padding: 1.25rem 1.5rem;
                    }
                    
                    .three21-bot-messages {
                        padding: 1.25rem 1.5rem;
                    }
                    
                    .three21-bot-input {
                        padding: 1.25rem 1.5rem;
                    }
                    
                    .message-content {
                        max-width: 95%;
                        padding: 1rem 1.25rem;
                    }
                    
                    .header-content {
                        gap: 0.75rem;
                    }
                    
                    .selected-part {
                        display: none;
                    }
                    
                    .quick-actions {
                        gap: 0.5rem;
                    }
                    
                    .bot-avatar {
                        width: 3rem;
                        height: 3rem;
                        font-size: 1.25rem;
                    }
                }

                /* Dark theme support */
                @media (prefers-color-scheme: dark) {
                    .three21-bot-container {
                        background: #1f2937;
                        border-color: #374151;
                    }
                    
                    .three21-bot-header {
                        background: #111827;
                        border-bottom-color: #374151;
                    }
                    
                    .three21-bot-messages {
                        background: #1f2937;
                    }
                    
                    .three21-bot-input {
                        background: #111827;
                        border-top-color: #374151;
                    }
                    
                    .bot-info h3 {
                        color: #f9fafb;
                    }
                    
                    .bot-status {
                        color: #9ca3af;
                    }
                    
                    .message.assistant .message-content {
                        background: #111827;
                        color: #f9fafb;
                        border-color: #374151;
                    }
                    
                    .message-input {
                        background: #1f2937;
                        border-color: #374151;
                        color: #f9fafb;
                    }
                    
                    .message-input::placeholder {
                        color: #6b7280;
                    }
                    
                    .quick-action-btn {
                        background: #1f2937;
                        border-color: #374151;
                        color: #f9fafb;
                    }
                    
                    .quick-action-btn:hover:not(:disabled) {
                        background: #374151;
                    }
                    
                    .markdown-h1, .markdown-h2, .markdown-p, .markdown-li {
                        color: #f9fafb;
                    }
                    
                    .markdown-h3 {
                        color: #d1d5db;
                    }
                    
                    .markdown-code {
                        background: #374151;
                        color: #d1d5db;
                        border-color: #4b5563;
                    }
                }
            `}</style>
        </div>
    );
}
