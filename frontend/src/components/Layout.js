import { Link, NavLink } from "react-router-dom";
import { Beer, MapPin, Shuffle, Heart, BarChart3, Route as RouteIcon } from "lucide-react";

const navItems = [
  { to: "/hospody", label: "Hospody", icon: Beer, testid: "nav-pubs" },
  { to: "/blizko", label: "Najdi blízko", icon: MapPin, testid: "nav-nearest" },
  { to: "/tah", label: "Hospodský tah", icon: RouteIcon, testid: "nav-crawl" },
  { to: "/oblibene", label: "Oblíbené", icon: Heart, testid: "nav-favorites" },
  { to: "/statistiky", label: "Statistiky", icon: BarChart3, testid: "nav-stats" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen paper-bg flex flex-col">
      <header className="border-b border-stone-200/70 bg-[#FAF9F6]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
          <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-serif text-xl group-hover:bg-amber-800 transition-colors">
              P
            </div>
            <div className="leading-tight">
              <div className="font-serif text-2xl text-stone-900">Pražské Hospody</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-700">Průvodce na pivo</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testid}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-sans tracking-wide transition-colors flex items-center gap-2 ${
                    isActive
                      ? "text-amber-800 border-b-2 border-amber-700"
                      : "text-stone-700 hover:text-amber-800 border-b-2 border-transparent"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="md:hidden border-t border-stone-200/70 overflow-x-auto">
          <nav className="flex items-center px-4 gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`mobile-${item.testid}`}
                className={({ isActive }) =>
                  `py-2 text-xs font-sans whitespace-nowrap flex items-center gap-1 ${
                    isActive ? "text-amber-800 border-b-2 border-amber-700" : "text-stone-600"
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-6 text-sm text-stone-600">
          <div>
            <div className="font-serif text-2xl text-stone-900">Pražské Hospody</div>
            <p className="mt-2">Editoriální průvodce pivními hospodami napříč Prahou. Na zdraví.</p>
          </div>
          <div>
            <div className="uppercase text-xs tracking-[0.2em] text-amber-700 mb-2">Funkce</div>
            <ul className="space-y-1">
              <li>Filtr podle čtvrti i pivovaru</li>
              <li>Náhodný výběr „Kam dnes?“</li>
              <li>Plánovač hospodského tahu</li>
              <li>Hodnocení s přezdívkou</li>
            </ul>
          </div>
          <div>
            <div className="uppercase text-xs tracking-[0.2em] text-amber-700 mb-2">Pivní moudro</div>
            <p className="italic font-serif text-lg text-stone-700">
              „Cesta dlouhá tisíc krků začíná prvním ležákem.“
            </p>
          </div>
        </div>
        <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Pražské Hospody · Pivem se neplýtvá
        </div>
      </footer>
    </div>
  );
}
