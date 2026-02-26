import { useLocation, useNavigate } from "react-router-dom";
import { Home, SearchNormal1, Calendar, Profile } from "iconsax-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/explore", icon: SearchNormal1, label: "Explore" },
  { path: "/bookings", icon: Calendar, label: "Bookings" },
  { path: "/profile", icon: Profile, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth" || location.pathname === "/add-station") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 brutal-card border-t border-border">
      <div className="flex items-center justify-around py-2 px-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 p-2 brutal-card transition-all ${
                isActive
                  ? "bg-accent text-accent-foreground shadow-brutal"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon
                size={18}
                variant={isActive ? "Bold" : "Linear"}
                color="currentColor"
              />
              <span className="text-caption font-bold text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
