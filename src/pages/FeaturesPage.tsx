import React, { useState } from 'react';
import { 
  Search, 
  Map, 
  Calendar, 
  Bell, 
  User, 
  Settings, 
  Battery, 
  CreditCard,
  Star,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { AdvancedSearchPanel } from '../components/stations/AdvancedSearchPanel';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { BookingSystem } from '../components/booking/BookingSystem';
import { NotificationsPanel } from '../components/notifications/NotificationsPanel';
import { RoutePlanning } from '../components/route/RoutePlanning';

type FeatureTab = 'search' | 'dashboard' | 'booking' | 'route' | 'notifications' | 'payment' | 'community' | 'business';

interface FeaturesPageProps {
  className?: string;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as FeatureTab, label: 'Dashboard', icon: User },
    { id: 'search' as FeatureTab, label: 'Search', icon: Search },
    { id: 'route' as FeatureTab, label: 'Route Planning', icon: Map },
    { id: 'booking' as FeatureTab, label: 'Booking', icon: Calendar },
    { id: 'notifications' as FeatureTab, label: 'Notifications', icon: Bell },
    { id: 'payment' as FeatureTab, label: 'Payment', icon: CreditCard },
    { id: 'community' as FeatureTab, label: 'Community', icon: MessageSquare },
    { id: 'business' as FeatureTab, label: 'Business', icon: TrendingUp },
  ];

  const renderActiveFeature = () => {
    switch (activeTab) {
      case 'dashboard':
        return <UserDashboard />;
      case 'search':
        return <AdvancedSearchPanel onStationSelect={(station) => console.log('Selected station:', station)} />;
      case 'route':
        return <RoutePlanning />;
      case 'booking':
        return <BookingSystem />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'payment':
        return (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
            <p className="text-muted-foreground">Payment integration component coming soon...</p>
          </div>
        );
      case 'community':
        return (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-bold mb-4">Community Features</h3>
            <p className="text-muted-foreground">Community features component coming soon...</p>
          </div>
        );
      case 'business':
        return (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-bold mb-4">Business Dashboard</h3>
            <p className="text-muted-foreground">Business dashboard component coming soon...</p>
          </div>
        );
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <div className="brutal-card border-b-2 border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ChargePe Features</h1>
              <p className="text-muted-foreground">Complete EV charging station management system</p>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Real-time Active</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="brutal-card border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-brutal'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="container mx-auto px-4 py-6">
        {renderActiveFeature()}
      </div>

      {/* Feature Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 brutal-card border-t-2 border-border p-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">System Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">All Systems Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Advanced Search Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-600" />
                <span>Real-time Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-600" />
                <span>Smart Route Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
