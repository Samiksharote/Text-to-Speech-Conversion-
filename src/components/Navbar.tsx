import { AudioLines, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "About", page: "about" },
    { label: "Contact", page: "contact" },
    { label: "Login", page: "login" },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo + site name (left) */}
        <button
          onClick={() => handleNav("home")}
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30 transition-all group-hover:shadow-cyan-400/50">
            <AudioLines className="h-5 w-5 text-white" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-xl bg-cyan-400/40 blur-md -z-10" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            AI<span className="text-cyan-400">Voice</span>
          </span>
        </button>

        {/* Desktop nav (right) */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                currentPage === link.page
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
              {currentPage === link.page && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
