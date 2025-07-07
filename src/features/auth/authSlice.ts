import { client } from '@/api/client'

import { createAppSlice } from '@/app/withTypes'

interface AuthState {
  userId: string | null
}

const initialState: AuthState = {
  // Note: a real app would probably have more complex auth state,
  // but for this example we'll keep things simple
  userId: null,
}

const authSlice = createAppSlice({
  name: 'auth',
  initialState,
  reducers: (create) => {
    return {
      login: create.asyncThunk(
        async (userId: string) => {
          await client.post('/fakeApi/login', { userId })
          return userId
        },
        {
          fulfilled: (state, action) => {
            state.userId = action.payload
          },
        },
      ),
      logout: create.asyncThunk(
        async () => {
          await client.post('/fakeApi/logout', {})
        },
        {
          fulfilled: (state, action) => {
            state.userId = null
          },
        },
      ),
    }
  },
  selectors: {
    selectCurrentUserId: (authState) => authState.userId
  }
})

export const { login, logout } = authSlice.actions

export const { selectCurrentUserId } = authSlice.selectors

export default authSlice.reducer
