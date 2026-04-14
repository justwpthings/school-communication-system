import { NavLink } from 'react-router-dom';

import { cn } from '../utils/cn';

export const AdminNav = ({ items }) => (
  <div className="border-b border-white/60 bg-white/55 backdrop-blur-xl">
    <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition duration-200',
              isActive
                ? 'brand-tint shadow-soft'
                : 'text-muted hover:bg-white/70 hover:text-ink'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  </div>
);
