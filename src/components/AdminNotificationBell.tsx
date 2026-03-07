import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAdminNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
} from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const AdminNotificationBell = () => {
  const { data: notifications = [], isLoading } = useAdminNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="text-sm font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllRead.mutate()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-accent/50',
                  !n.is_read && 'bg-accent/20'
                )}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                }}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationBell;
