import SftpClient from 'ssh2-sftp-client';

export async function uploadPhotoToHE(
  photographerId: number,
  photoId: number,
  imageBuffer: Buffer
): Promise<void> {
  const host = process.env.HE_SFTP_HOST;
  const username = process.env.HE_SFTP_USER;
  const password = process.env.HE_SFTP_PASSWORD;
  const remotePath = process.env.HE_SFTP_REMOTE_PATH;

  if (!host || !username || !password || !remotePath) {
    throw new Error('SFTP environment variables are not configured');
  }

  const sftp = new SftpClient();
  const remoteFile = `${remotePath}/${photographerId}_${photoId}.jpg`;

  try {
    await sftp.connect({ host, username, password });
    await sftp.put(imageBuffer, remoteFile);
  } finally {
    await sftp.end();
  }
}
