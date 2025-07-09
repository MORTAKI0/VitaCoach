// services/appwrite.ts

import { Client, Account, Databases, Avatars } from 'appwrite';

// 1. Initialize Appwrite Client
const client = new Client();

client
    .setEndpoint('https://YOUR_APPWRITE_ENDPOINT/v1') // TODO: Replace with your Appwrite endpoint URL
    .setProject('YOUR_PROJECT_ID'); // TODO: Replace with your Appwrite project ID

// 2. Export Appwrite services (Account, Databases, Avatars)
const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);

export { client, account, databases, avatars };

// 3. Sign up function for email/password auth
/**
 * Register a new user with Appwrite
 * @param email - User's email address
 * @param password - User's password
 * @param name - User's name
 */
export async function signUpWithEmail(email: string, password: string, name: string) {
    try {
        // 'unique()' generates a unique user ID for the new user
        const response = await account.create(
            'unique()',
            email,
            password,
            name
        );
        return response; // Success: user info returned
    } catch (error: any) {
        // Bubble up error message for UI to display
        throw new Error(error.message);
    }
}

