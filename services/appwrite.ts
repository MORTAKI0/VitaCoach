import { Client, Account, Databases, Avatars, ID } from 'appwrite';

// 1. Initialize Appwrite Client with environment variables
const client = new Client();

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Reads from .env (Expo runtime)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // Reads from .env (Expo runtime)

const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);

export { client, account, databases, avatars };

// 2. Register a new user and create a profile doc in the users collection.
export async function registerUserAndProfile(
    email: string,
    password: string,
    name: string,
    role: "user" | "coach"
) {
    const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
    const COLLECTION_ID = "users";

    // 1. Create Auth user
    const user = await account.create(ID.unique(), email, password, name);

    // 2. Create user profile doc in DB (doc ID = auth user.$id)
    await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        user.$id,
        {
            userId: user.$id,
            email,
            role,
        }
    );

    return user;
}

// Simple sign up (if you don't need profile, just auth)
export async function signUpWithEmail(email: string, password: string, name: string) {
    try {
        const response = await account.create(ID.unique(), email, password, name);
        return response;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Get the current user session
export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

// Log out the current session
export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    } catch {
        return false;
    }
}
