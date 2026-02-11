# Deploy no Easypanel

## Configuração do Projeto

### 1. Configurações Gerais
- **Nome**: agendamento-labs
- **Tipo**: App
- **Source**: GitHub Repository

### 2. Build Settings
```
Build Command: npm run build
Start Command: npm run start
Port: 3000
```

### 3. Variáveis de Ambiente Obrigatórias

No Easypanel, adicione as seguintes variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_anonima_aqui
```

**⚠️ IMPORTANTE**: Substitua os valores acima pelas credenciais reais do seu projeto Supabase.

### 4. Localizar suas Credenciais Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → Anon/Public → `VITE_SUPABASE_ANON_KEY`

### 5. Node Version
- **Node.js**: 20.x ou superior

### 6. Passos no Easypanel

1. **Criar novo App**
   - Selecione "GitHub" como fonte
   - Conecte seu repositório: `maxudi/Agendamento_Lab`

2. **Configurar Build**
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Port: `3000`

3. **Adicionar Variáveis de Ambiente**
   - Vá em "Environment Variables"
   - Adicione `VITE_SUPABASE_URL`
   - Adicione `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar

### 7. Verificação

Após o deploy, verifique se:
- [ ] A tela de login aparece corretamente
- [ ] É possível fazer login com admin/admin123
- [ ] O dashboard carrega os dados do Supabase
- [ ] É possível criar novos agendamentos

### Troubleshooting

**Erro: "Cannot find module 'vite'"**
- Verifique se o `npm install` foi executado antes do build

**Erro: "supabaseUrl is required"**
- As variáveis de ambiente não foram configuradas corretamente
- Certifique-se de que `VITE_SUPABASE_URL` está definida

**Página em branco após deploy**
- Verifique o console do navegador (F12)
- Confirme se as variáveis de ambiente estão corretas
- Verifique se o Supabase está acessível

**Erro 404 ao navegar entre páginas**
- Certifique-se de que o `base: './'` está configurado no `vite.config.ts`
- Configure fallback para SPA no servidor

## Credenciais de Acesso

Após o deploy, use as credenciais documentadas em `CREDENCIAIS.md`:

- **Admin**: admin / admin123
- **Professores**: consulte `CREDENCIAIS.md`

## Atualizações

Para atualizar o sistema após mudanças no código:

1. Faça commit e push para o GitHub
2. No Easypanel, vá em "Deployments"
3. Clique em "Redeploy" ou configure auto-deploy

## Suporte

Se encontrar problemas:
1. Verifique os logs no Easypanel
2. Confirme as variáveis de ambiente
3. Teste localmente com `npm run build && npm run start`
