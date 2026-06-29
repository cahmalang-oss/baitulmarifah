import * as XLSX from 'xlsx';

export function toXlsxBlob(headers: string[], rows: (string | number)[][]): Blob {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
    return { wch: Math.min(maxLen + 2, 50) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  // type:'array' returns Uint8Array; slice buffer to get plain ArrayBuffer for Blob
  const raw = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
  const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
  return new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
