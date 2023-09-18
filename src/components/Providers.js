"use client"

import { DataProvider } from '@/lib/context'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

export default function Providers({children}) {
  return (
    <SessionProvider>
      <DataProvider>
         {children}
      </DataProvider>
    </SessionProvider>
  )
}

