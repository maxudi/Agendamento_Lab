import { useEffect, useState } from "react"
import { supabase, Agendamento } from "../lib/supabase"

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  async function fetchAgendamentos() {
    const { data } = await supabase.from("agendamentos").select("*").order("data", { ascending: true })
    setAgendamentos(data || [])
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">Dashboard de Agendamentos</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Data</th>
            <th className="p-2">Disciplina</th>
            <th className="p-2">Laboratório</th>
            <th className="p-2">Turno</th>
            <th className="p-2">Alunos</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((a) => (
            <tr key={a.id} className="border-b hover:bg-gray-100">
              <td className="p-2">{a.data}</td>
              <td className="p-2">{a.disciplina}</td>
              <td className="p-2">{a.laboratorio}</td>
              <td className="p-2">{a.turno}</td>
              <td className="p-2">{a.quantidade_alunos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
