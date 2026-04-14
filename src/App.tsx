import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import ArticlePage from "./pages/ArticlePage.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminPosts from "./pages/admin/Posts.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminPrintEditions from "./pages/admin/PrintEditions.tsx";
import AdminAnalytics from "./pages/admin/Analytics.tsx";
import AdminUsersManagement from "./pages/admin/UsersManagement.tsx";
import AdminSiteSettings from "./pages/admin/SiteSettings.tsx";
import { useSiteMeta } from "@/hooks/useSiteMeta";

const queryClient = new QueryClient();

const SiteMetaLoader = () => {
  useSiteMeta();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SiteMetaLoader />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/noticia/:slug" element={<ArticlePage />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="print" element={<AdminPrintEditions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUsersManagement />} />
              <Route path="settings" element={<AdminSiteSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
