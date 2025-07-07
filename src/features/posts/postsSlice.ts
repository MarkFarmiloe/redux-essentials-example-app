import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit'

import { client } from '@/api/client'

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

interface PostsState {
  items: Post[]
  status: 'idle' | 'loading' | 'complete' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  items: [],
  status: 'idle',
  error: null,
}

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
            condition(arg, thunkApi) {
              const { posts } = thunkApi.getState() as { posts: PostsState }
              return posts.status === 'idle'
            },
          },
          pending: (state, action) => {
            state.status = 'loading'
          },
          fulfilled: (state, action) => {
            state.status = 'complete'
            state.items.push(...action.payload)
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
          fulfilled: (state, action) => {
            state.status = 'complete'
            state.items.push(action.payload)
          },
        },
      ),
      postUpdated: create.reducer<PostUpdate>((postsState, action: PayloadAction<PostUpdate>) => {
        const { id, title, content } = action.payload
        const existingPost = postsState.items.find((post) => post.id === id)
        if (existingPost) {
          existingPost.title = title
          existingPost.content = content
        }
      }),
      reactionAdded: create.reducer<{ postId: string; reaction: ReactionName }>((postsState, action) => {
        const { postId, reaction } = action.payload
        const existingPost = postsState.items.find((post) => post.id === postId)
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
    selectAllPosts: (postsState) => postsState.items,
    selectPostById: (postsState, postId: string) => postsState.items.find((post) => post.id === postId),
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
})

export const { fetchPosts, postAdded, postUpdated, reactionAdded } = postsSlice.actions

export const selectPostsByUser = createSelector(
  [postsSlice.selectors.selectAllPosts, (state: RootState, userId: string) => userId],
  (posts, userId: string) => posts.filter((post) => post.userId === userId),
)

export const { selectAllPosts, selectPostById, selectPostsStatus, selectPostsError } = postsSlice.selectors

export default postsSlice.reducer
