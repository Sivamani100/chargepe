import React, { useState } from 'react';
import { MapPin, Navigation, Battery, Clock, DollarSign, Plus, Trash2 } from 'lucide-react';
import { useRoutePlanning } from '../../hooks/useRoutePlanning';

interface RoutePlanningProps {
  className?: string;
}

export const RoutePlanning: React.FC<RoutePlanningProps> = ({ className = "" }) => {
  const {
    routePlan,
    isPlanning,
    planRoute,
    addStop,
    removeStop,
    updateVehicleProfile,
    clearRoute,
  } = useRoutePlanning();

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [vehicleProfile, setVehicleProfile] = useState({
    batteryCapacity: 50,
    currentBattery: 80,
    consumption: 0.2,
    connectorType: "CCS",
  });

  const handlePlanRoute = () => {
    if (startLocation && endLocation) {
      planRoute(startLocation, endLocation, vehicleProfile);
    }
  };

  if (isPlanning) {
    return (
      <div className={`brutal-card p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Planning optimal route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Route Input */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Plan Your Route</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Starting Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter starting address or coordinates"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Destination</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter destination address or coordinates"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Vehicle Profile */}
          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-medium mb-3">Vehicle Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Battery Capacity (kWh)</label>
                <input
                  type="number"
                  value={vehicleProfile.batteryCapacity}
                  onChange={(e) => setVehicleProfile(prev => ({ ...prev, batteryCapacity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Battery (%)</label>
                <input
                  type="number"
                  value={vehicleProfile.currentBattery}
                  onChange={(e) => setVehicleProfile(prev => ({ ...prev, currentBattery: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Consumption (kWh/km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vehicleProfile.consumption}
                  onChange={(e) => setVehicleProfile(prev => ({ ...prev, consumption: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Connector Type</label>
                <select
                  value={vehicleProfile.connectorType}
                  onChange={(e) => setVehicleProfile(prev => ({ ...prev, connectorType: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="CCS">CCS</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Type 2">Type 2</option>
                  <option value="Tesla">Tesla</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePlanRoute}
              className="flex-1 brutal-btn bg-primary text-primary-foreground py-3"
            >
              Plan Route
            </button>
            <button
              onClick={clearRoute}
              className="px-6 py-3 border-2 border-border rounded-lg hover:bg-accent transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Route Results */}
      {routePlan && (
        <div className="brutal-card p-6">
          <h3 className="text-lg font-bold mb-4">Route Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-accent rounded-lg">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Distance</p>
              <p className="text-xl font-bold">{routePlan.totalDistance} km</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-xl font-bold">{routePlan.totalTime} min</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-bold">${routePlan.totalCost}</p>
            </div>
          </div>

          {/* Charging Stops */}
          <div className="space-y-4">
            <h4 className="font-medium">Charging Stops ({routePlan.chargingStops.length})</h4>
            {routePlan.chargingStops.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No charging stops needed</p>
            ) : (
              routePlan.chargingStops.map((stop, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium">{stop.station.name}</h5>
                      <p className="text-sm text-muted-foreground">{stop.station.address}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm">{stop.station.power_output_kw} kW</span>
                        <span className="text-sm">${stop.station.price_per_kwh}/kWh</span>
                        <span className="text-sm">{stop.estimatedChargeTime} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${stop.estimatedCost}</p>
                    <p className="text-sm text-muted-foreground">{stop.batteryBefore}% → {stop.batteryAfter}%</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Battery Timeline */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Battery Timeline</h4>
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-border transform -translate-y-1/2"></div>
              <div className="relative flex justify-between">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Start</p>
                  <p className="text-xs text-muted-foreground">{vehicleProfile.currentBattery}%</p>
                </div>
                {routePlan.chargingStops.map((stop, index) => (
                  <div key={index} className="text-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Stop {index + 1}</p>
                    <p className="text-xs text-muted-foreground">{stop.batteryAfter}%</p>
                  </div>
                ))}
                <div className="text-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">End</p>
                  <p className="text-xs text-muted-foreground">{routePlan.finalBattery}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanning;
