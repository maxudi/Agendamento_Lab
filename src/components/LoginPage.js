import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }
        const success = login(username, password);
        if (!success) {
            setError('Usuário ou senha incorretos');
            setPassword('');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-md w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "bg-white rounded-3xl p-6 inline-block shadow-2xl mb-6", children: _jsx("img", { src: "https://logodownload.org/wp-content/uploads/2018/07/universidade-anhanguera-logo-1.png", alt: "Universidade Anhanguera", className: "h-20 w-auto object-contain" }) }), _jsx("h1", { className: "text-4xl font-black text-white mb-2", children: "Sistema de Agendamento" }), _jsx("p", { className: "text-white/90 text-lg", children: "Gest\u00E3o de Laborat\u00F3rios de Inform\u00E1tica" })] }), _jsxs("div", { className: "bg-white rounded-3xl shadow-2xl p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Fazer Login" }), _jsx("p", { className: "text-gray-600", children: "Entre com suas credenciais" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsx("div", { className: "bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl", children: _jsx("p", { className: "text-sm font-semibold", children: error }) })), _jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-bold text-gray-700 mb-2", children: "Usu\u00E1rio" }), _jsx("input", { id: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium", placeholder: "Digite seu usu\u00E1rio", autoComplete: "username" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-bold text-gray-700 mb-2", children: "Senha" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium", placeholder: "Digite sua senha", autoComplete: "current-password" })] }), _jsx("button", { type: "submit", className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95", children: "Entrar" })] }), _jsxs("div", { className: "mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200", children: [_jsx("p", { className: "text-xs font-bold text-gray-700 mb-2", children: "\uD83D\uDCA1 Credenciais de exemplo:" }), _jsxs("div", { className: "space-y-1 text-xs text-gray-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "Admin:" }), " admin / admin123"] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "Professor:" }), " joao.silva / silva123"] }), _jsxs("p", { className: "text-[10px] text-gray-500 mt-2", children: ["Senha do professor: primeiro sobrenome + 123", _jsx("br", {}), "(Ex: Prof. Jo\u00E3o Silva = silva123)"] })] })] })] })] }) }));
}
