import Constants       from 'expo-constants';
import { Platform }    from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
    Client,
    Account,
    Databases,
    Functions,
    ID,
    Query
} from 'appwrite';

/* 1) Grab your Expo `extra` vars from app.config.js */
const extra      = Constants.expoConfig?.extra ?? {};
const ENDPOINT   = extra.appwriteEndpoint    as string;
const PROJECT_ID = extra.appwriteProjectId   as string;

if (!ENDPOINT || !PROJECT_ID) {
    throw new Error('[Appwrite] Missing endpoint or project id in Expo extra');
}

/* 2) Initialize Appwrite singletons */
export const client     = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
export const account    = new Account(client);
export const databases  = new Databases(client);
export const functions  = new Functions(client);

/* 3) Your collection / function IDs */
export const DATABASE_ID               = extra.databaseId           as string;
export const USERS_COLLECTION_ID       = extra.usersColId           as string;
export const RATINGS_COLLECTION_ID     = extra.ratingsColId         as string;
export const RELATIONSHIPS_COLLECTION_ID = extra.relationshipsColId as string;
export const APPWRITE_FUNCTION_ID      = extra.functionId           as string;

/* 4) JWT storage helpers */
const JWT_KEY = 'APPWRITE_JWT';

async function saveJWT(jwt: string) {
    if (Platform.OS === 'web') {
        window.localStorage.setItem(JWT_KEY, jwt);
    } else {
        await SecureStore.setItemAsync(JWT_KEY, jwt);
    }
    client.setJWT(jwt);
}

async function loadJWT(): Promise<string | null> {
    return Platform.OS === 'web'
        ? window.localStorage.getItem(JWT_KEY)
        : await SecureStore.getItemAsync(JWT_KEY);
}

async function clearJWT() {
    if (Platform.OS === 'web') {
        window.localStorage.removeItem(JWT_KEY);
    } else {
        await SecureStore.deleteItemAsync(JWT_KEY);
    }
    client.setJWT('');
}

/** Call this once on app startup to re-attach the last JWT (if any) */
export async function restoreAuth() {
    const jwt = await loadJWT();
    if (jwt) client.setJWT(jwt);
}

/* 5) Auth helpers */

/** Email/Password login → issues a JWT, persists it & attaches it to the SDK */
export async function login(email: string, password: string) {
    // ensure no old session
    try { await account.deleteSession('current'); } catch {}
    // create a new session
    if ((account as any).createEmailSession) {
        // SDK v16+
        await (account as any).createEmailSession({ email, password });
    } else {
        // older SDKs
        await (account as any).createSession(email, password);
    }
    // now grab a JWT
    const { jwt } = await account.createJWT();
    await saveJWT(jwt);
}

/** Logs out server-side and clears your local JWT */
export async function logout() {
    try { await account.deleteSession('current'); } catch {}
    await clearJWT();
}

/** Returns `Account` or `null` if not logged in */
export async function getCurrentUser() {
    return account.get().catch(() => null);
}

/** Your app’s “role” lookup from the `users` collection */
export async function getRole(userId: string): Promise<'coach'|'user'> {
    const res = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
            Query.equal('userId', userId),
            Query.limit(1),
        ]
    );
    return res.total === 1
        ? (res.documents[0] as any).role
        : 'user';
}

/* 6) Sign-up helpers */

/** Create auth account + profile doc */
export async function registerUserAndProfile(
    email: string,
    password: string,
    name: string,
    role: 'coach'|'user'
) {
    const user = await account.create(ID.unique(), email, password, name);
    await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        { userId: user.$id, email, name, role }
    );
    return user;
}

/** Simple auth-only sign-up */
export async function signUp(email: string, password: string, name: string) {
    return account.create(ID.unique(), email, password, name);
}

/* 7) Convenience re-exports */
export { ID, Query };
