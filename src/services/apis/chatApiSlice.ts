import { baseApiSlice } from "../baseApiSlice";
import { Chat, ChatResponse, NewChatData, UpdateChatData } from "../../types/chat";


export const chatApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => '/chats',
      transformResponse: (response: ChatResponse) => response,
      providesTags: ['Chats'],
    }),

    // Add new chat
    addChat: builder.mutation<Chat, NewChatData>({
      query: (chatData) => ({
        url: '/chats',
        method: 'POST',
        body: chatData,
      }),
      invalidatesTags: ['Chats'],
    }),

    // Update chat
    updateChat: builder.mutation<Chat, UpdateChatData>({
      query: ({ id, ...patch }) => ({
        url: `/chats/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Chats', id },
        { type: 'Chats', id: 'LIST' }
      ],
    }),

    // Delete chat
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chats'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useAddChatMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
} = chatApiSlice;