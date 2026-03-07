

## Diagnóstico

A tabela `installment_payments` **não existe** no banco de dados — nenhuma migração a criou. O código frontend (`useInstallments.tsx`, `MinhasInscricoes.tsx`) já está implementado corretamente, mas todas as queries retornam erro 404 silenciosamente, fazendo com que a lista de parcelas nunca apareça.

Além disso, o bucket `installment-proofs` (usado para upload de comprovantes de parcelas) também não existe no storage.

## Plano

### 1. Criar migração SQL

Criar a tabela `installment_payments` e o bucket `installment-proofs`:

```sql
CREATE TABLE public.installment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_date date,
  proof_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;

-- Políticas: admins veem tudo, usuários veem suas próprias parcelas
CREATE POLICY "Admins can manage installments"
  ON public.installment_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own installments"
  ON public.installment_payments FOR SELECT TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM public.registrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own installments"
  ON public.installment_payments FOR UPDATE TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM public.registrations WHERE user_id = auth.uid()
    )
  );

-- Bucket para comprovantes de parcelas
INSERT INTO storage.buckets (id, name, public) VALUES ('installment-proofs', 'installment-proofs', true);

CREATE POLICY "Anyone can view installment proofs"
  ON storage.objects FOR SELECT USING (bucket_id = 'installment-proofs');

CREATE POLICY "Authenticated users can upload installment proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'installment-proofs');
```

### 2. Nenhuma alteração de código necessária

O frontend já está completo — o problema é exclusivamente a ausência da tabela e do bucket.

