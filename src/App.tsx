import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

import { useAppSelector } from './app/hooks'
import { Navbar } from './components/Navbar'

import { LoginPage } from './features/auth/LoginPage'
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
import { EditPostForm } from './features/posts/EditPostForm'
import { NotificationsList } from './features/notifications/NotificationsList'

import { selectCurrentUserId } from './features/auth/authSlice'
import { UsersList } from './features/users/UsersList'
import { UserPage } from './features/users/UserPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const username = useAppSelector(selectCurrentUserId)

  if (!username) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <div className="App">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/posts" element={<PostsMainPage />}></Route>
                    <Route path="/posts/:postId" element={<SinglePostPage />}></Route>
                    <Route path="/editPost/:postId" element={<EditPostForm />}></Route>
                    <Route path="/users" element={<UsersList />} />
                    <Route path="/users/:userId" element={<UserPage />} />
                    <Route path="/notifications" element={<NotificationsList />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
