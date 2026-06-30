export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nama: string
          email: string | null
          no_wa: string
          role: 'admin' | 'verifikator' | 'bendahara' | 'jamaah'
          alamat: string | null
          status: 'aktif' | 'nonaktif' | 'pending'
          fcm_token: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'status'> & { id?: string, created_at?: string, status?: 'aktif' | 'nonaktif' | 'pending' }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      paket: {
        Row: {
          id: string
          nama: string
          jenis: string
          harga_target: number
          status: string
          deskripsi: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['paket']['Row'], 'id' | 'created_at' | 'status'> & { id?: string, created_at?: string, status?: string }
        Update: Partial<Database['public']['Tables']['paket']['Insert']>
      }
      grup: {
        Row: {
          id: string
          nama: string
          paket_id: string | null
          target_anggota: number
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['grup']['Row'], 'id' | 'created_at' | 'target_anggota'> & { id?: string, created_at?: string, target_anggota?: number }
        Update: Partial<Database['public']['Tables']['grup']['Insert']>
      }
      jamaah_profile: {
        Row: {
          id: string
          user_id: string | null
          paket_id: string | null
          saldo: number
          no_va: string | null
          tanggal_daftar: string | null
          grup_id: string | null
          paket_status: string | null
        }
        Insert: Omit<Database['public']['Tables']['jamaah_profile']['Row'], 'id' | 'saldo'> & { id?: string, saldo?: number, tanggal_daftar?: string }
        Update: Partial<Database['public']['Tables']['jamaah_profile']['Insert']>
      }
      setoran: {
        Row: {
          id: string
          jamaah_id: string | null
          jumlah: number
          tanggal_setor: string
          status: 'pending' | 'dikonfirmasi' | 'ditolak'
          bukti_url: string | null
          catatan: string | null
          alasan_tolak: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['setoran']['Row'], 'id' | 'created_at' | 'status'> & { id?: string, created_at?: string, status?: 'pending' | 'dikonfirmasi' | 'ditolak' }
        Update: Partial<Database['public']['Tables']['setoran']['Insert']>
      }
      infaq_donatur_tetap: {
        Row: {
          id: string
          user_id: string | null
          nama_donatur: string
          no_wa: string
          nominal_komitmen: number
          metode_bayar: string | null
          aktif: boolean
          mulai_bulan: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['infaq_donatur_tetap']['Row'], 'id' | 'created_at' | 'aktif'> & { id?: string, created_at?: string, aktif?: boolean }
        Update: Partial<Database['public']['Tables']['infaq_donatur_tetap']['Insert']>
      }
      kas_transaksi: {
        Row: {
          id: string
          jenis: 'masuk' | 'keluar'
          kategori: string
          nominal: number
          sumber: string
          catatan: string | null
          tanggal: string
          input_oleh: string | null
          donatur_id: string | null
          bukti_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kas_transaksi']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['kas_transaksi']['Insert']>
      }
      infaq_donatur_realisasi: {
        Row: {
          id: string
          donatur_id: string | null
          bulan: string
          nominal_realisasi: number
          status: 'lunas' | 'kurang' | 'belum_bayar'
          kas_transaksi_id: string | null
          catatan: string | null
          bukti_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['infaq_donatur_realisasi']['Row'], 'id' | 'created_at' | 'status'> & { id?: string, created_at?: string, status?: 'lunas' | 'kurang' | 'belum_bayar' }
        Update: Partial<Database['public']['Tables']['infaq_donatur_realisasi']['Insert']>
      }
      hewan_fase: {
        Row: {
          id: string
          urutan: number
          label: string
          deskripsi: string | null
          aktif: boolean
          foto_url: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hewan_fase']['Row'], 'id' | 'updated_at' | 'aktif'> & { id?: string, updated_at?: string, aktif?: boolean }
        Update: Partial<Database['public']['Tables']['hewan_fase']['Insert']>
      }
      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          aksi: string
          entity_type: string
          entity_id: string | null
          detail: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
