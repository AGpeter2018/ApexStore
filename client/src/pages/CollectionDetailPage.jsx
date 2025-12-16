import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProductItem from '../components/ProductItem'

const CollectionDetailPage = () => {
  return (
    <div>
        <Routes>
            <Route path=":slug" element={<ProductItem/>}/>
        </Routes>
    </div>
  )
}

export default CollectionDetailPage