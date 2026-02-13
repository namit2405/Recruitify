import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "../hooks/useQueries";

import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Briefcase,
  FileText,
  X,
} from "lucide-react";

import { toast } from "sonner";

export default function NotificationsPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Notifications');
  
  const { data: notifications = [], isLoading, refetch } = useGetNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (notificationId) => {
    try {
      await markRead.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification.mutateAsync(notificationId);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.application_id) {
      // Navigate to applications page
      navigate({ to: "/candidate/applications" });
    } else if (notification.vacancy_id) {
      // Navigate to jobs page
      navigate({ to: "/candidate/jobs" });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "application_status":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "new_application":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "new_vacancy":
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case "vacancy_closed":
        return <BellOff className="h-5 w-5 text-orange-500" />;
      case "application_submitted":
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "You're all caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground">
                We'll notify you when something important happens
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md cursor-pointer ${
                  !notification.is_read ? "border-l-4 border-l-green-600 bg-green-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      disabled={deleteNotification.isPending}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
