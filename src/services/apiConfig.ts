import { fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default_key';
const AUTH_TOKEN_COOKIE = import.meta.env.VITE_AUTH_TOKEN_COOKIE || 'authToken';
const API_URL = import.meta.env.VITE_API_URL || '';



// this function bring token from coockies
const getDecryptedToken = (): string | null => {
    const encryptedToken = Cookies.get(AUTH_TOKEN_COOKIE);
    if (!encryptedToken) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Failed to decrypt token:', error);
        return null;
    }
};


// base query
export const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = getDecryptedToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});