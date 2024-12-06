import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Mic, MoreVertical } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';
import { getChatHistory, getChatMessages, createChatSession, sendMessage, deleteChatSession, startInterviewChat, renameSession } from '../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logoImg from '../assets/images/2.0.png';

const MainPage = () => {
    // States
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [chatStarted, setChatStarted] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [editSessionId, setEditSessionId] = useState(null);
    const [sessionName, setSessionName] = useState('');
    const [latestChatSession, setLatestChatSession] = useState('');
    const [isLatestChat, setIsLatestChat] = useState(false);
    const messageAreaRef = useRef(null);

    // Load chat history on component mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoading(true);
                const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                if (userId) {
                    const history = await getChatHistory(userId);
                    setChatHistory(history);
                    if (history.length > 0) {
                        setLatestChatSession(history[0].session_id);
                    }
                }
            } catch (err) {
                console.error('Error loading chat history:', err);
                setError('Failed to load chat history');
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, []);

    useEffect(() => {
        return () => {
            setMessages([]);
            setActiveChat(null);
            setChatStarted(false);
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0 && messageAreaRef.current) {
            const scrollHeight = messageAreaRef.current.scrollHeight;
            const height = messageAreaRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            messageAreaRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    }, [messages, loading]);

    // Handle sending messages
    const handleSend = async () => {
        if (message.trim()) {
            try {
                setLoading(true);
                if (!chatStarted) {
                    const sessionCount = chatHistory.length + 1;
                    const userInfo = JSON.parse(sessionStorage.getItem('user_info'));
                    //console.log('User info:', userInfo)
                    setSessionName(`Chat Session ${sessionCount}`)
                    //const newSessionName = `Chat session ${sessionCount}`
                    const newSession = await createChatSession(userInfo.id, sessionName);
                    setChatHistory(prevChatHistory => [
                        {
                            user_id: userInfo.id,
                            session_name: sessionName
                        }, ...prevChatHistory]);
                    setActiveChat(newSession.session_id);
                    setChatStarted(true);
                }

                const userMessage = {
                    id: Date.now(),
                    sender: 'user',
                    message: message
                };
                setMessages(prevMessages => [...prevMessages, userMessage]);

                //console.log('activeChat:', activeChat)
                const response = await sendMessage(activeChat, message);
                //console.log('Server response:', response); 

                setMessage('');

                if (response) {
                    const aiMessage = {
                        id: Date.now() + 1,
                        sender: 'ai',
                        message: response
                    };
                    setMessages(prevMessages => [...prevMessages, aiMessage]);
                }

            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message');
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle chat selection
    const handleChatSelect = async (chatId) => {
        //if (loading) return;

        try {
            setLoading(true);
            setMessages([]);
            setActiveChat(null);

            await new Promise(resolve => setTimeout(resolve, 100));

            setActiveChat(chatId);

            const messages = await getChatMessages(chatId);
            if (!messages || messages.length === 0) {
                setChatStarted(false);
                setJobDescription('');
                setResumeFile(null);
            } else {
                setChatStarted(true);
                setMessages(messages);
            }

            if (chatId == latestChatSession) {
                setIsLatestChat(true);
            } else {
                setIsLatestChat(false);
            }
        } catch (err) {
            console.error('Error loading chat messages:', err);
            setError('Failed to load chat messages');
        } finally {
            setLoading(false);
        }
    };

    // Handle creating new chat
    const handleNewChat = async () => {
        try {
            setLoading(true)
            const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
            if (!userId) {
                throw new Error('User not found');
            }
            const sessionCount = chatHistory.length + 1;
            const newSessionName = `Chat session ${sessionCount}`
            const newSession = await createChatSession(userId, newSessionName);
            const sessionWithName = {
                session_id: newSession.session_id,
                user_id: userId,
                session_name: newSessionName,
                ...newSession
            };

            await new Promise(resolve => {
                setChatHistory(prevChatHistory => {
                    const updatedHistory = [sessionWithName, ...prevChatHistory];
                    resolve(updatedHistory);
                    return updatedHistory;
                });
            });

            setActiveChat(newSession.session_id);
            setMessages([]);
            setLatestChatSession(newSession.session_id);
            setJobDescription('');
            setResumeFile(null);
            setChatStarted(false);
        } catch (err) {
            console.error('Error creating new chat:', err);
            setError('Failed to create new chat');
        }
    };

    // Handle chat deletion
    const handleDeleteChat = async (sessionId, e) => {
        e.stopPropagation();
        try {
            await deleteChatSession(sessionId);
            setChatHistory(prev => prev.filter(chat => chat.session_id !== sessionId));
            if (activeChat === sessionId) {
                setActiveChat(null);
                setChatStarted(false);
                setMessages([]);
            }
        } catch (err) {
            console.error('Error deleting chat:', err);
            setError('Failed to delete chat');
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('user_info');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleStartInterview = async () => {
        try {
            //console.log('Starting interview with:', {
            //jobDescription,
            //resumeFile: resumeFile ? resumeFile.name : null
            //});
            setLoading(true);
            let currentSessionId = activeChat;
            let sessionCreated = false;

            if (!activeChat) {
                const userInfo = JSON.parse(localStorage.getItem('user_info'));
                const sessionCount = chatHistory.length + 1;
                const newSessionName = `Chat Session ${sessionCount}`
                //console.log('Creating new session with name:', sessionName);
                const newSession = await createChatSession(userInfo.id, newSessionName)
                //console.log('New session response:', newSession);
                const sessionWithName = {
                    session_id: newSession.session_id,
                    user_id: userInfo.id,
                    session_name: newSessionName,
                    ...newSession
                };
                await new Promise(resolve => {
                    setChatHistory(prevChatHistory => {
                        const updatedHistory = [sessionWithName, ...prevChatHistory];
                        resolve(updatedHistory);
                        return updatedHistory;
                    });
                });
                currentSessionId = newSession.session_id;
                setActiveChat(currentSessionId);
                setLatestChatSession(currentSessionId);
                setIsLatestChat(true);
                sessionCreated = true;
            }

            const response = await startInterviewChat(
                currentSessionId,
                jobDescription,
                resumeFile
            );

            if (response) {
                setChatStarted(true);

                const userMessage = {
                    id: Date.now(),
                    sender: 'user',
                    message: `Job Description:\n${jobDescription}`
                };

                const aiMessage = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    message: response
                };

                setMessages([userMessage, aiMessage]);

                setJobDescription('');
                setResumeFile(null);
                if (sessionCreated) {
                    const userId = JSON.parse(localStorage.getItem('user_info'))?.id;
                    const history = await getChatHistory(userId);
                    setChatHistory(history);
                }
            }

        } catch (err) {
            console.error('Error starting interview:', err);
            setError('Failed to start interview.');
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (sessionId, newName) => {
        try {
            await renameSession(sessionId, newName);

            setChatHistory(prevHistory =>
                prevHistory.map(chat =>
                    chat.session_id === sessionId
                        ? { ...chat, session_name: newName }
                        : chat
                )
            );

            setEditSessionId(null);
            setSessionName('');
        } catch (err) {
            console.error('Error renaming session:', err);
            setError('Failed to rename session');
        }
    };

    const TypingAnimation = () => (
        <div className="message loading">
            <div className="typing-animation">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
            </div>
        </div>
    );

    return (
        <div className="mainpage">
            <Row className="h-100 g-0">
                {/* Sidebar */}
                <Col className={`sidebar ${!isSidebarVisible ? 'closed' : ''}`} xs="auto">
                    <div className="sidebar-content">
                        <div className="chat-actions p-3">
                            <button className="new-chat-btn" onClick={handleNewChat}>
                                + New chat
                            </button>
                        </div>

                        <div className="chat-list">
                            {chatHistory.map((chat) => (
                                <div
                                    key={chat.session_id}
                                    className={`chat-history-item ${activeChat === chat.session_id ? 'active' : ''}`}
                                    onClick={() => handleChatSelect(chat.session_id)}
                                >
                                    <span className="chat-title">
                                        {editSessionId === `rename-${chat.session_id}` ? (
                                            <input
                                                type="text"
                                                className="rename-input"
                                                value={sessionName}
                                                onChange={(e) => setSessionName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleRename(chat.session_id, sessionName);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                        ) : (
                                            chat.session_name || 'Unnamed session'
                                        )}
                                    </span>


                                    <div className="chat-menu">
                                        <button
                                            className="menu-trigger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditSessionId(editSessionId === chat.session_id ? null : chat.session_id);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {editSessionId === chat.session_id && (
                                            <div className="menu-options">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditSessionId(`rename-${chat.session_id}`);
                                                        setSessionName(chat.session_name || '');
                                                    }}
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    className="delete-option"
                                                    onClick={(e) => handleDeleteChat(chat.session_id, e)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>

                {/* Main Content */}
                <Col className="main-content">
                    {/* Header */}
                    <div className="main-header">
                        <button className="control-btn" onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
                            <Menu size={20} />
                        </button>
                        <div className='logo-title'>
                            <img className='logo' src={logoImg} alt='logoImg'></img>
                            <h1>IntervBot</h1>
                        </div>
                        <div className="header-actions">
                            <button
                                className="performance-btn"
                                onClick={() => window.location.href = '/userperformance'}
                            >
                                Performance
                            </button>
                            <button className="control-btn" onClick={handleLogout}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="error-message">
                            {error}
                            <button className="close-error" onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    {/* Chat Content */}
                    <div className="chat-content">
                        {!chatStarted ? (
                            <div className="welcome-screen">
                                <h2>Hi! Welcome to use IntervBot.</h2>
                                <h5>Please upload your resume and job description to start the chat!</h5>
                                <div className="welcome-form">
                                    <div className="form-group">
                                        <label>Job Description</label>
                                        <textarea
                                            placeholder="Please input the job description here..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Resume</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={(e) => setResumeFile(e.target.files[0])}
                                        />
                                        {resumeFile && (
                                            <div className="file-info">
                                                Selected file: {resumeFile.name}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="start-chat-btn"
                                        disabled={!jobDescription.trim() || !resumeFile}
                                        onClick={handleStartInterview}
                                    >
                                        Start Chat
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="messages-area" ref={messageAreaRef}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                                        {msg.message}
                                    </div>
                                ))}
                                {loading && <TypingAnimation />}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="input-area">
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                disabled={!chatStarted || !isLatestChat}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSend}
                                disabled={loading || !chatStarted || !isLatestChat}
                            >
                                Send
                            </button>
                        </div>
                        <div className="disclaimer">
                            AI interview assistant. May produce inaccurate information.
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default MainPage;