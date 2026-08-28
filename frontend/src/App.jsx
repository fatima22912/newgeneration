import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/common/ToastProvider";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Maintenance from "./pages/public/Maintenance";
import { env } from "./config/env";

export default function App() {
  if (env.maintenanceMode) {
    return <Maintenance />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
