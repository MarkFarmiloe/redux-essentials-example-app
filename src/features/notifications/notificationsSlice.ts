import { client } from '@/api/client'

import { createAppSlice } from '@/app/withTypes'

export interface ServerNotification {
  id: string
  date: string
  message: string
  user: string
}

export interface ClientNotification extends ServerNotification {
  read: boolean
  isNew: boolean
}

const initialState: ClientNotification[] = []

const notificationsSlice = createAppSlice({
  name: 'notifications',
  initialState,
  reducers: (create) => {
    return {
      fetchNotifications: create.asyncThunk(
        async (_notused, thunkApi) => {
          const { notifications } = thunkApi.getState() as { notifications: ServerNotification[] }
          const [latestNotification] = notifications
          const latestTimestamp = latestNotification ? latestNotification.date : ''
          const response = await client.get<ServerNotification[]>(`/fakeApi/notifications?since=${latestTimestamp}`)
          return response.data
        },
        {
          fulfilled: (notificationState, action) => {
            const notificationsWithMetadata: ClientNotification[] =
              action.payload.map(notification => ({
                ...notification,
                read: false,
                isNew: true
              }))
            notificationState.forEach(notification => {
              notification.isNew = !notification.read
            })
            notificationState.push(...notificationsWithMetadata)
            // Sort with newest first
            notificationState.sort((a, b) => b.date.localeCompare(a.date))
          },
        },
      ),
      allNotificationRead: create.reducer((notificationState) => {
        notificationState.forEach(notification => {
          notification.read = true
        })
      })
    }
  },
  selectors: {
    selectAllNotifications: (notificationState) => notificationState,
    selectUnreadNotificationsCount: (notificationState) => {
      const unreadNotifications = notificationState.filter(notification => !notification.read)
      return unreadNotifications.length
    }
  },
})

export const { fetchNotifications, allNotificationRead } = notificationsSlice.actions

export const { selectAllNotifications, selectUnreadNotificationsCount  } = notificationsSlice.selectors

export default notificationsSlice.reducer
