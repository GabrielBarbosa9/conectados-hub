import { useState } from 'react';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { useFoldersWithFileCount, useSermonFiles, getSermonFileUrl } from '@/hooks/useEsbocos';
import { Button } from '@/components/ui/button';

const Esbocos = () => {
  const { data: folders, isLoading: loadingFolders } = useFoldersWithFileCount();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { data: files, isLoading: loadingFiles } = useSermonFiles(selectedFolderId || undefined);

  const selectedFolder = folders?.find((f) => f.id === selectedFolderId);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {selectedFolderId && (
          <button
            onClick={() => setSelectedFolderId(null)}
            className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para os temas
          </button>
        )}

        <h1 className="mb-8 text-4xl font-bold">
          {selectedFolder ? selectedFolder.title : 'Esboços de pregação'}
        </h1>

        {!selectedFolderId && (
          <>
            {loadingFolders ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : !folders?.length ? (
              <p className="text-center text-muted-foreground">Nenhum tema disponível ainda.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:ring-2 hover:ring-primary/20"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{folder.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {folder.fileCount} {folder.fileCount === 1 ? 'arquivo' : 'arquivos'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selectedFolderId && (
          <>
            {loadingFiles ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : !files?.length ? (
              <p className="text-center text-muted-foreground">Nenhum arquivo neste tema ainda.</p>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">
                        {file.title || file.file_path.split('/').pop() || 'PDF'}
                      </span>
                    </div>
                    <a
                      href={getSermonFileUrl(file.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Esbocos;
