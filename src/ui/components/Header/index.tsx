import React from 'react';
import Tab from './Tab';
import { useLocation, matchRoutes } from 'react-router';

const tabs = [
  {
    label: 'Auto-Home',
    href: '/autoHome',
  },
  {
    label: 'Calibration',
    href: '/calibration',
  },
  {
    label: 'Current Height Map',
    href: '/currentHeightMap',
  },
  {
    label: 'Raw G-Code',
    href: '/rawGCode',
  },
  {
    label: 'Contoured G-Code',
    href: '/contouredGCode',
  },
];

export function Header() {
  const location = useLocation();

  const [activeTab, setActiveTab] = React.useState();

  return (
    <nav className='flex flex-row bg-neutral-800 w-full flex-grow shadow-xl sticky top-0 left-0 right-0'>
      {tabs.map((tab, i) => (
        <Tab
          key={i}
          label={tab.label}
          href={tab.href}
        />
      ))}
      <Tab filler />
    </nav>
  );
}
