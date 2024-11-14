
import { baseApiSlice } from '../baseApiSlice';
import { User } from '../../types/user';

interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginData>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['auth'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApiSlice;