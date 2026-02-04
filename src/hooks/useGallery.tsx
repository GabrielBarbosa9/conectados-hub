import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  cover_photo_url: string | null;
  display_order: number;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export const useGalleryAlbums = () => {
  return useQuery({
    queryKey: ['gallery-albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as GalleryAlbum[];
    },
  });
};

export const useGalleryPhotos = (albumId?: string) => {
  return useQuery({
    queryKey: ['gallery-photos', albumId],
    queryFn: async () => {
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (albumId) {
        query = query.eq('album_id', albumId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as GalleryPhoto[];
    },
  });
};

export const useRecentPhotos = (limit: number = 6) => {
  return useQuery({
    queryKey: ['recent-photos', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as GalleryPhoto[];
    },
  });
};

export const useAlbumWithPhotoCount = () => {
  return useQuery({
    queryKey: ['albums-with-count'],
    queryFn: async () => {
      const { data: albums, error: albumsError } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (albumsError) throw albumsError;
      
      const { data: photos, error: photosError } = await supabase
        .from('gallery_photos')
        .select('album_id');
      
      if (photosError) throw photosError;
      
      const countMap = photos.reduce((acc, photo) => {
        acc[photo.album_id] = (acc[photo.album_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return (albums as GalleryAlbum[]).map(album => ({
        ...album,
        photoCount: countMap[album.id] || 0,
      }));
    },
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (albumData: Omit<GalleryAlbum, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .insert(albumData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
      toast.success('Álbum criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar álbum');
      console.error('Error creating album:', error);
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...albumData }: Partial<GalleryAlbum> & { id: string }) => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .update(albumData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
      toast.success('Álbum atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar álbum');
      console.error('Error updating album:', error);
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (albumId: string) => {
      const { error } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', albumId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
      toast.success('Álbum excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir álbum');
      console.error('Error deleting album:', error);
    },
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, albumId, caption }: { file: File; albumId: string; caption?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${albumId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);
      
      const { data, error } = await supabase
        .from('gallery_photos')
        .insert({
          album_id: albumId,
          photo_url: publicUrl,
          caption,
          display_order: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', variables.albumId] });
      toast.success('Foto enviada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar foto');
      console.error('Error uploading photo:', error);
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ photoId, photoUrl }: { photoId: string; photoUrl: string }) => {
      // Extract file path from URL
      const urlParts = photoUrl.split('/gallery/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('gallery').remove([filePath]);
      }
      
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
      toast.success('Foto excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir foto');
      console.error('Error deleting photo:', error);
    },
  });
};
