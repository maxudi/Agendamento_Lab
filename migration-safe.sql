-- Script seguro de migração - só adiciona colunas se não existirem
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna status (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agendamentos_laboratorio' AND column_name='status') THEN
        ALTER TABLE agendamentos_laboratorio 
        ADD COLUMN status text DEFAULT 'pendente';
        
        ALTER TABLE agendamentos_laboratorio 
        ADD CONSTRAINT agendamentos_laboratorio_status_check 
        CHECK (status IN ('pendente', 'aprovado', 'negado'));
    END IF;
END $$;

-- Adicionar coluna justificativa_negacao (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agendamentos_laboratorio' AND column_name='justificativa_negacao') THEN
        ALTER TABLE agendamentos_laboratorio 
        ADD COLUMN justificativa_negacao text;
    END IF;
END $$;

-- Adicionar coluna validado_por (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agendamentos_laboratorio' AND column_name='validado_por') THEN
        ALTER TABLE agendamentos_laboratorio 
        ADD COLUMN validado_por text;
    END IF;
END $$;

-- Adicionar coluna validado_em (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agendamentos_laboratorio' AND column_name='validado_em') THEN
        ALTER TABLE agendamentos_laboratorio 
        ADD COLUMN validado_em timestamp with time zone;
    END IF;
END $$;

-- Criar índice (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE tablename='agendamentos_laboratorio' AND indexname='idx_agendamentos_status') THEN
        CREATE INDEX idx_agendamentos_status ON agendamentos_laboratorio(status);
    END IF;
END $$;

-- Adicionar comentários às colunas
COMMENT ON COLUMN agendamentos_laboratorio.status IS 'Status do agendamento: pendente (aguardando validação), aprovado (confirmado), negado (recusado)';
COMMENT ON COLUMN agendamentos_laboratorio.justificativa_negacao IS 'Justificativa obrigatória quando o agendamento é negado pelo administrador';
COMMENT ON COLUMN agendamentos_laboratorio.validado_por IS 'Nome do administrador que validou o agendamento';
COMMENT ON COLUMN agendamentos_laboratorio.validado_em IS 'Data e hora da validação do agendamento';

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'agendamentos_laboratorio'
  AND column_name IN ('status', 'justificativa_negacao', 'validado_por', 'validado_em')
ORDER BY ordinal_position;
