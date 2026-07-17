import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/roles";

import Home from "../pages/public/Home";
import Catalogue from "../pages/public/Catalogue";
import ProductDetail from "../pages/public/ProductDetail";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderConfirmation from "../pages/public/OrderConfirmation";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import TermsOfSale from "../pages/public/legal/TermsOfSale";
import PrivacyPolicy from "../pages/public/legal/PrivacyPolicy";
import LegalNotice from "../pages/public/legal/LegalNotice";
import ReturnPolicy from "../pages/public/legal/ReturnPolicy";
import NotFound from "../pages/public/NotFound";
import ServerError from "../pages/public/ServerError";

import OwnerLogin from "../pages/owner/OwnerLogin";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ProductList from "../pages/owner/ProductList";
import ProductForm from "../pages/owner/ProductForm";
import CategoryManager from "../pages/owner/CategoryManager";
import StockOverview from "../pages/owner/StockOverview";
import OrderList from "../pages/owner/OrderList";
import OrderDetail from "../pages/owner/OrderDetail";
import OwnerMessages from "../pages/owner/OwnerMessages";
import OwnerMessageDetail from "../pages/owner/OwnerMessageDetail";
import OwnerStatistics from "../pages/owner/OwnerStatistics";
import OwnerProfile from "../pages/owner/OwnerProfile";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import OwnerAccountsList from "../pages/admin/OwnerAccountsList";
import OwnerAccountForm from "../pages/admin/OwnerAccountForm";
import ActivityLog from "../pages/admin/ActivityLog";
import GlobalStatistics from "../pages/admin/GlobalStatistics";
import SystemSettings from "../pages/admin/SystemSettings";
import AdminProfile from "../pages/admin/AdminProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/produits/:slug" element={<ProductDetail />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/commande" element={<Checkout />} />
          <Route path="/confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cgv" element={<TermsOfSale />} />
          <Route path="/confidentialite" element={<PrivacyPolicy />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/retours-echanges" element={<ReturnPolicy />} />
          <Route path="/erreur-serveur" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/proprietaire/connexion" element={<OwnerLogin />} />
        <Route
          path="/proprietaire"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]} redirectTo="/proprietaire/connexion">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="tableau-de-bord" element={<OwnerDashboard />} />
          <Route path="produits" element={<ProductList />} />
          <Route path="produits/nouveau" element={<ProductForm />} />
          <Route path="produits/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="stock" element={<StockOverview />} />
          <Route path="commandes" element={<OrderList />} />
          <Route path="commandes/:id" element={<OrderDetail />} />
          <Route path="messages" element={<OwnerMessages />} />
          <Route path="messages/:id" element={<OwnerMessageDetail />} />
          <Route path="statistiques" element={<OwnerStatistics />} />
          <Route path="profil" element={<OwnerProfile />} />
        </Route>

        <Route path="/admin/connexion" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/admin/connexion">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="tableau-de-bord" element={<AdminDashboard />} />
          <Route path="comptes-proprietaires" element={<OwnerAccountsList />} />
          <Route path="comptes-proprietaires/nouveau" element={<OwnerAccountForm />} />
          <Route path="comptes-proprietaires/:id" element={<OwnerAccountForm />} />
          <Route path="journal-activite" element={<ActivityLog />} />
          <Route path="statistiques" element={<GlobalStatistics />} />
          <Route path="parametres" element={<SystemSettings />} />
          <Route path="profil" element={<AdminProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
