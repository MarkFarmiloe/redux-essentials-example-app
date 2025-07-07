import { asyncThunkCreator, buildCreateSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState, AppDispatch } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()

// createSlice with thunk ability
export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator }
})
