import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BUCKET = 'sermon-outlines';

export interface SermonFolder {
  id: string;
  title: string;
  display_order: number;
  created_at: string;
}

export interface SermonFile {
  id: string;
  folder_id: string;
  file_path: string;
  title: string | null;
  display_order: number;
  created_at: string;
}

export interface SermonFolderWithCount extends SermonFolder {
  fileCount: number;
}

export const useSermonFolders = () => {
  return useQuery({
    queryKey: ['sermon-folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sermon_outline_folders')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as SermonFolder[];
    },
  });
};

export const useSermonFiles = (folderId?: string) => {
  return useQuery({
    queryKey: ['sermon-files', folderId],
    queryFn: async () => {
      let query = supabase
        .from('sermon_outline_files')
        .select('*')
        .order('display_order', { ascending: true });
      if (folderId) query = query.eq('folder_id', folderId);
      const { data, error } = await query;
      if (error) throw error;
      return data as SermonFile[];
    },
  });
};

export const useFoldersWithFileCount = () => {
  return useQuery({
    queryKey: ['sermon-folders-with-count'],
    queryFn: async () => {
      const { data: folders, error: foldersError } = await supabase
        .from('sermon_outline_folders')
        .select('*')
        .order('display_order', { ascending: true });
      if (foldersError) throw foldersError;

      const { data: files, error: filesError } = await supabase
        .from('sermon_outline_files')
        .select('folder_id');
      if (filesError) throw filesError;

      const countMap = (files || []).reduce((acc: Record<string, number>, row) => {
        acc[row.folder_id] = (acc[row.folder_id] || 0) + 1;
        return acc;
      }, {});

      return (folders || []).map((f) => ({
        ...f,
        fileCount: countMap[f.id] || 0,
      })) as SermonFolderWithCount[];
    },
  });
};

export const useCreateSermonFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; display_order?: number }) => {
      const { data: row, error } = await supabase
        .from('sermon_outline_folders')
        .insert({ title: data.title, display_order: data.display_order ?? 0 })
        .select()
        .single();
      if (error) throw error;
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-folders'] });
      queryClient.invalidateQueries({ queryKey: ['sermon-folders-with-count'] });
      toast.success('Pasta criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar pasta.'),
  });
};

export const useUpdateSermonFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      display_order,
    }: {
      id: string;
      title?: string;
      display_order?: number;
    }) => {
      const payload: { title?: string; display_order?: number } = {};
      if (title !== undefined) payload.title = title;
      if (display_order !== undefined) payload.display_order = display_order;
      const { data, error } = await supabase
        .from('sermon_outline_folders')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-folders'] });
      queryClient.invalidateQueries({ queryKey: ['sermon-folders-with-count'] });
      toast.success('Pasta atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar pasta.'),
  });
};

export const useDeleteSermonFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      const { data: files, error: fetchError } = await supabase
        .from('sermon_outline_files')
        .select('file_path')
        .eq('folder_id', folderId);
      if (fetchError) throw fetchError;
      if (files?.length) {
        const paths = files.map((f) => f.file_path);
        await supabase.storage.from(BUCKET).remove(paths);
      }
      const { error: deleteError } = await supabase
        .from('sermon_outline_folders')
        .delete()
        .eq('id', folderId);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-folders'] });
      queryClient.invalidateQueries({ queryKey: ['sermon-files'] });
      queryClient.invalidateQueries({ queryKey: ['sermon-folders-with-count'] });
      toast.success('Pasta excluída.');
    },
    onError: () => toast.error('Erro ao excluir pasta.'),
  });
};

export const useUploadSermonFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      folderId,
      file,
      title,
    }: {
      folderId: string;
      file: File;
      title?: string;
    }) => {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Apenas arquivos PDF são permitidos.');
      }
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `${folderId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('sermon_outline_files')
        .insert({
          folder_id: folderId,
          file_path: path,
          title: title || null,
          display_order: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as SermonFile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sermon-files', variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ['sermon-folders-with-count'] });
      toast.success('PDF enviado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao enviar PDF.'),
  });
};

export const useDeleteSermonFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file_path }: { id: string; file_path: string }) => {
      await supabase.storage.from(BUCKET).remove([file_path]);
      const { error } = await supabase.from('sermon_outline_files').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-files'] });
      queryClient.invalidateQueries({ queryKey: ['sermon-folders-with-count'] });
      toast.success('Arquivo excluído.');
    },
    onError: () => toast.error('Erro ao excluir arquivo.'),
  });
};

export function getSermonFileUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
