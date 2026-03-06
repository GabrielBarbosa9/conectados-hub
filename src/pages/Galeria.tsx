import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Images } from 'lucide-react';
import { useAlbumWithPhotoCount, useGalleryPhotos } from '@/hooks/useGallery';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ThemeToggle } from '@/components/ThemeToggle';

const Galeria = () => {
  const { data: albums, isLoading: loadingAlbums } = useAlbumWithPhotoCount();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const { data: albumPhotos, isLoading: loadingPhotos } = useGalleryPhotos(selectedAlbumId || undefined);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const selectedAlbum = albums?.find(a => a.id === selectedAlbumId);

  return (
    <div className="min-h-screen bg-background px-4 py-8">

      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        {selectedAlbumId && (
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para álbuns
          </button>
        )}

        <h1 className="mb-8 text-4xl font-bold">
          {selectedAlbum ? selectedAlbum.title : 'Galeria'}
        </h1>

        {/* Albums View */}
        {!selectedAlbumId && (
          <>
            {loadingAlbums ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : albums?.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum álbum disponível ainda.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {albums?.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="group relative overflow-hidden rounded-xl bg-card text-left transition-all hover:ring-2 hover:ring-primary"
                  >
                    <AspectRatio ratio={16 / 9}>
                      {album.cover_photo_url ? (
                        <img
                          src={album.cover_photo_url}
                          alt={album.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Images className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-lg font-semibold text-white">{album.title}</h3>
                      <p className="text-sm text-white/70">
                        {album.photoCount} {album.photoCount === 1 ? 'foto' : 'fotos'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Photos View */}
        {selectedAlbumId && (
          <>
            {loadingPhotos ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : albumPhotos?.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhuma foto neste álbum ainda.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {albumPhotos?.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo.photo_url)}
                    className="group relative overflow-hidden rounded-lg bg-muted"
                  >
                    <AspectRatio ratio={1}>
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Foto do evento'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </AspectRatio>
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="text-sm text-white">{photo.caption}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Photo Lightbox */}
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
