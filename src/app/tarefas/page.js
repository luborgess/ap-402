'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Calendar, CheckCircle2, Circle, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskHistory } from '@/components/TaskHistory';
import { addDays, addWeeks, addMonths } from 'date-fns';

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchHistory();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      // Primeiro, buscar todas as tarefas
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('next_date', { ascending: true });

      if (tasksError) throw tasksError;

      // Depois, buscar os perfis dos usuários responsáveis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name');

      if (profilesError) throw profilesError;

      // Mapear os perfis para um objeto para fácil acesso
      const profilesMap = Object.fromEntries(
        profilesData.map(profile => [profile.id, profile])
      );

      // Combinar os dados
      const tasksWithProfiles = tasksData.map(task => ({
        ...task,
        responsible_users: Array.isArray(task.responsible_users)
          ? task.responsible_users.map(userId => profilesMap[userId])
          : []
      }));

      console.log('Tasks with profiles:', tasksWithProfiles);
      setTasks(tasksWithProfiles);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // Primeiro, buscar o histórico básico
      const { data: historyData, error: historyError } = await supabase
        .from('task_history')
        .select('*')
        .order('completed_at', { ascending: false });

      if (historyError) throw historyError;

      // Buscar as tarefas relacionadas
      const taskIds = [...new Set(historyData.map(h => h.task_id))];
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);

      if (tasksError) throw tasksError;

      // Buscar os perfis dos usuários
      const userIds = [...new Set(historyData.map(h => h.completed_by))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Mapear os dados para fácil acesso
      const tasksMap = Object.fromEntries(tasksData.map(task => [task.id, task]));
      const profilesMap = Object.fromEntries(profilesData.map(profile => [profile.id, profile]));

      // Combinar os dados
      const completeHistory = historyData.map(historyEntry => ({
        ...historyEntry,
        task: tasksMap[historyEntry.task_id],
        completed_by: profilesMap[historyEntry.completed_by]
      }));

      setHistory(completeHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const calculateNextDate = (frequency, lastCompletedAt) => {
    // Se não houver data de última conclusão, usa a data atual
    const baseDate = lastCompletedAt ? new Date(lastCompletedAt) : new Date();
    
    switch (frequency) {
      case 'daily':
        return addDays(baseDate, 1);
      case 'weekly':
        return addWeeks(baseDate, 1);
      case 'monthly':
        return addMonths(baseDate, 1);
      default:
        return baseDate;
    }
  };

  const getNextResponsible = (currentResponsibles, lastResponsibleId) => {
    if (!Array.isArray(currentResponsibles) || currentResponsibles.length === 0) {
      return null;
    }
    const currentIndex = currentResponsibles.findIndex(id => id === lastResponsibleId);
    const nextIndex = (currentIndex + 1) % currentResponsibles.length;
    return currentResponsibles[nextIndex];
  };

  const handleCreateTask = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: formData.title,
          description: formData.description,
          frequency: formData.frequency,
          responsible_users: formData.responsible_users,
          next_date: new Date(formData.next_date).toISOString(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Created task:', data);
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        throw new Error('Tarefa não encontrada');
      }

      console.log('Starting task completion for:', task);
      const completedAt = new Date().toISOString();

      // Criar entrada no histórico
      const { data: historyData, error: historyError } = await supabase
        .from('task_history')
        .insert({
          task_id: taskId,
          completed_by: user.id,
          completed_at: completedAt
        })
        .select()
        .single();

      if (historyError) {
        console.error('History error details:', historyError);
        throw new Error(`Erro ao criar histórico: ${historyError.message}`);
      }

      console.log('History created:', historyData);

      // Calcular próxima data baseada na data de conclusão
      const nextDate = calculateNextDate(task.frequency, completedAt);
      console.log('Next date calculated:', nextDate);

      // Atualizar a tarefa
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({
          next_date: nextDate.toISOString(),
          last_completed_at: completedAt,
          last_completed_by: user.id
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error details:', updateError);
        throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
      }

      console.log('Task updated:', updatedTask);

      // Recarregar os dados
      await Promise.all([
        fetchTasks().catch(error => {
          console.error('Error fetching tasks:', error);
          throw new Error('Erro ao recarregar tarefas');
        }),
        fetchHistory().catch(error => {
          console.error('Error fetching history:', error);
          throw new Error('Erro ao recarregar histórico');
        })
      ]);

      return updatedTask;
    } catch (error) {
      console.error('Error completing task:', error);
      // Repassar o erro com uma mensagem mais amigável
      throw new Error(error.message || 'Erro ao concluir a tarefa');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'pending') {
      return task.status === 'pending';
    }
    return task.status === 'completed';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Minhas Tarefas</h1>
          <p className="text-gray-400">Gerencie suas tarefas e responsabilidades</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 justify-center">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pending')}
          >
            Pendentes
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </Button>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>
            <PlusCircle className="h-5 w-5 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Tarefa'}
          </Button>
        </div>

        {/* Task Form */}
        {showForm && (
          <TaskForm onSubmit={handleCreateTask} />
        )}

        {/* Task List or History */}
        {activeTab === 'pending' ? (
          <TaskList
            tasks={filteredTasks}
            onComplete={handleCompleteTask}
            loading={loading}
          />
        ) : (
          <TaskHistory history={history} />
        )}
      </div>
    </div>
  );
}
