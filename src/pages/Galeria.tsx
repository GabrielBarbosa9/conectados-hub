import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useGalleryAlbums, useGalleryPhotos } from '@/hooks/useGallery';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Galeria = () => {
  const { data: albums, isLoading: loadingAlbums } = useGalleryAlbums();
  const { data: photos, isLoading: loadingPhotos } = useGalleryPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isLoading = loadingAlbums || loadingPhotos;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        
        <h1 className="mb-8 text-4xl font-bold">Galeria</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : photos?.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhuma foto disponível ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photos?.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo.photo_url)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Foto do evento'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm text-white">{photo.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute -top-10 right-0 text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Foto ampliada"
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Galeria;
