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
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .three21-bot-container {
                    width: 100%;
                    max-width: 800px;
                    height: 90vh;
                    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 20px;
                    border: 1px solid rgba(0, 255, 208, 0.3);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .three21-bot-header {
                    background: linear-gradient(90deg, #0f3460 0%, #0e4b99 100%);
                    padding: 20px;
                    border-bottom: 1px solid rgba(0, 255, 208, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex: 1;
                }

                .bot-avatar {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #00ffd0 0%, #2a5298 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .bot-info h3 {
                    color: #00ffd0;
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .bot-status {
                    color: #8892b0;
                    font-size: 14px;
                    display: block;
                    margin-top: 2px;
                }

                .selected-part {
                    background: rgba(0, 255, 208, 0.1);
                    border: 1px solid rgba(0, 255, 208, 0.3);
                    padding: 8px 12px;
                    border-radius: 12px;
                    color: #00ffd0;
                    font-size: 12px;
                    font-weight: 500;
                }

                .close-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #ccd6f6;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s ease;
                }

                .close-button:hover {
                    background: rgba(255, 100, 100, 0.2);
                    color: #ff6b6b;
                }

                .three21-bot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .message {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .message.user {
                    align-items: flex-end;
                }

                .message.assistant {
                    align-items: flex-start;
                }

                .message-content {
                    max-width: 80%;
                    padding: 16px 20px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .message.user .message-content {
                    background: linear-gradient(135deg, #00ffd0 0%, #2a5298 100%);
                    color: #1e3c72;
                    border-bottom-right-radius: 6px;
                }

                .message.assistant .message-content {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ccd6f6;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-bottom-left-radius: 6px;
                }

                .message-timestamp {
                    font-size: 11px;
                    color: #8892b0;
                    opacity: 0.7;
                    margin: 0 20px;
                }

                .screenshot-indicator {
                    margin-top: 8px;
                    padding: 6px 10px;
                    background: rgba(0, 255, 208, 0.1);
                    border-radius: 8px;
                    font-size: 12px;
                    color: #00ffd0;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: #00ffd0;
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                }

                .three21-bot-input {
                    background: rgba(0, 0, 0, 0.3);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px;
                }

                .quick-actions {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                    align-items: center;
                }

                .quick-action-btn {
                    background: rgba(0, 255, 208, 0.1);
                    border: 1px solid rgba(0, 255, 208, 0.3);
                    color: #00ffd0;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-action-btn:hover:not(:disabled) {
                    background: rgba(0, 255, 208, 0.2);
                }

                .quick-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .screenshot-ready {
                    color: #00ffd0;
                    font-size: 12px;
                    opacity: 0.8;
                }

                .input-form {
                    display: flex;
                    gap: 12px;
                }

                .message-input {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 14px 18px;
                    color: #ccd6f6;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .message-input:focus {
                    border-color: #00ffd0;
                    box-shadow: 0 0 0 2px rgba(0, 255, 208, 0.2);
                }

                .message-input::placeholder {
                    color: #8892b0;
                }

                .send-button {
                    background: linear-gradient(135deg, #00ffd0 0%, #2a5298 100%);
                    border: none;
                    color: #1e3c72;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .send-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 255, 208, 0.3);
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Markdown Styles */
                .markdown-h1 {
                    color: #00ffd0;
                    font-size: 20px;
                    margin: 0 0 12px 0;
                    font-weight: 600;
                }

                .markdown-h2 {
                    color: #64ffda;
                    font-size: 16px;
                    margin: 16px 0 8px 0;
                    font-weight: 600;
                }

                .markdown-h3 {
                    color: #8892b0;
                    font-size: 14px;
                    margin: 12px 0 6px 0;
                    font-weight: 600;
                }

                .markdown-p {
                    margin: 8px 0;
                    line-height: 1.6;
                }

                .markdown-ul {
                    margin: 8px 0;
                    padding-left: 20px;
                }

                .markdown-li {
                    margin: 4px 0;
                    line-height: 1.5;
                }

                .markdown-strong {
                    color: #00ffd0;
                    font-weight: 600;
                }

                .markdown-code {
                    background: rgba(0, 255, 208, 0.1);
                    color: #00ffd0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Fira Code', monospace;
                    font-size: 12px;
                }

                /* Scrollbar Styles */
                .three21-bot-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .three21-bot-messages::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .three21-bot-messages::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 208, 0.3);
                    border-radius: 3px;
                }

                .three21-bot-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 208, 0.5);
                }

                @media (max-width: 768px) {
                    .three21-bot-overlay {
                        padding: 10px;
                    }
                    
                    .three21-bot-container {
                        height: 95vh;
                        border-radius: 16px;
                    }
                    
                    .message-content {
                        max-width: 90%;
                    }
                    
                    .header-content {
                        gap: 10px;
                    }
                    
                    .selected-part {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
