import React from 'react'
import { Link, useParams } from 'react-router-dom'

import { useGetPostQuery } from '@/api/apiSlice'
import { useAppSelector } from '@/app/hooks'
import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'
import { selectCurrentUserId } from '@/features/auth/authSlice'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'

export const SinglePostPage = () => {
  const { postId } = useParams()
  const currentUserId = useAppSelector(selectCurrentUserId)!
  const { data: post, isFetching, isSuccess } = useGetPostQuery(postId!)

  const canEdit = currentUserId === post?.userId

  let content: React.ReactNode

  if (isFetching) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    content = (
      <article className="post">
        <h2>{post.title}</h2>
        <p>
          <PostAuthor userId={post.userId} />
        </p>
        <p className="post-content">{post.content}</p>
        <p>
          <TimeAgo timestamp={post.date} />
        </p>
        <ReactionButtons post={post} />
        {canEdit ? (
          <Link to={`/editPost/${post.id}`} className="button">
            Edit Post
          </Link>
        ) : null}
      </article>
    )
  }

  return <section>{content}</section>
}
