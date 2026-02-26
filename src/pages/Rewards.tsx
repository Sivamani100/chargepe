import { Gift, Cup, Medal, Star1 } from "iconsax-react";

const badges = [
  { name: "Early Adopter", icon: Star1, earned: true },
  { name: "Green Warrior", icon: Medal, earned: true },
  { name: "Top Charger", icon: Cup, earned: false },
  { name: "EV Hero", icon: Gift, earned: false },
];

const Rewards = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold flex items-center gap-2">
          <Gift size={22} variant="Bold" color="hsl(var(--accent))" />
          Rewards
        </h1>
      </header>

      {/* Points Card */}
      <div className="px-4 mb-6">
        <div className="brutal-card-accent p-6 text-center">
          <p className="text-caption text-muted-foreground mb-1">Total Points</p>
          <p className="text-4xl font-extrabold text-accent neon-glow-accent">1,250</p>
          <p className="text-caption text-muted-foreground mt-2">🌱 32kg CO₂ Saved</p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 mb-6">
        <h2 className="text-subheading text-foreground font-bold mb-3">🏆 Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.name}
                className={`brutal-card p-4 text-center ${!badge.earned ? "opacity-40" : ""}`}
              >
                <Icon
                  size={32}
                  variant="Bold"
                  color={badge.earned ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                />
                <p className="text-caption text-foreground font-bold mt-2">{badge.name}</p>
                <p className="text-caption text-muted-foreground">
                  {badge.earned ? "Earned ✓" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 pb-6">
        <h2 className="text-subheading text-foreground font-bold mb-3">📊 Leaderboard</h2>
        <div className="brutal-card p-4 space-y-3">
          {["Rahul S.", "Priya M.", "Arjun K.", "You"].map((name, i) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-caption font-bold ${
                  i === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <span className={`text-body ${i === 3 ? "text-primary font-bold" : "text-foreground"}`}>
                  {name}
                </span>
              </div>
              <span className="text-caption text-accent font-bold">
                {[2800, 2150, 1900, 1250][i]} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
