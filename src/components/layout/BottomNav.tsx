import { useLocation, useNavigate } from "react-router-dom";
import { Home2, SearchNormal1, Calendar, Gift, Profile } from "iconsax-react";

const navItems = [
  { path: "/", icon: Home2, label: "Home" },
  { path: "/explore", icon: SearchNormal1, label: "Explore" },
  { path: "/bookings", icon: Calendar, label: "Bookings" },
  { path: "/rewards", icon: Gift, label: "Rewards" },
  { path: "/profile", icon: Profile, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on auth pages
  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-brutal border-border bg-card">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                size={22}
                variant={isActive ? "Bold" : "Linear"}
                color="currentColor"
              />
              <span className="text-caption font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
