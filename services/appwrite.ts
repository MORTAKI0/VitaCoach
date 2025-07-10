// services/appwrite.ts
import Constants from 'expo-constants';
import {
    Client,
    Account,
    Databases,
    Functions,            // ⬅︎ trigger cloud-funcs
    ID,
    Query as AppwriteQuery // alias so we can re-export as “Query”
} from 'appwrite';

/* ──────────────────────────────────────────────────────────────── */
/* 1. Runtime env (set in app.config.js -> extra)                  */
/* ──────────────────────────────────────────────────────────────── */
const extra = Constants.expoConfig?.extra ?? {};

const appwriteEndpoint  = extra.appwriteEndpoint  as string;
const appwriteProjectId = extra.appwriteProjectId as string;

if (!appwriteEndpoint || !appwriteProjectId) {
    throw new Error(
        '[Appwrite] endpoint or project id is missing in Constants.expoConfig.extra',
    );
}

/* ──────────────────────────────────────────────────────────────── */
/* 2. Singletons                                                   */
/* ──────────────────────────────────────────────────────────────── */
export const client     = new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
export const account    = new Account(client);
export const databases  = new Databases(client);
export const functions  = new Functions(client);              // ← NEW

/* ──────────────────────────────────────────────────────────────── */
/* 3. IDs you’ll need everywhere                                   */
/* ──────────────────────────────────────────────────────────────── */
export const DATABASE_ID                 = extra.databaseId          as string;
export const RATINGS_COLLECTION_ID       = extra.ratingsColId        as string;
export const USERS_COLLECTION_ID         = extra.usersColId          as string;
export const RELATIONSHIPS_COLLECTION_ID = extra.relationshipsColId  as string;
export const APPWRITE_FUNCTION_ID        = extra.functionId          as string;

/* ──────────────────────────────────────────────────────────────── */
/* 4. Helper wrappers                                              */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Works with both older SDKs (`createSession`) and v13+ (`createEmailSession`)
 */
export async function loginWithEmail(email: string, password: string) {
    if (typeof (account as any).createEmailSession === 'function') {
        // v13+
        return (account as any).createEmailSession(email, password);
    }
    // pre-v13
    return (account as any).createSession(email, password);
}

export async function getCurrentUser() {
    try { return await account.get(); } catch { return null; }
}

export async function logout() {
    try { await account.deleteSession('current'); return true; } catch { return false; }
}

export async function registerUserAndProfile(
    email: string,
    password: string,
    name: string,
    role: 'user' | 'coach',
) {
    const user = await account.create(ID.unique(), email, password, name);

    await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,                      // <- use auth UID as doc-ID
        { userId: user.$id, email, role, name },
    );

    return user;
}

export async function signUpWithEmail(
    email: string,
    password: string,
    name: string,
) {
    return account.create(ID.unique(), email, password, name);
}

/** Return `"coach"` or `"user"` from the users collection */
export async function getRole(userId: string): Promise<'coach' | 'user'> {
    const res = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
            AppwriteQuery.equal('userId', userId),
            AppwriteQuery.limit(1),
        ],
    );

    return res.total
        ? ((res.documents[0] as any).role as 'coach' | 'user')
        : 'user'; // sensible default
}

/* ──────────────────────────────────────────────────────────────── */
/* 5. Convenience re-exports                                       */
/* ──────────────────────────────────────────────────────────────── */
export { ID, AppwriteQuery as Query };
