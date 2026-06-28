-- schema.sql
-- Migration untuk aplikasi BaitulMarifah App
-- Dijalankan di SQL Editor Supabase

-- 1. TABEL CORE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  email TEXT UNIQUE,
  no_wa TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'petugas_verifikasi', 'petugas_keuangan', 'jamaah')),
  alamat TEXT,
  status TEXT DEFAULT 'aktif',
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE paket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL,
  harga_target BIGINT NOT NULL,
  status TEXT DEFAULT 'active',
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE grup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  paket_id UUID REFERENCES paket(id),
  target_anggota INT DEFAULT 7,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jamaah_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paket_id UUID REFERENCES paket(id),
  saldo BIGINT DEFAULT 0,
  no_va TEXT,
  tanggal_daftar DATE DEFAULT CURRENT_DATE,
  grup_id UUID REFERENCES grup(id)
);

CREATE TABLE setoran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jamaah_id UUID REFERENCES jamaah_profile(id) ON DELETE CASCADE,
  jumlah BIGINT NOT NULL,
  tanggal_setor DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dikonfirmasi', 'ditolak')),
  bukti_url TEXT,
  catatan TEXT,
  alasan_tolak TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE infaq_donatur_tetap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  nama_donatur TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  nominal_komitmen BIGINT NOT NULL,
  metode_bayar TEXT,
  aktif BOOLEAN DEFAULT true,
  mulai_bulan DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kas_transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
  kategori TEXT NOT NULL,
  nominal BIGINT NOT NULL,
  sumber TEXT NOT NULL,
  catatan TEXT,
  tanggal DATE NOT NULL,
  input_oleh UUID REFERENCES users(id),
  donatur_id UUID REFERENCES infaq_donatur_tetap(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE infaq_donatur_realisasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donatur_id UUID REFERENCES infaq_donatur_tetap(id) ON DELETE CASCADE,
  bulan DATE NOT NULL,
  nominal_realisasi BIGINT NOT NULL,
  status TEXT DEFAULT 'belum_bayar' CHECK (status IN ('lunas', 'kurang', 'belum_bayar')),
  kas_transaksi_id UUID REFERENCES kas_transaksi(id),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (donatur_id, bulan)
);

CREATE TABLE hewan_fase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urutan INT NOT NULL,
  label TEXT NOT NULL,
  deskripsi TEXT,
  aktif BOOLEAN DEFAULT false,
  foto_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  aksi TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SETUP ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE paket ENABLE ROW LEVEL SECURITY;
ALTER TABLE grup ENABLE ROW LEVEL SECURITY;
ALTER TABLE jamaah_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;
ALTER TABLE infaq_donatur_tetap ENABLE ROW LEVEL SECURITY;
ALTER TABLE kas_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE infaq_donatur_realisasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE hewan_fase ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Keterangan: Semua INSERT/UPDATE/DELETE dilakukan via Server (Service Role Key),
-- sehingga kita HANYA perlu menambahkan policy untuk SELECT.

-- users: SELECT = own row only (kecuali admin = all)
CREATE POLICY "Users view own or admin views all" ON users FOR SELECT USING (
  id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- jamaah_profile: SELECT = own row or admin/petugas
CREATE POLICY "Jamaah view own profile" ON jamaah_profile FOR SELECT USING (
  user_id = auth.uid() OR
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'petugas_verifikasi')
);

-- setoran: SELECT = own rows (jamaah) atau semua (admin/petugas_verif)
CREATE POLICY "View setoran" ON setoran FOR SELECT USING (
  jamaah_id IN (SELECT id FROM jamaah_profile WHERE user_id = auth.uid()) OR
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'petugas_verifikasi')
);

-- kas_transaksi: SELECT = admin + petugas_verif + petugas_keuangan
CREATE POLICY "View kas_transaksi" ON kas_transaksi FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'petugas_verifikasi', 'petugas_keuangan')
);

-- paket, grup, hewan_fase, settings: PUBLIC or Authenticated can SELECT
CREATE POLICY "View paket" ON paket FOR SELECT USING (true);
CREATE POLICY "View grup" ON grup FOR SELECT USING (true);
CREATE POLICY "View hewan_fase" ON hewan_fase FOR SELECT USING (true);
CREATE POLICY "View settings" ON settings FOR SELECT USING (true);

-- infaq_donatur_tetap, infaq_donatur_realisasi, audit_log: Admin & Petugas Verif only
CREATE POLICY "View infaq_donatur_tetap" ON infaq_donatur_tetap FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'petugas_verifikasi')
);
CREATE POLICY "View infaq_donatur_realisasi" ON infaq_donatur_realisasi FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'petugas_verifikasi')
);
CREATE POLICY "View audit_log" ON audit_log FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- 3. SEED DATA AWAL
INSERT INTO users (id, nama, email, no_wa, role, status) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin Utama', 'admin@baitulmarifah.web.id', '081234567890', 'admin', 'aktif');

INSERT INTO paket (id, nama, jenis, harga_target, deskripsi) VALUES 
('11111111-0000-0000-0000-000000000001', 'Kambing Reguler', 'kambing', 2500000, 'Kurban 1 ekor kambing standar'),
('11111111-0000-0000-0000-000000000002', 'Sapi Patungan', 'sapi_patungan', 3000000, 'Kurban 1 ekor sapi untuk 7 orang (Rp 3jt/orang)'),
('11111111-0000-0000-0000-000000000003', 'Tabungan Kurban', 'tabungan', 2500000, 'Tabungan cicilan kurban (Rp 500rb x 5 bulan)');

INSERT INTO hewan_fase (urutan, label, deskripsi, aktif) VALUES
(1, 'Perencanaan', 'Tahap perencanaan kurban', true),
(2, 'Pengumpulan Dana', 'Tahap pengumpulan dana jamaah', false),
(3, 'Pengadaan Hewan', 'Proses pembelian hewan kurban', false),
(4, 'Penyembelihan', 'Proses pemotongan hewan kurban di hari H', false),
(5, 'Distribusi', 'Distribusi daging kurban ke mustahiq', false);

INSERT INTO settings (key, value) VALUES
('nama_masjid', '"Masjid Baitul Marifat"'),
('alamat', '"Jl. Contoh Alamat No. 123"'),
('no_rekening_bsi', '"BSI 7123456789 a.n Masjid Baitul Marifat"'),
('info_qris', '"Tersedia di lokasi masjid"');
