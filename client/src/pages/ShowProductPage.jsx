import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProductShow from '../components/ProductShow'

const ShowProductPage = () => {
  return (
    <div>
      <Routes>
        <Route path="/:slug" element={<ProductShow />} />
      </Routes>
    </div>
  )
}

export default ShowProductPage