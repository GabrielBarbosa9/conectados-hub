import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings, Settings } from '@/hooks/useSettings';
import { Save } from 'lucide-react';

const Configuracoes = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [formData, setFormData] = useState<Settings>({
    whatsapp_number: '',
    whatsapp_message: '',
    instagram_url: '',
    pix_key: '',
    pix_name: '',
    about_text: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Configure o botão de contato do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Número (com DDD, sem espaços)</Label>
              <Input
                id="whatsapp_number"
                placeholder="5511999999999"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_message">Mensagem padrão</Label>
              <Input
                id="whatsapp_message"
                value={formData.whatsapp_message}
                onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Instagram</CardTitle>
            <CardDescription>Link do perfil do Instagram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="instagram_url">URL do Instagram</Label>
              <Input
                id="instagram_url"
                placeholder="https://instagram.com/seuusuario"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>PIX para Doações</CardTitle>
            <CardDescription>Configure a chave PIX exibida na página de doações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input
                id="pix_key"
                value={formData.pix_key}
                onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix_name">Nome do beneficiário</Label>
              <Input
                id="pix_name"
                value={formData.pix_name}
                onChange={(e) => setFormData({ ...formData, pix_name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Textos do Site</CardTitle>
            <CardDescription>Personalize os textos exibidos no site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="about_text">Texto sobre o ministério (exibido na home)</Label>
              <Textarea
                id="about_text"
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2" disabled={updateSettings.isPending}>
          <Save className="h-4 w-4" />
          {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </form>
    </AdminLayout>
  );
};

export default Configuracoes;
