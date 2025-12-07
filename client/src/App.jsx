import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

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
import SellerDashboard from "./pages/seller/SellerDashboard"
import OrdersPage from "./pages/seller/OrdersPage"
import OrderDetailPage from "./pages/seller/OrderDetailPage"
import UsersManagementPage from "./pages/admin/UsersManagementPage"
import ReportsPage from "./pages/admin/ReportsPage"
import LoginPage from "./pages/LoginPage"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(user)
    if (!user.role) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

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

        <Route path="/login" element={
            <>
          <NavBar/>
          <LoginPage/>
          <Footer/>
            </>    
          }
        />

        {/* Admin Route */}

        <Route path="/admin" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard/>
          </ProtectedRoute>
          <Footer/>
            </>    
          }
        />

        <Route path="/admin/add-collection" element={
          <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
            <AddCollectionPage/>
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/add-product" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <AddProductPage/>
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/productList" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <ProductsListPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/products/edit/:slug" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <EditProductPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/collection/list" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <CollectionsListPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/collections/edit/:id" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <EditCollectionPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/analytics" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <AnalyticsPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        {/* Admin User Route */}

          <Route path="/admin/users" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <UsersManagementPage/>    
          </ProtectedRoute>
          </>    
          }
        />
        
          <Route path="/admin/reports" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <ReportsPage/>    
          </ProtectedRoute>
          </>    
          }
        />


        {/* Seller Route */}

         <Route path="/seller" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <SellerDashboard/> 
            </ProtectedRoute>   
            </>    
          }
        />

         <Route path="/seller/orders" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <OrdersPage/>    
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/seller/orders/:id" element={
            <>
          <NavBar/>
          <OrderDetailPage/>    
            </>    
          }
        />
        </Routes>
      </div>
  )
}

export default App
