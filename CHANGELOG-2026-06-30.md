# Catatan Update — 30 Juni 2026

## 1. Role Bendahara & Verifikator + Setoran Dual-Path
- Role baru `bendahara` (akses keuangan: Setoran, Infaq, Pengeluaran, Rekap, Export) dan `verifikator` (akses data: Jamaah, Paket, Grup, Progress Qurban).
- Nav admin difilter sesuai role.
- Setoran jamaah dipisah 2 jalur: Infaq Insidentil vs Donatur Tetap.
- Halaman `/admin/pengguna` untuk admin mengelola role pengguna lain.

## 2. Pisah Menu Kurban & Infaq di Sisi Jamaah
- Nav jamaah: Beranda, Kurban 🐄, Infaq 🤲, Riwayat, Profil.
- `/dashboard/kurban` — lapor setoran tabungan/patungan qurban, selalu tampil walau belum punya paket.
- `/dashboard/infaq` — infaq insidentil + donatur tetap dalam satu halaman.
- Fix tombol submit yang sebelumnya tertutup bottom nav.
- Beranda jamaah menampilkan saldo personal + data publik masjid (kas infaq, jumlah jamaah, pemasukan, pengeluaran).

## 3. Pendaftaran Paket Kurban Mandiri oleh Jamaah
- Jamaah tanpa paket bisa pilih & daftar paket kurban langsung dari halaman Kurban.
- Status pendaftaran `pending` sampai disetujui admin/verifikator.
- Admin/verifikator approve/tolak dari halaman detail jamaah.
- Setoran kurban diblokir backend selama status masih pending (anti-bypass).
- **SQL dijalankan:** `jamaah_profile.paket_status` (`pending` / `aktif`).

## 4. Bug Fix: Rekap Donatur Tetap & Bukti Transfer
- **Bug rekap "belum lunas"**: filter bulan `"YYYY-MM"` tidak cocok dengan kolom DATE `"YYYY-MM-01"` di `infaq_donatur_realisasi`, error query diam-diam diabaikan → rekap selalu salah tampil meski sudah diverifikasi lunas. Sudah dinormalisasi.
- Bukti transfer dari setoran jamaah sekarang ikut disalin ke `kas_transaksi` & `infaq_donatur_realisasi`, ditampilkan sebagai link "📎 Lihat" di tabel admin.
- Form input manual bendahara (realisasi donatur tetap & infaq insidentil) — upload bukti dibuat **opsional** (banyak pemasukan dari kotak amal/tunai tanpa bukti fisik).
- **SQL dijalankan:** `infaq_donatur_realisasi.bukti_url`, `kas_transaksi.bukti_url`.

## 5. Bug Fix: Konfirmasi Setoran Gagal
- Root cause #1: insert ke `infaq_donatur_realisasi` menyertakan kolom `tanggal_bayar` & `verifikasi_oleh` yang tidak ada di skema tabel — dihapus dari insert.
- Root cause #2: badge kategori di `/admin/setoran` salah — setoran `donatur_tetap` ikut ditampilkan sebagai "🐄 Qurban" (logic hanya cek `infaq`, sisanya default Qurban). Sekarang ada badge terpisah "🤝 Donatur Tetap".
- Root cause #3: constraint unik `(donatur_id, bulan)` di `infaq_donatur_realisasi` — kalau sudah ada baris realisasi bulan yang sama, insert gagal duplicate key. Sekarang nominal diakumulasi & status di-update jika sudah ada, insert baru jika belum.

## 6. Manajemen Paket: Tombol Hapus
- `/admin/paket` — tombol "Hapus" per kartu paket.
- Diblokir (disabled) jika paket masih dipakai jamaah.
- API baru: `DELETE /api/admin/paket/[id]`.

## 7. Role Humas Baru
- Akses terbatas: hanya Dashboard, Kajian, Imam Shalat, Pengumuman.
- Tidak bisa akses Jamaah/Paket/Setoran/Infaq/Pengeluaran/Rekap/dll.
- `requireHumas()` ditambahkan di `auth-middleware.ts`, dipakai API jadwal (kajian/imam/pengumuman) menggantikan `requireVerifikator` di route tersebut.
- Bisa dipilih saat mengatur role di `/admin/pengguna`.

---

## SQL Migration yang Sudah Dijalankan Hari Ini
```sql
-- Pendaftaran paket mandiri
ALTER TABLE jamaah_profile
ADD COLUMN IF NOT EXISTS paket_status TEXT DEFAULT 'aktif'
CHECK (paket_status IN ('pending', 'aktif'));
UPDATE jamaah_profile SET paket_status = 'aktif' WHERE paket_id IS NOT NULL AND paket_status IS NULL;

-- Bukti transfer
ALTER TABLE infaq_donatur_realisasi ADD COLUMN IF NOT EXISTS bukti_url TEXT;
ALTER TABLE kas_transaksi ADD COLUMN IF NOT EXISTS bukti_url TEXT;
```

## Belum Ada SQL Tambahan untuk Hari Ini
Fitur Hapus Paket & Role Humas tidak memerlukan migration baru — keduanya hanya pakai kolom/tabel yang sudah ada.
