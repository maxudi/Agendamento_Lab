# 📅 Página de Gerenciamento de Cronograma

## ✨ Visão Geral

Página completa para gerenciar a tabela `cronograma_aulas` com design premium e interface intuitiva.

## 🎨 Recursos de UI

### 1. **Header com Gradiente**
- Título com ícone de calendário
- Botão "+ Novo Cronograma" em destaque
- Design responsivo

### 2. **Sistema de Filtros**
```tsx
- 🔍 Busca por disciplina, professor ou curso
- 🎯 Filtro por turno (Matutino/Vespertino/Noturno)
- Filtros em tempo real
```

### 3. **Estatísticas Visuais**
Cards coloridos mostrando:
- Total de aulas cadastradas
- ☀️ Aulas no período Matutino (amarelo/laranja)
- 🌤️ Aulas no período Vespertino (laranja/rosa)
- 🌙 Aulas no período Noturno (índigo/roxo)

### 4. **Tabela Elegante**
```
Colunas:
├── Dia da Semana (com ícone de calendário)
├── Disciplina (com ícone de livro)
├── Professor (com ícone de usuário)
├── Curso (com ícone de formatura)
├── Turno (badge colorido com emoji)
├── Horário (formato monospace)
├── Local (com ícone de mapa)
└── Ações (3 botões)
```

**Ações por linha:**
- 👁️ **Visualizar** (azul) - Modo somente leitura
- ✏️ **Editar** (amarelo) - Atualizar dados
- 🗑️ **Excluir** (vermelho) - Com confirmação

### 5. **Modais Reutilizáveis** (Headless UI)

#### Modal de Formulário
- **Criar:** Campos em branco, professor e disciplina podem ser digitados
- **Editar:** Selects inteligentes (professor -> disciplina)
- **Visualizar:** Campos em modo read-only

**Campos do formulário:**
```tsx
{
  professor: string      // 👤 Select/Input
  disciplina: string     // 📚 Select/Input (dependente de professor)
  dia_semana: string     // 📅 Select (Segunda a Sábado)
  curso: string          // 🎓 Input text
  turno: string          // ☀️ Select (Matutino/Vespertino/Noturno)
  horario: string        // 🕐 Input text (ex: 14:00-16:00)
  local: string          // 📍 Input text (ex: Laboratório 1)
}
```

#### Modal de Confirmação de Exclusão
- ⚠️ Ícone de alerta em vermelho
- Exibe disciplina e professor a ser excluído
- Botões: "Cancelar" (cinza) e "Sim, Excluir" (vermelho)
- **NÃO usa** `window.confirm()` ou `alert()`

### 6. **Sistema de Notificações** (React Hot Toast)
```tsx
✅ "Cronograma criado com sucesso! 🎉"
✅ "Cronograma atualizado com sucesso! ✅"
✅ "Cronograma excluído com sucesso! 🗑️"
❌ "Erro ao salvar cronograma"
```

## 🔧 Tecnologias Utilizadas

### Bibliotecas
- **Lucide React** - Ícones modernos e consistentes
- **Headless UI** - Modais acessíveis (Dialog, Transition)
- **React Hot Toast** - Notificações elegantes
- **Tailwind CSS** - Estilização com gradientes e animações

### Recursos CSS
```css
- Gradientes coloridos (indigo → purple → pink)
- Animações suaves de entrada/saída
- Backdrop blur nos modais
- Hover effects em botões e linhas da tabela
- Badges coloridos por turno
- Scrollbar customizada
```

## 📊 Lógica de Negócio

### 1. **Read (Buscar Dados)**
```tsx
fetchCronogramas()
├── Busca todos os registros
├── Ordena por dia_semana
└── Atualiza estado automaticamente
```

### 2. **Create (Criar Novo)**
```tsx
onCreate()
├── Professor e disciplina podem ser digitados
├── Insert no Supabase
├── Toast de sucesso
├── Atualiza lista
└── Fecha modal
```

### 3. **Update (Editar)**
```tsx
onEdit()
├── Carrega dados no formulário
├── Selects inteligentes (Professor → Disciplina)
├── Update no Supabase
├── Toast de sucesso
└── Atualiza lista
```

### 4. **Delete (Excluir)**
```tsx
onDelete()
├── Abre modal de confirmação personalizado
├── Exibe dados a serem excluídos
├── Aguarda confirmação do usuário
├── Delete no Supabase
├── Toast de sucesso
└── Atualiza lista
```

### 5. **Selects Inteligentes**
```tsx
useEffect #1: Busca professores únicos ao carregar
useEffect #2: Quando professor é selecionado
              └── Busca disciplinas daquele professor
              └── Popula o select de disciplina

Fluxo no modo Editar:
1. Usuário seleciona Professor
2. Sistema busca disciplinas do professor
3. Select de Disciplina é habilitado
4. Usuário escolhe a disciplina
```

## 🎯 Estados do Componente

```tsx
// Dados
const [cronogramas, setCronogramas] = useState<CronogramaAula[]>([])
const [loading, setLoading] = useState(true)

// Filtros
const [searchTerm, setSearchTerm] = useState('')
const [filterTurno, setFilterTurno] = useState('all')

// Modais
const [isModalOpen, setIsModalOpen] = useState(false)
const [modalMode, setModalMode] = useState<'create'|'edit'|'view'|null>(null)
const [currentRecord, setCurrentRecord] = useState<CronogramaAula | null>(null)

// Exclusão
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
const [recordToDelete, setRecordToDelete] = useState<CronogramaAula | null>(null)

// Formulário
const [formData, setFormData] = useState<CronogramaAula>({...})

// Selects dinâmicos
const [professores, setProfessores] = useState<string[]>([])
const [disciplinas, setDisciplinas] = useState<string[]>([])
```

## 🎨 Paleta de Cores

### Turnos
- **Matutino:** `from-amber-400 to-yellow-500` ☀️
- **Vespertino:** `from-orange-400 to-pink-500` 🌤️
- **Noturno:** `from-indigo-500 to-purple-600` 🌙

### Ícones por Campo
- 📅 Calendar - Dia da semana
- 📚 Book - Disciplina
- 👤 User - Professor
- 🎓 GraduationCap - Curso
- ☀️ Sun - Turno
- 🕐 Clock - Horário
- 📍 MapPin - Local

### Botões de Ação
- **Visualizar:** `bg-blue-50 text-blue-600 hover:bg-blue-100`
- **Editar:** `bg-amber-50 text-amber-600 hover:bg-amber-100`
- **Excluir:** `bg-red-50 text-red-600 hover:bg-red-100`

## 📱 Responsividade

```css
- Tabela com overflow-x-auto
- Grid responsivo (1 coluna mobile, 2 colunas desktop)
- Cards de estatísticas adaptáveis
- Modal com max-w-3xl
- Sticky header com backdrop-blur
```

## 🚀 Como Usar

### 1. Abrir a Página
Clique em "**Gerenciar Cronograma**" no menu superior

### 2. Criar Novo Cronograma
1. Clique em "+ Novo Cronograma"
2. Preencha todos os campos
3. Digite professor e disciplina livremente
4. Clique em "Criar Cronograma"
5. Toast de confirmação aparece

### 3. Visualizar
1. Clique no ícone 👁️ (olho) em qualquer linha
2. Campos aparecem em modo somente leitura
3. Clique em "Fechar" para sair

### 4. Editar
1. Clique no ícone ✏️ (lápis) em qualquer linha
2. Selecione o professor no dropdown
3. Selecione a disciplina (filtrada pelo professor)
4. Edite outros campos conforme necessário
5. Clique em "Salvar Alterações"

### 5. Excluir
1. Clique no ícone 🗑️ (lixeira) em qualquer linha
2. Modal de confirmação aparece
3. Revise os dados a serem excluídos
4. Clique em "Sim, Excluir" para confirmar
5. Ou "Cancelar" para abortar

### 6. Filtrar e Buscar
- **Busca:** Digite no campo de busca (disciplina, professor ou curso)
- **Filtro:** Selecione um turno específico no dropdown
- **Limpar:** Apague o texto ou selecione "Todos os Turnos"

## 🔥 Destaques de UX

### Animações
- ✨ Entrada suave dos modais (scale + fade)
- ✨ Hover effects em todos os botões
- ✨ Linhas da tabela com hover highlight
- ✨ Loading spinner durante requisições
- ✨ Transições suaves em todas as interações

### Feedback Visual
- 🎯 Toast notifications coloridos
- 🎯 Badges com gradientes por turno
- 🎯 Ícones contextual em cada campo
- 🎯 Estados hover/focus bem definidos
- 🎯 Estatísticas em cards coloridos

### Acessibilidade
- ♿ Modais com Headless UI (Dialog)
- ♿ Transitions com Fragment
- ♿ Labels descritivas
- ♿ Foco gerenciado corretamente
- ♿ Teclado-friendly

## 📦 Estrutura do Arquivo

```
CronogramaPage.tsx (1050+ linhas)
├── Imports e Interfaces
├── Estado e Hooks
├── Funções de CRUD
│   ├── fetchCronogramas()
│   ├── fetchProfessores()
│   ├── fetchDisciplinasByProfessor()
│   ├── handleSubmit()
│   └── handleDelete()
├── Helper Functions
│   ├── openModal()
│   ├── closeModal()
│   ├── openDeleteModal()
│   ├── getTurnoColor()
│   └── getTurnoIcon()
├── Render
│   ├── Header com gradiente
│   ├── Filtros (busca + turno)
│   ├── Cards de estatísticas
│   ├── Tabela de dados
│   ├── Modal de formulário
│   └── Modal de confirmação
└── Export
```

## 🎓 Conceitos Aplicados

1. **Componentização:** Modais reutilizáveis para Create/Edit/View
2. **Estados Complexos:** Múltiplos estados gerenciados com useState
3. **Side Effects:** useEffect para buscar dados dinamicamente
4. **Conditional Rendering:** Diferentes modos de modal
5. **Interação com API:** CRUD completo no Supabase
6. **UX Design:** Feedback visual, animações, confirmações
7. **Responsividade:** Mobile-first design
8. **Acessibilidade:** Headless UI + ARIA patterns

## 🌟 Diferenciais

✅ **Sem window.confirm()** - Modal personalizado  
✅ **Toast Notifications** - Feedback elegante  
✅ **Selects Inteligentes** - Professor → Disciplina  
✅ **Design Premium** - Gradientes e sombras  
✅ **Animações Suaves** - Transitions profissionais  
✅ **Ícones Consistentes** - Lucide React  
✅ **Filtros em Tempo Real** - Busca + turno  
✅ **Estatísticas Visuais** - Cards informativos  
✅ **Responsivo** - Funciona em todos os dispositivos  
✅ **Código Limpo** - TypeScript com tipos completos  

---

**Desenvolvido com ❤️ usando React, TypeScript, Tailwind CSS, Headless UI, Lucide React e React Hot Toast**
