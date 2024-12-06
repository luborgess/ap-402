'use client';

import { useState, useEffect } from 'react';
import { Home, Calendar, Settings, LogOut, User, Menu, X, Loader2, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import useSWR from 'swr';

const fetchProfile = async (userId) => {
  if (!userId) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar')
    .eq('id', userId)
    .single();
    
  if (profile?.avatar) {
    const { data: avatarData } = await supabase
      .storage
      .from('avatars')
      .getPublicUrl(profile.avatar);
      
    if (avatarData) {
      return { ...profile, avatarUrl: avatarData.publicUrl };
    }
  }
  
  return profile;
};

export default function Header() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: profile, isLoading } = useSWR(
    user?.id ? ['profile', user.id] : null,
    () => fetchProfile(user?.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 30000, // Revalidate every 30 seconds
    }
  );

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const ProfileAvatar = ({ className = '' }) => {
    if (isLoading) {
      return (
        <div className={`h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center ring-2 ring-blue-500/20 ${className}`}>
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        </div>
      );
    }

    if (profile?.avatarUrl) {
      return (
        <div className={`h-8 w-8 rounded-full overflow-hidden ring-2 ring-blue-500/20 ${className}`}>
          <Image
            src={profile.avatarUrl}
            alt={profile.name || 'Avatar'}
            width={32}
            height={32}
            className="object-cover"
            priority
          />
        </div>
      );
    }

    return (
      <div className={`h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center ring-2 ring-blue-500/20 ${className}`}>
        <User className="h-4 w-4 text-blue-500" />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700/75 bg-gray-900/75 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              AP 402
            </span>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="nav-link flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">Início</span>
            </Link>
            <Link 
              href="/calendario" 
              className="nav-link flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Calendário</span>
            </Link>
            <Link 
              href="/tarefas" 
              className="nav-link flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-sm font-medium">Tarefas</span>
            </Link>
            <Link 
              href="/configuracoes" 
              className="nav-link flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Configurações</span>
            </Link>
          </nav>

          {/* Menu Mobile Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* User Menu Desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/perfil" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <ProfileAvatar />
                <span className="text-sm font-medium text-gray-200">
                  {profile?.name || user.email}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">Início</span>
              </Link>
              <Link 
                href="/calendario" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Calendário</span>
              </Link>
              <Link 
                href="/tarefas" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-sm font-medium">Tarefas</span>
              </Link>
              <Link 
                href="/configuracoes" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Configurações</span>
              </Link>
              {user && (
                <div className="pt-4 border-t border-gray-700/75">
                  <Link 
                    href="/perfil" 
                    className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
                    onClick={() => setIsOpen(false)}
                  >
                    <ProfileAvatar />
                    <span className="text-sm font-medium text-gray-200">
                      {profile?.name || user.email}
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sair</span>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
