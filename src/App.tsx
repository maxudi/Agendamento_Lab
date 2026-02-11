import { useState } from 'react'
import NovoAgendamentoForm from './components/NovoAgendamentoForm'
import DashboardNovo from './components/DashboardNovo'
import CronogramaPage from './components/CronogramaPage'
import LoginPage from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const { user, logout, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'novo' | 'dashboard' | 'cronograma'>('novo')

  // Se não estiver autenticado, mostrar página de login
  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header com gradiente */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="https://logodownload.org/wp-content/uploads/2018/07/universidade-anhanguera-logo-1.png" 
                alt="Universidade Anhanguera" 
                className="h-16 w-auto object-contain"
              />
              <div className="border-l-2 border-gray-300 h-12 mx-2" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sistema de Agendamento
                </h1>
                <p className="text-sm text-gray-500">Gestão de Laboratórios de Informática</p>
              </div>
            </div>
            
            {/* User Info e Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.role === 'admin' ? '👑 Administrador' : '👨‍🏫 Professor'}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navegação moderna */}
          <nav className="flex space-x-2 pb-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('novo')}
              className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'novo'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Agendamento</span>
              </span>
              {activeTab === 'novo' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
              </span>
              {activeTab === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full" />
              )}
            </button>

            {/* Apenas administradores podem ver o Gerenciar Cronograma */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('cronograma')}
                className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'cronograma'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Gerenciar Cronograma</span>
                </span>
                {activeTab === 'cronograma' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full" />
                )}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="transition-all duration-500">
        {activeTab === 'novo' && <NovoAgendamentoForm />}
        {activeTab === 'dashboard' && <DashboardNovo />}
        {activeTab === 'cronograma' && isAdmin && <CronogramaPage />}
      </main>
    </div>
  )
}

export default App
