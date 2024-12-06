'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'react-hot-toast';
import { User, Calendar, Clock, CheckCircle, RefreshCw, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"

export function TaskList({ tasks, loading, onTaskCompleted }) {
  const { user } = useAuth();
  const [users, setUsers] = useState({});
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'mine'
  const [completingTask, setCompletingTask] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name');
      
      if (error) throw error;
      
      const usersMap = {};
      profiles.forEach(profile => {
        usersMap[profile.id] = profile.name;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (viewMode === 'mine') {
      return task.responsible_users?.includes(user?.id);
    }
    return true; // show all active tasks in 'active' view
  });

  const handleCompleteTask = (task) => {
    setTaskToComplete(task);
    setShowDialog(true);
  };

  const handleConfirm = async (task) => {
    await confirmCompleteTask(task);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setTaskToComplete(null);
  };

  const confirmCompleteTask = async (task) => {
    if (!task) return;

    try {
      setCompletingTask(task.id);
      
      // Registrar a conclusão no histórico
      const { error: historyError } = await supabase.from('task_history').insert({
        task_id: task.id,
        completed_by: user.id,
        completed_at: new Date().toISOString(),
      });

      if (historyError) throw historyError;

      // Atualizar a próxima data e rotacionar usuários responsáveis
      const nextDate = getNextDate(task.frequency, new Date(task.next_date));
      const rotatedUsers = [...task.responsible_users];
      rotatedUsers.push(rotatedUsers.shift()); // Move o primeiro usuário para o final

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          next_date: nextDate.toISOString(),
          responsible_users: rotatedUsers,
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Atualizar a lista de tarefas
      onTaskCompleted();
      setTasks(tasks.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            next_date: nextDate.toISOString(),
            responsible_users: rotatedUsers,
          };
        }
        return t;
      }));

      toast.success('Tarefa concluída com sucesso!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Erro ao concluir a tarefa');
    } finally {
      setCompletingTask(null);
      setTaskToComplete(null);
    }
  };

  const getNextDate = (frequency, currentDate) => {
    switch (frequency) {
      case 'daily':
        return new Date(currentDate.setDate(currentDate.getDate() + 1));
      case 'weekly':
        return new Date(currentDate.setDate(currentDate.getDate() + 7));
      case 'monthly':
        return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      default:
        throw new Error('Frequência inválida');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">
              {viewMode === 'mine' ? 'Minhas Tarefas' : 'Todas as Tarefas'}
            </h2>
            <p className="text-gray-400">
              {viewMode === 'mine' 
                ? 'Visualize e gerencie suas tarefas atribuídas'
                : 'Visualize e gerencie todas as tarefas do sistema'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'active' ? 'default' : 'outline'}
              onClick={() => setViewMode('active')}
              className={cn(
                viewMode === 'active'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'hover:bg-gray-700/50'
              )}
            >
              Todas as Tarefas
            </Button>
            <Button
              variant={viewMode === 'mine' ? 'default' : 'outline'}
              onClick={() => setViewMode('mine')}
              className={cn(
                viewMode === 'mine'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'hover:bg-gray-700/50'
              )}
            >
              Minhas Tarefas
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center text-gray-400">
          Carregando tarefas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            {viewMode === 'mine'
              ? 'Você não tem nenhuma tarefa atribuída no momento'
              : 'Não há tarefas ativas no momento'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">
                    {task.title}
                  </h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={() => handleCompleteTask(task)}
                        disabled={completingTask === task.id}
                        className={cn(
                          "shrink-0 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-2",
                          completingTask === task.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Concluir</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar conclusão da tarefa</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div>
                            <p>Tem certeza que deseja marcar esta tarefa como concluída?</p>
                            <p className="mt-2 text-sm">
                              <strong>Tarefa:</strong> {task.title}
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleConfirm(task)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Prazo: {format(new Date(task.next_date), "dd/MM/yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-300">
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {task.frequency === 'daily' && 'Diária'}
                      {task.frequency === 'weekly' && 'Semanal'}
                      {task.frequency === 'monthly' && 'Mensal'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-300" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">Responsável:</span>
                      {task.responsible_users.map((id, index) => {
                        const userName = users[id] || 'Usuário desconhecido';
                        if (index === 0) {
                          return (
                            <span key={id} className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/20">
                              {userName}
                            </span>
                          );
                        } else if (index === 1) {
                          return (
                            <span key={id} className="text-gray-400 flex items-center gap-1">
                              <ArrowRight className="w-4 h-4" />
                              {userName}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-8">
              Nenhuma tarefa ativa encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
