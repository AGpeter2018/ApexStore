import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import CategoryPage from "./components/Category"
import Homepage from "./pages/homepage"
import NavBar from "./components/Navbar-2"
import CollectionDetailPage from "./pages/collectionDetailPage"
import ShowProductPage from "./pages/ShowProductPage"
import AddProductPage from "./pages/Product-admin"
import Footer from "./components/Footer"

import AddCategoryPage from "./pages/admin/AddCategoryPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductsListPage from "./pages/admin/ProductsListPage"
import EditProductPage from "./pages/admin/EditProductPage"
import AnalyticsPage from "./pages/admin/AnalyticsPage"
import SellerDashboard from "./pages/seller/SellerDashboard"
import OrdersPage from "./pages/seller/OrdersPage"
import OrderDetailPage from "./pages/seller/OrderDetailPage"
import UsersManagementPage from "./pages/admin/UsersManagementPage"
import ReportsPage from "./pages/admin/ReportsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import EditCategoryPage from "./pages/admin/EditCategoryPage"
import CategoriesListPage from "./pages/admin/CategoriesListPage"

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
        <Route path="/categories" element={
          <>
          <NavBar/>
            <CategoryPage/>
            <Footer/>
            </>    
          }
        />
            

        <Route path="/categories/*" element={
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

        <Route path="/register" element={
            <>
          <NavBar/>
          <RegisterPage/>
          <Footer/>
            </>    
          }
        />

        <Route path="/forgot-password" element={
            <>
          <NavBar/>
          <ForgotPasswordPage/>
          <Footer/>
            </>    
          }
        />

        <Route path="/reset-password/:token" element={
            <>
          <NavBar/>
          <ResetPasswordPage/>
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

        <Route path="/admin/categories/add" element={
          <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
            <AddCategoryPage/>
            <Footer/>
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/product/add" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller','admin']}>
          <AddProductPage/>
          <Footer/>
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/product/list" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller','admin']}>
          <ProductsListPage/> 
          <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/products/edit/:id" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <EditProductPage/> 
          <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/categories" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <CategoriesListPage/> 
          <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/categories/edit/:id" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <EditCategoryPage/>  
           <Footer/>     
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/admin/analytics" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <AnalyticsPage/>    
           <Footer/>   
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
           <Footer/>     
          </ProtectedRoute>
          </>    
          }
        />
        
          <Route path="/admin/reports" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['admin']}>
          <ReportsPage/>    
           <Footer/>   
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
             <Footer/>   
            </ProtectedRoute>   
            </>    
          }
        />

         <Route path="/seller/orders" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <OrdersPage/>  
           <Footer/>     
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/seller/orders/:id" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <OrderDetailPage/>    
           <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

        <Route path="/seller/product/list" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <ProductsListPage />    
           <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

          <Route path="/seller/products/edit/:slug" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <EditProductPage/> 
          <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />
        
         <Route path="/seller/product/add" element={
            <>
          <NavBar/>
          <ProtectedRoute allowedRoles={['seller','admin']}>
          <AddProductPage/>
           <Footer/>   
          </ProtectedRoute>
            </>    
          }
        />

        </Routes>
      </div>
  )
}

export default App
