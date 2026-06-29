import { redirect } from 'next/navigation';

// Halaman setoran lama → redirect ke kurban
export default function SetoranRedirect() {
  redirect('/dashboard/kurban');
}
