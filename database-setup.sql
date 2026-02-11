-- ========================================
-- Script SQL para Configuração do Banco de Dados
-- Sistema de Agendamento de Laboratórios
-- ========================================

-- ========================================
-- TABELA: cronograma_aulas
-- Armazena o cronograma de aulas dos professores
-- ========================================
create table if not exists cronograma_aulas (
  id serial primary key,
  disciplina text not null,
  professor text not null,
  dia_semana text not null check (dia_semana in ('Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom')),
  curso text not null,
  turno char(1) not null check (turno in ('M', 'V', 'N')),
  horario time not null,
  local text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para melhorar performance
create index if not exists idx_cronograma_professor on cronograma_aulas(professor);
create index if not exists idx_cronograma_dia_semana on cronograma_aulas(dia_semana);
create index if not exists idx_cronograma_turno on cronograma_aulas(turno);

-- ========================================
-- TABELA: agendamentos_laboratorio
-- Armazena os agendamentos de laboratório
-- ========================================
create table if not exists agendamentos_laboratorio (
  id uuid primary key default gen_random_uuid(),
  professor_id text not null,
  disciplina_id text not null,
  email_contato text,
  telefone text,
  datas_selecionadas date[] not null,
  turno text not null check (turno in ('Matutino', 'Vespertino', 'Noturno')),
  laboratorio_id text not null,
  pratica_realizada text,
  software_utilizado text,
  necessita_internet boolean default false,
  quantidade_alunos integer not null check (quantidade_alunos > 0),
  observacao text,
  uso_kit_multimidia boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para melhorar performance
create index if not exists idx_agendamentos_lab_professor on agendamentos_laboratorio(professor_id);
create index if not exists idx_agendamentos_lab_laboratorio on agendamentos_laboratorio(laboratorio_id);
create index if not exists idx_agendamentos_lab_turno on agendamentos_laboratorio(turno);
create index if not exists idx_agendamentos_lab_datas on agendamentos_laboratorio using gin(datas_selecionadas);

-- ========================================
-- TABELA: agendamentos (Sistema Antigo)
-- Mantida para compatibilidade
-- ========================================
create table if not exists agendamentos (
  id bigint primary key generated always as identity,
  disciplina text not null,
  laboratorio text not null,
  turno text not null,
  quantidade_alunos text not null,
  software text,
  observacao text,
  data date not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para melhorar performance
create index if not exists idx_agendamentos_data on agendamentos(data);
create index if not exists idx_agendamentos_laboratorio on agendamentos(laboratorio);
create index if not exists idx_agendamentos_turno on agendamentos(turno);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS nas tabelas
alter table cronograma_aulas enable row level security;
alter table agendamentos_laboratorio enable row level security;
alter table agendamentos enable row level security;

-- ========================================
-- POLÍTICAS DE SEGURANÇA: cronograma_aulas
-- ========================================

-- Permitir leitura pública
create policy "Permitir leitura pública de cronograma"
  on cronograma_aulas for select
  using (true);

-- Permitir inserção pública
create policy "Permitir inserção pública de cronograma"
  on cronograma_aulas for insert
  with check (true);

-- Permitir atualização pública
create policy "Permitir atualização pública de cronograma"
  on cronograma_aulas for update
  using (true);

-- Permitir exclusão pública
create policy "Permitir exclusão pública de cronograma"
  on cronograma_aulas for delete
  using (true);

-- ========================================
-- POLÍTICAS DE SEGURANÇA: agendamentos_laboratorio
-- ========================================

-- Permitir leitura pública
create policy "Permitir leitura pública de agendamentos laboratorio"
  on agendamentos_laboratorio for select
  using (true);

-- Permitir inserção pública
create policy "Permitir inserção pública de agendamentos laboratorio"
  on agendamentos_laboratorio for insert
  with check (true);

-- Permitir atualização pública
create policy "Permitir atualização pública de agendamentos laboratorio"
  on agendamentos_laboratorio for update
  using (true);

-- Permitir exclusão pública
create policy "Permitir exclusão pública de agendamentos laboratorio"
  on agendamentos_laboratorio for delete
  using (true);

-- ========================================
-- POLÍTICAS DE SEGURANÇA: agendamentos
-- ========================================

-- Permitir leitura pública
create policy "Permitir leitura pública de agendamentos"
  on agendamentos for select
  using (true);

-- Permitir inserção pública
create policy "Permitir inserção pública de agendamentos"
  on agendamentos for insert
  with check (true);

-- Permitir atualização pública
create policy "Permitir atualização pública de agendamentos"
  on agendamentos for update
  using (true);

-- Permitir exclusão pública
create policy "Permitir exclusão pública de agendamentos"
  on agendamentos for delete
  using (true);

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- Descomente para inserir dados de teste
-- ========================================

/*
-- Exemplo de dados para cronograma_aulas
insert into cronograma_aulas (disciplina, professor, dia_semana, curso, turno, horario, local) values
  ('Programação Web', 'Prof. João Silva', 'Seg', 'Sistemas de Informação', 'N', '19:00:00', 'C30'),
  ('Banco de Dados', 'Prof. Maria Santos', 'Ter', 'Sistemas de Informação', 'N', '19:00:00', 'C31'),
  ('Algoritmos', 'Prof. Pedro Costa', 'Qua', 'Ciência da Computação', 'M', '08:00:00', 'C32'),
  ('Redes de Computadores', 'Prof. Ana Oliveira', 'Qui', 'Sistemas de Informação', 'N', '19:00:00', 'C33'),
  ('Engenharia de Software', 'Prof. Carlos Lima', 'Sex', 'Engenharia de Software', 'V', '14:00:00', 'C34a'),
  ('Inteligência Artificial', 'Prof. Ana Oliveira', 'Seg', 'Ciência da Computação', 'V', '14:00:00', 'C34b');

-- NOTA: Laboratórios disponíveis e suas capacidades:
-- C30: 8 alunos  | C31: 35 alunos | C32: 40 alunos | C33: 19 alunos
-- C34a: 19 alunos | C34b: 21 alunos (C34 foi dividido em A e B)
-- C35: 30 alunos | C36: 42 alunos | C37: 71 alunos | C38: 37 alunos | C39: 6 alunos
*/
