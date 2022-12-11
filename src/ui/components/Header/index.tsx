import React from 'react';
import Tab from './Tab';

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
  return (
    <nav className='flex flex-row bg-neutral-800 w-full flex-grow sticky top-0 left-0 right-0'>
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
