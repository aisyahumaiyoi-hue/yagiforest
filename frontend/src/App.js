import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { YagiProvider } from "@/store/YagiContext";
import { Toaster } from "@/components/ui/sonner";
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
import Orders from "@/pages/Orders";
import AskYagi from "@/pages/AskYagi";
import Superadmin from "@/pages/Superadmin";

function App() {
    return (
        <div className="app-root">
            <YagiProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
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
                        <Route path="/ask-yagi" element={<AskYagi />} />
                        <Route path="/superadmin" element={<Superadmin />} />
                    </Routes>
                </BrowserRouter>
                <Toaster position="top-center" />
            </YagiProvider>
        </div>
    );
}

export default App;
