# Sistema de Agendamento de Laboratórios - Novo Sistema

## 🎯 Visão Geral

Este é o novo sistema de agendamento de laboratórios com filtros dinâmicos e inteligentes, integrado ao cronograma de aulas dos professores.

## 🔄 Mudanças Principais

### Novas Tabelas

1. **cronograma_aulas** - Armazena o cronograma de aulas dos professores
2. **agendamentos_laboratorio** - Nova tabela de agendamentos com recursos avançados

### Funcionalidades do Novo Formulário

#### 1️⃣ Filtros Dinâmicos e Inteligentes

- **Filtro por Data/Dia da Semana**: Ao selecionar datas no calendário, o sistema automaticamente:
  - Identifica os dias da semana (Seg, Ter, Qua, Qui, Sex)
  - Filtra apenas professores que têm aulas nesses dias
  - Exibe apenas disciplinas que ocorrem nos dias selecionados

- **Filtro Professor → Disciplina**: Ao selecionar um professor:
  - Mostra apenas disciplinas ministradas por ele
  - Considera também os dias da semana selecionados
  - Atualiza automaticamente a lista de opções

#### 2️⃣ Seleção Múltipla de Datas

- Calendário interativo com seleção múltipla
- Visualização dos dias da semana selecionados
- Desabilita datas passadas automaticamente
- Todas as datas são armazenadas como array no banco

#### 3️⃣ Laboratórios em Grid Visual

- Interface com cards clicáveis para cada laboratório (C30 a C39)
- Exibição da capacidade de cada laboratório
- Feedback visual ao selecionar

#### 4️⃣ Seções Organizadas

**Identificação:**
- Professor (filtrado dinamicamente)
- Disciplina (filtrada por professor e dias)
- E-mail de contato
- Telefone

**Agendamento:**
- Turno (Matutino, Vespertino, Noturno)
- Quantidade de alunos
- Laboratório (seleção visual)

**Requisitos Técnicos:**
- Prática a ser realizada
- Software a ser utilizado
- Necessita internet (checkbox)
- Uso de kit multimídia (checkbox)
- Observações gerais

#### 5️⃣ Validação e Conflitos

- Verifica conflitos antes de salvar
- Alerta se o laboratório já está reservado para:
  - Mesma data
  - Mesmo turno
  - Mesmo laboratório

## 📊 Dashboard Atualizado

O novo dashboard (DashboardNovo) oferece:

- **Busca em tempo real** por professor, disciplina ou laboratório
- **Cards expandidos** com todas as informações
- **Visualização de múltiplas datas** por agendamento
- **Badges visuais** para requisitos técnicos
- **Filtro e contador** de agendamentos
- **Atualização manual** dos dados
- **Exclusão de agendamentos**

## 🗄️ Estrutura do Banco de Dados

### Tabela: cronograma_aulas

```sql
- id: SERIAL PRIMARY KEY
- disciplina: TEXT
- professor: TEXT
- dia_semana: TEXT (Seg, Ter, Qua, Qui, Sex, Sáb, Dom)
- curso: TEXT
- turno: CHAR(1) (M, V, N)
- horario: TIME
- local: TEXT
- created_at: TIMESTAMP
```

### Tabela: agendamentos_laboratorio

```sql
- id: UUID (gerado automaticamente)
- professor_id: TEXT
- disciplina_id: TEXT
- email_contato: TEXT
- telefone: TEXT
- datas_selecionadas: DATE[] (array de datas)
- turno: TEXT (Matutino, Vespertino, Noturno)
- laboratorio_id: TEXT (C30-C39)
- pratica_realizada: TEXT
- software_utilizado: TEXT
- necessita_internet: BOOLEAN
- quantidade_alunos: INTEGER
- observacao: TEXT
- uso_kit_multimidia: BOOLEAN
- created_at: TIMESTAMP
```

## 🚀 Como Usar

### 1. Configurar o Banco de Dados

Execute o script SQL completo em `database-setup.sql` no SQL Editor do Supabase.

### 2. Adicionar Dados ao Cronograma

Você precisa popular a tabela `cronograma_aulas` com os dados dos professores e suas aulas. Exemplo:

```sql
insert into cronograma_aulas (disciplina, professor, dia_semana, curso, turno, horario, local) values
  ('Programação Web', 'Prof. João Silva', 'Seg', 'Sistemas de Informação', 'N', '19:00:00', 'C30'),
  ('Banco de Dados', 'Prof. Maria Santos', 'Ter', 'Sistemas de Informação', 'N', '19:00:00', 'C31');
```

### 3. Usar o Sistema

1. Acesse o sistema através do navegador
2. Clique em "🆕 Novo Agendamento" na navegação
3. Selecione uma ou mais datas no calendário
4. Escolha o professor (filtrado pelos dias selecionados)
5. Escolha a disciplina (filtrada pelo professor)
6. Preencha os demais campos
7. Selecione o laboratório
8. Clique em "Confirmar Agendamento"

### 4. Visualizar Agendamentos

- Clique em "📊 Dashboard" para ver todos os agendamentos
- Use a busca para filtrar por professor, disciplina ou laboratório
- Clique em "Excluir" para remover um agendamento

## 🔧 Componentes Criados

- **NovoAgendamentoForm.tsx** - Formulário com filtros dinâmicos
- **DashboardNovo.tsx** - Dashboard completo com busca e visualização

## 🎨 Design

- Interface moderna com Tailwind CSS
- Gradientes e sombras para profundidade
- Cards interativos e responsivos
- Feedback visual em todas as ações
- Ícones SVG para melhor usabilidade

## 🔒 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso configuradas
- Validação de dados no frontend e backend

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (melhor experiência)
- Tablets
- Smartphones

## 🔄 Compatibilidade

O sistema mantém compatibilidade com o formulário antigo:
- Tabela `agendamentos` ainda existe
- Componentes antigos disponíveis nas abas "Formulário Antigo" e "Dashboard Antigo"

## 🎓 Fluxo de Uso Ideal

1. **Administrador** popula a tabela `cronograma_aulas` com os horários dos professores
2. **Professor** acessa o sistema e seleciona as datas desejadas
3. Sistema **filtra automaticamente** suas disciplinas baseado no dia da semana
4. Professor preenche os requisitos técnicos
5. Sistema **valida conflitos** antes de confirmar
6. Agendamento é **salvo com sucesso**
7. Pode ser **visualizado no dashboard** por todos

## 🐛 Troubleshooting

### Problema: Nenhum professor aparece
**Solução**: Verifique se há dados na tabela `cronograma_aulas` e se você selecionou datas no calendário.

### Problema: Erro ao salvar
**Solução**: Verifique se todas as tabelas foram criadas corretamente e se as políticas RLS estão ativas.

### Problema: Conflito detectado
**Solução**: Escolha outro laboratório ou outro turno para a mesma data.

## 📝 Próximas Melhorias

- [ ] Sistema de autenticação de usuários
- [ ] Notificações por e-mail
- [ ] Exportação de relatórios
- [ ] Calendário visual mensal
- [ ] Edição de agendamentos existentes
- [ ] Histórico de alterações
