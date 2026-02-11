# 🎓 Sistema de Agendamento de Laboratórios
## Universidade Anhanguera

<div align="center">
  <img src="https://logodownload.org/wp-content/uploads/2018/07/universidade-anhanguera-logo-1.png" alt="Universidade Anhanguera" width="300">
</div>

Sistema web completo para gerenciamento e agendamento de laboratórios de informática, desenvolvido com React, TypeScript, Vite e Supabase.

## ✨ Funcionalidades Principais

### 📅 Novo Agendamento
- ✅ Seleção de múltiplas datas com calendário visual
- ✅ Filtros dinâmicos baseados no cronograma de aulas
- ✅ Validação de conflitos automática
- ✅ Interface moderna com cards coloridos
- ✅ Suporte a 11 laboratórios (C30-C39, incluindo C34a e C34b)

### 📊 Dashboard de Agendamentos
- ✅ Cards coloridos com gradientes por laboratório
- ✅ Seções com informações detalhadas
- ✅ Filtros por turno (Matutino, Vespertino, Noturno)
- ✅ Busca em tempo real
- ✅ Estatísticas por turno

### 📆 Gerenciamento de Cronograma
- ✅ CRUD completo de cronograma de aulas
- ✅ Modais com Headless UI
- ✅ Filtros avançados
- ✅ Notificações com React Hot Toast

## 🏫 Laboratórios Configurados

```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:
```env
*React 19.2.0** - Framework JavaScript
- **TypeScript 5.9.3** - Tipagem estática
- **Vite 7.3.1** - Build tool e dev server ultrarrápido
- **Tailwind CSS 4.1.18** - Framework CSS com nova sintaxe
- **Supabase 2.95.3** - Backend as a Service (PostgreSQL)
- **React Day Picker 9.13.2** - Seletor de múltiplas datas
- **Lucide React 0.563.0** - Ícones modernos
- **Headless UI 2.2.9** - Componentes acessíveis
- **React Hot Toast 2.6.0** - Sistema de notificações

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

## ⚙️ Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/maxudi/Agendamento_Lab.git
cd Agendamento_Lab
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Configure o banco de dados no Supabase**
   
   Execute o seguinte SQL no editor SQL do Supabase:
   ```sql
   create table agendamentos (
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
   ```

## 🎯 Como Usar

1. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   
   O sistema estará disponível em `http://localhost:5173`

2. **Compilar para produção**
   ```bash
   npm run build
   ```

3. **Visualizar build de produção**
   ```bash
   npm run preview
   ```

## 📱 Estrutura do Projeto

```
agendamento-labs/
├── src/
│   ├── components/
│   │   ├── AgendamentoForm.tsx  # Formulário de agendamento
│   │   └── Dashboard.tsx         # Dashboard de visualização
│   ├── lib/
│   │   └── supabase.ts          # Configuração do Supabase
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Estilos globais
├── .env                          # Variáveis de ambiente (não versionado)
├── .env.example                  # Exemplo de variáveis de ambiente
└── package.json
```

## 📝 Uso do Sistema

### Novo Agendamento
1. Clique na aba "Novo Agendamento"
2. Preencha os campos: disciplina, laboratório, etc.
3. Selecione uma ou múltiplas datas no calendário
4. Escolha o turno (Matutino, Vespertino ou Noturno)
5. Clique em "Agendar"

### Dashboard
1. Clique na aba "Dashboard"
2. Visualize todos os agendamentos ordenados por data
3. Veja informações como disciplina, laboratório, turno e número de alunos

## ✅ Status do Sistema

O sistema foi verificado e está **funcionando corretamente**:
- ✅ Compilação sem erros
- ✅ Servidor de desenvolvimento rodando
- ✅ Todas as dependências instaladas
- ✅ TypeScript configurado corretamente
- ✅ Integração com Supabase configurada

## � Deploy em Produção

## 🚀 Deploy em Produção

### Docker (Recomendado para Auto-hospedagem)

**Build e execução rápida:**
```bash
docker-compose up -d
```

Veja instruções completas em **[DEPLOY.md](DEPLOY.md)**.

### Easypanel

Este projeto está pronto para deploy no Easypanel. Consulte o guia completo em **[DEPLOY.md](DEPLOY.md)** para instruções detalhadas.

**Resumo rápido:**
1. Build Command: `npm run build`
2. Start Command: `npm run start`
3. Port: `3000`
4. Variáveis de ambiente necessárias:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Outras Plataformas

O projeto também pode ser deployado em:
- **Docker**: Use o Dockerfile incluído
- **Vercel**: Conecte o repositório GitHub
- **Netlify**: Configure build com `npm run build` e pasta `dist`
- **Railway**: Adicione as variáveis de ambiente
- **Render**: Configure `npm run build` && `npm run start`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run start` - Serve o build de produção (para deploy)
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
