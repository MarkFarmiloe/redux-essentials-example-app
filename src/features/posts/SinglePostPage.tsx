import { Link, useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectCurrentUserId } from '../auth/authSlice'
import { selectPostById } from './postsSlice'
import { PostAuthor } from './PostAuthor'
import { TimeAgo } from '@/components/TimeAgo'
import { ReactionButtons } from './ReactionButtons'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector((state) => selectPostById(state, postId!))

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  const currentUserId = useAppSelector(selectCurrentUserId)!
  const canEdit = currentUserId === post.userId

  return (
    <section>
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
    </section>
  )
}
