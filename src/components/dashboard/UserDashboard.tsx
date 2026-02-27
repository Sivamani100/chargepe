import React from 'react';
import { Battery, TrendingUp, DollarSign, Leaf, Clock, Star, Zap } from 'lucide-react';
import { useUserDashboard } from '../../hooks/useUserDashboard';

interface UserDashboardProps {
  className?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ className = "" }) => {
  const {
    analytics,
    favoriteStations,
    recentActivity,
    paymentMethods,
    isLoading,
  } = useUserDashboard();

  if (isLoading) {
    return (
      <div className={`brutal-card p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="brutal-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{analytics?.totalSessions || 0}</p>
            </div>
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="brutal-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Energy Consumed</p>
              <p className="text-2xl font-bold">{analytics?.totalEnergyConsumed || 0} kWh</p>
            </div>
            <Battery className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="brutal-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">${analytics?.totalCost || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="brutal-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              <p className="text-2xl font-bold">{analytics?.co2Saved || 0} kg</p>
            </div>
            <Leaf className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Favorite Stations */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Favorite Stations</h3>
        <div className="space-y-3">
          {favoriteStations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No favorite stations yet</p>
          ) : (
            favoriteStations.slice(0, 3).map((station) => (
              <div key={station.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <h4 className="font-medium">{station.name}</h4>
                  <p className="text-sm text-muted-foreground">{station.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{station.rating || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground">• {station.visits || 0} visits</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${station.price_per_kwh}/kWh</p>
                  <p className="text-sm text-muted-foreground">{station.power_output_kw} kW</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 
                    activity.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{activity.stationName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${activity.amount || 0}</p>
                  <p className="text-sm text-muted-foreground capitalize">{activity.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {paymentMethods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No payment methods added</p>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                  <div>
                    <h4 className="font-medium">{method.nickname || `${method.provider} ••••${method.last4}`}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{method.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                      Default
                    </span>
                  )}
                  <span className={`w-2 h-2 rounded-full ${
                    method.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
