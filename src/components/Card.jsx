import React from 'react';

function Card({ title, description, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm border-[3px] border-[#F2F1F1]">
      <h3 className="text-blue-600 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="text-green-500 text-2xl">{icon}</div>
    </div>
  );
}

export default Card;