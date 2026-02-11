import { useEffect, useState } from "react"
import { supabase, AgendamentoLaboratorio } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

export default function DashboardNovo() {
  const { isAdmin } = useAuth()
  const [agendamentos, setAgendamentos] = useState<AgendamentoLaboratorio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filterTurno, setFilterTurno] = useState<string>('all')

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  async function fetchAgendamentos() {
    try {
      const { data, error } = await supabase
        .from('agendamentos_laboratorio')
        .select('*')
        .order('created_at', { ascending: false})
      if (error) throw error
      setAgendamentos(data || [])
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('🗑️ Deseja realmente excluir este agendamento?')) return
    try {
      const { error } = await supabase.from('agendamentos_laboratorio').delete().eq('id', id)
      if (error) throw error
      alert('✅ Agendamento excluído com sucesso!')
      fetchAgendamentos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('❌ Erro ao excluir agendamento')
    }
  }

  const getLabColor = (lab: string) => {
    const colors: Record<string, string> = {
      '1': 'from-blue-500 to-blue-600',
      '2': 'from-green-500 to-emerald-600',
      '3': 'from-purple-500 to-purple-600',
      '4': 'from-pink-500 to-rose-600',
      '5': 'from-orange-500 to-orange-600',
      '6': 'from-teal-500 to-cyan-600',
      '7': 'from-indigo-500 to-indigo-600',
      '8': 'from-red-500 to-red-600'
    }
    const labNum = lab.replace(/\D/g, '')
    return colors[labNum] || 'from-gray-500 to-gray-600'
  }

  const getTurnoBgColor = (turno: string) => {
    switch (turno) {
      case 'Matutino': return 'bg-yellow-500'
      case 'Vespertino': return 'bg-orange-500'
      case 'Noturno': return 'bg-indigo-600'
      default: return 'bg-gray-500'
    }
  }

  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'Matutino': return '☀️'
      case 'Vespertino': return '🌤️'
      case 'Noturno': return '🌙'
      default: return '⏰'
    }
  }

  const agendamentosFiltrados = agendamentos.filter(a => {
    const termo = filtro.toLowerCase()
    const matchesSearch = a.professor_id.toLowerCase().includes(termo) ||
           a.disciplina_id.toLowerCase().includes(termo) ||
           a.laboratorio_id.toLowerCase().includes(termo)
    const matchesTurno = filterTurno === 'all' || a.turno === filterTurno
    return matchesSearch && matchesTurno
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl font-bold text-gray-800">Carregando...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: agendamentos.length,
    matutino: agendamentos.filter(a => a.turno === 'Matutino').length,
    vespertino: agendamentos.filter(a => a.turno === 'Vespertino').length,
    noturno: agendamentos.filter(a => a.turno === 'Noturno').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Dashboard de Agendamentos</h1>
          <p className="text-gray-600 text-lg">Visualize e gerencie todos os laboratórios</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-blue-100 text-sm font-semibold mb-1">Total</p>
            <p className="text-4xl font-black">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-yellow-100 text-sm font-semibold mb-1">☀️ Matutino</p>
            <p className="text-4xl font-black">{stats.matutino}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-orange-100 text-sm font-semibold mb-1">🌤️ Vespertino</p>
            <p className="text-4xl font-black">{stats.vespertino}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-indigo-100 text-sm font-semibold mb-1">🌙 Noturno</p>
            <p className="text-4xl font-black">{stats.noturno}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Buscar por professor, disciplina ou laboratório..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterTurno('all')}
                className={`px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterTurno('Matutino')}
                className={`px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Matutino' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ☀️
              </button>
              <button
                onClick={() => setFilterTurno('Vespertino')}
                className={`px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Vespertino' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🌤️
              </button>
              <button
                onClick={() => setFilterTurno('Noturno')}
                className={`px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Noturno' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🌙
              </button>
              <button
                onClick={fetchAgendamentos}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold"
                title="Atualizar"
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Agendamentos */}
        {agendamentosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-xl font-bold text-gray-600">Nenhum agendamento encontrado</p>
            <p className="text-gray-500 mt-2">Ajuste os filtros ou crie um novo agendamento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agendamentosFiltrados.map((agendamento) => (
              <div key={agendamento.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                {/* Header colorido do laboratório */}
                <div className={`bg-gradient-to-r ${getLabColor(agendamento.laboratorio_id)} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black">{agendamento.laboratorio_id}</span>
                    <span className={`${getTurnoBgColor(agendamento.turno)} px-3 py-1 rounded-full text-sm font-bold`}>
                      {getTurnoIcon(agendamento.turno)} {agendamento.turno}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm font-semibold">Laboratório de Informática</p>
                </div>

                {/* Seção de Informações com fundo preto */}
                <div className="bg-gray-900 p-6 space-y-4">
                  {/* Professor e Disciplina */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-gray-400 text-sm font-semibold w-24">Professor:</span>
                      <span className="text-white font-bold flex-1">{agendamento.professor_id}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 text-sm font-semibold w-24">Disciplina:</span>
                      <span className="text-white font-bold flex-1">{agendamento.disciplina_id}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 text-sm font-semibold w-24">Alunos:</span>
                      <span className="text-white font-bold flex-1">{agendamento.quantidade_alunos} estudantes</span>
                    </div>
                  </div>

                  {/* Contatos */}
                  {(agendamento.email_contato || agendamento.telefone) && (
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                      {agendamento.email_contato && (
                        <div className="flex items-start">
                          <span className="text-gray-400 text-sm font-semibold w-24">E-mail:</span>
                          <span className="text-white text-sm flex-1 break-all">{agendamento.email_contato}</span>
                        </div>
                      )}
                      {agendamento.telefone && (
                        <div className="flex items-start">
                          <span className="text-gray-400 text-sm font-semibold w-24">Telefone:</span>
                          <span className="text-white text-sm flex-1">{agendamento.telefone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Datas */}
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm font-semibold mb-3">📅 Datas Agendadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {agendamento.datas_selecionadas?.map((data, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 text-white rounded-lg text-xs font-bold border border-gray-700">
                          {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes adicionais */}
                  {(agendamento.software_utilizado || agendamento.pratica_realizada) && (
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                      {agendamento.pratica_realizada && (
                        <div>
                          <span className="text-gray-400 text-xs font-semibold">PRÁTICA:</span>
                          <p className="text-white text-sm mt-1">{agendamento.pratica_realizada}</p>
                        </div>
                      )}
                      {agendamento.software_utilizado && (
                        <div>
                          <span className="text-gray-400 text-xs font-semibold">SOFTWARE:</span>
                          <p className="text-white text-sm mt-1">{agendamento.software_utilizado}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recursos */}
                  {(agendamento.necessita_internet || agendamento.uso_kit_multimidia) && (
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-400 text-xs font-semibold mb-2">RECURSOS:</p>
                      <div className="flex flex-wrap gap-2">
                        {agendamento.necessita_internet && (
                          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                            🌐 Internet
                          </span>
                        )}
                        {agendamento.uso_kit_multimidia && (
                          <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                            📽️ Multimídia
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {agendamento.observacao && (
                    <div className="border-t border-gray-700 pt-4">
                      <span className="text-gray-400 text-xs font-semibold">OBSERVAÇÕES:</span>
                      <p className="text-white text-sm mt-1">{agendamento.observacao}</p>
                    </div>
                  )}
                </div>

                {/* Botão Excluir - Apenas para Administradores */}
                {isAdmin && (
                  <div className="p-4 bg-gray-50">
                    <button
                      onClick={() => agendamento.id && handleDelete(agendamento.id)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2"
                    >
                      <span>🗑️</span>
                      <span>Excluir Agendamento</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
