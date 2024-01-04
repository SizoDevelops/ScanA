import {configureStore } from '@reduxjs/toolkit'
import User from './Slice'
export default configureStore({
  reducer: {
    User
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
  })

})


