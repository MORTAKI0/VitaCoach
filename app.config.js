/// app.config.js
import 'dotenv/config'; // allow process.env.*

/** @type {import('@expo/cli').ExpoConfig} */
export default ({ config }) => ({
    ...config,
    extra: {
        // these keys must match exactly what services/appwrite.ts uses:
        appwriteEndpoint:          process.env.APPWRITE_ENDPOINT,
        appwriteProjectId:         process.env.APPWRITE_PROJECT_ID,
        databaseId:                process.env.DATABASE_ID,
        usersCollectionId:         process.env.USERS_COLLECTION_ID,
        ratingsCollectionId:       process.env.RATINGS_COLLECTION_ID,
        relationshipsCollectionId: process.env.RELATIONSHIPS_COLLECTION_ID,
        functionId:                process.env.APPWRITE_FUNCTION_ID,

        // preserve any other extras (e.g. router, eas)
        ...(config.extra ?? {}),
    },
});
