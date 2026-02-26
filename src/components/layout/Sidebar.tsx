import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact Info', path: '/contact-info' },
    { name: 'Images', path: '/images' },
    { name: 'Upload Image', path: '/images/upload' },
    { name: 'Projects', path: '/projects' },
    { name: 'Admin-only', path: '/admin-only' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-4 space-y-4 flex flex-col">
      <div className="text-2xl font-bold text-center mb-6">CMS Admin</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition duration-200 ${
                    isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
