# Instruções para Executar Migração SQL

## Problema
O erro "Erro ao criar evento" ocorre porque a tabela `events` não possui os campos necessários para pagamento com cartão de crédito e parcelamento.

## Solução
Execute o seguinte SQL no painel do Supabase:

### Passo 1: Acessar Painel
1. Abra: https://tmwfsourehntmddrywtm.supabase.co
2. Faça login com suas credenciais

### Passo 2: SQL Editor
1. No menu lateral, clique em "SQL Editor"
2. Clique em "New query" para criar uma nova consulta

### Passo 3: Executar SQL
Copie e cole o código abaixo:

```sql
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS accepts_credit_card BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepts_installments BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_installments INTEGER DEFAULT 1;
```

### Passo 4: Verificar
1. Clique em "Run" para executar
2. Aguarde a mensagem de sucesso
3. Teste criar um novo evento no sistema

## Campos Adicionados
- `accepts_credit_card`: Booleano para aceitar cartão de crédito presencial
- `accepts_installments`: Booleano para aceitar parcelamento  
- `max_installments`: Número máximo de parcelas (padrão: 1)

## Após Migração
O formulário de criação de eventos funcionará corretamente com todas as opções de pagamento.

## Teste
1. Acesse: http://localhost:8080/admin/login
2. Faça login como administrador
3. Vá para Eventos
4. Crie um novo evento com opções de pagamento
5. Verifique se não aparece mais o erro

## Arquivos Modificados
- `src/integrations/supabase/types.ts` - Tipos atualizados
- `supabase/migrations/20260306165256_add_payment_fields_to_events.sql` - Migração criada
