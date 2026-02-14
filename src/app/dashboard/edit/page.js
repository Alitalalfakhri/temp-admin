'use client'

import { Suspense } from "react";
import EditProductClient from './editClient.js'

export default function EditProduct(){

  return(
    <>
    <Suspense fallback={<div>Loading...</div>}>
      <EditProductClient/>
    </Suspense>
    </>
  )
}