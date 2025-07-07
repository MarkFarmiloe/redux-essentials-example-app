import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'

import { fetchPosts, Post, selectAllPosts, selectPostsError, selectPostsStatus } from './postsSlice'
import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'

interface PostExcerptProps {
  post: Post
}

const PostExcerpt = React.memo(({ post }: PostExcerptProps) => {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  )
})

export const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postsStatus = useAppSelector(selectPostsStatus)
  const postsError = useAppSelector(selectPostsError)

  useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postsStatus, dispatch])

  // const renderedPosts = orderedPosts.map((post) => (
  //   <article className="post-excerpt" key={post.id}>
  //     <h3>{post.title}</h3>
  //     <p>
  //       <PostAuthor userId={post.userId} />
  //     </p>
  //     <p className="post-content">{post.content.substring(0, 100)}</p>
  //     <p>
  //       <TimeAgo timestamp={post.date} />
  //     </p>
  //     <ReactionButtons post={post} />
  //   </article>
  // ))

  let content: React.ReactNode

  switch (postsStatus) {
    case 'loading':
      content = <Spinner text="Loading..." />
      break
    case 'complete':
      const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))
      content = orderedPosts.map((post) => <PostExcerpt key={post.id} post={post} />)
      break
    case 'failed':
      content = <Spinner text="Loading..." />
      break
    default:
      content = null
      break
  }
  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
