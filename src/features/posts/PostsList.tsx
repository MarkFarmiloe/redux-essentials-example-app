import classNames from 'classnames'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useGetPostsQuery, Post } from '@/api/apiSlice'
import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'

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
  const { data: posts = [], isLoading, isFetching, isSuccess, isError, error } = useGetPostsQuery()

  const sortedPosts = useMemo(() => posts.slice().sort((a, b) => b.date.localeCompare(a.date)), [posts])

  let content: React.ReactNode

  if (isLoading) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    const renderedPosts = sortedPosts.map((post) => <PostExcerpt key={post.id} post={post} />)
    const containerClassname = classNames('posts-container', {
      disabled: isFetching,
    })
    content = <div className={containerClassname}>{renderedPosts}</div>
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
