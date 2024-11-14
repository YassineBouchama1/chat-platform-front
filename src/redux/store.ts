// # Store configuration

import { configureStore } from '@reduxjs/toolkit'
import { baseApiSlice } from '../services/baseApiSlice'


export const store = configureStore({
  reducer: {

    [baseApiSlice.reducerPath]: baseApiSlice.reducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApiSlice.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch