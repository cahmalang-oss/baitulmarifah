import { redirect } from 'next/navigation';

// Donatur tetap sekarang ada di halaman Infaq
export default function DonaturRedirect() {
  redirect('/dashboard/infaq');
}
