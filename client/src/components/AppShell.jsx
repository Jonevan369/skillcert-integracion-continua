import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Award, Compass, Home, LogOut, Moon, Search, UsersRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function submit(event) {
    event.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
          <Link to="/dashboard" className="flex items-center gap-2 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-slate-950">
              <Award size={20} />
            </span>
            SkillCert
          </Link>
          <form onSubmit={submit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Buscar usuarios o habilidades" />
          </form>
          <nav className="flex flex-wrap items-center gap-1">
            <NavItem to="/dashboard" icon={<Home size={17} />} label="Inicio" />
            <NavItem to="/explore" icon={<Compass size={17} />} label="Explorar" />
            <NavItem to="/communities" icon={<UsersRound size={17} />} label="Comunidades" />
            <Button variant="ghost" size="sm" onClick={() => document.documentElement.classList.toggle('dark')} aria-label="Modo oscuro">
              <Moon size={17} />
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${user.id}`)}>
                {user.name}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={16} />
            </Button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
          isActive ? 'bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
