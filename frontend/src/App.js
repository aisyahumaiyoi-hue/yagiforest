import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { YagiProvider } from "@/store/YagiContext";
import { Toaster } from "@/components/ui/sonner";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Routine from "@/pages/Routine";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Rewards from "@/pages/Rewards";
import Impact from "@/pages/Impact";
import Orders from "@/pages/Orders";
import AskYagi from "@/pages/AskYagi";
import Superadmin from "@/pages/Superadmin";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/landing" element={<Onboarding />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/ask-yagi" element={<AskYagi />} />
            <Route path="/superadmin" element={<Superadmin />} />
        </Routes>
    );
}

function App() {
    return (
        <div className="app-root">
            <YagiProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                <Toaster position="top-center" />
            </YagiProvider>
        </div>
    );
}

export default App;
