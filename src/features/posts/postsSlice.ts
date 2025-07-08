import { createEntityAdapter, createSelector, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { toast } from 'react-tiny-toast'

import { client } from '@/api/client'
import { AppStartListening } from '@/app/listenerMiddleware'
import { createAppSlice } from '@/app/withTypes'

import { logout } from '@/features/auth/authSlice'
import { RootState } from '@/app/store'

export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
  id: string
  title: string
  content: string
  userId: string
  date: string
  reactions: Reactions
}

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
}

type PostAdd = Pick<Post, 'title' | 'content' | 'userId'>
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

interface PostsState extends EntityState<Post, string> {
  status: 'idle' | 'loading' | 'complete' | 'failed'
  error: string | null
}

const postsAdapter = createEntityAdapter<Post>({
  // Sort in descending date order
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

const postsSlice = createAppSlice({
  name: 'posts',
  initialState,
  reducers: (create) => {
    return {
      fetchPosts: create.asyncThunk(
        async () => {
          const response = await client.get<Post[]>('/fakeApi/posts')
          return response.data
        },
        {
          options: {
            condition(_unused, thunkApi) {
              const { posts } = thunkApi.getState() as { posts: PostsState }
              return posts.status === 'idle'
            },
          },
          pending: (state) => {
            state.status = 'loading'
          },
          fulfilled: (state, action) => {
            state.status = 'complete'
            postsAdapter.setAll(state, action.payload)
          },
          rejected: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message ?? 'Unknown Error'
          },
        },
      ),
      postAdded: create.asyncThunk(
        async (newPost: PostAdd) => {
          const response = await client.post<Post>('/fakeApi/posts', newPost)
          return response.data
        },
        {
          fulfilled: postsAdapter.addOne,
        },
      ),
      postUpdated: create.reducer<PostUpdate>((postsState, action: PayloadAction<PostUpdate>) => {
        const { id, title, content } = action.payload
        postsAdapter.updateOne(postsState, { id, changes: { title, content } })
      }),
      reactionAdded: create.reducer<{ postId: string; reaction: ReactionName }>((postsState, action) => {
        const { postId, reaction } = action.payload
        const existingPost = postsState.entities[postId]
        if (existingPost) {
          existingPost.reactions[reaction]++
        }
      }),
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () => {
      return initialState
    })
  },
  selectors: {
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
})

export const { fetchPosts, postAdded, postUpdated, reactionAdded } = postsSlice.actions

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state: RootState, userId: string) => userId],
  (posts, userId) => posts.filter((post) => post.userId === userId),
)

export const { selectPostsStatus, selectPostsError } = postsSlice.selectors

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: postAdded.fulfilled,
    effect: async (action, listenerApi) => {
      const toastId = toast.show('New post added!', {
        variant: 'success',
        position: 'bottom-right',
        pause: true
      })

      await listenerApi.delay(5000)
      toast.remove(toastId)
    }
  })
}

export default postsSlice.reducer
