// --- Dépendances ---
// npm install socket.io-client
// -----------------------------------------------------------

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from "socket.io-client";

// --- Configuration ---
const API_URL = 'http://localhost:3001';

// --- Icônes (Composants SVG) ---
const HomeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const FileIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const ChatIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const UsersIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const OnlineIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const AdminIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const LogoutIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>;
const DownloadIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>;
const SendIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const MenuIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const AppLogo = () => <svg height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;

// --- Helper Hook for API calls ---
const useApi = () => {
    const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
        const token = localStorage.getItem('accessToken');
        const headers = { ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const config = { ...options, headers };
        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.reload();
        }
        return response;
    }, []);
    return { fetchWithAuth };
};


// --- UI Components ---
const LoadingSpinner = () => <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>;
const SmallLoadingSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const MessageBox = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const colors = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700';
    return (
        <div className={`p-4 my-4 border-l-4 rounded-r-md flex justify-between items-center ${colors}`} role="alert">
            <p>{message}</p>
            {onDismiss && <button onClick={onDismiss} className="font-bold text-xl ml-4">&times;</button>}
        </div>
    );
};

// --- Authentication Page ---
const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const payload = isLogin ? { email, password } : { displayName, email, password };
        try {
            const response = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
            if (isLogin) {
                localStorage.setItem('accessToken', data.accessToken);
                onLoginSuccess();
            } else {
                setMessage(data.message);
                setIsLogin(true);
            }
        } catch (err) { setError(err.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-3 mb-8 text-3xl font-bold text-slate-800">
                <AppLogo />
                <h1>Study Hub</h1>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{isLogin ? 'Connexion' : 'Inscription'}</h2>
                {error && <MessageBox message={error} type="error" onDismiss={() => setError('')} />}
                {message && <MessageBox message={message} type="success" onDismiss={() => setMessage('')} />}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Nom d'utilisateur</label>
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-slate-700 font-semibold mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-semibold mb-2">Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" required />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-sky-300 flex items-center justify-center transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                            {isLogin ? 'Se connecter' : 'S\'inscrire'}
                        </button>
                        <a href="#" onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="font-semibold text-sm text-sky-500 hover:text-sky-700 transition-colors">
                            {isLogin ? 'Créer un compte' : 'J\'ai déjà un compte'}
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Application Pages ---

const HomePage = ({ currentUser, handleSetPage, socket }) => {
    const { fetchWithAuth } = useApi();
    const [stats, setStats] = useState({ userCount: 0, fileCount: 0 });
    const [latestFiles, setLatestFiles] = useState([]);
    const [events, setEvents] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    const fetchData = useCallback(async () => {
        const [statsRes, filesRes, eventsRes] = await Promise.all([
            fetchWithAuth('/api/stats'),
            fetchWithAuth('/api/files/latest'),
            fetch(`${API_URL}/api/events`)
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (filesRes.ok) setLatestFiles(await filesRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchData();

        const handleDashboardUpdate = () => fetchData();
        const handleOnlineUsersUpdate = (count) => setOnlineCount(count);

        if (socket) {
            socket.on('update_dashboard', handleDashboardUpdate);
            socket.on('update_online_users', handleOnlineUsersUpdate);
        }

        return () => {
            if (socket) {
                socket.off('update_dashboard', handleDashboardUpdate);
                socket.off('update_online_users', handleOnlineUsersUpdate);
            }
        };
    }, [fetchData, socket]);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className={`bg-white p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-slate-500 font-semibold">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Bienvenue, <span className="text-sky-600">{currentUser.displayName}</span> !
                </h1>
                <p className="text-slate-500 mt-1">Ravi de vous revoir. Voici un résumé de l'activité du groupe.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">Dernières Actualités</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                             {events.length > 0 ? events.map(event => (
                                <div key={event.id} className="p-4 bg-slate-50 rounded-lg">
                                    <h3 className="font-semibold text-sky-600">{event.title}</h3>
                                    <p className="text-sm text-slate-500 mb-1">{new Date(event.createdAt).toLocaleDateString('fr-FR')}</p>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{event.content}</p>
                                </div>
                            )) : <p className="text-slate-500 text-center py-8">Aucune actualité pour le moment.</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <StatCard icon={OnlineIcon} title="Utilisateurs en Ligne" value={onlineCount} color="bg-teal-500" />
                        <StatCard icon={UsersIcon} title="Membres Inscrits" value={stats.userCount} color="bg-sky-500" />
                        <StatCard icon={FileIcon} title="Fichiers Partagés" value={stats.fileCount} color="bg-emerald-500" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-slate-700 mb-4">Derniers Fichiers</h2>
                         <ul className="space-y-3">
                            {latestFiles.length > 0 ? latestFiles.map(file => (
                                <li key={file.id} className="p-3 bg-slate-50 rounded-lg">
                                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                                    <p className="text-sm text-slate-500">par {file.uploaderName}</p>
                                </li>
                            )) : <p className="text-slate-500 text-center py-4">Aucun fichier récent.</p>}
                         </ul>
                         <button onClick={() => handleSetPage('files')} className="mt-4 w-full text-center bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                            Voir tous les fichiers
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// **CHANGEMENT ICI** : La page Fichiers est entièrement modifiée pour corriger le téléchargement
const FilesPage = () => {
    const { fetchWithAuth } = useApi();
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(null); // Pour savoir quel fichier est en cours de DL
    const fileInputRef = useRef(null);

    const fetchFiles = useCallback(async () => {
        const res = await fetchWithAuth('/api/files');
        const data = await res.json();
        if (res.ok) setFiles(data);
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setError('');
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            setError("Le fichier est trop volumineux (max 20MB).");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetchWithAuth('/api/files', { method: 'POST', body: formData });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erreur d\'upload');
            }
            fetchFiles();
        } catch (err) { setError(err.message);
        } finally {
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDownload = async (file) => {
        try {
            setDownloading(file.id);
            // On utilise fetchWithAuth pour que la requête soit authentifiée
            const res = await fetchWithAuth(`/${file.path}`);
            if (!res.ok) throw new Error("Le téléchargement a échoué.");
            
            // On transforme la réponse en un "blob" (un objet de données brutes)
            const blob = await res.blob();
            // On crée une URL temporaire pour ce blob
            const url = window.URL.createObjectURL(blob);
            // On crée un lien <a> invisible
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name); // On lui dit de télécharger avec le bon nom
            document.body.appendChild(link);
            link.click(); // On clique sur le lien pour lancer le téléchargement
            link.parentNode.removeChild(link); // On nettoie en supprimant le lien
            window.URL.revokeObjectURL(url); // On libère la mémoire
        } catch (err) {
            setError("Erreur de téléchargement : " + err.message);
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Partage de Fichiers</h1>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 transition-shadow hover:shadow-lg">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Envoyer un nouveau fichier</h2>
                <input type="file" ref={fileInputRef} onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 transition-colors" />
                {uploading && <p className="text-sky-600 mt-2 font-semibold">Envoi en cours...</p>}
                {error && <MessageBox message={error} type="error" onDismiss={() => setError('')}/>}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Fichiers Disponibles</h2>
                <ul className="space-y-3">
                    {files.length > 0 ? files.map(file => (
                        <li key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg transition-all duration-200 hover:bg-slate-100 hover:scale-[1.02]">
                            <div>
                                <p className="font-semibold text-slate-800 break-all">{file.name}</p>
                                <p className="text-sm text-slate-500">Par {file.uploaderName} - {formatFileSize(file.size)}</p>
                            </div>
                            <button onClick={() => handleDownload(file)} disabled={downloading === file.id} className="ml-4 flex-shrink-0 bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-full inline-flex items-center justify-center transition-transform hover:scale-110 shadow-sm disabled:bg-sky-300 disabled:scale-100">
                                {downloading === file.id ? <SmallLoadingSpinner /> : <DownloadIcon />}
                            </button>
                        </li>
                    )) : <p className="text-slate-500 text-center py-8">Aucun fichier partagé pour le moment.</p>}
                </ul>
            </div>
        </div>
    );
};


const ChatPage = ({ currentUser, socket }) => {
    const { fetchWithAuth } = useApi();
    const [users, setUsers] = useState([]);
    const [activeChat, setActiveChat] = useState({ type: 'public', id: 'public', name: 'Canal Public' });
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetchWithAuth('/api/users');
            if (res.ok) setUsers(await res.json());
        };
        fetchUsers();
    }, [fetchWithAuth]);

    useEffect(() => {
        if (!activeChat.id || !socket) return;
        socket.emit('join_chat', activeChat.id);
        const handleChatHistory = (history) => setMessages(history);
        const handleNewMessage = (message) => {
            if (message.chatId === activeChat.id) {
                setMessages(prev => [...prev, message]);
            }
        };
        socket.on('chat_history', handleChatHistory);
        socket.on('receive_message', handleNewMessage);
        return () => {
            socket.off('chat_history', handleChatHistory);
            socket.off('receive_message', handleNewMessage);
        };
    }, [activeChat.id, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getPrivateChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');
    const selectChat = (user) => {
        const chatId = getPrivateChatId(currentUser.uid, user.uid);
        setActiveChat({ type: 'private', id: chatId, name: `Chat avec ${user.displayName}` });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket) return;
        socket.emit('send_message', { chatId: activeChat.id, senderId: currentUser.uid, senderName: currentUser.displayName, text: newMessage });
        setNewMessage('');
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-800">Discussions</h2>
                </div>
                <ul className="overflow-y-auto">
                    <li onClick={() => setActiveChat({ type: 'public', id: 'public', name: 'Canal Public' })} className={`p-4 cursor-pointer font-semibold transition-colors ${activeChat.id === 'public' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        # Canal Public
                    </li>
                    {users.filter(u => u.uid !== currentUser.uid).map(user => (
                        <li key={user.uid} onClick={() => selectChat(user)} className={`p-4 cursor-pointer font-semibold transition-colors ${activeChat.id === getPrivateChatId(currentUser.uid, user.uid) ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {user.displayName}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h2 className="font-bold text-lg text-slate-800">{activeChat.name}</h2>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-xl px-4 py-2 max-w-xs md:max-w-md shadow-sm ${msg.senderId === currentUser.uid ? 'bg-sky-500 text-white' : 'bg-white text-slate-700'}`}>
                                <p className="font-bold text-sm">{msg.senderName}</p>
                                <p className="break-words">{msg.text}</p>
                                <p className={`text-xs mt-1 text-right ${msg.senderId === currentUser.uid ? 'text-sky-200' : 'text-slate-400'}`}>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="flex">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrire un message..." className="flex-grow border-slate-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"/>
                        <button type="submit" className="bg-sky-500 text-white px-4 rounded-r-lg hover:bg-sky-600 flex items-center justify-center transition-colors"><SendIcon/></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = ({ currentUser, fetchUser }) => {
    const { fetchWithAuth } = useApi();
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [email, setEmail] = useState(currentUser.email);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword && newPassword !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }
        if (newPassword && newPassword.length < 6) {
            return setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        }

        const payload = {};
        if (displayName !== currentUser.displayName) payload.displayName = displayName;
        if (email !== currentUser.email) payload.email = email;
        if (newPassword) payload.newPassword = newPassword;

        if (Object.keys(payload).length === 0) {
            return setMessage("Aucun changement détecté.");
        }

        setLoading(true);
        try {
            const res = await fetchWithAuth('/api/me/update', { method: 'PUT', body: payload });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            localStorage.setItem('accessToken', data.accessToken);
            await fetchUser(); 

            setMessage(data.message);
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
             <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Mon Profil</h1>
             {error && <MessageBox message={error} type="error" onDismiss={() => setError('')}/>}
             {message && <MessageBox message={message} type="success" onDismiss={() => setMessage('')}/>}
             <div className="bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-700">Mes Informations</h2>
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Nom d'utilisateur</label>
                            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-6 mt-6">
                         <h2 className="text-xl font-semibold text-slate-700">Changer le mot de passe</h2>
                         <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                             <div>
                                <label className="block text-slate-700 font-semibold mb-2">Confirmer le nouveau mot de passe</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                         </div>
                    </div>
                    <div className="mt-6">
                        <button type="submit" disabled={loading} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-sky-300">
                            {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
};

const AdminPage = () => {
    const { fetchWithAuth } = useApi();
    const [view, setView] = useState('users');
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', content: ''});

    const fetchUsers = useCallback(async () => {
        const res = await fetchWithAuth('/api/admin/users');
        if (res.ok) setUsers(await res.json());
    }, [fetchWithAuth]);

    const fetchEvents = useCallback(async () => {
        const res = await fetchWithAuth('/api/events');
        if (res.ok) setEvents(await res.json());
    }, [fetchWithAuth]);

    useEffect(() => {
        if (view === 'users') fetchUsers();
        else if (view === 'events') fetchEvents();
    }, [view, fetchUsers, fetchEvents]);

    const handleUserStatusChange = async (uid, status) => {
        await fetchWithAuth(`/api/admin/users/${uid}/status`, { method: 'PUT', body: { status } });
        fetchUsers();
    };
    
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        if(!newEvent.title || !newEvent.content) return;
        await fetchWithAuth('/api/admin/events', { method: 'POST', body: newEvent });
        setNewEvent({ title: '', content: ''});
        fetchEvents();
    };

    const deleteEvent = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
            await fetchWithAuth(`/api/admin/events/${id}`, { method: 'DELETE' });
            fetchEvents();
        }
    };
    
    const StatusBadge = ({ status }) => {
        const colors = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            banned: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Panneau d'Administration</h1>
            <div className="flex border-b border-slate-200 mb-6">
                <button onClick={() => setView('users')} className={`px-4 py-2 font-semibold ${view === 'users' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Utilisateurs</button>
                <button onClick={() => setView('events')} className={`px-4 py-2 font-semibold ${view === 'events' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Actualités</button>
            </div>

            {view === 'users' && (
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Gérer les utilisateurs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Statut</th><th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.uid} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-semibold">{user.displayName}</td>
                                        <td className="p-3 text-slate-600">{user.email}</td>
                                        <td className="p-3"><StatusBadge status={user.status} /></td>
                                        <td className="p-3 space-x-2">
                                            {user.status === 'pending' && <button onClick={() => handleUserStatusChange(user.uid, 'approved')} className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md">Approuver</button>}
                                            {user.status === 'approved' && <button onClick={() => handleUserStatusChange(user.uid, 'banned')} className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">Bannir</button>}
                                            {user.status === 'banned' && <button onClick={() => handleUserStatusChange(user.uid, 'approved')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">Débannir</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}

            {view === 'events' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">Ajouter une actualité</h2>
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Titre</label>
                                <input type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                             <div>
                                <label className="block text-slate-700 font-semibold mb-2">Contenu</label>
                                <textarea value={newEvent.content} onChange={e => setNewEvent({...newEvent, content: e.target.value})} rows="5" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                            </div>
                            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg">Publier</button>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                         <h2 className="text-xl font-semibold text-slate-700 mb-4">Actualités existantes</h2>
                         <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {events.map(event => (
                                <li key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <p className="font-semibold text-slate-800">{event.title}</p>
                                    <button onClick={() => deleteEvent(event.id)} className="text-sm bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 px-3 py-1 rounded-md transition-colors">Supprimer</button>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Application Component ---
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [socket, setSocket] = useState(null);

    const { fetchWithAuth } = useApi();

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const res = await fetchWithAuth('/api/me');
                if (res.ok) {
                    const userData = await res.json();
                    setCurrentUser(userData);
                    if (!socket || !socket.connected) {
                        const newSocket = io(API_URL, { auth: { token } });
                        setSocket(newSocket);
                    }
                } else {
                    localStorage.removeItem('accessToken');
                    if (socket) socket.disconnect();
                }
            } catch (error) {
                localStorage.removeItem('accessToken');
                if (socket) socket.disconnect();
            }
        }
        setLoading(false);
    }, [fetchWithAuth, socket]);

    useEffect(() => {
        fetchUser();
        return () => { 
            if (socket) {
                socket.disconnect();
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setCurrentUser(null);
        setPage('home');
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };
    
    const handleSetPage = (newPage) => {
        setPage(newPage);
        setSidebarOpen(false);
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-100"><LoadingSpinner /></div>
    }

    if (!currentUser) {
        return <AuthPage onLoginSuccess={fetchUser} />;
    }

    const renderPage = () => {
        switch (page) {
            case 'home': return <HomePage currentUser={currentUser} handleSetPage={handleSetPage} socket={socket} />;
            case 'files': return <FilesPage socket={socket} />;
            case 'chat': return <ChatPage currentUser={currentUser} socket={socket} />;
            case 'profile': return <ProfilePage currentUser={currentUser} fetchUser={fetchUser} />;
            case 'admin': return <AdminPage />;
            default: return <HomePage currentUser={currentUser} handleSetPage={handleSetPage} socket={socket} />;
        }
    };

    const NavLink = ({ pageName, icon: Icon, children }) => (
         <button onClick={() => handleSetPage(pageName)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${page === pageName ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            <Icon className="h-6 w-6" />
            <span>{children}</span>
        </button>
    );

    const sidebarContent = (
        <div className="bg-slate-900 text-white flex flex-col h-full">
            <div className="h-20 flex items-center gap-3 justify-center text-2xl font-bold border-b border-slate-700">
                <AppLogo />
                <span>Study Hub</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 font-semibold">
                <NavLink pageName="home" icon={HomeIcon}>Accueil</NavLink>
                <NavLink pageName="files" icon={FileIcon}>Fichiers</NavLink>
                <NavLink pageName="chat" icon={ChatIcon}>Chat</NavLink>
                <NavLink pageName="profile" icon={UserIcon}>Profil</NavLink>
                {currentUser.role === 'admin' && (
                    <NavLink pageName="admin" icon={AdminIcon}>Admin</NavLink>
                )}
            </nav>
            <div className="px-4 py-4 border-t border-slate-700">
                 <button onClick={handleLogout} className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-700 transition-colors font-semibold text-slate-300 hover:text-white"><LogoutIcon /><span>Déconnexion</span></button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-100">
            <aside className="hidden md:block md:w-64 flex-shrink-0">{sidebarContent}</aside>
            <div className={`fixed inset-0 z-30 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'bg-black bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-40 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarContent}</aside>

            <div className="flex-1 flex flex-col">
                <header className="md:hidden h-16 bg-white shadow-sm flex items-center justify-between px-4 flex-shrink-0">
                     <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-slate-100 transition-colors">
                        <MenuIcon className="h-6 w-6 text-slate-700" />
                    </button>
                    <div className="text-xl font-bold text-sky-600">{page.charAt(0).toUpperCase() + page.slice(1)}</div>
                     <div className="w-8"></div>
                </header>
                
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

