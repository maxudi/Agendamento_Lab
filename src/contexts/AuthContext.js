import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
// Usuários hardcoded (em produção, isso viria do banco de dados)
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin', fullName: 'Administrador' },
    { username: 'joao.silva', password: 'silva123', role: 'professor', fullName: 'Prof. João Silva' },
    { username: 'maria.santos', password: 'santos123', role: 'professor', fullName: 'Prof. Maria Santos' },
    { username: 'pedro.costa', password: 'costa123', role: 'professor', fullName: 'Prof. Pedro Costa' },
    { username: 'ana.oliveira', password: 'oliveira123', role: 'professor', fullName: 'Prof. Ana Oliveira' },
    { username: 'carlos.lima', password: 'lima123', role: 'professor', fullName: 'Prof. Carlos Lima' },
];
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Carregar usuário do localStorage
        const savedUser = localStorage.getItem('agendamento_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);
    const login = (username, password) => {
        const foundUser = USERS.find(u => u.username === username && u.password === password);
        if (foundUser) {
            const userData = {
                username: foundUser.username,
                role: foundUser.role,
                fullName: foundUser.fullName
            };
            setUser(userData);
            localStorage.setItem('agendamento_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('agendamento_user');
    };
    return (_jsx(AuthContext.Provider, { value: { user, login, logout, isAdmin: user?.role === 'admin' }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
