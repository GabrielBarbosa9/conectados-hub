import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Migrate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test connection with public key
      const supabase = createClient(
        'https://tmwfsourehntmddrywtm.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtd2Zzb3VyZWhudG1kZHJ5d3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDQ3NDIsImV4cCI6MjA4NDUyMDc0Mn0.gLgJxtT6syg8jdGAOxzEWlooASCsEyUjqo4hhbx8AdY'
      );

      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .limit(1);

      if (error) {
        toast.error('Erro na conexão com o banco de dados');
        console.error('Connection error:', error);
      } else {
        toast.success('Conexão testada com sucesso!');
        console.log('Connection test result:', data);
        
        // Check if columns already exist by trying to select them
        try {
          const { data: testColumns, error: columnError } = await supabase
            .from('events')
            .select('accepts_credit_card, accepts_installments, max_installments')
            .limit(1);
          
          if (!columnError) {
            setMigrationStatus('success');
            toast.success('✅ Migração já foi executada! Campos já existem.');
          } else {
            setMigrationStatus('pending');
            toast.info('⚠️ Migração necessária. Execute o SQL manualmente.');
          }
        } catch (testErr) {
          setMigrationStatus('pending');
          toast.info('⚠️ Migração necessária. Execute o SQL manualmente.');
        }
      }
      
    } catch (err) {
      console.error('Test error:', err);
      toast.error('Erro ao testar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const copySQL = () => {
    const sql = `ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS accepts_credit_card BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepts_installments BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_installments INTEGER DEFAULT 1;`;
    
    navigator.clipboard.writeText(sql);
    toast.success('SQL copiado para a área de transferência!');
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Database Migration - Eventos
            {migrationStatus === 'success' && (
              <span className="text-green-500">✅</span>
            )}
            {migrationStatus === 'error' && (
              <span className="text-red-500">❌</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para corrigir o erro na criação de eventos, precisamos adicionar 3 campos à tabela events.
          </p>
          
          {migrationStatus === 'pending' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Migração Necessária
              </p>
              <p className="text-sm text-yellow-700">
                Os campos para pagamento com cartão de crédito ainda não existem na tabela.
              </p>
            </div>
          )}

          {migrationStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-medium text-green-800 mb-2">
                ✅ Migração Concluída
              </p>
              <p className="text-sm text-green-700">
                Todos os campos necessários já existem na tabela. Você pode criar eventos normalmente.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Testar Conexão e Verificar Status'}
            </Button>
            
            <Button 
              onClick={copySQL} 
              variant="outline"
              className="w-full"
            >
              📋 Copiar SQL para Área de Transferência
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded text-xs">
            <strong>SQL para executar no Supabase:</strong>
            <pre className="mt-2 whitespace-pre-wrap font-mono cursor-pointer hover:bg-muted-80 p-2 rounded" onClick={copySQL}>
              {`ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS accepts_credit_card BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepts_installments BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_installments INTEGER DEFAULT 1;`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-800 mb-2">
              📋 Instruções Completas:
            </p>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Acesse: <a href="https://tmwfsourehntmddrywtm.supabase.co" target="_blank" className="underline">https://tmwfsourehntmddrywtm.supabase.co</a></li>
              <li>Vá para SQL Editor</li>
              <li>Cole o SQL acima (ou clique em "Copiar SQL")</li>
              <li>Execute o SQL</li>
              <li>Volte aqui e clique em "Testar Conexão"</li>
              <li>Teste criar um evento no sistema</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Migrate;
