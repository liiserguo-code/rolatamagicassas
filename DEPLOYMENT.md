# Guia de Deploy - LuxSpin

## Deploy na Vercel

### 1. Preparação

1. Crie uma conta na [Vercel](https://vercel.com)
2. Instale o Vercel CLI (opcional):
   ```bash
   npm install -g vercel
   ```

### 2. Deploy via GitHub

1. Faça push do código para um repositório GitHub
2. Na Vercel Dashboard, clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_APP_URL`: URL do seu app (ex: https://luxspin.vercel.app)
   - `DATABASE_URL`: URL do banco de dados (Railway)
   - `PAYMENT_API_KEY`: Chave da API de pagamento
   - `PAYMENT_SECRET`: Secret da API de pagamento
   - `PAYMENT_WEBHOOK_SECRET`: Secret para webhooks

5. Clique em "Deploy"

### 3. Deploy via CLI

```bash
# Login na Vercel
vercel login

# Deploy para produção
vercel --prod

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_APP_URL
vercel env add DATABASE_URL
vercel env add PAYMENT_API_KEY
vercel env add PAYMENT_SECRET
```

## Deploy do Banco de Dados no Railway

### 1. Criar Conta

1. Acesse [Railway](https://railway.app)
2. Crie uma conta gratuita

### 2. Criar Banco PostgreSQL

1. No Dashboard, clique em "New Project"
2. Selecione "Provision PostgreSQL"
3. Aguarde a criação do banco
4. Copie a `DATABASE_URL` da aba "Connect"

### 3. Configurar Variáveis

1. Adicione a `DATABASE_URL` no Vercel
2. Configure as variáveis de ambiente no Railway se necessário

## Configuração de Pagamento

### Mercado Pago

1. Crie uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obtenha suas credenciais:
   - Access Token
   - Public Key
3. Configure o webhook URL: `https://seu-dominio.vercel.app/api/deposit/callback`

### PagSeguro

1. Crie uma conta no [PagSeguro](https://pagseguro.uol.com.br)
2. Acesse a área de integração
3. Obtenha:
   - Email
   - Token
4. Configure a URL de notificação: `https://seu-dominio.vercel.app/api/deposit/callback`

## Pós-Deploy

### 1. Verificar Deploy

- Acesse a URL do seu app
- Teste o registro de usuário
- Teste o sistema de depósito
- Verifique os logs no Vercel Dashboard

### 2. Configurar Domínio Customizado (Opcional)

1. Na Vercel, vá em Settings > Domains
2. Adicione seu domínio
3. Configure os DNS records conforme instruções
4. Aguarde propagação (até 48h)

### 3. Monitoramento

- **Vercel**: Logs automáticos em tempo real no Dashboard
- **Railway**: Logs do banco de dados na aba "Logs"
- **Sentry** (opcional): Para tracking de erros

## Troubleshooting

### Erro de Build

```bash
# Limpar cache e reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro de Conexão com Banco

- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco está ativo no Railway
- Teste a conexão localmente primeiro

### Webhooks não funcionam

- Verifique se a URL está correta
- Confirme que o endpoint está acessível publicamente
- Revise os logs da API de pagamento

## Custos Estimados

- **Vercel**: Grátis para hobby (100GB bandwidth/mês)
- **Railway**: Grátis até $5/mês de uso
- **Total**: R$0 - R$50/mês (dependendo do tráfego)

## Suporte

Para problemas, verifique:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Next.js Docs](https://nextjs.org/docs)
