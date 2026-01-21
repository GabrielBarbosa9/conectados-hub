import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useGalleryAlbums, useGalleryPhotos, useCreateAlbum, useDeleteAlbum, useUploadPhoto, useDeletePhoto } from '@/hooks/useGallery';

const Galeria = () => {
  const { data: albums, isLoading: loadingAlbums } = useGalleryAlbums();
  const { data: photos, isLoading: loadingPhotos } = useGalleryPhotos();
  const createAlbum = useCreateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAlbum.mutateAsync({
      title: albumTitle,
      description: null,
      event_id: null,
      cover_photo_url: null,
      display_order: 0,
    });
    setIsAlbumOpen(false);
    setAlbumTitle('');
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (confirm('Tem certeza que deseja excluir este álbum e todas as suas fotos?')) {
      await deleteAlbum.mutateAsync(albumId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedAlbumId) return;

    for (const file of Array.from(files)) {
      await uploadPhoto.mutateAsync({ file, albumId: selectedAlbumId });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      await deletePhoto.mutateAsync({ photoId, photoUrl });
    }
  };

  const albumPhotos = photos?.filter(p => p.album_id === selectedAlbumId) || [];

  return (
    <AdminLayout title="Galeria">
      <div className="mb-6">
        <Dialog open={isAlbumOpen} onOpenChange={setIsAlbumOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Álbum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Álbum</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  required
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Criar Álbum</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Albums List */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Álbuns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingAlbums ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : albums?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum álbum criado.</p>
              ) : (
                albums?.map((album) => (
                  <div
                    key={album.id}
                    className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedAlbumId === album.id ? 'bg-primary/20' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedAlbumId(album.id)}
                  >
                    <span className="font-medium">{album.title}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photos Grid */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedAlbumId ? 'Fotos do Álbum' : 'Selecione um Álbum'}
              </CardTitle>
              {selectedAlbumId && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPhoto.isPending}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadPhoto.isPending ? 'Enviando...' : 'Upload'}
                  </Button>
                </>
              )}
            </CardHeader>
            <CardContent>
              {!selectedAlbumId ? (
                <p className="text-center text-muted-foreground py-8">
                  Selecione um álbum para ver e gerenciar as fotos.
                </p>
              ) : loadingPhotos ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : albumPhotos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma foto neste álbum. Faça upload para adicionar.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {albumPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Foto'}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-2 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Galeria;
