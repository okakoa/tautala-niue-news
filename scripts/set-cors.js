const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=("?)(.*)\2$/);
  if (match) {
    env[match[1].trim()] = match[3];
  }
});

const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

initializeApp({
  credential: cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

async function setCors() {
  // Let's try .appspot.com which is the standard GCS bucket name for Firebase
  const bucketName = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '.appspot.com';
  console.log(`Setting CORS for bucket: ${bucketName}`);
  const bucket = getStorage().bucket(bucketName);
  
  await bucket.setCorsConfiguration([
    {
      origin: ['*'],
      responseHeader: ['Content-Type', 'x-firebase-storage-class'],
      method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      maxAgeSeconds: 3600
    }
  ]);
  console.log('CORS configured successfully!');
}

setCors().catch(console.error);
