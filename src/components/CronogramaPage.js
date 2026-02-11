import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Eye, Pencil, Trash2, X, AlertTriangle, Calendar, User, Book, Clock, MapPin, GraduationCap, Sun, Search, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
export default function CronogramaPage() {
    const [cronogramas, setCronogramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTurno, setFilterTurno] = useState('all');
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [currentRecord, setCurrentRecord] = useState(null);
    // Delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    // Form state
    const [formData, setFormData] = useState({
        disciplina: '',
        professor: '',
        dia_semana: '',
        curso: '',
        turno: '',
        horario: '',
        local: ''
    });
    // Dynamic selects data
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    useEffect(() => {
        fetchCronogramas();
        fetchProfessores();
    }, []);
    // Update disciplinas when professor changes
    useEffect(() => {
        if (formData.professor) {
            fetchDisciplinasByProfessor(formData.professor);
        }
        else {
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
            if (error)
                throw error;
            setCronogramas(data || []);
        }
        catch (error) {
            console.error('Erro ao buscar cronogramas:', error);
            toast.error('Erro ao carregar cronogramas');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchProfessores = async () => {
        try {
            const { data, error } = await supabase
                .from('cronograma_aulas')
                .select('professor');
            if (error)
                throw error;
            const uniqueProfessores = Array.from(new Set(data?.map(d => d.professor) || []));
            setProfessores(uniqueProfessores);
        }
        catch (error) {
            console.error('Erro ao buscar professores:', error);
        }
    };
    const fetchDisciplinasByProfessor = async (professor) => {
        try {
            const { data, error } = await supabase
                .from('cronograma_aulas')
                .select('disciplina')
                .eq('professor', professor);
            if (error)
                throw error;
            const uniqueDisciplinas = Array.from(new Set(data?.map(d => d.disciplina) || []));
            setDisciplinas(uniqueDisciplinas);
        }
        catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
        }
    };
    const openModal = (mode, record) => {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                const { error } = await supabase
                    .from('cronograma_aulas')
                    .insert([formData]);
                if (error)
                    throw error;
                toast.success('Cronograma criado com sucesso! 🎉');
            }
            else if (modalMode === 'edit' && currentRecord?.id) {
                const { error } = await supabase
                    .from('cronograma_aulas')
                    .update(formData)
                    .eq('id', currentRecord.id);
                if (error)
                    throw error;
                toast.success('Cronograma atualizado com sucesso! ✅');
            }
            fetchCronogramas();
            fetchProfessores();
            closeModal();
        }
        catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar cronograma');
        }
    };
    const handleDelete = async () => {
        if (!recordToDelete?.id)
            return;
        try {
            const { error } = await supabase
                .from('cronograma_aulas')
                .delete()
                .eq('id', recordToDelete.id);
            if (error)
                throw error;
            toast.success('Cronograma excluído com sucesso! 🗑️');
            fetchCronogramas();
            fetchProfessores();
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
        }
        catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir cronograma');
        }
    };
    const openDeleteModal = (record) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const turnos = ['Matutino', 'Vespertino', 'Noturno'];
    // Filtered cronogramas
    const filteredCronogramas = cronogramas.filter(crono => {
        const matchesSearch = crono.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crono.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crono.curso.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTurno = filterTurno === 'all' || crono.turno === filterTurno;
        return matchesSearch && matchesTurno;
    });
    const getTurnoColor = (turno) => {
        switch (turno) {
            case 'Matutino': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
            case 'Vespertino': return 'bg-gradient-to-r from-orange-400 to-pink-500 text-white';
            case 'Noturno': return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };
    const getTurnoIcon = (turno) => {
        switch (turno) {
            case 'Matutino': return '☀️';
            case 'Vespertino': return '🌤️';
            case 'Noturno': return '🌙';
            default: return '⏰';
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4", children: [_jsx(Toaster, { position: "top-right" }), _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsx("div", { className: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center gap-3", children: [_jsx(Calendar, { className: "w-10 h-10" }), "Gerenciamento de Cronograma"] }), _jsx("p", { className: "text-white/90 text-lg", children: "Gerencie as aulas e hor\u00E1rios dos laborat\u00F3rios" })] }), _jsxs("button", { onClick: () => openModal('create'), className: "bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold \r\n                         hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2\r\n                         shadow-lg hover:shadow-xl hover:scale-105 active:scale-95", children: [_jsx(Plus, { className: "w-5 h-5" }), "Novo Cronograma"] })] }) }) }), _jsx("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", placeholder: "Buscar por disciplina, professor ou curso...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 \r\n                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 \r\n                         transition-all outline-none" })] }), _jsxs("div", { className: "relative", children: [_jsx(Filter, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsxs("select", { value: filterTurno, onChange: (e) => setFilterTurno(e.target.value), className: "w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 \r\n                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 \r\n                         transition-all outline-none appearance-none bg-white cursor-pointer", children: [_jsx("option", { value: "all", children: "Todos os Turnos" }), _jsx("option", { value: "Matutino", children: "\u2600\uFE0F Matutino" }), _jsx("option", { value: "Vespertino", children: "\uD83C\uDF24\uFE0F Vespertino" }), _jsx("option", { value: "Noturno", children: "\uD83C\uDF19 Noturno" })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white rounded-xl p-4 shadow-md border border-gray-100", children: [_jsx("div", { className: "text-sm text-gray-600 mb-1", children: "Total de Aulas" }), _jsx("div", { className: "text-2xl font-bold text-indigo-600", children: cronogramas.length })] }), _jsxs("div", { className: "bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-4 shadow-md text-white", children: [_jsx("div", { className: "text-sm text-white/90 mb-1", children: "Matutino" }), _jsx("div", { className: "text-2xl font-bold", children: cronogramas.filter(c => c.turno === 'Matutino').length })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl p-4 shadow-md text-white", children: [_jsx("div", { className: "text-sm text-white/90 mb-1", children: "Vespertino" }), _jsx("div", { className: "text-2xl font-bold", children: cronogramas.filter(c => c.turno === 'Vespertino').length })] }), _jsxs("div", { className: "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 shadow-md text-white", children: [_jsx("div", { className: "text-sm text-white/90 mb-1", children: "Noturno" }), _jsx("div", { className: "text-2xl font-bold", children: cronogramas.filter(c => c.turno === 'Noturno').length })] })] }), _jsx("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100", children: loading ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Carregando cronogramas..." })] })) : filteredCronogramas.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Calendar, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500 text-lg", children: "Nenhum cronograma encontrado" }), _jsx("p", { className: "text-gray-400 text-sm mt-2", children: searchTerm || filterTurno !== 'all'
                                        ? 'Tente ajustar os filtros de busca'
                                        : 'Clique em "+ Novo Cronograma" para começar' })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Dia" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Disciplina" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Professor" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Curso" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Turno" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Hor\u00E1rio" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase", children: "Local" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-bold text-indigo-900 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredCronogramas.map((crono, index) => (_jsxs("tr", { className: "hover:bg-indigo-50/50 transition-colors duration-200", style: { animationDelay: `${index * 50}ms` }, children: [_jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("span", { className: "font-semibold text-gray-900 text-sm", children: crono.dia_semana }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "font-semibold text-gray-900 text-sm", children: crono.disciplina }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-gray-700 text-sm", children: crono.professor }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-gray-700 text-sm", children: crono.curso }) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getTurnoColor(crono.turno)}`, children: [getTurnoIcon(crono.turno), " ", crono.turno] }) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("span", { className: "text-gray-700 font-mono text-sm font-semibold", children: crono.horario }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-gray-700 text-sm", children: crono.local }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [_jsx("button", { onClick: () => openModal('view', crono), className: "p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white\r\n                                     transition-all duration-200", title: "Visualizar", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openModal('edit', crono), className: "p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white\r\n                                     transition-all duration-200", title: "Editar", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openDeleteModal(crono), className: "p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white\r\n                                     transition-all duration-200", title: "Excluir", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, crono.id))) })] }) })) })] }), _jsx(Transition, { appear: true, show: isModalOpen, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-50", onClose: closeModal, children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-3xl transform overflow-hidden rounded-3xl \r\n                                       bg-white shadow-2xl transition-all", children: [_jsx("div", { className: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Dialog.Title, { className: "text-2xl font-bold text-white flex items-center gap-3", children: [_jsx(Calendar, { className: "w-7 h-7" }), modalMode === 'create' && 'Novo Cronograma', modalMode === 'edit' && 'Editar Cronograma', modalMode === 'view' && 'Visualizar Cronograma'] }), _jsx("button", { onClick: closeModal, className: "text-white/90 hover:text-white hover:bg-white/20 \r\n                                 rounded-lg p-2 transition-all duration-200", children: _jsx(X, { className: "w-6 h-6" }) })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4 text-blue-500" }), "Professor"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: formData.professor })) : modalMode === 'create' ? (_jsx("input", { type: "text", value: formData.professor, onChange: (e) => setFormData({ ...formData, professor: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 \r\n                                     transition-all outline-none", placeholder: "Nome do professor", required: true })) : (_jsxs("select", { value: formData.professor, onChange: (e) => setFormData({ ...formData, professor: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 \r\n                                     transition-all outline-none", required: true, children: [_jsx("option", { value: "", children: "Selecione o professor" }), professores.map(prof => (_jsx("option", { value: prof, children: prof }, prof)))] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(Book, { className: "w-4 h-4 text-purple-500" }), "Disciplina"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: formData.disciplina })) : modalMode === 'create' ? (_jsx("input", { type: "text", value: formData.disciplina, onChange: (e) => setFormData({ ...formData, disciplina: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100 \r\n                                     transition-all outline-none", placeholder: "Nome da disciplina", required: true })) : (_jsxs("select", { value: formData.disciplina, onChange: (e) => setFormData({ ...formData, disciplina: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100 \r\n                                     transition-all outline-none", required: true, disabled: !formData.professor, children: [_jsx("option", { value: "", children: "Selecione a disciplina" }), disciplinas.map(disc => (_jsx("option", { value: disc, children: disc }, disc)))] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-indigo-500" }), "Dia da Semana"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: formData.dia_semana })) : (_jsxs("select", { value: formData.dia_semana, onChange: (e) => setFormData({ ...formData, dia_semana: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 \r\n                                     transition-all outline-none", required: true, children: [_jsx("option", { value: "", children: "Selecione o dia" }), diasSemana.map(dia => (_jsx("option", { value: dia, children: dia }, dia)))] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-4 h-4 text-green-500" }), "Curso"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: formData.curso })) : (_jsx("input", { type: "text", value: formData.curso, onChange: (e) => setFormData({ ...formData, curso: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-green-500 focus:ring-4 focus:ring-green-100 \r\n                                     transition-all outline-none", placeholder: "Ex: Engenharia de Software", required: true }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(Sun, { className: "w-4 h-4 text-amber-500" }), "Turno"] }), modalMode === 'view' ? (_jsxs("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: [getTurnoIcon(formData.turno), " ", formData.turno] })) : (_jsxs("select", { value: formData.turno, onChange: (e) => setFormData({ ...formData, turno: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-amber-500 focus:ring-4 focus:ring-amber-100 \r\n                                     transition-all outline-none", required: true, children: [_jsx("option", { value: "", children: "Selecione o turno" }), turnos.map(turno => (_jsxs("option", { value: turno, children: [getTurnoIcon(turno), " ", turno] }, turno)))] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-amber-500" }), "Hor\u00E1rio"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200 font-mono", children: formData.horario })) : (_jsx("input", { type: "text", value: formData.horario, onChange: (e) => setFormData({ ...formData, horario: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-amber-500 focus:ring-4 focus:ring-amber-100 \r\n                                     transition-all outline-none font-mono", placeholder: "Ex: 14:00-16:00", required: true }))] }), _jsxs("div", { className: "md:col-span-2", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-red-500" }), "Local"] }), modalMode === 'view' ? (_jsx("div", { className: "px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200", children: formData.local })) : (_jsx("input", { type: "text", value: formData.local, onChange: (e) => setFormData({ ...formData, local: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 \r\n                                     focus:border-red-500 focus:ring-4 focus:ring-red-100 \r\n                                     transition-all outline-none", placeholder: "Ex: Laborat\u00F3rio 1, Bloco A", required: true }))] })] }), _jsxs("div", { className: "mt-8 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: closeModal, className: "px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 \r\n                                 font-semibold hover:bg-gray-50 transition-all duration-200", children: modalMode === 'view' ? 'Fechar' : 'Cancelar' }), modalMode !== 'view' && (_jsx("button", { type: "submit", className: "px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 \r\n                                   text-white font-semibold hover:from-indigo-700 hover:to-purple-700 \r\n                                   shadow-lg hover:shadow-xl transition-all duration-200 \r\n                                   hover:scale-105 active:scale-95", children: modalMode === 'create' ? 'Criar Cronograma' : 'Salvar Alterações' }))] })] })] }) }) }) })] }) }), _jsx(Transition, { appear: true, show: isDeleteModalOpen, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-50", onClose: () => setIsDeleteModalOpen(false), children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsx(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-3xl \r\n                                       bg-white shadow-2xl transition-all", children: _jsxs("div", { className: "p-8", children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-600" }) }) }), _jsx(Dialog.Title, { className: "text-2xl font-bold text-gray-900 text-center mb-3", children: "Confirmar Exclus\u00E3o" }), _jsxs("p", { className: "text-gray-600 text-center mb-6", children: ["Tem certeza que deseja excluir o cronograma de", ' ', _jsx("span", { className: "font-semibold text-gray-900", children: recordToDelete?.disciplina }), ' ', "do professor", ' ', _jsx("span", { className: "font-semibold text-gray-900", children: recordToDelete?.professor }), "?"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setIsDeleteModalOpen(false), className: "flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 \r\n                                 font-semibold hover:bg-gray-50 transition-all duration-200", children: "Cancelar" }), _jsx("button", { onClick: handleDelete, className: "flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 \r\n                                 text-white font-semibold hover:from-red-700 hover:to-red-800 \r\n                                 shadow-lg hover:shadow-xl transition-all duration-200 \r\n                                 hover:scale-105 active:scale-95", children: "Sim, Excluir" })] })] }) }) }) }) })] }) })] }));
}
