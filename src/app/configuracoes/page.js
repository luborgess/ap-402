'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Auth from '@/components/Auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Bell, Settings } from 'lucide-react';

export default function Configuracoes() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Perfil */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Perfil</h2>
                <p className="text-gray-400">Gerencie suas informações pessoais</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>
          </Card>

          {/* Segurança */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Segurança</h2>
                <p className="text-gray-400">Configure suas opções de segurança</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                onClick={() => {/* TODO: Implement password change */}}
              >
                <Settings className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
            </div>
          </Card>

          {/* Notificações */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Bell className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notificações</h2>
                <p className="text-gray-400">Gerencie suas preferências de notificação</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Em breve: Configurações de notificações para tarefas e escalas
              </p>
            </div>
          </Card>

          {/* Sair */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/10 p-3 rounded-full">
                <LogOut className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sair da Conta</h2>
                <p className="text-gray-400">Encerre sua sessão atual</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}