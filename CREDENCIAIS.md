# 🔐 Credenciais de Acesso

## Sistema de Autenticação

O sistema agora possui controle de acesso com dois níveis de permissão:

### 👑 Administrador (Acesso Total)
**Permissões:**
- ✅ Criar novos agendamentos
- ✅ Visualizar dashboard
- ✅ **Gerenciar cronograma de aulas** (CRUD completo)
- ✅ **Excluir agendamentos** do dashboard

**Credenciais:**
- **Usuário:** `admin`
- **Senha:** `admin123`

---

### 👨‍🏫 Professor (Acesso Limitado)
**Permissões:**
- ✅ Criar novos agendamentos
- ✅ Visualizar dashboard
- ❌ Não pode gerenciar cronograma
- ❌ Não pode excluir agendamentos

**Credenciais dos Professores:**

| Nome               | Usuário          | Senha       |
|--------------------|------------------|-------------|
| Prof. João Silva   | `joao.silva`     | `silva123`  |
| Prof. Maria Santos | `maria.santos`   | `santos123` |
| Prof. Pedro Costa  | `pedro.costa`    | `costa123`  |
| Prof. Ana Oliveira | `ana.oliveira`   | `oliveira123` |
| Prof. Carlos Lima  | `carlos.lima`    | `lima123`   |

---

## 📝 Padrão de Senha

As senhas dos professores seguem o padrão:
```
[último sobrenome] + 123
```

**Exemplos:**
- Prof. João **Silva** → senha: `silva123`
- Prof. Maria **Santos** → senha: `santos123`
- Prof. Ana **Oliveira** → senha: `oliveira123`

---

## 🔒 Recursos Protegidos

### Totalmente Protegido (Apenas Admin)
1. **Gerenciar Cronograma**
   - Adicionar novas aulas
   - Editar aulas existentes
   - Excluir aulas do cronograma

2. **Excluir Agendamentos**
   - Botão de exclusão no dashboard
   - Apenas visível para administradores

### Acessível a Todos (Professores e Admin)
1. **Novo Agendamento**
   - Criar agendamentos de laboratórios
   - Selecionar datas, turno e laboratório

2. **Dashboard**
   - Visualizar todos os agendamentos
   - Filtrar por turno e buscar
   - Professores **não podem excluir**

---

## 💾 Persistência de Sessão

- A sessão é salva no **localStorage** do navegador
- O usuário permanece logado mesmo após recarregar a página
- Para fazer logout, clique no botão **"Sair"** no header

---

## 🔧 Para Desenvolvedores

### Adicionar Novo Usuário

Edite o arquivo `src/contexts/AuthContext.tsx`:

```typescript
const USERS = [
  // ... usuários existentes
  { 
    username: 'novo.usuario', 
    password: 'senha123', 
    role: 'professor', // ou 'admin'
    fullName: 'Prof. Novo Usuario' 
  },
]
```

### Alterar Senhas

Para alterar a senha de um usuário, edite o array `USERS` no mesmo arquivo.

---

## ⚠️ Nota de Segurança

**IMPORTANTE:** Este é um sistema de autenticação **básico** para fins educacionais e testes.

Para **produção**, recomenda-se:
- Implementar Supabase Auth com hash de senhas
- Usar JWT tokens
- Adicionar roles e permissions no banco de dados
- Implementar rate limiting
- Adicionar 2FA (autenticação de dois fatores)

---

## 🎯 Fluxo de Autenticação

1. Usuário acessa o sistema
2. É redirecionado para página de login
3. Digite usuário e senha
4. Sistema valida credenciais
5. Se válido:
   - Salva sessão no localStorage
   - Redireciona para sistema
   - Mostra nome e tipo de usuário no header
6. Usuário pode fazer logout a qualquer momento

---

**Desenvolvido para:** Universidade Anhanguera  
**Sistema de Agendamento de Laboratórios**
