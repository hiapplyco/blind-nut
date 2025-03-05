
import React from 'react';

interface ProfileHeaderProps {
  name: string;
  title: string;
  location: string;
  score?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  name, 
  title, 
  location, 
  score 
}) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-medium text-[#8B5CF6]">{name}</h3>
      <p className="text-sm font-medium text-[#8B5CF6]/80">{title}</p>
      <p className="text-sm text-gray-600">{location}</p>
      
      {score !== undefined && (
        <span className="inline-block text-sm bg-[#FEF7CD] text-gray-900 px-2 py-1 rounded-full border border-black">
          Score: {score}
        </span>
      )}
    </div>
  );
};
