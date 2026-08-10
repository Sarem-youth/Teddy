import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import StorefrontLayout from './components/layout/StorefrontLayout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import ConstructionServices from './pages/ConstructionServices.jsx';
import Gallery from './pages/Gallery.jsx';
import NotFound from './pages/NotFound.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

import AccountLayout from './pages/account/AccountLayout.jsx';
import AccountOverview from './pages/account/Overview.jsx';
import AccountOrders from './pages/account/Orders.jsx';
import AccountOrderDetail from './pages/account/OrderDetail.jsx';
import AccountAddresses from './pages/account/Addresses.jsx';
import AccountProfile from './pages/account/Profile.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminProductForm from './pages/admin/ProductForm.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetail from './pages/admin/OrderDetail.jsx';
import AdminMedia from './pages/admin/Media.jsx';
import AdminCustomers from './pages/admin/Customers.jsx';
import AdminMessages from './pages/admin/Messages.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminConstruction from './pages/admin/Construction.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Storefront */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:identifier" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/construction-services" element={<ConstructionServices />} />

          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/order-success/:orderNumber"
            element={
              <RequireAuth>
                <OrderSuccess />
              </RequireAuth>
            }
          />

          {/* Customer activity hub (REQ-3.3.2) */}
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AccountOverview />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:orderNumber" element={<AccountOrderDetail />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="profile" element={<AccountProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin portal (NFR-4.2.3 RBAC) */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="construction" element={<AdminConstruction />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}
