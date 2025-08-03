import React from 'react';
import { IconType } from 'react-icons';

type ToolCardProps = {
  icon: IconType;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
};

export const ToolCard = ({ icon: Icon, label, color }: ToolCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer text-center">
      <div className={`p-3 rounded-full inline-block mb-2 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div className="font-medium text-gray-900">{label}</div>
    </div>
  );
};