import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import DashboardHome from "./pages/DashboardHome";
import AllTasks from "./pages/AllTasks";
import TaskDetail from "./pages/TaskDetail";
import Templates from "./pages/Templates";
import TemplateBuilder from "./pages/TemplateBuilder";
import Analytics from "./pages/Analytics";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/tasks" element={<AllTasks />} />
          <Route path="/dashboard/tasks/:id" element={<TaskDetail />} />
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/templates/builder" element={<TemplateBuilder />} />
          <Route path="/dashboard/templates/builder/:id" element={<TemplateBuilder />} />
          <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
          <Route path="/dashboard/analytics-old" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
