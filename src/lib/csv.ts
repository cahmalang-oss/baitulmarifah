// Fungsi sanitasi CSV untuk mencegah CSV Injection (OWASP standard)
export function sanitizeCSVField(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  
  // Wrap dengan quotes jika ada koma, newline, atau quotes
  const needsQuoting = str.includes(',') || str.includes('\n') || str.includes('"');
  
  // Prefix karakter formula dengan tab untuk mencegah Excel menjalankan formula (CSV Injection)
  const safe = str.replace(/^[=+\-@\t]/, '\t$&');
  
  return needsQuoting ? `"${safe.replace(/"/g, '""')}"` : safe;
}

// Byte Order Mark (BOM) wajib untuk Excel UTF-8
export const CSV_BOM = '\uFEFF';
