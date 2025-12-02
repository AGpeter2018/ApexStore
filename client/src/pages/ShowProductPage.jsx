import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProductShow from '../components/productShow'

const ShowProductPage = () => {
  return (
    <div>
        <Routes>
            <Route path="/:slug" element={<ProductShow/>}/>
        </Routes>
        {/* <ProductShow/> */}
    </div>
  )
}

export default ShowProductPage