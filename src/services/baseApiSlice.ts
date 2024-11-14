import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiConfig';

export const baseApiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['auth', 'Users', 'Chats'],
    endpoints: () => ({}),
});