'use client';

import { useState, useEffect } from 'react';
import { Home, Calendar, Settings, LogOut, User, Menu, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
        
        if (data?.avatar) {
          const { data: avatarData } = await supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.avatar);
            
          if (avatarData) {
            setAvatarUrl(avatarData.publicUrl);
          }
        }
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
              href="/tarefas" 
              className="nav-link flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">Tarefas</span>
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
                <div className="relative w-9 h-9 overflow-hidden rounded-full bg-gray-100 border border-gray-200 hover:border-blue-500 transition-colors">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
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
                href="/tarefas"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Tarefas</span>
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
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
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
