import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  Sparkles,
  History,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/fields', label: 'Fields', icon: MapPin },
    { path: '/advisory/new', label: 'AI Advisory', icon: Sparkles, highlight: true },
    { path: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-emerald-900/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                AgriTech
              </span>
              <span className="block text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                AI Precision Agronomy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      link.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 hover:brightness-110'
                        : active
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${link.highlight ? 'text-white' : active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Profile & Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-100">{user.full_name}</div>
                  <div className="flex items-center justify-end space-x-1 text-xs text-emerald-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="uppercase text-[10px] tracking-wider font-semibold">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Farm</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {user ? (
            <>
              <div className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 mb-3">
                <div className="text-sm font-bold text-white">{user.full_name}</div>
                <div className="text-xs text-slate-400">{user.email} • <span className="text-emerald-400 font-semibold">{user.role}</span></div>
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                      isActive(link.path)
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-950/30"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center w-full py-3 rounded-lg font-medium text-slate-200 bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block text-center w-full py-3 rounded-lg font-bold text-slate-950 bg-emerald-500"
              >
                Register Farm
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
