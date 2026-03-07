

## Notificação ao Admin quando Comprovante é Enviado

### Contexto

Existem dois fluxos de envio de comprovante:
1. **Parcelas** (`useUploadInstallmentProof`) — upload para `installment-proofs`
2. **Pagamento integral** (durante inscrição em `Eventos.tsx`) — salva `payment_proof_url` na registration

Não existe nenhum sistema de notificação no projeto atualmente.

### Plano

#### 1. Criar tabela `admin_notifications` (migração SQL)

Tabela para armazenar notificações destinadas a admins:

```sql
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'payment_proof',
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: admins podem SELECT/UPDATE; INSERT liberado para authenticated (para que o próprio usuário crie a notificação ao enviar comprovante).

Habilitar realtime para atualização instantânea.

#### 2. Alterar `useUploadInstallmentProof` (parcelas)

Após o upload bem-sucedido, inserir um registro em `admin_notifications` com informações da parcela (número, valor, registration_id).

#### 3. Alterar fluxo de inscrição com comprovante (pagamento integral)

No `Eventos.tsx`, após a inscrição com `payment_proof_url`, inserir notificação similar.

#### 4. Criar hook `useAdminNotifications`

- Query com realtime subscription para buscar notificações não lidas
- Mutation para marcar como lida

#### 5. Adicionar ícone de sino no header do admin

No layout/header do painel admin, adicionar um botão com badge de contagem de não lidas e dropdown listando as notificações recentes. Ao clicar em uma notificação, marca como lida e pode navegar para a inscrição correspondente.

