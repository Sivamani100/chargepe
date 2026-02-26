import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flash, Sms, Lock, User, Eye, EyeSlash } from "iconsax-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back! ⚡");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/20 brutal-border brutal-shadow flex items-center justify-center">
            <Flash size={28} variant="Bold" color="hsl(var(--primary))" />
          </div>
        </div>
        <h1 className="text-heading font-extrabold mt-3">
          <span className="text-primary neon-glow">CHARGE</span>
          <span className="text-accent neon-glow-accent">PE</span>
        </h1>
        <p className="text-caption text-muted-foreground mt-1">
          EV Charging Intelligence Platform
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm brutal-card p-6">
        <h2 className="text-subheading text-foreground font-bold mb-6 text-center">
          {isLogin ? "Welcome Back ⚡" : "Create Account 🚀"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="brutal-card flex items-center gap-3 px-3 py-2.5">
              <User size={20} color="hsl(var(--muted-foreground))" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="brutal-card flex items-center gap-3 px-3 py-2.5">
            <Sms size={20} color="hsl(var(--muted-foreground))" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="brutal-card flex items-center gap-3 px-3 py-2.5">
            <Lock size={20} color="hsl(var(--muted-foreground))" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeSlash size={20} color="hsl(var(--muted-foreground))" />
              ) : (
                <Eye size={20} color="hsl(var(--muted-foreground))" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn bg-primary text-primary-foreground py-3 font-bold text-body disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign In ⚡" : "Create Account 🚀"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-caption text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
