import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Collections from '../components/Collection'
import ProductItem from '../components/ProductItem'

const CollectionDetailPage = () => {
  return (
    <div>
        <Routes>
            <Route index element={<Collections/>}/>
            <Route path=":slug" element={<ProductItem/>}/>
        </Routes>
    </div>
  )
}

export default CollectionDetailPage