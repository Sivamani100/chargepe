import { useNavigate } from "react-router-dom";
import { Profile, Logout, Setting2, Flash, ArrowRight2, Sun1, Moon } from "iconsax-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out ⚡");
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <p className="text-body text-muted-foreground mb-4">Sign in to view your profile</p>
          <button onClick={() => navigate("/auth")} className="brutal-btn bg-primary text-primary-foreground px-6 py-2 font-bold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold flex items-center gap-2">
          <Profile size={22} variant="Bold" color="hsl(var(--primary))" />
          Profile
        </h1>
      </header>

      <div className="px-4 mb-6">
        <div className="brutal-card p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/15 border border-border flex items-center justify-center">
            <Profile size={32} variant="Bold" color="hsl(var(--primary))" />
          </div>
          <div className="flex-1">
            <h2 className="text-subheading text-foreground font-bold">
              {profile?.full_name || "EV Driver"}
            </h2>
            <p className="text-caption text-muted-foreground">{user.email}</p>
            <p className="text-caption text-accent font-bold mt-1">
              {profile?.reward_points || 0} Points ⚡
            </p>
            {isAdmin && (
              <span className="text-caption bg-primary/15 text-primary font-bold px-2 py-0.5 rounded mt-1 inline-block">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {profile && (
        <div className="px-4 mb-6 flex gap-3">
          <div className="flex-1 brutal-card p-3 text-center">
            <p className="text-heading text-primary font-bold">{profile.reward_points || 0}</p>
            <p className="text-caption text-muted-foreground">Points</p>
          </div>
          <div className="flex-1 brutal-card-accent p-3 text-center">
            <p className="text-heading text-accent font-bold">{profile.carbon_saved_kg || 0}kg</p>
            <p className="text-caption text-muted-foreground">CO₂ Saved</p>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 mb-6 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full brutal-card p-4 flex items-center gap-3"
        >
          {theme === "dark" ? <Sun1 size={20} color="hsl(var(--primary))" /> : <Moon size={20} color="hsl(var(--primary))" />}
          <span className="text-body text-foreground font-semibold flex-1 text-left">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
          <ArrowRight2 size={16} color="hsl(var(--muted-foreground))" />
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="w-full brutal-card p-4 flex items-center gap-3"
          >
            <Setting2 size={20} color="hsl(var(--primary))" />
            <span className="text-body text-foreground font-semibold flex-1 text-left">Admin Dashboard</span>
            <ArrowRight2 size={16} color="hsl(var(--muted-foreground))" />
          </button>
        )}

        <button
          onClick={() => navigate("/add-station")}
          className="w-full brutal-card p-4 flex items-center gap-3"
        >
          <Flash size={20} color="hsl(var(--primary))" />
          <span className="text-body text-foreground font-semibold flex-1 text-left">Add Station</span>
          <ArrowRight2 size={16} color="hsl(var(--muted-foreground))" />
        </button>
      </div>

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
