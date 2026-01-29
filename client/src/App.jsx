import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import CategoryPage from "./components/Category"
import Homepage from "./pages/homepage"
import CollectionDetailPage from "./pages/CollectionDetailPage"
import ShowProductPage from "./pages/ShowProductPage"
import AddProductPage from "./pages/Product-admin"
import MainLayout from "./components/MainLayout"

import AddCategoryPage from "./pages/admin/AddCategoryPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductsListPage from "./pages/admin/ProductsListPage"
import EditProductPage from "./pages/admin/EditProductPage"
import AnalyticsPage from "./pages/admin/AnalyticsPage"
import VendorDashboard from "./pages/vendor/VendorDashboard"
import VendorSettingsPage from "./pages/vendor/VendorSettingsPage"
import OrdersPage from "./pages/vendor/OrdersPage"
import OrderDetailPage from "./pages/vendor/OrderDetailPage"
import PaymentsPage from "./pages/vendor/PaymentsPage"
import AnalyticsDashboard from "./pages/vendor/AnalyticsDashboard"
import UsersManagementPage from "./pages/admin/UsersManagementPage"
import ReportsPage from "./pages/admin/ReportsPage"
import AdminPayoutPage from "./pages/admin/AdminPayoutPage"
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import EditCategoryPage from "./pages/admin/EditCategoryPage"
import CategoriesListPage from "./pages/admin/CategoriesListPage"
import VendorsManagementPage from "./pages/admin/VendorsManagementPage"
import VendorAccountDetailPage from "./pages/admin/VendorAccountDetailPage"
import CustomerAIAssistant from "./components/CustomerAIAssistant"
import SearchPage from "./pages/SearchPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import MyOrdersPage from "./pages/customer/MyOrdersPage"
import CustomerOrderDetailPage from "./pages/customer/CustomerOrderDetailPage"
import WishlistPage from "./pages/customer/WishlistPage"
import OpenDisputePage from "./pages/customer/OpenDisputePage"
import DisputeListPage from "./pages/customer/DisputeListPage"
import DisputeDetailsPage from "./pages/customer/DisputeDetailsPage"

import { useDispatch } from "react-redux"
import { fetchCart } from "./redux/slices/cartSlice"
import { fetchWishlist } from "./redux/slices/wishlistSlice"
import PaymentVerificationPage from "./pages/PaymentVerificationPage"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token && user.role === 'customer') {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/categories" element={
          <MainLayout>
            <CategoryPage />
          </MainLayout>
        }
        />


        <Route path="/categories/*" element={
          <MainLayout>
            <ShowProductPage />
          </MainLayout>
        }
        />

        <Route path="/products/*" element={
          <MainLayout>
            <CollectionDetailPage />
          </MainLayout>
        }
        />

        <Route path="/login" element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
        />

        <Route path="/register" element={
          <MainLayout>
            <RegisterPage />
          </MainLayout>
        }
        />

        <Route path="/forgot-password" element={
          <MainLayout>
            <ForgotPasswordPage />
          </MainLayout>
        }
        />

        <Route path="/reset-password/:token" element={
          <MainLayout>
            <ResetPasswordPage />
          </MainLayout>
        }
        />

        <Route path="/search" element={
          <MainLayout>
            <SearchPage />
          </MainLayout>
        } />

        {/* Cart and Checkout Routes */}
        <Route path="/cart" element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        } />
        <Route path="/wishlist" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <WishlistPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/checkout" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <CheckoutPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/order-confirmation/:orderId" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderConfirmationPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/my-orders" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrdersPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/my-orders/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerOrderDetailPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/payment/verify" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer']}>
              <PaymentVerificationPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        {/* Dispute Center Routes */}
        <Route path="/customer/disputes/open/:orderId" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OpenDisputePage />
          </ProtectedRoute>
        } />

        <Route path="/disputes" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
              <DisputeListPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/disputes/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
              <DisputeDetailsPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        {/* Admin Route */}

        <Route path="/admin" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/categories/add" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AddCategoryPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/product/add" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AddProductPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/product/list" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <ProductsListPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/products/edit/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <EditProductPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/categories" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <CategoriesListPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/categories/edit/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <EditCategoryPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/product-analytics" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        {/* Admin User Route */}

        <Route path="/admin/users" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersManagementPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/reports" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/vendors" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorsManagementPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />
        <Route path="/admin/vendors/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorAccountDetailPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/orders" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
              <OrdersPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/orders/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
              <OrderDetailPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/payments" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <PaymentsPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/analytics" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/settings" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorSettingsPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/payouts" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayoutPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/admin/analytics" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/product/list" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <ProductsListPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/products/edit/:id" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <EditProductPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

        <Route path="/vendor/product/add" element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['vendor']}>
              <AddProductPage />
            </ProtectedRoute>
          </MainLayout>
        }
        />

      </Routes>
      <CustomerAIAssistant />
    </div>
  )
}

export default App
