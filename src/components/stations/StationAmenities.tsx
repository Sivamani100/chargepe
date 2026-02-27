import React from 'react';
import { Wifi, Car, Utensils, Shield, ParkingSquare, Coffee } from 'lucide-react';

interface StationAmenitiesProps {
  amenities: string[];
  className?: string;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <ParkingSquare className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
  restroom: <Car className="w-4 h-4" />,
};

export const StationAmenities: React.FC<StationAmenitiesProps> = ({ amenities, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {amenities.map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-xs font-medium"
        >
          {amenityIcons[amenity.toLowerCase()] || <Car className="w-4 h-4" />}
          <span className="capitalize">{amenity}</span>
        </div>
      ))}
    </div>
  );
};

export default StationAmenities;
