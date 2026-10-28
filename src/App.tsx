import { useState } from "react";
import Navbar from "@/components/Navbar";
import Converter from "@/components/Converter";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "about":
        return <AboutPage onNavigate={setPage} />;
      case "contact":
        return <ContactPage />;
      case "login":
        return <LoginPage onNavigate={setPage} />;
      default:
        return <Converter />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-cyan-400/5 blur-[100px]" />
      </div>
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative z-10">
        <Navbar currentPage={page} onNavigate={setPage} />
        <main className="px-4 pt-24 pb-12 sm:px-6 lg:px-8">
          <div key={page} className="animate-fade-in-up">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
