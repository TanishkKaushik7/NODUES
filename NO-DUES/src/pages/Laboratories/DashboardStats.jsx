import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
};

const DashboardStats = ({ stats }) => {
  const { total, pending, approved, rejected } = stats;

  const statItems = [
    { label: 'Total', count: total, icon: FiUsers, color: 'text-indigo-500', border: 'border-indigo-500', text: 'text-gray-900' },
    { label: 'Pending', count: pending, icon: FiClock, color: 'text-yellow-500', border: 'border-yellow-500', text: 'text-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${item.border} transition-shadow duration-300 hover:shadow-xl`}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: index * 0.1 }}
        >
          <div className='flex items-center justify-between'>
            <p className="text-sm font-semibold text-gray-500 uppercase">{item.label}</p>
            <item.icon className={`${item.color} text-xl`} />
          </div>
          <p className={`text-3xl font-bold mt-1 ${item.text}`}>{item.count}</p>
        </motion.div>
      ))}
    </div>
  );
};
export default DashboardStats;