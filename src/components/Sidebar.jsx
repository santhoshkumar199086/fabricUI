import React, { useState } from "react";


import Blueprint from "../assets/icons/Blueprint.svg";
import BlueprintHover from "../assets/icons/Blueprint_Hoover.svg";
import Device from "../assets/icons/Device.svg";
import DeviceHover from "../assets/icons/Device_Hoover.svg";
import Design from "../assets/icons/Design.svg";
import DesignHover from "../assets/icons/Design_Hoover.svg";
import Resource from "../assets/icons/Resource.svg";
import ResourceHover from "../assets/icons/Resource_Hoover.svg";
import Analytics from "../assets/icons/Analytics.svg";
import AnalyticsHover from "../assets/icons/Analytics_Hoover.svg";
import External from "../assets/icons/External.svg";
import ExternalHover from "../assets/icons/External_Hoover.svg";
import Platform from "../assets/icons/Platform.svg";
import PlatformHover from "../assets/icons/Platform_Hoover.svg";
import Favorite from "../assets/icons/Favorite.svg";
import FavoriteHover from "../assets/icons/Favorite_Hoover.svg";

const icons = [
  { default: Blueprint, hover: BlueprintHover },
  { default: Device, hover: DeviceHover },
  { default: Design, hover: DesignHover },
  { default: Resource, hover: ResourceHover },
  { default: Analytics, hover: AnalyticsHover },
  { default: External, hover: ExternalHover },
  { default: Platform, hover: PlatformHover },
  { default: Favorite, hover: FavoriteHover },
];

function Sidebar() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <aside className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-6">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={hoveredIndex === index ? icon.hover : icon.default}
          alt={`icon-${index}`}
          className="w-6 h-6 cursor-pointer transition-transform duration-200"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      ))}
    </aside>
  );
}

export default Sidebar;
