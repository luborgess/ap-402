'use client';

import { useState, useEffect } from 'react';
import { Home, Calendar, Settings, LogOut, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center">
            <span className="text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              AP 402
            </span>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="nav-link flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Home className="h-5 w-5" />
              <span className="text-sm">Início</span>
            </Link>
            <Link 
              href="/calendario" 
              className="nav-link flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Calendário</span>
            </Link>
            <Link 
              href="/configuracoes" 
              className="nav-link flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Configurações</span>
            </Link>
          </nav>

          {/* Menu Mobile Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* User Menu Desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Olá, </span>
                <span className="font-medium">
                  {profile?.name || user.email.split('@')[0]}
                </span>
              </div>
              <Link href="/perfil">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <span>Início</span>
                </div>
              </Link>
              <Link
                href="/calendario"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span>Calendário</span>
                </div>
              </Link>
              <Link
                href="/configuracoes"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Configurações</span>
                </div>
              </Link>
              {user && (
                <>
                  <Link
                    href="/perfil"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <span>Perfil</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5" />
                      <span>Sair</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
