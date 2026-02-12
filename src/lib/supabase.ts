import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!')
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o sistema antigo
export interface Agendamento {
  id?: number
  disciplina: string
  laboratorio: string
  turno: string
  quantidade_alunos: string
  software: string
  observacao: string
  data: string
  created_at?: string
}

// Tipos para o novo sistema
export interface CronogramaAula {
  id: number
  disciplina: string
  professor: string
  dia_semana: string
  curso: string
  turno: 'N' | 'M' | 'V'
  horario: string
  local: string
}

export interface AgendamentoLaboratorio {
  id?: string
  professor_id: string
  disciplina_id: string
  email_contato: string
  telefone: string
  datas_selecionadas: string[]
  turno: string
  laboratorio_id: string
  pratica_realizada: string
  software_utilizado: string
  necessita_internet: boolean
  quantidade_alunos: number
  observacao: string
  uso_kit_multimidia: boolean
  status?: 'pendente' | 'aprovado' | 'negado'
  justificativa_negacao?: string
  validado_por?: string
  validado_em?: string
  created_at?: string
}

export interface Laboratorio {
  id: string
  nome: string
  capacidade: number
}
