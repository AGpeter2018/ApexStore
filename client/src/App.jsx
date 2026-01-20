import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import CategoryPage from "./components/Category"
import Homepage from "./pages/homepage"
import NavBar from "./components/NavBar-2"
import CollectionDetailPage from "./pages/CollectionDetailPage"
import ShowProductPage from "./pages/ShowProductPage"
import AddProductPage from "./pages/Product-admin"
import Footer from "./components/Footer"

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
          <>
            <NavBar />
            <CategoryPage />
            <Footer />
          </>
        }
        />


        <Route path="/categories/*" element={
          <>
            <NavBar />
            <ShowProductPage />
          </>
        }
        />

        <Route path="/products/*" element={
          <>
            <NavBar />
            <CollectionDetailPage />
            <Footer />
          </>
        }
        />

        <Route path="/login" element={
          <>
            <NavBar />
            <LoginPage />
            <Footer />
          </>
        }
        />

        <Route path="/register" element={
          <>
            <NavBar />
            <RegisterPage />
            <Footer />
          </>
        }
        />

        <Route path="/forgot-password" element={
          <>
            <NavBar />
            <ForgotPasswordPage />
            <Footer />
          </>
        }
        />

        <Route path="/reset-password/:token" element={
          <>
            <NavBar />
            <ResetPasswordPage />
            <Footer />
          </>
        }
        />

        <Route path="/search" element={<SearchPage />} />

        {/* Cart and Checkout Routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <WishlistPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        <Route path="/checkout" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <CheckoutPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        <Route path="/order-confirmation/:orderId" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderConfirmationPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        <Route path="/my-orders" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrdersPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        <Route path="/my-orders/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerOrderDetailPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        <Route path="/payment/verify" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['customer']}>
              <PaymentVerificationPage />
            </ProtectedRoute>
            <Footer />
          </>
        } />

        {/* Dispute Center Routes */}
        <Route path="/customer/disputes/open/:orderId" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OpenDisputePage />
          </ProtectedRoute>
        } />

        <Route path="/disputes" element={
          <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
            <DisputeListPage />
          </ProtectedRoute>
        } />

        <Route path="/disputes/:id" element={
          <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
            <DisputeDetailsPage />
          </ProtectedRoute>
        } />

        {/* Admin Route */}

        <Route path="/admin" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
            <Footer />
          </>
        }
        />

        <Route path="/admin/categories/add" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AddCategoryPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/product/add" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AddProductPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/product/list" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <ProductsListPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/products/edit/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <EditProductPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/categories" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <CategoriesListPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/categories/edit/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <EditCategoryPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/product-analytics" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        {/* Admin User Route */}

        <Route path="/admin/users" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersManagementPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/reports" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/vendors" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorsManagementPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />
        <Route path="/admin/vendors/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorAccountDetailPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/orders" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
              <OrdersPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/orders/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
              <OrderDetailPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/payments" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <PaymentsPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/analytics" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <AnalyticsDashboard />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/settings" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorSettingsPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/payouts" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayoutPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/admin/analytics" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalyticsPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/product/list" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <ProductsListPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/products/edit/:id" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <EditProductPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

        <Route path="/vendor/product/add" element={
          <>
            <NavBar />
            <ProtectedRoute allowedRoles={['vendor']}>
              <AddProductPage />
              <Footer />
            </ProtectedRoute>
          </>
        }
        />

      </Routes>
      <CustomerAIAssistant />
    </div>
  )
}

export default App
