/**
 * Managers Page
 * Store managers management (owner only)
 */

'use client';

import React, { useState } from 'react';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import { Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import {
  useStoreManagers,
  useAddManager,
  useRemoveManager,
  useStoreDashboard,
} from '@/features/store-menu/hooks/useStoreMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

function AddManagerDialog({
  storeId,
  isOpen,
  onClose,
}: {
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const addMutation = useAddManager();
  const [email, setEmail] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);

  const handleAdd = async () => {
    if (!email) return;

    try {
      await addMutation.mutateAsync({ storeId, email });
      toast.success('Менеджера додано успішно');
      setEmail('');
      setUserNotFound(false);
      onClose();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          setUserNotFound(true);
        } else {
          toast.error('Помилка при додаванні менеджера');
        }
      } else {
        toast.error('Помилка при додаванні менеджера');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати менеджера</DialogTitle>
          <DialogDescription>
            Введіть email користувача, якого ви хочете додати як менеджера
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setUserNotFound(false);
              }}
              placeholder="manager@example.com"
            />
          </div>

          {userNotFound && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Користувача з таким email не знайдено. Запросіть його спочатку зареєструватися на
                сайті.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleAdd} disabled={!email || addMutation.isPending}>
            {addMutation.isPending ? 'Додавання...' : 'Додати менеджера'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteManagerDialog({
  manager,
  storeId,
  isOpen,
  onClose,
}: {
  manager: { id: string; name: string; email: string } | null;
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const removeMutation = useRemoveManager();

  if (!manager) return null;

  const handleDelete = async () => {
    try {
      await removeMutation.mutateAsync({ storeId, userId: manager.id });
      toast.success('Менеджера видалено');
      onClose();
    } catch {
      toast.error('Помилка при видаленні менеджера');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалити менеджера?</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити &quot;{manager.name || manager.email}&quot; з менеджерів
            магазину?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={removeMutation.isPending}>
            {removeMutation.isPending ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManagersContent({ storeId, isOwner }: { storeId: string; isOwner: boolean }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    manager: { id: string; name: string; email: string } | null;
  }>({ isOpen: false, manager: null });

  const { data, isLoading } = useStoreManagers(storeId);
  const managers = data?.items || [];

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Тільки власник магазину може керувати менеджерами. Ви маєте доступ тільки для
              перегляду.
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Ім&apos;я</TableHead>
                  <TableHead>Додано</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map(manager => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.name || '—'}</TableCell>
                    <TableCell>
                      {format(new Date(manager.added_at), 'dd MMM yyyy', { locale: uk })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Менеджери</h1>
          <p className="text-muted-foreground">Керуйте доступом менеджерів до вашого магазину</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Додати менеджера
        </Button>
      </div>

      {/* Managers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-48" />
            </div>
          ) : managers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Ім&apos;я</TableHead>
                  <TableHead>Додано</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map(manager => (
                  <TableRow key={manager.id}>
                    <TableCell className="font-medium">{manager.email}</TableCell>
                    <TableCell>{manager.name || '—'}</TableCell>
                    <TableCell>
                      {format(new Date(manager.added_at), 'dd MMM yyyy', { locale: uk })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setDeleteDialog({
                            isOpen: true,
                            manager: {
                              id: manager.id,
                              name: manager.name,
                              email: manager.email,
                            },
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">У вас ще немає менеджерів</p>
              <p className="text-muted-foreground">
                Додайте менеджерів, щоб вони могли допомагати керувати магазином
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Додати першого менеджера
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddManagerDialog
        storeId={storeId}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <DeleteManagerDialog
        manager={deleteDialog.manager}
        storeId={storeId}
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, manager: null })}
      />
    </div>
  );
}

export default function ManagersPage() {
  const { selectedStoreId, isLoading } = useStoreContext();
  const { data: dashboardData } = useStoreDashboard(selectedStoreId || '');
  const isOwner = dashboardData?.store.access_type === 'owner';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedStoreId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              ID магазину не вказано. Перейдіть зі списку ваших магазинів.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StoreMenuLayout>
      <ManagersContent storeId={selectedStoreId} isOwner={isOwner} />
    </StoreMenuLayout>
  );
}
