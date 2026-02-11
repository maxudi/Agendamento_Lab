import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle,
  Calendar,
  User,
  Book,
  Clock,
  MapPin,
  GraduationCap,
  Sun,
  Search,
  Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CronogramaAula {
  id?: number;
  disciplina: string;
  professor: string;
  dia_semana: string;
  curso: string;
  turno: string;
  horario: string;
  local: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

export default function CronogramaPage() {
  const [cronogramas, setCronogramas] = useState<CronogramaAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentRecord, setCurrentRecord] = useState<CronogramaAula | null>(null);
  
  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<CronogramaAula | null>(null);

  // Form state
  const [formData, setFormData] = useState<CronogramaAula>({
    disciplina: '',
    professor: '',
    dia_semana: '',
    curso: '',
    turno: '',
    horario: '',
    local: ''
  });

  // Dynamic selects data
  const [professores, setProfessores] = useState<string[]>([]);
  const [disciplinas, setDisciplinas] = useState<string[]>([]);

  useEffect(() => {
    fetchCronogramas();
    fetchProfessores();
  }, []);

  // Update disciplinas when professor changes
  useEffect(() => {
    if (formData.professor) {
      fetchDisciplinasByProfessor(formData.professor);
    } else {
      setDisciplinas([]);
    }
  }, [formData.professor]);

  const fetchCronogramas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cronograma_aulas')
        .select('*')
        .order('dia_semana', { ascending: true });

      if (error) throw error;
      setCronogramas(data || []);
    } catch (error) {
      console.error('Erro ao buscar cronogramas:', error);
      toast.error('Erro ao carregar cronogramas');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessores = async () => {
    try {
      const { data, error } = await supabase
        .from('cronograma_aulas')
        .select('professor');

      if (error) throw error;
      
      const uniqueProfessores = Array.from(new Set(data?.map(d => d.professor) || []));
      setProfessores(uniqueProfessores);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  const fetchDisciplinasByProfessor = async (professor: string) => {
    try {
      const { data, error } = await supabase
        .from('cronograma_aulas')
        .select('disciplina')
        .eq('professor', professor);

      if (error) throw error;
      
      const uniqueDisciplinas = Array.from(new Set(data?.map(d => d.disciplina) || []));
      setDisciplinas(uniqueDisciplinas);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    }
  };

  const openModal = (mode: ModalMode, record?: CronogramaAula) => {
    setModalMode(mode);
    setCurrentRecord(record || null);
    setFormData(record || {
      disciplina: '',
      professor: '',
      dia_semana: '',
      curso: '',
      turno: '',
      horario: '',
      local: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setCurrentRecord(null);
    setFormData({
      disciplina: '',
      professor: '',
      dia_semana: '',
      curso: '',
      turno: '',
      horario: '',
      local: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('cronograma_aulas')
          .insert([formData]);

        if (error) throw error;
        toast.success('Cronograma criado com sucesso! 🎉');
      } else if (modalMode === 'edit' && currentRecord?.id) {
        const { error } = await supabase
          .from('cronograma_aulas')
          .update(formData)
          .eq('id', currentRecord.id);

        if (error) throw error;
        toast.success('Cronograma atualizado com sucesso! ✅');
      }

      fetchCronogramas();
      fetchProfessores();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar cronograma');
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;

    try {
      const { error } = await supabase
        .from('cronograma_aulas')
        .delete()
        .eq('id', recordToDelete.id);

      if (error) throw error;
      
      toast.success('Cronograma excluído com sucesso! 🗑️');
      fetchCronogramas();
      fetchProfessores();
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir cronograma');
    }
  };

  const openDeleteModal = (record: CronogramaAula) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const turnos = ['Matutino', 'Vespertino', 'Noturno'];

  // Filtered cronogramas
  const filteredCronogramas = cronogramas.filter(crono => {
    const matchesSearch = 
      crono.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crono.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crono.curso.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTurno = filterTurno === 'all' || crono.turno === filterTurno;
    
    return matchesSearch && matchesTurno;
  });

  const getTurnoColor = (turno: string) => {
    switch (turno) {
      case 'Matutino': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
      case 'Vespertino': return 'bg-gradient-to-r from-orange-400 to-pink-500 text-white';
      case 'Noturno': return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'Matutino': return '☀️';
      case 'Vespertino': return '🌤️';
      case 'Noturno': return '🌙';
      default: return '⏰';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Calendar className="w-10 h-10" />
                  Gerenciamento de Cronograma
                </h1>
                <p className="text-white/90 text-lg">
                  Gerencie as aulas e horários dos laboratórios
                </p>
              </div>
              <button
                onClick={() => openModal('create')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold 
                         hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2
                         shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Novo Cronograma
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por disciplina, professor ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                         transition-all outline-none"
              />
            </div>

            {/* Filter by turno */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterTurno}
                onChange={(e) => setFilterTurno(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                         transition-all outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="all">Todos os Turnos</option>
                <option value="Matutino">☀️ Matutino</option>
                <option value="Vespertino">🌤️ Vespertino</option>
                <option value="Noturno">🌙 Noturno</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total de Aulas</div>
            <div className="text-2xl font-bold text-indigo-600">{cronogramas.length}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-4 shadow-md text-white">
            <div className="text-sm text-white/90 mb-1">Matutino</div>
            <div className="text-2xl font-bold">{cronogramas.filter(c => c.turno === 'Matutino').length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl p-4 shadow-md text-white">
            <div className="text-sm text-white/90 mb-1">Vespertino</div>
            <div className="text-2xl font-bold">{cronogramas.filter(c => c.turno === 'Vespertino').length}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 shadow-md text-white">
            <div className="text-sm text-white/90 mb-1">Noturno</div>
            <div className="text-2xl font-bold">{cronogramas.filter(c => c.turno === 'Noturno').length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Carregando cronogramas...</p>
            </div>
          ) : filteredCronogramas.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum cronograma encontrado</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || filterTurno !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Clique em "+ Novo Cronograma" para começar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Dia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Disciplina
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Professor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Curso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Turno
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Horário
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase">
                      Local
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-indigo-900 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCronogramas.map((crono, index) => (
                    <tr 
                      key={crono.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 text-sm">{crono.dia_semana}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 text-sm">{crono.disciplina}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">{crono.professor}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">{crono.curso}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getTurnoColor(crono.turno)}`}>
                          {getTurnoIcon(crono.turno)} {crono.turno}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-700 font-mono text-sm font-semibold">{crono.horario}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">{crono.local}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openModal('view', crono)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white
                                     transition-all duration-200"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', crono)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white
                                     transition-all duration-200"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(crono)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white
                                     transition-all duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form - Create/Edit/View */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl 
                                       bg-white shadow-2xl transition-all">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="w-7 h-7" />
                        {modalMode === 'create' && 'Novo Cronograma'}
                        {modalMode === 'edit' && 'Editar Cronograma'}
                        {modalMode === 'view' && 'Visualizar Cronograma'}
                      </Dialog.Title>
                      <button
                        onClick={closeModal}
                        className="text-white/90 hover:text-white hover:bg-white/20 
                                 rounded-lg p-2 transition-all duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Professor */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          Professor
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {formData.professor}
                          </div>
                        ) : modalMode === 'create' ? (
                          <input
                            type="text"
                            value={formData.professor}
                            onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                                     transition-all outline-none"
                            placeholder="Nome do professor"
                            required
                          />
                        ) : (
                          <select
                            value={formData.professor}
                            onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                                     transition-all outline-none"
                            required
                          >
                            <option value="">Selecione o professor</option>
                            {professores.map(prof => (
                              <option key={prof} value={prof}>{prof}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Disciplina */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Book className="w-4 h-4 text-purple-500" />
                          Disciplina
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {formData.disciplina}
                          </div>
                        ) : modalMode === 'create' ? (
                          <input
                            type="text"
                            value={formData.disciplina}
                            onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                                     transition-all outline-none"
                            placeholder="Nome da disciplina"
                            required
                          />
                        ) : (
                          <select
                            value={formData.disciplina}
                            onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                                     transition-all outline-none"
                            required
                            disabled={!formData.professor}
                          >
                            <option value="">Selecione a disciplina</option>
                            {disciplinas.map(disc => (
                              <option key={disc} value={disc}>{disc}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Dia da Semana */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          Dia da Semana
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {formData.dia_semana}
                          </div>
                        ) : (
                          <select
                            value={formData.dia_semana}
                            onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                                     transition-all outline-none"
                            required
                          >
                            <option value="">Selecione o dia</option>
                            {diasSemana.map(dia => (
                              <option key={dia} value={dia}>{dia}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Curso */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-green-500" />
                          Curso
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {formData.curso}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.curso}
                            onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-green-500 focus:ring-4 focus:ring-green-100 
                                     transition-all outline-none"
                            placeholder="Ex: Engenharia de Software"
                            required
                          />
                        )}
                      </div>

                      {/* Turno */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          Turno
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {getTurnoIcon(formData.turno)} {formData.turno}
                          </div>
                        ) : (
                          <select
                            value={formData.turno}
                            onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-amber-500 focus:ring-4 focus:ring-amber-100 
                                     transition-all outline-none"
                            required
                          >
                            <option value="">Selecione o turno</option>
                            {turnos.map(turno => (
                              <option key={turno} value={turno}>
                                {getTurnoIcon(turno)} {turno}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Horário */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Horário
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200 font-mono">
                            {formData.horario}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.horario}
                            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-amber-500 focus:ring-4 focus:ring-amber-100 
                                     transition-all outline-none font-mono"
                            placeholder="Ex: 14:00-16:00"
                            required
                          />
                        )}
                      </div>

                      {/* Local */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          Local
                        </label>
                        {modalMode === 'view' ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200">
                            {formData.local}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.local}
                            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-red-500 focus:ring-4 focus:ring-red-100 
                                     transition-all outline-none"
                            placeholder="Ex: Laboratório 1, Bloco A"
                            required
                          />
                        )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 
                                 font-semibold hover:bg-gray-50 transition-all duration-200"
                      >
                        {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
                      </button>
                      {modalMode !== 'view' && (
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                                   text-white font-semibold hover:from-indigo-700 hover:to-purple-700 
                                   shadow-lg hover:shadow-xl transition-all duration-200 
                                   hover:scale-105 active:scale-95"
                        >
                          {modalMode === 'create' ? 'Criar Cronograma' : 'Salvar Alterações'}
                        </button>
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl 
                                       bg-white shadow-2xl transition-all">
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                    
                    <Dialog.Title className="text-2xl font-bold text-gray-900 text-center mb-3">
                      Confirmar Exclusão
                    </Dialog.Title>
                    
                    <p className="text-gray-600 text-center mb-6">
                      Tem certeza que deseja excluir o cronograma de{' '}
                      <span className="font-semibold text-gray-900">{recordToDelete?.disciplina}</span>
                      {' '}do professor{' '}
                      <span className="font-semibold text-gray-900">{recordToDelete?.professor}</span>?
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 
                                 font-semibold hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 
                                 text-white font-semibold hover:from-red-700 hover:to-red-800 
                                 shadow-lg hover:shadow-xl transition-all duration-200 
                                 hover:scale-105 active:scale-95"
                      >
                        Sim, Excluir
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
