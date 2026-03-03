import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useEventCustomFields, useCreateCustomField, useDeleteCustomField, EventCustomField } from '@/hooks/useEvents';

interface Props {
  eventId: string;
}

const EventCustomFieldsManager = ({ eventId }: Props) => {
  const { data: fields, isLoading } = useEventCustomFields(eventId);
  const createField = useCreateCustomField();
  const deleteField = useDeleteCustomField();
  const [isOpen, setIsOpen] = useState(false);
  const [fieldData, setFieldData] = useState({
    field_name: '',
    field_type: 'text',
    is_required: false,
    options: '',
  });

  const handleAdd = async () => {
    if (!fieldData.field_name.trim()) return;
    
    await createField.mutateAsync({
      event_id: eventId,
      field_name: fieldData.field_name,
      field_type: fieldData.field_type,
      is_required: fieldData.is_required,
      field_order: (fields?.length || 0) + 1,
      options: fieldData.field_type === 'select' && fieldData.options
        ? fieldData.options.split(',').map(o => o.trim())
        : null,
    });
    
    setFieldData({ field_name: '', field_type: 'text', is_required: false, options: '' });
    setIsOpen(false);
  };

  const handleDelete = async (fieldId: string) => {
    await deleteField.mutateAsync({ fieldId, eventId });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Campos Personalizados</Label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Campo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Campo *</Label>
                <Input
                  value={fieldData.field_name}
                  onChange={(e) => setFieldData({ ...fieldData, field_name: e.target.value })}
                  placeholder="Ex: CPF, Tamanho da Camiseta..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={fieldData.field_type} onValueChange={(v) => setFieldData({ ...fieldData, field_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {fieldData.field_type === 'select' && (
                <div className="space-y-2">
                  <Label>Opções (separadas por vírgula)</Label>
                  <Input
                    value={fieldData.options}
                    onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })}
                    placeholder="Opção 1, Opção 2, Opção 3"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={fieldData.is_required}
                  onCheckedChange={(checked) => setFieldData({ ...fieldData, is_required: checked })}
                />
                <Label>Obrigatório</Label>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!fieldData.field_name.trim()}>
                Adicionar Campo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : fields?.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum campo personalizado.</p>
      ) : (
        <div className="space-y-2">
          {fields?.map((field) => (
            <div key={field.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <span className="font-medium">{field.field_name}</span>
                <span className="ml-2 text-muted-foreground">
                  ({field.field_type}{field.is_required ? ', obrigatório' : ''})
                </span>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => handleDelete(field.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCustomFieldsManager;
