import { client } from '@/api/client'

import type { RootState } from '@/app/store'
import { createAppSlice } from '@/app/withTypes'
import { createEntityAdapter } from '@reduxjs/toolkit'

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

const notificationsAdapter = createEntityAdapter<ClientNotification>({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState = notificationsAdapter.getInitialState()

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
            Object.values(notificationState.entities).forEach(notification => {
              notification.isNew = !notification.read
            })
            notificationsAdapter.upsertMany(notificationState, notificationsWithMetadata)
          },
        },
      ),
      allNotificationRead: create.reducer((notificationState) => {
        Object.values(notificationState.entities).forEach(notification => {
          notification.read = true
        })
      })
    }
  },
  selectors: {
    selectUnreadNotificationsCount: (notificationState) => {
      const unreadNotifications = Object.values(notificationState).filter(notification => !notification.read)
      return unreadNotifications.length
    }
  },
})

export const { fetchNotifications, allNotificationRead } = notificationsSlice.actions

export const { selectUnreadNotificationsCount } = notificationsSlice.selectors

export const { selectAll: selectAllNotifications } = 
  notificationsAdapter.getSelectors((state: RootState) => state.notifications)

export default notificationsSlice.reducer
