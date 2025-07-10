// app.config.js  ––  single source-of-truth for Expo + Appwrite
import 'dotenv/config';           // allows process.env.* in this file

/** @type {import('@expo/cli').ExpoConfig} */
export default ({ config }) => ({
    ...config,                      // keep everything that was already there
    name:          'vitacoachV1',
    slug:          'vitacoachV1',
    version:       '1.0.0',
    orientation:   'portrait',
    userInterfaceStyle: 'automatic',
    scheme:        'vitacoachv1',

    /* keep your existing iOS / Android / web sections … */

    /* ------------------------------------------------------------------ */
    /* most important part ––––––––––––––––––––––––––––––––––––––––––––––– */
    extra: {
        /** the ↓ keys are what services/appwrite.ts expects */
        appwriteEndpoint:        process.env.APPWRITE_ENDPOINT,
        appwriteProjectId:       process.env.APPWRITE_FUNCTION_PROJECT_ID,
        databaseId:              process.env.DATABASE_ID,
        ratingsColId:            process.env.RATINGS_COLLECTION_ID,
        usersColId:              process.env.USERS_COLLECTION_ID,
        relationshipsColId:      process.env.RELATIONSHIPS_COLLECTION_ID,
        functionId:              process.env.APPWRITE_FUNCTION_ID,

        /* keep anything you had before (router / eas etc.) */
        ...(config.extra ?? {}),
    },
});
