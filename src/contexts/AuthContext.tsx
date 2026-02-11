import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  username: string
  role: 'admin' | 'professor'
  fullName: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuários hardcoded (em produção, isso viria do banco de dados)
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' as const, fullName: 'Administrador' },
  { username: 'joao.silva', password: 'silva123', role: 'professor' as const, fullName: 'Prof. João Silva' },
  { username: 'maria.santos', password: 'santos123', role: 'professor' as const, fullName: 'Prof. Maria Santos' },
  { username: 'pedro.costa', password: 'costa123', role: 'professor' as const, fullName: 'Prof. Pedro Costa' },
  { username: 'ana.oliveira', password: 'oliveira123', role: 'professor' as const, fullName: 'Prof. Ana Oliveira' },
  { username: 'carlos.lima', password: 'lima123', role: 'professor' as const, fullName: 'Prof. Carlos Lima' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Carregar usuário do localStorage
    const savedUser = localStorage.getItem('agendamento_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    )
    
    if (foundUser) {
      const userData = {
        username: foundUser.username,
        role: foundUser.role,
        fullName: foundUser.fullName
      }
      setUser(userData)
      localStorage.setItem('agendamento_user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('agendamento_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
