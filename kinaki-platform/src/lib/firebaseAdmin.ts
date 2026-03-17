import admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      console.warn('Firebase environment variables are missing. Firebase features will be disabled.')
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error)
  }
}

export const bucket = admin.storage().bucket()
