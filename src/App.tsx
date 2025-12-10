import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Stores from "./pages/Stores";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminBrands from "./pages/AdminBrands";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import MyRatings from "./pages/MyRatings";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/brands" element={<AdminBrands />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-ratings" element={<MyRatings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);export default App;
