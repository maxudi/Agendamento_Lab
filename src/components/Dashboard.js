import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export default function Dashboard() {
    const [agendamentos, setAgendamentos] = useState([]);
    useEffect(() => {
        fetchAgendamentos();
    }, []);
    async function fetchAgendamentos() {
        const { data } = await supabase.from("agendamentos").select("*").order("data", { ascending: true });
        setAgendamentos(data || []);
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl", children: [_jsx("h2", { className: "text-2xl font-bold text-indigo-600 mb-4", children: "Dashboard de Agendamentos" }), _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "p-2", children: "Data" }), _jsx("th", { className: "p-2", children: "Disciplina" }), _jsx("th", { className: "p-2", children: "Laborat\u00F3rio" }), _jsx("th", { className: "p-2", children: "Turno" }), _jsx("th", { className: "p-2", children: "Alunos" })] }) }), _jsx("tbody", { children: agendamentos.map((a) => (_jsxs("tr", { className: "border-b hover:bg-gray-100", children: [_jsx("td", { className: "p-2", children: a.data }), _jsx("td", { className: "p-2", children: a.disciplina }), _jsx("td", { className: "p-2", children: a.laboratorio }), _jsx("td", { className: "p-2", children: a.turno }), _jsx("td", { className: "p-2", children: a.quantidade_alunos })] }, a.id))) })] })] }));
}
