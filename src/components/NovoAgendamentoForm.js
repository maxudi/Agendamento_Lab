import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, Fragment } from "react";
import { supabase } from "../lib/supabase";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
const LABORATORIOS = [
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
];
const DIAS_SEMANA_MAP = {
    0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb'
};
const TURNOS = [
    { id: 'Matutino', nome: 'Matutino', icon: '☀️' },
    { id: 'Vespertino', nome: 'Vespertino', icon: '🌤️' },
    { id: 'Noturno', nome: 'Noturno', icon: '🌙' }
];
export default function NovoAgendamentoForm() {
    const [cronogramas, setCronogramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDates, setSelectedDates] = useState([]);
    const [diasSemanaSelecionados, setDiasSemanaSelecionados] = useState([]);
    const [professoresFiltrados, setProfessoresFiltrados] = useState([]);
    const [disciplinasFiltradas, setDisciplinasFiltradas] = useState([]);
    const [showClearModal, setShowClearModal] = useState(false);
    const [form, setForm] = useState({
        professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '',
        laboratorio_id: '', pratica_realizada: '', software_utilizado: '', necessita_internet: false,
        quantidade_alunos: '', observacao: '', uso_kit_multimidia: false
    });
    function limparFormulario() {
        setSelectedDates([]);
        setForm({
            professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '',
            laboratorio_id: '', pratica_realizada: '', software_utilizado: '', necessita_internet: false,
            quantidade_alunos: '', observacao: '', uso_kit_multimidia: false
        });
        setShowClearModal(false);
        toast.success('✨ Formulário limpo com sucesso!');
    }
    useEffect(() => { fetchCronogramas(); }, []);
    async function fetchCronogramas() {
        try {
            const { data, error } = await supabase.from('cronograma_aulas').select('*');
            if (error)
                throw error;
            setCronogramas(data || []);
        }
        catch (error) {
            console.error('Erro ao buscar cronogramas:', error);
            toast.error('❌ Erro ao carregar dados do cronograma');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (selectedDates.length > 0) {
            const dias = selectedDates.map(date => DIAS_SEMANA_MAP[date.getDay()]);
            setDiasSemanaSelecionados(Array.from(new Set(dias)));
        }
        else {
            setDiasSemanaSelecionados([]);
        }
    }, [selectedDates]);
    useEffect(() => {
        if (diasSemanaSelecionados.length > 0) {
            const cronogramasFiltrados = cronogramas.filter(c => diasSemanaSelecionados.includes(c.dia_semana));
            const profs = Array.from(new Set(cronogramasFiltrados.map(c => c.professor)));
            setProfessoresFiltrados(profs);
            if (form.professor_id && !profs.includes(form.professor_id)) {
                setForm(prev => ({ ...prev, professor_id: '', disciplina_id: '' }));
            }
        }
        else {
            setProfessoresFiltrados(Array.from(new Set(cronogramas.map(c => c.professor))));
        }
    }, [diasSemanaSelecionados, cronogramas]);
    useEffect(() => {
        if (form.professor_id) {
            let cronogramasFiltrados = cronogramas.filter(c => c.professor === form.professor_id);
            if (diasSemanaSelecionados.length > 0) {
                cronogramasFiltrados = cronogramasFiltrados.filter(c => diasSemanaSelecionados.includes(c.dia_semana));
            }
            const discs = Array.from(new Set(cronogramasFiltrados.map(c => c.disciplina)));
            setDisciplinasFiltradas(discs);
            if (form.disciplina_id && !discs.includes(form.disciplina_id)) {
                setForm(prev => ({ ...prev, disciplina_id: '' }));
            }
        }
        else {
            setDisciplinasFiltradas([]);
            setForm(prev => ({ ...prev, disciplina_id: '' }));
        }
    }, [form.professor_id, diasSemanaSelecionados, cronogramas]);
    async function handleSubmit(e) {
        e.preventDefault();
        if (selectedDates.length === 0) {
            toast.error('📅 Por favor, selecione pelo menos uma data');
            return;
        }
        if (!form.professor_id || !form.disciplina_id) {
            toast.error('👨‍🏫 Por favor, selecione o professor e a disciplina');
            return;
        }
        if (!form.laboratorio_id) {
            toast.error('🖥️ Por favor, selecione um laboratório');
            return;
        }
        if (!form.quantidade_alunos || parseInt(form.quantidade_alunos) <= 0) {
            toast.error('👥 Por favor, informe a quantidade de alunos');
            return;
        }
        try {
            for (const date of selectedDates) {
                const dataISO = date.toISOString().split('T')[0];
                const { data: conflitos } = await supabase.from('agendamentos_laboratorio').select('*')
                    .contains('datas_selecionadas', [dataISO]).eq('laboratorio_id', form.laboratorio_id).eq('turno', form.turno);
                if (conflitos && conflitos.length > 0) {
                    toast.error(`⚠️ Conflito detectado! O laboratório ${form.laboratorio_id} já está agendado para ${date.toLocaleDateString()} no turno ${form.turno}`, { duration: 5000 });
                    return;
                }
            }
            const agendamento = {
                ...form, datas_selecionadas: selectedDates.map(d => d.toISOString().split('T')[0]),
                quantidade_alunos: parseInt(form.quantidade_alunos)
            };
            const { error } = await supabase.from('agendamentos_laboratorio').insert([agendamento]);
            if (error)
                throw error;
            toast.success('✅ Agendamento realizado com sucesso!', { duration: 4000 });
            setSelectedDates([]);
            setForm({ professor_id: '', disciplina_id: '', email_contato: '', telefone: '', turno: '', laboratorio_id: '',
                pratica_realizada: '', software_utilizado: '', necessita_internet: false, quantidade_alunos: '', observacao: '', uso_kit_multimidia: false });
        }
        catch (error) {
            console.error('Erro:', error);
            toast.error('❌ Erro ao criar agendamento');
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 animate-pulse" }) })] }), _jsx("p", { className: "mt-6 text-xl font-semibold text-gray-800", children: "Carregando dados..." }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Aguarde um momento" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen py-12 px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50", children: [_jsxs("div", { className: "relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 sm:px-12 py-12 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10" }), _jsxs("div", { className: "relative z-10 flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl", children: _jsx("svg", { className: "w-10 h-10 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-black text-white drop-shadow-lg", children: "Novo Agendamento" }), _jsx("p", { className: "text-white/90 text-lg mt-2", children: "Reserve o laborat\u00F3rio para suas aulas pr\u00E1ticas" })] })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 sm:p-8 space-y-8", children: [_jsxs("section", { className: "group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200/50 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "Selecione as Datas" }), _jsx("p", { className: "text-xs text-gray-600", children: "Escolha um ou mais dias" })] })] }), _jsx("span", { className: "px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg", children: "Passo 1" })] }), _jsx("div", { className: "bg-white p-4 rounded-2xl shadow-lg border border-gray-100 inline-block hover:shadow-xl transition-shadow", children: _jsx(DayPicker, { mode: "multiple", selected: selectedDates, onSelect: (days) => setSelectedDates(days || []), disabled: { before: new Date() } }) }), selectedDates.length > 0 && (_jsxs("div", { className: "mt-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg animate-fade-in", children: [_jsxs("p", { className: "text-sm font-bold text-white mb-2 flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), selectedDates.length, " ", selectedDates.length === 1 ? 'data selecionada' : 'datas selecionadas'] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedDates.map((date, idx) => (_jsxs("span", { className: "px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-semibold shadow", children: [date.toLocaleDateString('pt-BR'), " ", _jsxs("span", { className: "opacity-75", children: ["(", DIAS_SEMANA_MAP[date.getDay()], ")"] })] }, idx))) })] }))] }), _jsxs("section", { className: "group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-green-200/50 hover:border-emerald-400 transition-all duration-300 hover:shadow-xl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "Identifica\u00E7\u00E3o" }), _jsx("p", { className: "text-xs text-gray-600", children: "Professor e disciplina" })] })] }), _jsx("span", { className: "px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg", children: "Passo 2" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: ["Professor ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { required: true, value: form.professor_id, onChange: e => setForm({ ...form, professor_id: e.target.value }), disabled: selectedDates.length === 0, className: "w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 font-medium", children: [_jsx("option", { value: "", children: selectedDates.length === 0 ? '📅 Selecione as datas primeiro' : 'Selecione o professor' }), professoresFiltrados.sort().map(prof => _jsx("option", { value: prof, children: prof }, prof))] }), diasSemanaSelecionados.length > 0 && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Filtrando por: ", diasSemanaSelecionados.join(', ')] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: ["Disciplina ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { required: true, value: form.disciplina_id, onChange: e => setForm({ ...form, disciplina_id: e.target.value }), disabled: !form.professor_id, className: "w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 font-medium", children: [_jsx("option", { value: "", children: !form.professor_id ? 'Selecione o professor primeiro' : 'Selecione a disciplina' }), disciplinasFiltradas.sort().map(disc => _jsx("option", { value: disc, children: disc }, disc))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "E-mail" }), _jsx("input", { type: "email", value: form.email_contato, onChange: e => setForm({ ...form, email_contato: e.target.value }), className: "w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium", placeholder: "email@exemplo.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Telefone" }), _jsx("input", { type: "tel", value: form.telefone, onChange: e => setForm({ ...form, telefone: e.target.value }), className: "w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium", placeholder: "(00) 00000-0000" })] })] })] }), _jsxs("section", { className: "group relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200/50 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "Laborat\u00F3rio e Hor\u00E1rio" }), _jsx("p", { className: "text-xs text-gray-600", children: "Local e per\u00EDodo da aula" })] })] }), _jsx("span", { className: "px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg", children: "Passo 3" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-3", children: ["Turno ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: TURNOS.map(turno => (_jsxs("label", { className: `relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${form.turno === turno.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-100 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`, children: [_jsx("input", { type: "radio", name: "turno", value: turno.id, checked: form.turno === turno.id, onChange: e => setForm({ ...form, turno: e.target.value }), className: "sr-only", required: true }), _jsx("div", { className: "text-3xl mb-2", children: turno.icon }), _jsx("span", { className: "text-sm font-bold text-gray-800", children: turno.nome }), form.turno === turno.id && _jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })] }, turno.id))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: ["Quantidade de Alunos ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "number", required: true, min: "1", value: form.quantidade_alunos, onChange: e => setForm({ ...form, quantidade_alunos: e.target.value }), className: "w-full md:w-1/3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold", placeholder: "Ex: 30" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-3", children: ["Laborat\u00F3rio ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2", children: LABORATORIOS.map(lab => (_jsxs("label", { className: `relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${form.laboratorio_id === lab.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'}`, children: [_jsx("input", { type: "radio", name: "laboratorio", value: lab.id, checked: form.laboratorio_id === lab.id, onChange: e => setForm({ ...form, laboratorio_id: e.target.value }), className: "sr-only", required: true }), _jsx("span", { className: `text-2xl font-black mb-1 ${form.laboratorio_id === lab.id ? 'text-white' : 'text-indigo-600'}`, children: lab.id }), _jsxs("span", { className: `text-[10px] ${form.laboratorio_id === lab.id ? 'text-white/90' : 'text-gray-600'}`, children: [lab.capacidade, "PC"] }), form.laboratorio_id === lab.id && _jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })] }, lab.id))) })] })] })] }), _jsxs("section", { className: "group relative bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-violet-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-xl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "Requisitos T\u00E9cnicos" }), _jsx("p", { className: "text-xs text-gray-600", children: "Detalhes da aula" })] })] }), _jsx("span", { className: "px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg", children: "Passo 4" })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Pr\u00E1tica a ser Realizada" }), _jsx("textarea", { value: form.pratica_realizada, onChange: e => setForm({ ...form, pratica_realizada: e.target.value }), className: "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none", rows: 3, placeholder: "Ex: Desenvolvimento de aplica\u00E7\u00E3o web com React..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Software a ser Utilizado" }), _jsx("input", { type: "text", value: form.software_utilizado, onChange: e => setForm({ ...form, software_utilizado: e.target.value }), className: "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium", placeholder: "Ex: VS Code, Node.js, MySQL..." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("label", { className: "flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all", children: [_jsx("input", { type: "checkbox", checked: form.necessita_internet, onChange: e => setForm({ ...form, necessita_internet: e.target.checked }), className: "w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), _jsx("span", { className: "text-sm font-bold text-gray-700", children: "\uD83C\uDF10 Necessita Internet" })] }), _jsxs("label", { className: "flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all", children: [_jsx("input", { type: "checkbox", checked: form.uso_kit_multimidia, onChange: e => setForm({ ...form, uso_kit_multimidia: e.target.checked }), className: "w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" }), _jsx("span", { className: "text-sm font-bold text-gray-700", children: "\uD83D\uDCFD\uFE0F Kit Multim\u00EDdia" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Observa\u00E7\u00F5es Gerais" }), _jsx("textarea", { value: form.observacao, onChange: e => setForm({ ...form, observacao: e.target.value }), className: "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none", rows: 2, placeholder: "Informa\u00E7\u00F5es adicionais..." })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-end gap-3 pt-4", children: [_jsxs("button", { type: "button", onClick: () => setShowClearModal(true), className: "px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center space-x-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }), _jsx("span", { children: "Limpar" })] }), _jsxs("button", { type: "submit", className: "group px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2", children: [_jsx("svg", { className: "w-5 h-5 group-hover:rotate-12 transition-transform", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), _jsx("span", { children: "Confirmar Agendamento" })] })] })] })] }) }), _jsx(Transition, { appear: true, show: showClearModal, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-50", onClose: () => setShowClearModal(false), children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all", children: [_jsx("div", { className: "bg-gradient-to-br from-orange-500 to-red-500 p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-8 w-8 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) }), _jsx(Dialog.Title, { className: "text-2xl font-black text-white", children: "Limpar Formul\u00E1rio?" })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-gray-600 text-lg mb-6", children: "Todos os campos ser\u00E3o limpos e as datas selecionadas ser\u00E3o removidas. Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", className: "flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all", onClick: () => setShowClearModal(false), children: "Cancelar" }), _jsx("button", { type: "button", className: "flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all", onClick: limparFormulario, children: "Sim, Limpar" })] })] })] }) }) }) })] }) }), _jsx("style", { children: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      ` })] }));
}
