import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { notificationsService, Notification } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getUserNotifications();
      // Ensure data is an array
      const notificationList = Array.isArray(data) ? data : (data as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).data || [];
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.is_read).length);
    } catch (error) {
      // Silently ignore - no need to spam console on polling failures
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Refresh every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'new_user': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'user_login': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'booking_confirmed': 
      case 'booking_confirmation':
      case 'booking_update':
      case 'trip_approved':
      case 'listing_approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'booking_cancelled': 
      case 'trip_declined':
      case 'listing_suspended': return 'bg-red-100 text-red-700 border-red-200';
      case 'new_booking':
      case 'new_trip': 
      case 'listing_update': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DropdownMenuLabel className="p-0 font-bold text-base">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground/60 px-8 mt-1">
                You'll see updates about your bookings and account activity here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`group relative flex flex-col gap-1 border-b px-4 py-4 transition-colors hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 leading-tight ${getTypeStyles(notification.type)}`}>
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {(() => {
                        try {
                          const date = new Date(notification.created_at);
                          return !isNaN(date.getTime()) 
                            ? formatDistanceToNow(date, { addSuffix: true })
                            : 'recently';
                        } catch (e) {
                          return 'recently';
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold' : 'text-foreground/80'}`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button variant="outline" className="w-full text-xs h-9 font-medium" asChild>
            <a href="/dashboard/settings">
              Notification Settings
            </a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
