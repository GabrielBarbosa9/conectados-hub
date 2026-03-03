

## Plano: Pagamento PIX na Inscrição + Gestão de Campos e Valores pelo Admin

### 1. Migração de Banco de Dados

Adicionar colunas na tabela `events`:

- `price` (numeric, nullable, default null) - valor do evento
- `payment_method` (text, nullable, default null) - ex: 'pix', 'free', 'pix_recorrente'
- `pix_key` (text, nullable) - chave PIX específica do evento (ou usa a global do settings)
- `n8n_webhook_url` (text, nullable) - URL do webhook N8N para cobrança recorrente via WhatsApp

Adicionar colunas na tabela `registrations`:

- `payment_status` (text, default 'pending') - 'pending', 'confirmed', 'free'
- `payment_proof_url` (text, nullable) - URL do comprovante enviado

### 2. Admin: Edição de Valores e Pagamento no Evento

**Arquivo:** `src/pages/admin/Eventos.tsx`

Adicionar ao formulário de criação/edição de evento:
- Campo "Valor" (numérico, R$)
- Select "Forma de Pagamento": Gratuito / PIX / PIX Recorrente
- Campo "Chave PIX do Evento" (opcional, usa a global se vazio)
- Campo "URL Webhook N8N" (aparece apenas quando "PIX Recorrente" selecionado)
- Texto explicativo sobre integração N8N

Atualizar hooks `useCreateEvent` e `useUpdateEvent` para incluir os novos campos.

### 3. Admin: Gestão de Campos Personalizados do Evento

**Novo componente:** `src/components/EventCustomFieldsManager.tsx`

Interface no admin para gerenciar campos de inscrição por evento:
- Lista de campos atuais com nome, tipo, obrigatoriedade
- Botão "Adicionar Campo" com dialog para: nome do campo, tipo (texto/número/select), obrigatório (sim/não), opções (para select)
- Botão para excluir campo existente
- Reordenação por drag ou setas

Usar os hooks existentes `useCreateCustomField` e `useDeleteCustomField` de `useEvents.tsx`.

Integrar este componente dentro do dialog de edição de evento em `admin/Eventos.tsx`, como uma aba ou seção separada.

### 4. Formulário de Inscrição Pública com PIX

**Arquivo:** `src/pages/Eventos.tsx`

Alterações no formulário de inscrição:
- Se o evento tem `price > 0` e `payment_method = 'pix'`: exibir valor, chave PIX (do evento ou global), botão copiar, e campo para upload do comprovante
- Se `payment_method = 'free'` ou `price` é null: fluxo atual sem pagamento
- Se `payment_method = 'pix_recorrente'`: exibir informação de que será cobrado mensalmente via WhatsApp após N8N processar
- Salvar `payment_status` como 'pending' (pix) ou 'free' (gratuito) na inscrição

### 5. Admin: Visualização de Status de Pagamento

**Arquivo:** `src/pages/admin/Inscricoes.tsx`

- Adicionar coluna "Pagamento" na tabela de inscritos
- Badge colorido: Pendente (amarelo), Confirmado (verde), Gratuito (cinza)
- Botão para admin confirmar pagamento manualmente
- Incluir status de pagamento na exportação CSV

### 6. Storage para Comprovantes

Usar o bucket `gallery` existente ou criar subpasta `payment-proofs/` para armazenar comprovantes de pagamento enviados pelos inscritos.

---

### Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| Migration SQL | Novos campos em `events` e `registrations` |
| `src/hooks/useEvents.tsx` | Atualizar interfaces e mutations com novos campos |
| `src/hooks/useRegistrations.tsx` | Adicionar `payment_status`, `payment_proof_url` |
| `src/pages/admin/Eventos.tsx` | Formulário com preço, pagamento, webhook N8N, campos personalizados |
| `src/components/EventCustomFieldsManager.tsx` | Novo - gestão de campos de inscrição |
| `src/pages/Eventos.tsx` | Fluxo de pagamento PIX no formulário público |
| `src/pages/admin/Inscricoes.tsx` | Coluna de status de pagamento + confirmação manual |

### Ordem de Implementação

1. Migração de banco (novos campos)
2. Atualizar hooks e interfaces TypeScript
3. Admin: formulário de evento com preço/pagamento/webhook
4. Admin: componente de gestão de campos personalizados
5. Formulário público com fluxo PIX
6. Admin: status de pagamento nas inscrições

