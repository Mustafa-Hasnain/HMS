import React from 'react';
import { useNavigate } from 'react-router-dom';

const InfoCard = ({ count, title, textColor, svgIcon, svgBgColor, viewAllLink }) => {
  const navigate = useNavigate();

  return (
    <div className="card border rounded-md p-4 flex flex-col items-start">
      <div className="space-y-3">
        {/* SVG Icon with Background */}
        <div
          className="rounded-full p-3 w-fit"
          style={{ backgroundColor: svgBgColor }}
        >
          <img src={svgIcon} alt="icon" className="h-6 w-6" />
        </div>
        <div className="">
          <p className="text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold" style={{ color: textColor }}>
            {count}
          </h3>
        </div>
      </div>
      {viewAllLink &&
        <button
          onClick={() => navigate(viewAllLink)}
          className="mt-2 text-sm text-gray-500 hover:underline"
        >
          View All
        </button>
      }
    </div>
  );
};

export default InfoCard;
