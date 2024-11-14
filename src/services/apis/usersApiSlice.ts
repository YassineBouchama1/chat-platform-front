import { baseApiSlice } from '../baseApiSlice';
import { Member } from '../../types/chat';

export const usersApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Member[], void>({
      query: () => '/user',
      providesTags: ['Users'],
      keepUnusedDataFor: 300, // 5 minutes in seconds
    }),
  }),
});

export const { useGetUsersQuery } = usersApiSlice;