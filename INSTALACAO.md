# 🚀 Guia Rápido de Instalação

## Passo 1: Configurar o Banco de Dados

1. Acesse o SQL Editor do Supabase
2. Execute o script completo do arquivo `database-setup.sql`
3. Adicione dados de exemplo ao cronograma (opcional, mas recomendado):

```sql
-- Exemplo de dados para cronograma_aulas
insert into cronograma_aulas (disciplina, professor, dia_semana, curso, turno, horario, local) values
  ('Programação Web', 'Prof. João Silva', 'Seg', 'Sistemas de Informação', 'N', '19:00:00', 'C30'),
  ('Programação Web', 'Prof. João Silva', 'Qua', 'Sistemas de Informação', 'N', '19:00:00', 'C30'),
  ('Banco de Dados', 'Prof. Maria Santos', 'Ter', 'Sistemas de Informação', 'N', '19:00:00', 'C31'),
  ('Banco de Dados', 'Prof. Maria Santos', 'Qui', 'Sistemas de Informação', 'N', '19:00:00', 'C31'),
  ('Algoritmos', 'Prof. Pedro Costa', 'Qua', 'Ciência da Computação', 'M', '08:00:00', 'C32'),
  ('Algoritmos', 'Prof. Pedro Costa', 'Sex', 'Ciência da Computação', 'M', '08:00:00', 'C32'),
  ('Redes de Computadores', 'Prof. Ana Oliveira', 'Qui', 'Sistemas de Informação', 'N', '19:00:00', 'C33'),
  ('Engenharia de Software', 'Prof. Carlos Lima', 'Sex', 'Engenharia de Software', 'V', '14:00:00', 'C34a'),
  ('Inteligência Artificial', 'Prof. Ana Oliveira', 'Seg', 'Ciência da Computação', 'V', '14:00:00', 'C34b'),
  ('Estrutura de Dados', 'Prof. João Silva', 'Sex', 'Ciência da Computação', 'M', '08:00:00', 'C35');
```

> **📌 Nota:** O laboratório C34 foi dividido em **C34a** (19 alunos) e **C34b** (21 alunos)

## Passo 2: Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` existe e contém suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Passo 3: Executar o Sistema

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🎯 Testando o Sistema Novo

1. Acesse `http://localhost:5173`
2. Clique em "🆕 Novo Agendamento"
3. **Selecione datas no calendário** (ex: uma Segunda e uma Quarta)
4. Observe que o select de Professor mostra apenas professores com aulas nesses dias
5. Selecione um professor (ex: Prof. João Silva)
6. Observe que o select de Disciplina mostra apenas disciplinas desse professor nesses dias
7. Preencha os demais campos
8. Selecione um laboratório (ex: C30)
9. Clique em "Confirmar Agendamento"
10. Acesse "📊 Dashboard" para ver o agendamento criado

## 🔍 Entendendo os Filtros Dinâmicos

### Exemplo Prático:

Se você inserir os dados de exemplo acima e selecionar:
- **Datas**: 17/02/2026 (Segunda) e 19/02/2026 (Quarta)

O sistema irá:
1. Identificar que Segunda = "Seg" e Quarta = "Qua"
2. Filtrar professores que têm aulas em "Seg" OU "Qua"
3. Mostrar: Prof. João Silva (tem aula Seg e Qua), Prof. Pedro Costa (tem aula Qua)

Se você selecionar **Prof. João Silva**:
- Mostrará apenas: "Programação Web" e "Estrutura de Dados"
- Porque são as disciplinas que ele ministra em Seg ou Qua

## 📊 Recursos Principais

✅ **Filtros inteligentes** - Baseados em dia da semana
✅ **Múltiplas datas** - Agende vários dias de uma vez
✅ **Detecção de conflitos** - Evita agendamentos duplicados
✅ **Interface visual** - Seleção de laboratórios em grid
✅ **Dashboard completo** - Com busca e filtros
✅ **Responsivo** - Funciona em mobile e desktop

## 🐛 Problemas Comuns

### "Nenhum professor disponível"
- **Causa**: Não há dados na tabela `cronograma_aulas` ou você não selecionou datas
- **Solução**: Selecione datas no calendário e certifique-se de ter dados no cronograma

### "Selecione o professor primeiro"
- **Causa**: Você precisa selecionar um professor antes de escolher a disciplina
- **Solução**: Selecione um professor no campo acima

### Erro ao salvar
- **Causa**: Tabela não foi criada ou RLS não está configurado
- **Solução**: Execute o script `database-setup.sql` completo no Supabase

## 📝 Compatibilidade

O sistema mantém **total compatibilidade** com o formulário antigo:
- Acesse "📝 Formulário Antigo" para usar o sistema original
- Acesse "📈 Dashboard Antigo" para ver agendamentos antigos
- As duas tabelas (`agendamentos` e `agendamentos_laboratorio`) funcionam independentemente

## 🎓 Próximos Passos

1. Adicione seus professores e disciplinas reais no cronograma
2. Teste o fluxo completo de agendamento
3. Configure permissões de usuário (opcional)
4. Personalize os laboratórios e capacidades conforme necessário

## 🏫 Laboratórios Configurados

Os laboratórios estão definidos em `src/components/NovoAgendamentoForm.tsx`:

| Laboratório | Capacidade | Observação |
|------------|-----------|------------|
| C30 | 8 alunos | - |
| C31 | 35 alunos | - |
| C32 | 40 alunos | - |
| C33 | 19 alunos | - |
| **C34a** | **19 alunos** | Subdivisão A |
| **C34b** | **21 alunos** | Subdivisão B |
| C35 | 30 alunos | - |
| C36 | 42 alunos | - |
| C37 | 71 alunos | - |
| C38 | 37 alunos | - |
| C39 | 6 alunos | - |

> ⚠️ **Importante:** O laboratório C34 foi dividido em dois (C34a e C34b) para melhor gestão de espaço.

## 📚 Documentação Adicional

- `README.md` - Documentação geral do projeto
- `NOVO_SISTEMA.md` - Detalhes técnicos do novo sistema
- `database-setup.sql` - Script completo do banco de dados
