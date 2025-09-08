import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSports } from '@/hooks/useSports';
import { useUpdateInvitation, useDeleteInvitation } from '@/hooks/useInvitationManagement';
import { createInvitationSchema, type CreateInvitationInput } from '@/schemas/invitation';
import { Edit, Trash2, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InvitationManagementProps {
  invitation: any;
  onSuccess?: () => void;
}

export const InvitationManagement = ({ invitation, onSuccess }: InvitationManagementProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const { data: sports = [] } = useSports();
  const updateInvitation = useUpdateInvitation();
  const deleteInvitation = useDeleteInvitation();
  
  const form = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      sport_id: invitation.sport_id,
      venue: invitation.venue,
      start_at: format(new Date(invitation.start_at), "yyyy-MM-dd'T'HH:mm"),
      duration: invitation.duration,
      capacity: invitation.capacity,
      note: invitation.note || ''
    }
  });

  const onSubmit = async (data: CreateInvitationInput) => {
    updateInvitation.mutate({
      id: invitation.id,
      ...data,
      start_at: new Date(data.start_at).toISOString(),
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        onSuccess?.();
      }
    });
  };

  const handleDelete = () => {
    deleteInvitation.mutate(invitation.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        onSuccess?.();
      }
    });
  };

  const startDate = new Date(invitation.start_at);
  const isPast = startDate < new Date();

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPast || invitation.is_canceled}>
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ajakan Olahraga</DialogTitle>
            <DialogDescription>
              Ubah detail ajakan olahraga Anda.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sport_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Olahraga</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih olahraga" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports.map((sport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.Sport_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi/Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: GOR Senayan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal & Jam</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi (jam)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.5"
                          max="8"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Bawa sepatu futsal, level pemula welcome"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={updateInvitation.isPending}>
                  {updateInvitation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPast || invitation.is_canceled}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Ajakan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan ajakan ini? Tindakan ini tidak dapat dibatalkan.
              Semua peserta akan diberitahu tentang pembatalan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteInvitation.isPending}
            >
              {deleteInvitation.isPending ? 'Membatalkan...' : 'Ya, Batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
