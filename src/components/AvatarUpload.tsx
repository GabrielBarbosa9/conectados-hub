import { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadAvatar } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const iconClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const AvatarUpload = ({ userId, currentUrl, size = 'md' }: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadAvatar = useUploadAvatar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 5MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    uploadAvatar.mutate(
      { userId, file },
      { onError: () => setPreview(null) }
    );
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-muted border-2 border-border cursor-pointer group`}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Foto de perfil"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <User className={`${iconClasses[size]} text-muted-foreground`} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploadAvatar.isPending ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploadAvatar.isPending}
      >
        {uploadAvatar.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            {displayUrl ? 'Alterar foto' : 'Adicionar foto'}
          </>
        )}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">Opcional · máx. 5MB · JPG, PNG, WebP</p>
    </div>
  );
};

export default AvatarUpload;
