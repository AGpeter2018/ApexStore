import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"

import CollectionPage from "./components/Collection"
import Homepage from "./pages/homepage"
import NavBar from "./components/Navbar-2"
import AddCollectionPage from "./pages/AddCollectionPage"
import CollectionDetailPage from "./pages/collectionDetailPage"
import ProductShow from "./components/productShow"
import ShowProductPage from "./pages/ShowProductPage"
import AddProductPage from "./pages/Product-admin"
import Footer from "./components/Footer"

function App() {
  return (
      <div>
        <Routes>
          <Route path="/" element={<Homepage/>}/>
        <Route path="/collections" element={
          <>
          <NavBar/>
            <CollectionPage/>
            </>    
          }
        />
            
        <Route path="/admin/add-collection" element={
          <>
          <NavBar/>
            <AddCollectionPage/>
            </>    
          }
        />

        <Route path="/collections/*" element={
          <>
          <NavBar/>
          <ShowProductPage/>
            </>    
          }
        />

        <Route path="/products/*" element={
            <>
          <NavBar/>
          <CollectionDetailPage/>
          <Footer/>
            </>    
          }
        />

        <Route path="/admin/add-product" element={
            <>
          <NavBar/>
          <AddProductPage/>
            </>    
          }
        />
        </Routes>
      </div>
  )
}

export default App
