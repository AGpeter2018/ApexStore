import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"

import CollectionPage from "./components/Collection"
import Homepage from "./pages/homepage"
import NavBar from "./components/Navbar-2"
import CollectionDetailPage from "./pages/collectionDetailPage"
import ShowProductPage from "./pages/ShowProductPage"
import AddProductPage from "./pages/Product-admin"
import Footer from "./components/Footer"

import AddCollectionPage from "./pages/admin/AddCollectionPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductsListPage from "./pages/admin/ProductsListPage"
import EditProductPage from "./pages/admin/EditProductPage"
import CollectionsListPage from "./pages/admin/CollectionsListPage"
import EditCollectionPage from "./pages/admin/EditCollectionPage"
import AnalyticsPage from "./pages/admin/AnalyticsPage"

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

        <Route path="/admin" element={
            <>
          <NavBar/>
          <AdminDashboard/>
          <Footer/>
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

        <Route path="/admin/add-product" element={
            <>
          <NavBar/>
          <AddProductPage/>
            </>    
          }
        />

        <Route path="/admin/productList" element={
            <>
          <NavBar/>
          <ProductsListPage/>    
            </>    
          }
        />

        <Route path="/admin/products/edit/:slug" element={
            <>
          <NavBar/>
          <EditProductPage/>    
            </>    
          }
        />

        <Route path="/admin/collection/list" element={
            <>
          <NavBar/>
          <CollectionsListPage/>    
            </>    
          }
        />

        <Route path="/admin/collections/edit/:id" element={
            <>
          <NavBar/>
          <EditCollectionPage/>    
            </>    
          }
        />

        <Route path="/admin/analytics" element={
            <>
          <NavBar/>
          <AnalyticsPage/>    
            </>    
          }
        />
        </Routes>
      </div>
  )
}

export default App
