import { useNavigate } from "react-router-dom";
import { Profile, Logout, Setting2, Notification, SecuritySafe, Flash, ArrowRight2 } from "iconsax-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { icon: Setting2, label: "Settings", path: "/settings" },
  { icon: Notification, label: "Notifications", path: "/notifications" },
  { icon: SecuritySafe, label: "Privacy & Security", path: "/privacy" },
  { icon: Flash, label: "My Vehicles", path: "/vehicles" },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out ⚡");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold flex items-center gap-2">
          <Profile size={22} variant="Bold" color="hsl(var(--primary))" />
          Profile
        </h1>
      </header>

      {/* User Card */}
      <div className="px-4 mb-6">
        <div className="brutal-card p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-primary/20 brutal-border brutal-shadow flex items-center justify-center">
            <Profile size={32} variant="Bold" color="hsl(var(--primary))" />
          </div>
          <div className="flex-1">
            <h2 className="text-subheading text-foreground font-bold">EV Driver</h2>
            <p className="text-caption text-muted-foreground">driver@chargepe.com</p>
            <p className="text-caption text-accent font-bold mt-1">1,250 Points ⚡</p>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="brutal-btn bg-primary/10 text-primary px-3 py-1.5 text-caption font-bold"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mb-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full brutal-card p-4 flex items-center gap-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all"
            >
              <Icon size={20} color="hsl(var(--primary))" />
              <span className="text-body text-foreground font-semibold flex-1 text-left">{item.label}</span>
              <ArrowRight2 size={16} color="hsl(var(--muted-foreground))" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full brutal-btn bg-destructive/10 text-destructive py-3 font-bold text-body flex items-center justify-center gap-2"
        >
          <Logout size={20} color="currentColor" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
