

## Plano: Adicionar Data/Hora de Encerramento nos Eventos

### 1. Migração de Banco de Dados

Adicionar duas colunas na tabela `events`:
- `end_date` (date, nullable) — data de encerramento
- `end_time` (time, nullable) — horário de encerramento

### 2. Atualizar Hooks e Interfaces

**Arquivo:** `src/hooks/useEvents.tsx`
- Adicionar `end_date` e `end_time` nas interfaces `Event` e `CreateEventData`

### 3. Admin: Formulário de Evento

**Arquivo:** `src/pages/admin/Eventos.tsx`
- Adicionar campos "Data de Encerramento" e "Horário de Encerramento" no formulário, ao lado dos campos de data/hora existentes
- Renomear os labels atuais para "Data de Início" e "Horário de Início"
- Incluir os novos campos no `formData`, `resetForm`, `openEditDialog` e `handleSubmit`

### 4. Admin: Exibição na Lista

Na listagem de eventos no admin, exibir o período completo quando houver data de encerramento:
- "06/03/2026 às 15:00 — 08/03/2026 às 18:00"

### 5. Página Pública de Eventos

**Arquivo:** `src/pages/Eventos.tsx`
- No `EventCard`, exibir o período quando `end_date` existir:
  - "06 de março às 15:00 — 08 de março às 18:00"
- Se não tiver `end_date`, manter o formato atual com data única

### Resumo de Alterações

| Arquivo | Alteração |
|---------|-----------|
| Migration SQL | `end_date` e `end_time` na tabela `events` |
| `src/hooks/useEvents.tsx` | Interfaces atualizadas |
| `src/pages/admin/Eventos.tsx` | Campos de início/encerramento no formulário + exibição na lista |
| `src/pages/Eventos.tsx` | Exibição do período no card público |

