import { client } from '@/api/client'

import type { RootState } from '@/app/store'
import { createAppSlice } from '@/app/withTypes'

import { selectCurrentUserId } from '@/features/auth/authSlice'
import { createEntityAdapter } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
}

const usersAdapter = createEntityAdapter<User>()

const initialState = usersAdapter.getInitialState()

const usersSlice = createAppSlice({
  name: 'users',
  initialState,
  reducers: (create) => {
    return {
      fetchUsers: create.asyncThunk(
        async () => {
          const response = await client.get<User[]>('/fakeApi/users')
          return response.data
        },
        {
          fulfilled: usersAdapter.setAll,
        },
      ),
    }
  },
})

export const { fetchUsers } = usersSlice.actions

export const { selectAll: selectAllUsers, selectById: selectUserById } = 
  usersAdapter.getSelectors((state: RootState) => state.users)

export default usersSlice.reducer

// this selector needs the RootState, so it cannot be inside createAppSlice.
export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  if (!currentUserId) {
    return
  }
  return selectUserById(state, currentUserId)
}
