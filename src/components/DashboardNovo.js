import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export default function DashboardNovo() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [filterTurno, setFilterTurno] = useState('all');
    useEffect(() => {
        fetchAgendamentos();
    }, []);
    async function fetchAgendamentos() {
        try {
            const { data, error } = await supabase
                .from('agendamentos_laboratorio')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setAgendamentos(data || []);
        }
        catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleDelete(id) {
        if (!confirm('🗑️ Deseja realmente excluir este agendamento?'))
            return;
        try {
            const { error } = await supabase.from('agendamentos_laboratorio').delete().eq('id', id);
            if (error)
                throw error;
            alert('✅ Agendamento excluído com sucesso!');
            fetchAgendamentos();
        }
        catch (error) {
            console.error('Erro ao excluir:', error);
            alert('❌ Erro ao excluir agendamento');
        }
    }
    const getLabColor = (lab) => {
        const colors = {
            '1': 'from-blue-500 to-blue-600',
            '2': 'from-green-500 to-emerald-600',
            '3': 'from-purple-500 to-purple-600',
            '4': 'from-pink-500 to-rose-600',
            '5': 'from-orange-500 to-orange-600',
            '6': 'from-teal-500 to-cyan-600',
            '7': 'from-indigo-500 to-indigo-600',
            '8': 'from-red-500 to-red-600'
        };
        const labNum = lab.replace(/\D/g, '');
        return colors[labNum] || 'from-gray-500 to-gray-600';
    };
    const getTurnoBgColor = (turno) => {
        switch (turno) {
            case 'Matutino': return 'bg-yellow-500';
            case 'Vespertino': return 'bg-orange-500';
            case 'Noturno': return 'bg-indigo-600';
            default: return 'bg-gray-500';
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
    const agendamentosFiltrados = agendamentos.filter(a => {
        const termo = filtro.toLowerCase();
        const matchesSearch = a.professor_id.toLowerCase().includes(termo) ||
            a.disciplina_id.toLowerCase().includes(termo) ||
            a.laboratorio_id.toLowerCase().includes(termo);
        const matchesTurno = filterTurno === 'all' || a.turno === filterTurno;
        return matchesSearch && matchesTurno;
    });
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto" }), _jsx("p", { className: "mt-6 text-xl font-bold text-gray-800", children: "Carregando..." })] }) }));
    }
    const stats = {
        total: agendamentos.length,
        matutino: agendamentos.filter(a => a.turno === 'Matutino').length,
        vespertino: agendamentos.filter(a => a.turno === 'Vespertino').length,
        noturno: agendamentos.filter(a => a.turno === 'Noturno').length
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-black text-gray-900 mb-2", children: "\uD83D\uDCCA Dashboard de Agendamentos" }), _jsx("p", { className: "text-gray-600 text-lg", children: "Visualize e gerencie todos os laborat\u00F3rios" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-blue-100 text-sm font-semibold mb-1", children: "Total" }), _jsx("p", { className: "text-4xl font-black", children: stats.total })] }), _jsxs("div", { className: "bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-yellow-100 text-sm font-semibold mb-1", children: "\u2600\uFE0F Matutino" }), _jsx("p", { className: "text-4xl font-black", children: stats.matutino })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-orange-100 text-sm font-semibold mb-1", children: "\uD83C\uDF24\uFE0F Vespertino" }), _jsx("p", { className: "text-4xl font-black", children: stats.vespertino })] }), _jsxs("div", { className: "bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-indigo-100 text-sm font-semibold mb-1", children: "\uD83C\uDF19 Noturno" }), _jsx("p", { className: "text-4xl font-black", children: stats.noturno })] })] }), _jsx("div", { className: "bg-white rounded-2xl shadow-xl p-6 mb-8", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "flex-1 relative", children: _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Buscar por professor, disciplina ou laborat\u00F3rio...", value: filtro, onChange: e => setFiltro(e.target.value), className: "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setFilterTurno('all'), className: `px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "Todos" }), _jsx("button", { onClick: () => setFilterTurno('Matutino'), className: `px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Matutino' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\u2600\uFE0F" }), _jsx("button", { onClick: () => setFilterTurno('Vespertino'), className: `px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Vespertino' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\uD83C\uDF24\uFE0F" }), _jsx("button", { onClick: () => setFilterTurno('Noturno'), className: `px-4 py-3 rounded-xl font-bold transition-all ${filterTurno === 'Noturno' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\uD83C\uDF19" }), _jsx("button", { onClick: fetchAgendamentos, className: "px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold", title: "Atualizar", children: "\uD83D\uDD04" })] })] }) }), agendamentosFiltrados.length === 0 ? (_jsxs("div", { className: "text-center py-20 bg-white rounded-2xl shadow-xl", children: [_jsx("p", { className: "text-4xl mb-4", children: "\uD83D\uDCED" }), _jsx("p", { className: "text-xl font-bold text-gray-600", children: "Nenhum agendamento encontrado" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Ajuste os filtros ou crie um novo agendamento" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: agendamentosFiltrados.map((agendamento) => (_jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all", children: [_jsxs("div", { className: `bg-gradient-to-r ${getLabColor(agendamento.laboratorio_id)} p-6 text-white`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-2xl font-black", children: agendamento.laboratorio_id }), _jsxs("span", { className: `${getTurnoBgColor(agendamento.turno)} px-3 py-1 rounded-full text-sm font-bold`, children: [getTurnoIcon(agendamento.turno), " ", agendamento.turno] })] }), _jsx("p", { className: "text-white/90 text-sm font-semibold", children: "Laborat\u00F3rio de Inform\u00E1tica" })] }), _jsxs("div", { className: "bg-gray-900 p-6 space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Professor:" }), _jsx("span", { className: "text-white font-bold flex-1", children: agendamento.professor_id })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Disciplina:" }), _jsx("span", { className: "text-white font-bold flex-1", children: agendamento.disciplina_id })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Alunos:" }), _jsxs("span", { className: "text-white font-bold flex-1", children: [agendamento.quantidade_alunos, " estudantes"] })] })] }), (agendamento.email_contato || agendamento.telefone) && (_jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-2", children: [agendamento.email_contato && (_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "E-mail:" }), _jsx("span", { className: "text-white text-sm flex-1 break-all", children: agendamento.email_contato })] })), agendamento.telefone && (_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Telefone:" }), _jsx("span", { className: "text-white text-sm flex-1", children: agendamento.telefone })] }))] })), _jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("p", { className: "text-gray-400 text-sm font-semibold mb-3", children: "\uD83D\uDCC5 Datas Agendadas:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: agendamento.datas_selecionadas?.map((data, idx) => (_jsx("span", { className: "px-3 py-1 bg-gray-800 text-white rounded-lg text-xs font-bold border border-gray-700", children: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }, idx))) })] }), (agendamento.software_utilizado || agendamento.pratica_realizada) && (_jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-2", children: [agendamento.pratica_realizada && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "PR\u00C1TICA:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.pratica_realizada })] })), agendamento.software_utilizado && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "SOFTWARE:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.software_utilizado })] }))] })), (agendamento.necessita_internet || agendamento.uso_kit_multimidia) && (_jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("p", { className: "text-gray-400 text-xs font-semibold mb-2", children: "RECURSOS:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [agendamento.necessita_internet && (_jsx("span", { className: "px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold", children: "\uD83C\uDF10 Internet" })), agendamento.uso_kit_multimidia && (_jsx("span", { className: "px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold", children: "\uD83D\uDCFD\uFE0F Multim\u00EDdia" }))] })] })), agendamento.observacao && (_jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "OBSERVA\u00C7\u00D5ES:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.observacao })] }))] }), _jsx("div", { className: "p-4 bg-gray-50", children: _jsxs("button", { onClick: () => agendamento.id && handleDelete(agendamento.id), className: "w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\uD83D\uDDD1\uFE0F" }), _jsx("span", { children: "Excluir Agendamento" })] }) })] }, agendamento.id))) }))] }) }));
}
