import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

// Mengamankan dari error crash jika R2 belum disetting (dev mode)
const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucketName);

const s3Client = isR2Configured ? new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
  },
}) : null;

export async function uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!isR2Configured || !s3Client) {
    console.warn('[R2 Dev Mode] Mocking file upload for key:', key);
    return `https://mock-url.local/${key}`; // Kembalikan URL palsu jika env belum di-set
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Sekarang HANYA kembalikan R2 Key, BUKAN public URL untuk keamanan (Presigned URL diakses terpisah)
    return key;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Gagal mengunggah file ke penyimpanan');
  }
}

// Men-generate Presigned URL dengan masa kadaluarsa (default 15 menit)
export async function getPresignedDownloadUrl(key: string, expiresIn = 900): Promise<string> {
  // If already a full URL (e.g., Supabase Storage or dev mock), return as-is
  if (key.startsWith('http')) return key;

  if (!isR2Configured || !s3Client) {
    return `https://mock-url.local/${key}`; // Dev fallback
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    // URL ini hanya valid selama 'expiresIn' detik
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return '';
  }
}

// Menghapus file dari R2
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!isR2Configured || !s3Client) {
    console.warn('[R2 Dev Mode] Mocking file deletion for key:', key);
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}

// Mendapatkan URL publik statis (Tanpa proxy/presigned)
export function getPublicR2Url(key: string): string {
  if (!key) return '';
  if (key.startsWith('http')) return key; // Jika sudah berupa full URL
  return publicUrl ? `${publicUrl}/${key}` : `https://mock-public-url.local/${key}`;
}

