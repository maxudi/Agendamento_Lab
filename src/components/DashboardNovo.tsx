import { useEffect, useState, Fragment, useRef } from "react"
import { supabase, AgendamentoLaboratorio } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { Dialog, Transition } from '@headlessui/react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { toPng } from 'html-to-image'

export default function DashboardNovo() {
  const { isAdmin, user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<AgendamentoLaboratorio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filterTurno, setFilterTurno] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Estados do modal de validação
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoLaboratorio | null>(null)
  const [validationAction, setValidationAction] = useState<'aprovar' | 'negar'>('aprovar')
  const [justificativa, setJustificativa] = useState('')

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
      toast.success('✅ Agendamento excluído com sucesso!')
      fetchAgendamentos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('❌ Erro ao excluir agendamento')
    }
  }

  function openValidationModal(agendamento: AgendamentoLaboratorio, action: 'aprovar' | 'negar') {
    setSelectedAgendamento(agendamento)
    setValidationAction(action)
    setJustificativa('')
    setShowValidationModal(true)
  }

  async function sendToWebhook(agendamento: AgendamentoLaboratorio, action: 'aprovar' | 'negar', justificativaTexto?: string) {
    console.log('🚀 [WEBHOOK] Iniciando envio para webhook...')
    console.log('🚀 [WEBHOOK] Agendamento ID:', agendamento.id)
    console.log('🚀 [WEBHOOK] Ação:', action)
    console.log('🚀 [WEBHOOK] Justificativa:', justificativaTexto)
    
    try {
      // Capturar o card como imagem
      console.log('📷 [WEBHOOK] Procurando elemento do card: card-' + agendamento.id)
      const cardElement = document.getElementById(`card-${agendamento.id}`)
      
      if (!cardElement) {
        console.error('❌ [WEBHOOK] Card não encontrado para captura! ID:', `card-${agendamento.id}`)
        console.log('📋 [WEBHOOK] Cards disponíveis no DOM:')
        const allCards = document.querySelectorAll('[id^="card-"]')
        allCards.forEach(card => console.log('  -', card.id))
        return
      }

      console.log('✅ [WEBHOOK] Card encontrado, iniciando captura...')
      
      // Usar html-to-image que suporta cores modernas (oklch/oklab)
      console.log('📸 [WEBHOOK] Capturando imagem com html-to-image (suporta oklch/oklab)...')
      const imageBase64 = await toPng(cardElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 2, // Mesma qualidade que scale: 2 do html2canvas
        cacheBust: true,
        skipFonts: false
      })
      
      console.log('✅ [WEBHOOK] Imagem capturada com sucesso!')
      console.log('✅ [WEBHOOK] Base64 gerado (tamanho:', imageBase64.length, 'caracteres)')

      // Preparar dados para envio
      const webhookData = {
        status: action === 'aprovar' ? 'aprovado' : 'negado',
        motivo: action === 'negar' ? justificativaTexto : 'Agendamento aprovado',
        professor: agendamento.professor_id,
        telefone: agendamento.telefone,
        email: agendamento.email_contato,
        disciplina: agendamento.disciplina_id,
        laboratorio: agendamento.laboratorio_id,
        turno: agendamento.turno,
        datas: agendamento.datas_selecionadas?.join(', '),
        validado_por: user?.fullName || user?.username || 'Admin',
        validado_em: new Date().toISOString(),
        card_imagem: imageBase64
      }

      console.log('📤 [WEBHOOK] Dados preparados:', {
        ...webhookData,
        card_imagem: `[${imageBase64.length} caracteres]` // Não logar a imagem completa
      })

      // Enviar para o webhook
      console.log('🌐 [WEBHOOK] Enviando para:', 'https://geral-n8n.yzqq8i.easypanel.host/webhook/anhanguera')
      const response = await fetch('https://geral-n8n.yzqq8i.easypanel.host/webhook/anhanguera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })

      console.log('📡 [WEBHOOK] Resposta HTTP:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [WEBHOOK] Erro na resposta:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.text()
      console.log('✅ [WEBHOOK] Resposta do servidor:', responseData)
      console.log('✅ [WEBHOOK] Enviado para webhook com sucesso!')
      
      toast.success('📤 Notificação enviada!')
      
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao enviar para webhook:', error)
      console.error('❌ [WEBHOOK] Stack trace:', error instanceof Error ? error.stack : 'N/A')
      toast.error('⚠️ Erro ao enviar notificação (agendamento salvo)')
      // Não bloqueia o processo principal
    }
  }

  async function handleValidation() {
    if (!selectedAgendamento || !selectedAgendamento.id) return

    console.log('🔄 [VALIDAÇÃO] Iniciando validação...')
    console.log('🔄 [VALIDAÇÃO] Agendamento:', selectedAgendamento.id)
    console.log('🔄 [VALIDAÇÃO] Ação:', validationAction)

    // Validação: justificativa obrigatória ao negar
    if (validationAction === 'negar' && !justificativa.trim()) {
      toast.error('⚠️ Justificativa obrigatória ao negar um agendamento!')
      return
    }

    try {
      const updateData: any = {
        status: validationAction === 'aprovar' ? 'aprovado' : 'negado',
        validado_por: user?.fullName || user?.username || 'Admin',
        validado_em: new Date().toISOString()
      }

      if (validationAction === 'negar') {
        updateData.justificativa_negacao = justificativa
      }

      console.log('💾 [VALIDAÇÃO] Atualizando banco de dados...')
      const { error } = await supabase
        .from('agendamentos_laboratorio')
        .update(updateData)
        .eq('id', selectedAgendamento.id)

      if (error) throw error

      console.log('✅ [VALIDAÇÃO] Banco atualizado com sucesso')

      const message = validationAction === 'aprovar' 
        ? '✅ Agendamento aprovado com sucesso!' 
        : '❌ Agendamento negado com sucesso!'
      
      toast.success(message)
      setShowValidationModal(false)
      
      // Criar agendamento atualizado com novos dados
      const agendamentoAtualizado: AgendamentoLaboratorio = {
        ...selectedAgendamento,
        ...updateData
      }

      console.log('🔄 [VALIDAÇÃO] Agendamento atualizado:', agendamentoAtualizado)
      
      // Atualizar lista para refletir mudanças antes de capturar
      console.log('🔄 [VALIDAÇÃO] Recarregando lista de agendamentos...')
      await fetchAgendamentos()
      
      console.log('⏳ [VALIDAÇÃO] Aguardando 1 segundo para atualizar DOM...')
      // Aguardar um pouco para garantir que o DOM foi atualizado
      setTimeout(() => {
        console.log('🚀 [VALIDAÇÃO] Chamando sendToWebhook...')
        sendToWebhook(agendamentoAtualizado, validationAction, justificativa)
      }, 1000)
      
    } catch (error) {
      console.error('❌ [VALIDAÇÃO] Erro ao validar:', error)
      toast.error('❌ Erro ao processar validação')
    }
  }

  function exportToExcel() {
    try {
      // Preparar dados para exportação
      const dadosExport = agendamentosFiltrados.map(a => ({
        'ID': a.id,
        'Status': a.status || 'pendente',
        'Professor': a.professor_id,
        'Disciplina': a.disciplina_id,
        'Laboratório': a.laboratorio_id,
        'Turno': a.turno,
        'Quantidade de Alunos': a.quantidade_alunos,
        'Datas': a.datas_selecionadas?.join(', '),
        'E-mail': a.email_contato,
        'Telefone': a.telefone,
        'Prática Realizada': a.pratica_realizada,
        'Software Utilizado': a.software_utilizado,
        'Internet': a.necessita_internet ? 'Sim' : 'Não',
        'Multimídia': a.uso_kit_multimidia ? 'Sim' : 'Não',
        'Observações': a.observacao,
        'Justificativa (se negado)': a.justificativa_negacao || '',
        'Validado por': a.validado_por || '',
        'Data de Validação': a.validado_em ? new Date(a.validado_em).toLocaleString('pt-BR') : '',
        'Criado em': a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : ''
      }))

      // Criar planilha
      const ws = XLSX.utils.json_to_sheet(dadosExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos')

      // Ajustar largura das colunas
      const maxWidth = 50
      const minWidth = 10
      const colWidths = Object.keys(dadosExport[0] || {}).map(() => ({ wch: minWidth }))
      ws['!cols'] = colWidths

      // Gerar arquivo
      const fileName = `agendamentos_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      toast.success('📊 Planilha exportada com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('❌ Erro ao exportar planilha')
    }
  }

  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case 'aprovado': return 'border-4 border-green-500'
      case 'negado': return 'border-4 border-red-500'
      case 'pendente':
      default: return 'border-4 border-yellow-500'
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'aprovado': 
        return <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">✅ Aprovado</span>
      case 'negado':
        return <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">❌ Negado</span>
      case 'pendente':
      default:
        return <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">⏳ Pendente</span>
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
    const matchesStatus = filterStatus === 'all' || (a.status || 'pendente') === filterStatus
    return matchesSearch && matchesTurno && matchesStatus
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
    noturno: agendamentos.filter(a => a.turno === 'Noturno').length,
    pendentes: agendamentos.filter(a => (a.status || 'pendente') === 'pendente').length,
    aprovados: agendamentos.filter(a => a.status === 'aprovado').length,
    negados: agendamentos.filter(a => a.status === 'negado').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Dashboard de Agendamentos</h1>
            <p className="text-gray-600 text-lg">Visualize e gerencie todos os laboratórios</p>
          </div>
          <button
            onClick={exportToExcel}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Exportar Excel</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-yellow-100 text-sm font-semibold mb-1">⏳ Pendentes</p>
            <p className="text-4xl font-black">{stats.pendentes}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-green-100 text-sm font-semibold mb-1">✅ Aprovados</p>
            <p className="text-4xl font-black">{stats.aprovados}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-red-100 text-sm font-semibold mb-1">❌ Negados</p>
            <p className="text-4xl font-black">{stats.negados}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Buscar por professor, disciplina ou laboratório..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            
            {/* Filtros de Turno e Status */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro Turno */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-600 flex items-center">Turno:</span>
                <button
                  onClick={() => setFilterTurno('all')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${filterTurno === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterTurno('Matutino')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Matutino' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  ☀️ M
                </button>
                <button
                  onClick={() => setFilterTurno('Vespertino')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Vespertino' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🌤️ V
                </button>
                <button
                  onClick={() => setFilterTurno('Noturno')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Noturno' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🌙 N
                </button>
              </div>

              {/* Filtro Status */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-600 flex items-center">Status:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('pendente')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  ⏳ Pendentes
                </button>
                <button
                  onClick={() => setFilterStatus('aprovado')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'aprovado' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  ✅ Aprovados
                </button>
                <button
                  onClick={() => setFilterStatus('negado')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'negado' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  ❌ Negados
                </button>
              </div>

              {/* Botão Atualizar */}
              <button
                onClick={fetchAgendamentos}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold"
                title="Atualizar"
              >
                🔄 Atualizar
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
              <div 
                key={agendamento.id} 
                id={`card-${agendamento.id}`}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all ${getStatusBorderColor(agendamento.status || 'pendente')}`}
              >
                {/* Header colorido do laboratório */}
                <div className={`bg-gradient-to-r ${getLabColor(agendamento.laboratorio_id)} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black">{agendamento.laboratorio_id}</span>
                    <div className="flex gap-2">
                      <span className={`${getTurnoBgColor(agendamento.turno)} px-3 py-1 rounded-full text-sm font-bold`}>
                        {getTurnoIcon(agendamento.turno)} {agendamento.turno}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/90 text-sm font-semibold">Laboratório de Informática</p>
                    {getStatusBadge(agendamento.status || 'pendente')}
                  </div>
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

                  {/* Justificativa de Negação */}
                  {agendamento.status === 'negado' && agendamento.justificativa_negacao && (
                    <div className="border-t border-red-700 pt-4 bg-red-900/30 -mx-6 -mb-6 px-6 py-4 mt-4">
                      <span className="text-red-300 text-xs font-semibold block mb-2">❌ MOTIVO DA NEGAÇÃO:</span>
                      <p className="text-red-100 text-sm">{agendamento.justificativa_negacao}</p>
                      {agendamento.validado_por && (
                        <p className="text-red-300 text-xs mt-2">
                          <strong>Negado por:</strong> {agendamento.validado_por}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Info de Validação */}
                  {agendamento.status === 'aprovado' && agendamento.validado_por && (
                    <div className="border-t border-green-700 pt-4">
                      <p className="text-green-300 text-xs">
                        ✅ <strong>Aprovado por:</strong> {agendamento.validado_por}
                        {agendamento.validado_em && <span className="ml-2">em {new Date(agendamento.validado_em).toLocaleDateString('pt-BR')}</span>}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botões de Ação - Apenas para Administradores */}
                {isAdmin && (
                  <div className="p-4 bg-gray-50 space-y-3">
                    {/* Botões de Validação (apenas se pendente) */}
                    {(agendamento.status === 'pendente' || !agendamento.status) && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => openValidationModal(agendamento, 'aprovar')}
                          className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2"
                        >
                          <span>✅</span>
                          <span>Aprovar</span>
                        </button>
                        <button
                          onClick={() => openValidationModal(agendamento, 'negar')}
                          className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2"
                        >
                          <span>❌</span>
                          <span>Negar</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Botão Excluir */}
                    <button
                      onClick={() => agendamento.id && handleDelete(agendamento.id)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2"
                    >
                      <span>🗑️</span>
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal de Validação */}
        <Transition appear show={showValidationModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowValidationModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                    <Dialog.Title className="text-2xl font-black text-gray-900 mb-4">
                      {validationAction === 'aprovar' ? '✅ Aprovar Agendamento' : '❌ Negar Agendamento'}
                    </Dialog.Title>

                    <div className="mb-6">
                      <p className="text-gray-600 mb-4">
                        <strong>Professor:</strong> {selectedAgendamento?.professor_id}
                      </p>
                      <p className="text-gray-600 mb-4">
                        <strong>Disciplina:</strong> {selectedAgendamento?.disciplina_id}
                      </p>
                      <p className="text-gray-600">
                        <strong>Laboratório:</strong> {selectedAgendamento?.laboratorio_id}
                      </p>
                    </div>

                    {validationAction === 'negar' && (
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Justificativa (obrigatório) *
                        </label>
                        <textarea
                          value={justificativa}
                          onChange={(e) => setJustificativa(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          rows={4}
                          placeholder="Digite o motivo da negação..."
                        />
                      </div>
                    )}

                    {validationAction === 'aprovar' && (
                      <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <p className="text-green-800 text-sm">
                          ✅ Ao aprovar, o agendamento será marcado como confirmado e o professor será notificado.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowValidationModal(false)}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleValidation}
                        className={`flex-1 px-6 py-3 ${validationAction === 'aprovar' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white rounded-xl hover:shadow-lg transition-all font-bold`}
                      >
                        Confirmar
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  )
}
