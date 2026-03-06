import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Upload, Loader2, Pencil, FileText, Download } from 'lucide-react';
import {
  useSermonFolders,
  useSermonFiles,
  useCreateSermonFolder,
  useUpdateSermonFolder,
  useDeleteSermonFolder,
  useUploadSermonFile,
  useDeleteSermonFile,
  getSermonFileUrl,
  type SermonFolder,
  type SermonFile,
} from '@/hooks/useEsbocos';

const Esbocos = () => {
  const { data: folders, isLoading: loadingFolders } = useSermonFolders();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { data: files, isLoading: loadingFiles } = useSermonFiles(selectedFolderId || undefined);
  const createFolder = useCreateSermonFolder();
  const updateFolder = useUpdateSermonFolder();
  const deleteFolder = useDeleteSermonFolder();
  const uploadFile = useUploadSermonFile();
  const deleteFile = useDeleteSermonFile();

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [editFolder, setEditFolder] = useState<SermonFolder | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<SermonFolder | null>(null);
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<SermonFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFolder.mutateAsync({ title: newFolderTitle });
    setFolderDialogOpen(false);
    setNewFolderTitle('');
  };

  const openEditFolder = (folder: SermonFolder) => {
    setEditFolder(folder);
    setEditTitle(folder.title);
    setEditOrder(folder.display_order);
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFolder) return;
    await updateFolder.mutateAsync({
      id: editFolder.id,
      title: editTitle,
      display_order: editOrder,
    });
    setEditFolder(null);
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderConfirm) return;
    await deleteFolder.mutateAsync(deleteFolderConfirm.id);
    setDeleteFolderConfirm(null);
    if (selectedFolderId === deleteFolderConfirm.id) setSelectedFolderId(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolderId) return;
    try {
      await uploadFile.mutateAsync({ folderId: selectedFolderId, file });
    } catch (_) {
      // toast in hook
    }
    e.target.value = '';
  };

  const handleDeleteFile = async () => {
    if (!deleteFileConfirm) return;
    await deleteFile.mutateAsync({ id: deleteFileConfirm.id, file_path: deleteFileConfirm.file_path });
    setDeleteFileConfirm(null);
  };

  const selectedFolder = folders?.find((f) => f.id === selectedFolderId);

  return (
    <AdminLayout title="Esboços de pregação">
      <div className="mb-6">
        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova pasta (tema)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova pasta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-title">Título do tema *</Label>
                <Input
                  id="folder-title"
                  required
                  value={newFolderTitle}
                  onChange={(e) => setNewFolderTitle(e.target.value)}
                  placeholder="Ex: Fé, Amor, Esperança"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createFolder.isPending}>
                Criar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Pastas (temas)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingFolders ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : folders?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma pasta criada.</p>
              ) : (
                folders?.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between gap-2 rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedFolderId === folder.id ? 'bg-primary/20' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <span className="font-medium truncate flex-1">{folder.title}</span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFolder(folder);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteFolderConfirm(folder);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedFolder ? selectedFolder.title : 'Selecione uma pasta'}
              </CardTitle>
              {selectedFolderId && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadFile.isPending}
                  >
                    {uploadFile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Enviar PDF
                  </Button>
                </>
              )}
            </CardHeader>
            <CardContent>
              {!selectedFolderId ? (
                <p className="text-center text-muted-foreground py-8">
                  Selecione uma pasta para ver e gerenciar os arquivos PDF.
                </p>
              ) : loadingFiles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !files?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum PDF nesta pasta. Envie um arquivo PDF.
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">
                          {file.title || file.file_path.split('/').pop() || 'PDF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={getSermonFileUrl(file.file_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                        >
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="h-4 w-4" />
                            Baixar
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteFileConfirm(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit folder dialog */}
      <Dialog open={!!editFolder} onOpenChange={(open) => !open && setEditFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pasta</DialogTitle>
          </DialogHeader>
          {editFolder && (
            <form onSubmit={handleUpdateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Ordem de exibição</Label>
                <Input
                  id="edit-order"
                  type="number"
                  min={0}
                  value={editOrder}
                  onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditFolder(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateFolder.isPending}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete folder confirm */}
      <AlertDialog open={!!deleteFolderConfirm} onOpenChange={(open) => !open && setDeleteFolderConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta &quot;{deleteFolderConfirm?.title}&quot; e todos os PDFs
              dentro dela? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete file confirm */}
      <AlertDialog open={!!deleteFileConfirm} onOpenChange={(open) => !open && setDeleteFileConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este PDF?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Esbocos;
