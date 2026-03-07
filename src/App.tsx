import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import History from "./pages/History";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalysisProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </BrowserRouter>
      </AnalysisProvider>
    </QueryClientProvider>
  );
}
