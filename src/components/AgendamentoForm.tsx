import { useState, FormEvent } from "react"
import { supabase, Agendamento } from "../lib/supabase"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export default function AgendamentoForm() {
  const [selectedDays, setSelectedDays] = useState<Date[]>([])
  const [form, setForm] = useState({
    disciplina: "",
    laboratorio: "",
    turno: "Noturno",
    quantidade_alunos: "",
    software: "",
    observacao: ""
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if(selectedDays.length === 0){
      alert("Selecione pelo menos uma data")
      return
    }

    for (const day of selectedDays) {
      const { data: conflito } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", day.toISOString().split('T')[0])
        .eq("laboratorio", form.laboratorio)
        .eq("turno", form.turno)

      if (conflito && conflito.length > 0) {
        alert(`Conflito no dia ${day.toLocaleDateString()}!`)
        return
      }

      await supabase.from("agendamentos").insert([
        {
          ...form,
          data: day.toISOString().split('T')[0]
        }
      ])
    }

    alert("Agendamento enviado com sucesso!")
    setSelectedDays([])
    setForm({
      disciplina: "",
      laboratorio: "",
      turno: "Noturno",
      quantidade_alunos: "",
      software: "",
      observacao: ""
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">Agendamento de Laboratório</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Disciplina"
            className="w-full p-3 border rounded-xl"
            value={form.disciplina}
            onChange={e => setForm({...form, disciplina:e.target.value})}
          />

          <input
            type="text"
            placeholder="Laboratório"
            className="w-full p-3 border rounded-xl"
            value={form.laboratorio}
            onChange={e => setForm({...form, laboratorio:e.target.value})}
          />

          <div>
            <label className="block mb-2 font-semibold">Selecione as datas:</label>
            <DayPicker
              mode="multiple"
              selected={selectedDays}
              onSelect={(days) => setSelectedDays(days || [])}
              className="border rounded-xl p-4"
            />
          </div>

          <select
            className="w-full p-3 border rounded-xl"
            value={form.turno}
            onChange={e => setForm({...form, turno:e.target.value})}
          >
            <option>Matutino</option>
            <option>Vespertino</option>
            <option>Noturno</option>
          </select>

          <input
            type="number"
            placeholder="Quantidade de alunos"
            className="w-full p-3 border rounded-xl"
            value={form.quantidade_alunos}
            onChange={e => setForm({...form, quantidade_alunos:e.target.value})}
          />

          <textarea
            placeholder="Software a ser utilizado"
            className="w-full p-3 border rounded-xl"
            value={form.software}
            onChange={e => setForm({...form, software:e.target.value})}
          />

          <textarea
            placeholder="Observações"
            className="w-full p-3 border rounded-xl"
            value={form.observacao}
            onChange={e => setForm({...form, observacao:e.target.value})}
          />

          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Agendar
          </button>
        </form>
      </div>
    </div>
  )
}
