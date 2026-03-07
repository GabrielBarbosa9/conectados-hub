

## Diagnóstico

O problema **não é no INSERT** — a política de inserção permite qualquer pessoa. O erro ocorre porque o código faz `.insert().select().single()` após a inserção, e a política de **SELECT** na tabela `registrations` só permite acesso a admins:

```
"Admins can view all registrations" → USING (has_role(auth.uid(), 'admin'))
```

Quando um usuário não-admin se inscreve, o INSERT funciona, mas o `.select()` encadeado falha com o erro de RLS.

## Plano

### 1. Adicionar política RLS de SELECT para registros próprios

Criar uma migração SQL que adicione uma política permitindo que usuários autenticados vejam suas próprias inscrições:

```sql
CREATE POLICY "Users can view own registrations"
ON public.registrations
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
```

### 2. Atualizar o código do hook para não depender do SELECT após INSERT

Alterar `useCreateRegistration` em `src/hooks/useRegistrations.tsx` para remover `.select().single()` do insert — já que inscrições podem ser feitas por usuários anônimos (sem `user_id`), o SELECT pode falhar mesmo com a nova política. O insert retornará sucesso sem precisar ler o registro de volta.

Ambas as mudanças serão aplicadas para cobrir os dois cenários (usuário logado e visitante anônimo).

