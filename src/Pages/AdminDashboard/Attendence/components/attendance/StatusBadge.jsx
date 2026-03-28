import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    Good: 'bg-green-100 text-green-800',
    Average: 'bg-yellow-100 text-yellow-800',
    Warning: 'bg-yellow-100 text-yellow-800',
    Alert: 'bg-red-100 text-red-800',
    Critical: 'bg-red-100 text-red-800',
    Low: 'bg-red-100 text-red-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-orange-100 text-orange-800',
  };

  const text = typeof status === 'string' ? status : status?.text || status;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[text] || 'bg-gray-100 text-gray-800'}`}>
      {text}
    </span>
  );
};

export default StatusBadge;