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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"

export function TaskList({ tasks, loading, onTaskCompleted }) {
  const { user } = useAuth();
  const [users, setUsers] = useState({});
  const [userHistory, setUserHistory] = useState({});
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'mine'
  const [completingTask, setCompletingTask] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTaskHistory();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, full_name, avatar');
      
      if (error) throw error;
      
      const usersMap = {};
      for (const profile of profiles) {
        const { data: avatarData } = profile.avatar 
          ? await supabase.storage.from('avatars').getPublicUrl(profile.avatar)
          : { data: null };

        usersMap[profile.id] = {
          name: profile.full_name || profile.name,
          avatarUrl: avatarData?.publicUrl || null
        };
      }
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      toast.error('Erro ao carregar usuários');
    }
  };

  const fetchTaskHistory = async () => {
    try {
      const { data: history, error } = await supabase
        .from('task_history')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const historyMap = {};
      history.forEach(record => {
        if (!historyMap[record.task_id]) {
          historyMap[record.task_id] = {};
        }
        if (!historyMap[record.task_id][record.completed_by]) {
          historyMap[record.task_id][record.completed_by] = record.completed_at;
        }
      });

      setUserHistory(historyMap);
    } catch (error) {
      console.error('Error fetching task history:', error);
    }
  };

  const getLastCompletionDate = (taskId, userId) => {
    return userHistory[taskId]?.[userId] 
      ? format(new Date(userHistory[taskId][userId]), "'Última conclusão:' dd 'de' MMMM", { locale: ptBR })
      : 'Ainda não concluiu esta tarefa';
  };

  const getUserInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      {/* Header Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="bg-blue-500/10 p-3 rounded-full shrink-0">
            <CheckCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lista de Tarefas</h2>
            <p className="text-gray-400">Gerencie e acompanhe suas tarefas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === 'active' ? 'default' : 'outline'}
              onClick={() => setViewMode('active')}
              className={cn(
                "bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800/50 w-full sm:w-auto",
                viewMode === 'active' && "bg-purple-500 hover:bg-purple-600 border-purple-400"
              )}
            >
              <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
              <span className="whitespace-nowrap">Todas as Tarefas</span>
            </Button>
            <Button
              variant={viewMode === 'mine' ? 'default' : 'outline'}
              onClick={() => setViewMode('mine')}
              className={cn(
                "bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800/50 w-full sm:w-auto",
                viewMode === 'mine' && "bg-purple-500 hover:bg-purple-600 border-purple-400"
              )}
            >
              <User className="w-4 h-4 mr-2 shrink-0" />
              <span className="whitespace-nowrap">Minhas Tarefas</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-center text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span>Carregando tarefas...</span>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="bg-gray-900/50 p-4 rounded-full inline-block mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400">
              {viewMode === 'mine'
                ? 'Você não tem nenhuma tarefa atribuída no momento'
                : 'Não há tarefas ativas no momento'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
                  <p className="text-gray-400 line-clamp-2 sm:line-clamp-1">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5 min-w-[120px]">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {format(new Date(task.next_date), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {task.frequency === 'daily' && 'Diária'}
                        {task.frequency === 'weekly' && 'Semanal'}
                        {task.frequency === 'monthly' && 'Mensal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Users className="h-4 w-4 shrink-0" />
                      <div className="flex flex-wrap gap-2 items-center">
                        <TooltipProvider>
                          {task.responsible_users?.map((userId, index) => {
                            const userInfo = users[userId];
                            if (!userInfo) return null;

                            return (
                              <Tooltip key={userId}>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex items-center gap-2 px-2 py-1 rounded-full",
                                    index === 0 && "bg-green-500/20 text-green-300",
                                    index === 1 && "bg-blue-500/20 text-blue-300",
                                    index > 1 && "bg-gray-700/50 text-gray-300"
                                  )}>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage 
                                        src={userInfo.avatarUrl} 
                                        alt={userInfo.name} 
                                      />
                                      <AvatarFallback className="text-xs">
                                        {getUserInitials(userInfo.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">
                                      {userInfo.name.split(' ')[0]}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                  className="bg-gray-800 border-gray-700 text-white"
                                >
                                  <div className="space-y-1">
                                    <p className="font-medium">{userInfo.name}</p>
                                    <p className="text-sm text-gray-400">
                                      {index === 0 ? 'Responsável atual' : 
                                       index === 1 ? 'Próximo responsável' : 
                                       `${index + 1}º na fila`}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {getLastCompletionDate(task.id, userId)}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:ml-4">
                  <AlertDialog open={showDialog && taskToComplete?.id === task.id}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-purple-500/10 border-purple-400/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 w-full sm:w-auto"
                        disabled={completingTask === task.id}
                        onClick={() => handleCompleteTask(task)}
                      >
                        {completingTask === task.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin mr-2 shrink-0" />
                            <span className="truncate">Concluindo...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                            <span className="truncate">Concluir</span>
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Confirmar Conclusão</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Tem certeza que deseja marcar esta tarefa como concluída?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          onClick={handleCancel}
                          className="bg-gray-800 text-white hover:bg-gray-700"
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleConfirm(task)}
                          className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
