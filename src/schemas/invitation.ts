import { z } from 'zod';

export const createInvitationSchema = z.object({
  sport_id: z.string().min(1, 'Pilih jenis olahraga'),
  venue: z.string().min(1, 'Lokasi/Venue wajib diisi').max(200, 'Lokasi terlalu panjang'),
  start_at: z.string().min(1, 'Tanggal & jam wajib diisi'),
  duration: z.number().min(0.5, 'Durasi minimal 0.5 jam').max(8, 'Durasi maksimal 8 jam'),
  capacity: z.number().min(2, 'Kapasitas minimal 2 orang').max(50, 'Kapasitas maksimal 50 orang'),
  note: z.string().max(500, 'Catatan terlalu panjang').optional(),
}).refine((data) => {
  const startDate = new Date(data.start_at);
  const now = new Date();
  return startDate > now;
}, {
  message: 'Tanggal & jam harus di masa depan',
  path: ['start_at'],
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
