import { client } from '@/api/client'

import type { RootState } from '@/app/store'
import { createAppSlice } from '@/app/withTypes'

import { selectCurrentUserId } from '@/features/auth/authSlice'

interface User {
  id: string
  name: string
}

const initialState: User[] = []

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
          fulfilled: (state, action) => {
            return action.payload
          },
        },
      ),
    }
  },
  selectors: {
    selectAllUsers: (usersState) => usersState,
    selectUserById: (usersState, userId: string) => usersState.find((user) => user.id === userId),
  },
})

export const { fetchUsers } = usersSlice.actions

export const { selectAllUsers, selectUserById } = usersSlice.selectors

export default usersSlice.reducer

// this selector needs the RootState, so it cannot be inside createAppSlice.
export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  return selectUserById(state, currentUserId!)
}
