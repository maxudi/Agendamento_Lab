import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
export default function AgendamentoForm() {
    const [selectedDays, setSelectedDays] = useState([]);
    const [form, setForm] = useState({
        disciplina: "",
        laboratorio: "",
        turno: "Noturno",
        quantidade_alunos: "",
        software: "",
        observacao: ""
    });
    async function handleSubmit(e) {
        e.preventDefault();
        if (selectedDays.length === 0) {
            alert("Selecione pelo menos uma data");
            return;
        }
        for (const day of selectedDays) {
            const { data: conflito } = await supabase
                .from("agendamentos")
                .select("*")
                .eq("data", day.toISOString().split('T')[0])
                .eq("laboratorio", form.laboratorio)
                .eq("turno", form.turno);
            if (conflito && conflito.length > 0) {
                alert(`Conflito no dia ${day.toLocaleDateString()}!`);
                return;
            }
            await supabase.from("agendamentos").insert([
                {
                    ...form,
                    data: day.toISOString().split('T')[0]
                }
            ]);
        }
        alert("Agendamento enviado com sucesso!");
        setSelectedDays([]);
        setForm({
            disciplina: "",
            laboratorio: "",
            turno: "Noturno",
            quantidade_alunos: "",
            software: "",
            observacao: ""
        });
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 p-6", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl", children: [_jsx("h1", { className: "text-3xl font-bold text-indigo-600 mb-6", children: "Agendamento de Laborat\u00F3rio" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx("input", { type: "text", placeholder: "Disciplina", className: "w-full p-3 border rounded-xl", value: form.disciplina, onChange: e => setForm({ ...form, disciplina: e.target.value }) }), _jsx("input", { type: "text", placeholder: "Laborat\u00F3rio", className: "w-full p-3 border rounded-xl", value: form.laboratorio, onChange: e => setForm({ ...form, laboratorio: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "block mb-2 font-semibold", children: "Selecione as datas:" }), _jsx(DayPicker, { mode: "multiple", selected: selectedDays, onSelect: (days) => setSelectedDays(days || []), className: "border rounded-xl p-4" })] }), _jsxs("select", { className: "w-full p-3 border rounded-xl", value: form.turno, onChange: e => setForm({ ...form, turno: e.target.value }), children: [_jsx("option", { children: "Matutino" }), _jsx("option", { children: "Vespertino" }), _jsx("option", { children: "Noturno" })] }), _jsx("input", { type: "number", placeholder: "Quantidade de alunos", className: "w-full p-3 border rounded-xl", value: form.quantidade_alunos, onChange: e => setForm({ ...form, quantidade_alunos: e.target.value }) }), _jsx("textarea", { placeholder: "Software a ser utilizado", className: "w-full p-3 border rounded-xl", value: form.software, onChange: e => setForm({ ...form, software: e.target.value }) }), _jsx("textarea", { placeholder: "Observa\u00E7\u00F5es", className: "w-full p-3 border rounded-xl", value: form.observacao, onChange: e => setForm({ ...form, observacao: e.target.value }) }), _jsx("button", { type: "submit", className: "w-full p-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition", children: "Agendar" })] })] }) }));
}
