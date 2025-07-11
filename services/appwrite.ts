import Constants from 'expo-constants';
import { Client, Account, Databases, Functions, ID, Query as AppwriteQuery } from 'appwrite';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

const appwriteEndpoint  = extra.appwriteEndpoint  as string;
const appwriteProjectId = extra.appwriteProjectId as string;

export const DATABASE_ID                 = extra.databaseId                as string;
export const USERS_COLLECTION_ID         = extra.usersCollectionId         as string;
export const RATINGS_COLLECTION_ID       = extra.ratingsCollectionId       as string;
export const RELATIONSHIPS_COLLECTION_ID = extra.relationshipsCollectionId as string;
export const APPWRITE_FUNCTION_ID        = extra.functionId                as string;
export const WORKOUTS_COLLECTION_ID      = extra.workoutsCollectionId as string;

if (!appwriteEndpoint || !appwriteProjectId) throw new Error('[Appwrite Config] Endpoint or Project ID is missing.');
if (!DATABASE_ID || !USERS_COLLECTION_ID) throw new Error('[Appwrite Config] Database ID or Users Collection ID is missing.');

const JWT_KEY = 'appwrite_jwt';

export const client     = new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
export const account    = new Account(client);
export const databases  = new Databases(client);
export const functions  = new Functions(client);

async function saveJWT(token: string): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.setItem(JWT_KEY, token);
    } else {
        await SecureStore.setItemAsync(JWT_KEY, token);
    }
}

async function deleteJWT(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(JWT_KEY);
    } else {
        await SecureStore.deleteItemAsync(JWT_KEY);
    }
}

async function fetchAndStoreJWT(): Promise<void> {
    const { jwt } = await account.createJWT();
    await saveJWT(jwt);
}

export async function login(email: string, password: string) {
    try {
        await account.deleteSession('current');
    } catch (error) { /* Expected */ }

    const session = await account.createEmailPasswordSession(email, password);
    await fetchAndStoreJWT();
    return session;
}

export async function logout() {
    try {
        await account.deleteSession('current');
    } catch (error) { /* Expected */ }
    finally {
        await deleteJWT();
    }
}

export async function getCurrentUser() {
    try { return await account.get(); } catch { return null; }
}

export async function getRole(userId: string): Promise<'coach' | 'user'> {
    const res = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [AppwriteQuery.equal('userId', userId), AppwriteQuery.limit(1)],
    );
    return res.total ? ((res.documents[0] as any).role as 'coach' | 'user') : 'user';
}

// --- CORRECTED: ADDED THIS FUNCTION BACK AND EXPORTED IT ---
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
        user.$id,
        { userId: user.$id, email, role, name },
    );

    // Log the new user in and get them a JWT
    await login(email, password);

    return user;
}

export { ID, AppwriteQuery as Query };