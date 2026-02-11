import { useState, useEffect, FormEvent } from "react"
import { supabase, CronogramaAula, AgendamentoLaboratorio, Laboratorio } from "../lib/supabase"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

const LABORATORIOS: Laboratorio[] = [
  { id: 'C30', nome: 'Laboratório C30', capacidade: 8 },
  { id: 'C31', nome: 'Laboratório C31', capacidade: 35 },
  { id: 'C32', nome: 'Laboratório C32', capacidade: 40 },
  { id: 'C33', nome: 'Laboratório C33', capacidade: 19 },
  { id: 'C34a', nome: 'Laboratório C34-A', capacidade: 19 },
  { id: 'C34b', nome: 'Laboratório C34-B', capacidade: 21 },
  { id: 'C35', nome: 'Laboratório C35', capacidade: 30 },
  { id: 'C36', nome: 'Laboratório C36', capacidade: 42 },
  { id: 'C37', nome: 'Laboratório C37', capacidade: 71 },
  { id: 'C38', nome: 'Laboratório C38', capacidade: 37 },
  { id: 'C39', nome: 'Laboratório C39', capacidade: 6 },
]

const DIAS_SEMANA_MAP: { [key: number]: string } = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb'
}

const TURNOS = [
  { id: 'Matutino', nome: 'Matutino', icon: '☀️' },
  { id: 'Vespertino', nome: 'Vespertino', icon: '🌤️' },
  { id: 'Noturno', nome: 'Noturno', icon: '🌙' }
]

export default function NovoAgendamentoForm() {
  const [cronogramas, setCronogramas] = useState<CronogramaAula[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [diasSemanaSelecionados, setDiasSemanaSelecionados] = useState<string[]>([])
  const [professoresFiltrados, setProfessoresFiltrados] = useState<string[]>([])
  const [disciplinasFiltradas, setDisciplinasFiltradas] = useState<string[]>([])
  const [form, setForm] = useState({
    professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '',
    laboratorio_id: '', pratica_realizada: '', software_utilizado: '', necessita_internet: false,
    quantidade_alunos: '', observacao: '', uso_kit_multimidia: false
  })

  useEffect(() => { fetchCronogramas() }, [])

  async function fetchCronogramas() {
    try {
      const { data, error } = await supabase.from('cronograma_aulas').select('*')
      if (error) throw error
      setCronogramas(data || [])
    } catch (error) {
      console.error('Erro ao buscar cronogramas:', error)
      alert('Erro ao carregar dados do cronograma')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDates.length > 0) {
      const dias = selectedDates.map(date => DIAS_SEMANA_MAP[date.getDay()])
      setDiasSemanaSelecionados(Array.from(new Set(dias)))
    } else {
      setDiasSemanaSelecionados([])
    }
  }, [selectedDates])

  useEffect(() => {
    if (diasSemanaSelecionados.length > 0) {
      const cronogramasFiltrados = cronogramas.filter(c => diasSemanaSelecionados.includes(c.dia_semana))
      const profs = Array.from(new Set(cronogramasFiltrados.map(c => c.professor)))
      setProfessoresFiltrados(profs)
      if (form.professor_id && !profs.includes(form.professor_id)) {
        setForm(prev => ({ ...prev, professor_id: '', disciplina_id: '' }))
      }
    } else {
      setProfessoresFiltrados(Array.from(new Set(cronogramas.map(c => c.professor))))
    }
  }, [diasSemanaSelecionados, cronogramas])

  useEffect(() => {
    if (form.professor_id) {
      let cronogramasFiltrados = cronogramas.filter(c => c.professor === form.professor_id)
      if (diasSemanaSelecionados.length > 0) {
        cronogramasFiltrados = cronogramasFiltrados.filter(c => diasSemanaSelecionados.includes(c.dia_semana))
      }
      const discs = Array.from(new Set(cronogramasFiltrados.map(c => c.disciplina)))
      setDisciplinasFiltradas(discs)
      if (form.disciplina_id && !discs.includes(form.disciplina_id)) {
        setForm(prev => ({ ...prev, disciplina_id: '' }))
      }
    } else {
      setDisciplinasFiltradas([])
      setForm(prev => ({ ...prev, disciplina_id: '' }))
    }
  }, [form.professor_id, diasSemanaSelecionados, cronogramas])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (selectedDates.length === 0) return alert('Por favor, selecione pelo menos uma data')
    if (!form.professor_id || !form.disciplina_id) return alert('Por favor, selecione o professor e a disciplina')
    if (!form.laboratorio_id) return alert('Por favor, selecione um laboratório')
    if (!form.quantidade_alunos || parseInt(form.quantidade_alunos) <= 0) return alert('Por favor, informe a quantidade de alunos')

    try {
      for (const date of selectedDates) {
        const dataISO = date.toISOString().split('T')[0]
        const { data: conflitos } = await supabase.from('agendamentos_laboratorio').select('*')
          .contains('datas_selecionadas', [dataISO]).eq('laboratorio_id', form.laboratorio_id).eq('turno', form.turno)
        if (conflitos && conflitos.length > 0) {
          return alert(`Conflito detectado! O laboratório ${form.laboratorio_id} já está agendado para ${date.toLocaleDateString()} no turno ${form.turno}`)
        }
      }

      const agendamento: Omit<AgendamentoLaboratorio, 'id' | 'created_at'> = {
        ...form, datas_selecionadas: selectedDates.map(d => d.toISOString().split('T')[0]),
        quantidade_alunos: parseInt(form.quantidade_alunos)
      }

      const { error } = await supabase.from('agendamentos_laboratorio').insert([agendamento])
      if (error) throw error

      alert('✅ Agendamento realizado com sucesso!')
      setSelectedDates([])
      setForm({ professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '', laboratorio_id: '',
        pratica_realizada: '', software_utilizado: '', necessita_internet: false, quantidade_alunos: '', observacao: '', uso_kit_multimidia: false })
    } catch (error) {
      console.error('Erro:', error)
      alert('❌ Erro ao criar agendamento')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-800">Carregando dados...</p>
          <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          
          {/* Header Premium */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 sm:px-12 py-12 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">Novo Agendamento</h1>
                <p className="text-white/90 text-lg mt-2">Reserve o laboratório para suas aulas práticas</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* Seção: Datas */}
            <section className="group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200/50 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Selecione as Datas</h2>
                    <p className="text-xs text-gray-600">Escolha um ou mais dias</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">Passo 1</span>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 inline-block hover:shadow-xl transition-shadow">
                <DayPicker mode="multiple" selected={selectedDates} onSelect={(days) => setSelectedDates(days || [])} disabled={{ before: new Date() }} />
              </div>
              
              {selectedDates.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg animate-fade-in">
                  <p className="text-sm font-bold text-white mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {selectedDates.length} {selectedDates.length === 1 ? 'data selecionada' : 'datas selecionadas'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-semibold shadow">
                        {date.toLocaleDateString('pt-BR')} <span className="opacity-75">({DIAS_SEMANA_MAP[date.getDay()]})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Seção: Identificação */}
            <section className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-green-200/50 hover:border-emerald-400 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Identificação</h2>
                    <p className="text-xs text-gray-600">Professor e disciplina</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">Passo 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professor <span className="text-red-500">*</span></label>
                  <select required value={form.professor_id} onChange={e => setForm({ ...form, professor_id: e.target.value })} disabled={selectedDates.length === 0}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 font-medium">
                    <option value="">{selectedDates.length === 0 ? '📅 Selecione as datas primeiro' : 'Selecione o professor'}</option>
                    {professoresFiltrados.sort().map(prof => <option key={prof} value={prof}>{prof}</option>)}
                  </select>
                  {diasSemanaSelecionados.length > 0 && <p className="text-xs text-gray-500 mt-1">Filtrando por: {diasSemanaSelecionados.join(', ')}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Disciplina <span className="text-red-500">*</span></label>
                  <select required value={form.disciplina_id} onChange={e => setForm({ ...form, disciplina_id: e.target.value })} disabled={!form.professor_id}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 font-medium">
                    <option value="">{!form.professor_id ? 'Selecione o professor primeiro' : 'Selecione a disciplina'}</option>
                    {disciplinasFiltradas.sort().map(disc => <option key={disc} value={disc}>{disc}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                  <input type="email" value={form.email_contato} onChange={e => setForm({ ...form, email_contato: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium" placeholder="email@exemplo.com" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                  <input type="tel" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </section>

            {/* Seção: Laboratório */}
            <section className="group relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200/50 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Laboratório e Horário</h2>
                    <p className="text-xs text-gray-600">Local e período da aula</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg">Passo 3</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Turno <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {TURNOS.map(turno => (
                      <label key={turno.id} className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${form.turno === turno.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-100 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}>
                        <input type="radio" name="turno" value={turno.id} checked={form.turno === turno.id} onChange={e => setForm({ ...form, turno: e.target.value })} className="sr-only" required />
                        <div className="text-3xl mb-2">{turno.icon}</div>
                        <span className="text-sm font-bold text-gray-800">{turno.nome}</span>
                        {form.turno === turno.id && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade de Alunos <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={form.quantidade_alunos} onChange={e => setForm({ ...form, quantidade_alunos: e.target.value })}
                    className="w-full md:w-1/3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold" placeholder="Ex: 30" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Laboratório <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                    {LABORATORIOS.map(lab => (
                      <label key={lab.id} className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${form.laboratorio_id === lab.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'}`}>
                        <input type="radio" name="laboratorio" value={lab.id} checked={form.laboratorio_id === lab.id} onChange={e => setForm({ ...form, laboratorio_id: e.target.value })} className="sr-only" required />
                        <span className={`text-2xl font-black mb-1 ${form.laboratorio_id === lab.id ? 'text-white' : 'text-indigo-600'}`}>{lab.id}</span>
                        <span className={`text-[10px] ${form.laboratorio_id === lab.id ? 'text-white/90' : 'text-gray-600'}`}>{lab.capacidade}PC</span>
                        {form.laboratorio_id === lab.id && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Seção: Requisitos */}
            <section className="group relative bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-violet-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Requisitos Técnicos</h2>
                    <p className="text-xs text-gray-600">Detalhes da aula</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">Passo 4</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prática a ser Realizada</label>
                  <textarea value={form.pratica_realizada} onChange={e => setForm({ ...form, pratica_realizada: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none" rows={3}
                    placeholder="Ex: Desenvolvimento de aplicação web com React..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Software a ser Utilizado</label>
                  <input type="text" value={form.software_utilizado} onChange={e => setForm({ ...form, software_utilizado: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                    placeholder="Ex: VS Code, Node.js, MySQL..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
                    <input type="checkbox" checked={form.necessita_internet} onChange={e => setForm({ ...form, necessita_internet: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">🌐 Necessita Internet</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all">
                    <input type="checkbox" checked={form.uso_kit_multimidia} onChange={e => setForm({ ...form, uso_kit_multimidia: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                    <span className="text-sm font-bold text-gray-700">📽️ Kit Multimídia</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Observações Gerais</label>
                  <textarea value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none" rows={2}
                    placeholder="Informações adicionais..." />
                </div>
              </div>
            </section>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button type="button" onClick={() => { if (confirm('Deseja limpar todos os campos?')) { setSelectedDates([]); setForm({ professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '', laboratorio_id: '', pratica_realizada: '', software_utilizado: '', necessita_internet: false, quantidade_alunos: '', observacao: '', uso_kit_multimidia: false }) } }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Limpar</span>
              </button>
              <button type="submit" className="group px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Confirmar Agendamento</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  )
}
