'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Auth from '@/components/Auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Shield, Bell, Settings, Plus, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    responsible_users: []
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  async function fetchUsers() {
    try {
      console.log('Iniciando busca de usuários...');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }

      console.log('Perfis encontrados:', profiles);
      
      const formattedProfiles = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name || profile.email || profile.id
      }));
      
      console.log('Perfis formatados:', formattedProfiles);
      setUsers(formattedProfiles);
    } catch (error) {
      console.error('Erro detalhado ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários: ' + (error.message || 'Erro desconhecido'));
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar se há responsáveis selecionados
      if (newTask.responsible_users.length === 0) {
        toast.error('Selecione pelo menos um responsável');
        setLoading(false);
        return;
      }

      const now = new Date().toISOString();
      
      // Dados da tarefa formatados corretamente
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        frequency: newTask.frequency,
        responsible_users: newTask.responsible_users,
        status: 'active',
        next_date: now,
        created_at: now,
        updated_at: now
      };

      console.log('Creating task with data:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task created:', data);
      toast.success('Tarefa criada com sucesso!');
      
      // Reset do formulário
      setNewTask({
        title: '',
        description: '',
        frequency: 'daily',
        responsible_users: []
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Criação de Tarefas */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Plus className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
                <p className="text-gray-400">Crie uma nova tarefa para a equipe</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Título</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Digite o título da tarefa"
                    className="bg-gray-900/50 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Descrição</Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Digite a descrição da tarefa"
                    className="bg-gray-900/50 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency" className="text-white">Frequência</Label>
                  <select
                    id="frequency"
                    value={newTask.frequency}
                    onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                    className="w-full p-2 rounded-md bg-gray-900/50 border border-gray-700 text-white"
                    required
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Responsáveis</Label>
                  <div className="space-y-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800/50"
                        >
                          {newTask.responsible_users.length === 0
                            ? "Selecione os responsáveis..."
                            : `${newTask.responsible_users.length} responsável(is) selecionado(s)`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-gray-900 border-gray-700">
                        <Command className="bg-gray-900">
                          <CommandInput 
                            placeholder="Procurar usuário..." 
                            className="h-9 text-white bg-gray-900"
                          />
                          <CommandEmpty className="text-white py-2">Nenhum usuário encontrado.</CommandEmpty>
                          <div className="max-h-[200px] overflow-y-auto">
                            {users && users.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 px-2 py-2 text-white hover:bg-gray-800 cursor-pointer"
                                onClick={() => {
                                  const currentUsers = [...newTask.responsible_users];
                                  const index = currentUsers.indexOf(item.id);
                                  
                                  if (index >= 0) {
                                    currentUsers.splice(index, 1);
                                  } else {
                                    currentUsers.push(item.id);
                                  }
                                  
                                  setNewTask({
                                    ...newTask,
                                    responsible_users: currentUsers
                                  });
                                }}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    newTask.responsible_users.includes(item.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {newTask.responsible_users.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTask.responsible_users.map(userId => {
                          const selectedUser = users.find(u => u.id === userId);
                          return selectedUser && (
                            <div
                              key={userId}
                              className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-sm"
                            >
                              <span>{selectedUser.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTask({
                                    ...newTask,
                                    responsible_users: newTask.responsible_users.filter(id => id !== userId)
                                  });
                                }}
                                className="ml-1 hover:text-purple-100"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Tarefa'
                )}
              </Button>
            </form>
          </Card>

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