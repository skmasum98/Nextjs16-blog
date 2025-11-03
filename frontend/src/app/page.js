import HomePageComponent from '@/components/HomePage'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <Suspense fallback={<div>Loading blogs...</div>}>
      <HomePageComponent />
    </Suspense>
  )
}
