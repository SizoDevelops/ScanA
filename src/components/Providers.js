"use client"

import { DataProvider } from '@/lib/context'
import store from '@/lib/store'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { Provider } from 'react-redux'

export default function Providers({children}) {
  return (
    <Provider store={store}>
    <SessionProvider>
      
      <DataProvider>
         {children}
      </DataProvider>
    </SessionProvider>
    </Provider>
  )
}

