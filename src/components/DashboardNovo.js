import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, Fragment } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Dialog, Transition } from '@headlessui/react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
export default function DashboardNovo() {
    const { isAdmin, user } = useAuth();
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [filterTurno, setFilterTurno] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    // Estados do modal de validação
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [validationAction, setValidationAction] = useState('aprovar');
    const [justificativa, setJustificativa] = useState('');
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
            toast.success('✅ Agendamento excluído com sucesso!');
            fetchAgendamentos();
        }
        catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('❌ Erro ao excluir agendamento');
        }
    }
    function openValidationModal(agendamento, action) {
        setSelectedAgendamento(agendamento);
        setValidationAction(action);
        setJustificativa('');
        setShowValidationModal(true);
    }
    function convertOklchToRgb(element) {
        try {
            // Obter todos os estilos computados
            const computedStyle = window.getComputedStyle(element);
            // Propriedades que podem conter cores
            const colorProps = [
                'color',
                'backgroundColor',
                'borderColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'outlineColor'
            ];
            colorProps.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value) {
                    // Se for oklch, o navegador já converteu para rgb no computedStyle
                    // Apenas aplicar diretamente
                    element.style[prop] = value;
                }
            });
            // Processar todos os filhos recursivamente
            Array.from(element.children).forEach(child => {
                convertOklchToRgb(child);
            });
        }
        catch (error) {
            console.warn('⚠️ [WEBHOOK] Erro ao converter cores:', error);
        }
    }
    async function sendToWebhook(agendamento, action, justificativaTexto) {
        console.log('🚀 [WEBHOOK] Iniciando envio para webhook...');
        console.log('🚀 [WEBHOOK] Agendamento ID:', agendamento.id);
        console.log('🚀 [WEBHOOK] Ação:', action);
        console.log('🚀 [WEBHOOK] Justificativa:', justificativaTexto);
        try {
            // Capturar o card como imagem
            console.log('📷 [WEBHOOK] Procurando elemento do card: card-' + agendamento.id);
            const cardElement = document.getElementById(`card-${agendamento.id}`);
            if (!cardElement) {
                console.error('❌ [WEBHOOK] Card não encontrado para captura! ID:', `card-${agendamento.id}`);
                console.log('📋 [WEBHOOK] Cards disponíveis no DOM:');
                const allCards = document.querySelectorAll('[id^="card-"]');
                allCards.forEach(card => console.log('  -', card.id));
                return;
            }
            console.log('✅ [WEBHOOK] Card encontrado, iniciando captura...');
            // Clonar o card para converter cores oklch sem afetar o original
            console.log('🔄 [WEBHOOK] Clonando card para conversão de cores...');
            const clonedCard = cardElement.cloneNode(true);
            clonedCard.style.position = 'absolute';
            clonedCard.style.left = '-9999px';
            clonedCard.style.top = '0';
            document.body.appendChild(clonedCard);
            // Converter todas as cores oklch para rgb
            console.log('🎨 [WEBHOOK] Convertendo cores oklch para rgb...');
            convertOklchToRgb(clonedCard);
            console.log('📸 [WEBHOOK] Capturando imagem do card...');
            const canvas = await html2canvas(clonedCard, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });
            // Remover o clone do DOM
            document.body.removeChild(clonedCard);
            console.log('🧹 [WEBHOOK] Card clonado removido');
            console.log('✅ [WEBHOOK] Canvas criado:', canvas.width, 'x', canvas.height);
            const imageBase64 = canvas.toDataURL('image/png');
            console.log('✅ [WEBHOOK] Imagem convertida para base64 (tamanho:', imageBase64.length, 'caracteres)');
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
            };
            console.log('📤 [WEBHOOK] Dados preparados:', {
                ...webhookData,
                card_imagem: `[${imageBase64.length} caracteres]` // Não logar a imagem completa
            });
            // Enviar para o webhook
            console.log('🌐 [WEBHOOK] Enviando para:', 'https://geral-n8n.yzqq8i.easypanel.host/webhook/anhanguera');
            const response = await fetch('https://geral-n8n.yzqq8i.easypanel.host/webhook/anhanguera', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });
            console.log('📡 [WEBHOOK] Resposta HTTP:', response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [WEBHOOK] Erro na resposta:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            const responseData = await response.text();
            console.log('✅ [WEBHOOK] Resposta do servidor:', responseData);
            console.log('✅ [WEBHOOK] Enviado para webhook com sucesso!');
            toast.success('📤 Notificação enviada!');
        }
        catch (error) {
            console.error('❌ [WEBHOOK] Erro ao enviar para webhook:', error);
            console.error('❌ [WEBHOOK] Stack trace:', error instanceof Error ? error.stack : 'N/A');
            toast.error('⚠️ Erro ao enviar notificação (agendamento salvo)');
            // Não bloqueia o processo principal
        }
    }
    async function handleValidation() {
        if (!selectedAgendamento || !selectedAgendamento.id)
            return;
        console.log('🔄 [VALIDAÇÃO] Iniciando validação...');
        console.log('🔄 [VALIDAÇÃO] Agendamento:', selectedAgendamento.id);
        console.log('🔄 [VALIDAÇÃO] Ação:', validationAction);
        // Validação: justificativa obrigatória ao negar
        if (validationAction === 'negar' && !justificativa.trim()) {
            toast.error('⚠️ Justificativa obrigatória ao negar um agendamento!');
            return;
        }
        try {
            const updateData = {
                status: validationAction === 'aprovar' ? 'aprovado' : 'negado',
                validado_por: user?.fullName || user?.username || 'Admin',
                validado_em: new Date().toISOString()
            };
            if (validationAction === 'negar') {
                updateData.justificativa_negacao = justificativa;
            }
            console.log('💾 [VALIDAÇÃO] Atualizando banco de dados...');
            const { error } = await supabase
                .from('agendamentos_laboratorio')
                .update(updateData)
                .eq('id', selectedAgendamento.id);
            if (error)
                throw error;
            console.log('✅ [VALIDAÇÃO] Banco atualizado com sucesso');
            const message = validationAction === 'aprovar'
                ? '✅ Agendamento aprovado com sucesso!'
                : '❌ Agendamento negado com sucesso!';
            toast.success(message);
            setShowValidationModal(false);
            // Criar agendamento atualizado com novos dados
            const agendamentoAtualizado = {
                ...selectedAgendamento,
                ...updateData
            };
            console.log('🔄 [VALIDAÇÃO] Agendamento atualizado:', agendamentoAtualizado);
            // Atualizar lista para refletir mudanças antes de capturar
            console.log('🔄 [VALIDAÇÃO] Recarregando lista de agendamentos...');
            await fetchAgendamentos();
            console.log('⏳ [VALIDAÇÃO] Aguardando 1 segundo para atualizar DOM...');
            // Aguardar um pouco para garantir que o DOM foi atualizado
            setTimeout(() => {
                console.log('🚀 [VALIDAÇÃO] Chamando sendToWebhook...');
                sendToWebhook(agendamentoAtualizado, validationAction, justificativa);
            }, 1000);
        }
        catch (error) {
            console.error('❌ [VALIDAÇÃO] Erro ao validar:', error);
            toast.error('❌ Erro ao processar validação');
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
            }));
            // Criar planilha
            const ws = XLSX.utils.json_to_sheet(dadosExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');
            // Ajustar largura das colunas
            const maxWidth = 50;
            const minWidth = 10;
            const colWidths = Object.keys(dadosExport[0] || {}).map(() => ({ wch: minWidth }));
            ws['!cols'] = colWidths;
            // Gerar arquivo
            const fileName = `agendamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success('📊 Planilha exportada com sucesso!');
        }
        catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('❌ Erro ao exportar planilha');
        }
    }
    const getStatusBorderColor = (status) => {
        switch (status) {
            case 'aprovado': return 'border-4 border-green-500';
            case 'negado': return 'border-4 border-red-500';
            case 'pendente':
            default: return 'border-4 border-yellow-500';
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'aprovado':
                return _jsx("span", { className: "px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold", children: "\u2705 Aprovado" });
            case 'negado':
                return _jsx("span", { className: "px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold", children: "\u274C Negado" });
            case 'pendente':
            default:
                return _jsx("span", { className: "px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold", children: "\u23F3 Pendente" });
        }
    };
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
        const matchesStatus = filterStatus === 'all' || (a.status || 'pendente') === filterStatus;
        return matchesSearch && matchesTurno && matchesStatus;
    });
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto" }), _jsx("p", { className: "mt-6 text-xl font-bold text-gray-800", children: "Carregando..." })] }) }));
    }
    const stats = {
        total: agendamentos.length,
        matutino: agendamentos.filter(a => a.turno === 'Matutino').length,
        vespertino: agendamentos.filter(a => a.turno === 'Vespertino').length,
        noturno: agendamentos.filter(a => a.turno === 'Noturno').length,
        pendentes: agendamentos.filter(a => (a.status || 'pendente') === 'pendente').length,
        aprovados: agendamentos.filter(a => a.status === 'aprovado').length,
        negados: agendamentos.filter(a => a.status === 'negado').length
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-gray-900 mb-2", children: "\uD83D\uDCCA Dashboard de Agendamentos" }), _jsx("p", { className: "text-gray-600 text-lg", children: "Visualize e gerencie todos os laborat\u00F3rios" })] }), _jsxs("button", { onClick: exportToExcel, className: "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center space-x-2", children: [_jsx("span", { children: "\uD83D\uDCCA" }), _jsx("span", { children: "Exportar Excel" })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8", children: [_jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-blue-100 text-sm font-semibold mb-1", children: "Total" }), _jsx("p", { className: "text-4xl font-black", children: stats.total })] }), _jsxs("div", { className: "bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-yellow-100 text-sm font-semibold mb-1", children: "\u2600\uFE0F Matutino" }), _jsx("p", { className: "text-4xl font-black", children: stats.matutino })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-orange-100 text-sm font-semibold mb-1", children: "\uD83C\uDF24\uFE0F Vespertino" }), _jsx("p", { className: "text-4xl font-black", children: stats.vespertino })] }), _jsxs("div", { className: "bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-indigo-100 text-sm font-semibold mb-1", children: "\uD83C\uDF19 Noturno" }), _jsx("p", { className: "text-4xl font-black", children: stats.noturno })] }), _jsxs("div", { className: "bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-yellow-100 text-sm font-semibold mb-1", children: "\u23F3 Pendentes" }), _jsx("p", { className: "text-4xl font-black", children: stats.pendentes })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-green-100 text-sm font-semibold mb-1", children: "\u2705 Aprovados" }), _jsx("p", { className: "text-4xl font-black", children: stats.aprovados })] }), _jsxs("div", { className: "bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl text-white", children: [_jsx("p", { className: "text-red-100 text-sm font-semibold mb-1", children: "\u274C Negados" }), _jsx("p", { className: "text-4xl font-black", children: stats.negados })] })] }), _jsx("div", { className: "bg-white rounded-2xl shadow-xl p-6 mb-8", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("div", { className: "flex-1 relative", children: _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Buscar por professor, disciplina ou laborat\u00F3rio...", value: filtro, onChange: e => setFiltro(e.target.value), className: "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("span", { className: "text-sm font-bold text-gray-600 flex items-center", children: "Turno:" }), _jsx("button", { onClick: () => setFilterTurno('all'), className: `px-4 py-2 rounded-xl font-bold transition-all text-sm ${filterTurno === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "Todos" }), _jsx("button", { onClick: () => setFilterTurno('Matutino'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Matutino' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\u2600\uFE0F M" }), _jsx("button", { onClick: () => setFilterTurno('Vespertino'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Vespertino' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\uD83C\uDF24\uFE0F V" }), _jsx("button", { onClick: () => setFilterTurno('Noturno'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterTurno === 'Noturno' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\uD83C\uDF19 N" })] }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("span", { className: "text-sm font-bold text-gray-600 flex items-center", children: "Status:" }), _jsx("button", { onClick: () => setFilterStatus('all'), className: `px-4 py-2 rounded-xl font-bold transition-all text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "Todos" }), _jsx("button", { onClick: () => setFilterStatus('pendente'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\u23F3 Pendentes" }), _jsx("button", { onClick: () => setFilterStatus('aprovado'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'aprovado' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\u2705 Aprovados" }), _jsx("button", { onClick: () => setFilterStatus('negado'), className: `px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === 'negado' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "\u274C Negados" })] }), _jsx("button", { onClick: fetchAgendamentos, className: "px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold", title: "Atualizar", children: "\uD83D\uDD04 Atualizar" })] })] }) }), agendamentosFiltrados.length === 0 ? (_jsxs("div", { className: "text-center py-20 bg-white rounded-2xl shadow-xl", children: [_jsx("p", { className: "text-4xl mb-4", children: "\uD83D\uDCED" }), _jsx("p", { className: "text-xl font-bold text-gray-600", children: "Nenhum agendamento encontrado" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Ajuste os filtros ou crie um novo agendamento" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: agendamentosFiltrados.map((agendamento) => (_jsxs("div", { id: `card-${agendamento.id}`, className: `bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all ${getStatusBorderColor(agendamento.status || 'pendente')}`, children: [_jsxs("div", { className: `bg-gradient-to-r ${getLabColor(agendamento.laboratorio_id)} p-6 text-white`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-2xl font-black", children: agendamento.laboratorio_id }), _jsx("div", { className: "flex gap-2", children: _jsxs("span", { className: `${getTurnoBgColor(agendamento.turno)} px-3 py-1 rounded-full text-sm font-bold`, children: [getTurnoIcon(agendamento.turno), " ", agendamento.turno] }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-white/90 text-sm font-semibold", children: "Laborat\u00F3rio de Inform\u00E1tica" }), getStatusBadge(agendamento.status || 'pendente')] })] }), _jsxs("div", { className: "bg-gray-900 p-6 space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Professor:" }), _jsx("span", { className: "text-white font-bold flex-1", children: agendamento.professor_id })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Disciplina:" }), _jsx("span", { className: "text-white font-bold flex-1", children: agendamento.disciplina_id })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Alunos:" }), _jsxs("span", { className: "text-white font-bold flex-1", children: [agendamento.quantidade_alunos, " estudantes"] })] })] }), (agendamento.email_contato || agendamento.telefone) && (_jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-2", children: [agendamento.email_contato && (_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "E-mail:" }), _jsx("span", { className: "text-white text-sm flex-1 break-all", children: agendamento.email_contato })] })), agendamento.telefone && (_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "text-gray-400 text-sm font-semibold w-24", children: "Telefone:" }), _jsx("span", { className: "text-white text-sm flex-1", children: agendamento.telefone })] }))] })), _jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("p", { className: "text-gray-400 text-sm font-semibold mb-3", children: "\uD83D\uDCC5 Datas Agendadas:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: agendamento.datas_selecionadas?.map((data, idx) => (_jsx("span", { className: "px-3 py-1 bg-gray-800 text-white rounded-lg text-xs font-bold border border-gray-700", children: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }, idx))) })] }), (agendamento.software_utilizado || agendamento.pratica_realizada) && (_jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-2", children: [agendamento.pratica_realizada && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "PR\u00C1TICA:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.pratica_realizada })] })), agendamento.software_utilizado && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "SOFTWARE:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.software_utilizado })] }))] })), (agendamento.necessita_internet || agendamento.uso_kit_multimidia) && (_jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("p", { className: "text-gray-400 text-xs font-semibold mb-2", children: "RECURSOS:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [agendamento.necessita_internet && (_jsx("span", { className: "px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold", children: "\uD83C\uDF10 Internet" })), agendamento.uso_kit_multimidia && (_jsx("span", { className: "px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold", children: "\uD83D\uDCFD\uFE0F Multim\u00EDdia" }))] })] })), agendamento.observacao && (_jsxs("div", { className: "border-t border-gray-700 pt-4", children: [_jsx("span", { className: "text-gray-400 text-xs font-semibold", children: "OBSERVA\u00C7\u00D5ES:" }), _jsx("p", { className: "text-white text-sm mt-1", children: agendamento.observacao })] })), agendamento.status === 'negado' && agendamento.justificativa_negacao && (_jsxs("div", { className: "border-t border-red-700 pt-4 bg-red-900/30 -mx-6 -mb-6 px-6 py-4 mt-4", children: [_jsx("span", { className: "text-red-300 text-xs font-semibold block mb-2", children: "\u274C MOTIVO DA NEGA\u00C7\u00C3O:" }), _jsx("p", { className: "text-red-100 text-sm", children: agendamento.justificativa_negacao }), agendamento.validado_por && (_jsxs("p", { className: "text-red-300 text-xs mt-2", children: [_jsx("strong", { children: "Negado por:" }), " ", agendamento.validado_por] }))] })), agendamento.status === 'aprovado' && agendamento.validado_por && (_jsx("div", { className: "border-t border-green-700 pt-4", children: _jsxs("p", { className: "text-green-300 text-xs", children: ["\u2705 ", _jsx("strong", { children: "Aprovado por:" }), " ", agendamento.validado_por, agendamento.validado_em && _jsxs("span", { className: "ml-2", children: ["em ", new Date(agendamento.validado_em).toLocaleDateString('pt-BR')] })] }) }))] }), isAdmin && (_jsxs("div", { className: "p-4 bg-gray-50 space-y-3", children: [(agendamento.status === 'pendente' || !agendamento.status) && (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => openValidationModal(agendamento, 'aprovar'), className: "px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\u2705" }), _jsx("span", { children: "Aprovar" })] }), _jsxs("button", { onClick: () => openValidationModal(agendamento, 'negar'), className: "px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\u274C" }), _jsx("span", { children: "Negar" })] })] })), _jsxs("button", { onClick: () => agendamento.id && handleDelete(agendamento.id), className: "w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\uD83D\uDDD1\uFE0F" }), _jsx("span", { children: "Excluir" })] })] }))] }, agendamento.id))) })), _jsx(Transition, { appear: true, show: showValidationModal, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-50", onClose: () => setShowValidationModal(false), children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black/50" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all", children: [_jsx(Dialog.Title, { className: "text-2xl font-black text-gray-900 mb-4", children: validationAction === 'aprovar' ? '✅ Aprovar Agendamento' : '❌ Negar Agendamento' }), _jsxs("div", { className: "mb-6", children: [_jsxs("p", { className: "text-gray-600 mb-4", children: [_jsx("strong", { children: "Professor:" }), " ", selectedAgendamento?.professor_id] }), _jsxs("p", { className: "text-gray-600 mb-4", children: [_jsx("strong", { children: "Disciplina:" }), " ", selectedAgendamento?.disciplina_id] }), _jsxs("p", { className: "text-gray-600", children: [_jsx("strong", { children: "Laborat\u00F3rio:" }), " ", selectedAgendamento?.laboratorio_id] })] }), validationAction === 'negar' && (_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Justificativa (obrigat\u00F3rio) *" }), _jsx("textarea", { value: justificativa, onChange: (e) => setJustificativa(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all", rows: 4, placeholder: "Digite o motivo da nega\u00E7\u00E3o..." })] })), validationAction === 'aprovar' && (_jsx("div", { className: "mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl", children: _jsx("p", { className: "text-green-800 text-sm", children: "\u2705 Ao aprovar, o agendamento ser\u00E1 marcado como confirmado e o professor ser\u00E1 notificado." }) })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowValidationModal(false), className: "flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold", children: "Cancelar" }), _jsx("button", { onClick: handleValidation, className: `flex-1 px-6 py-3 ${validationAction === 'aprovar' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white rounded-xl hover:shadow-lg transition-all font-bold`, children: "Confirmar" })] })] }) }) }) })] }) })] }) }));
}
