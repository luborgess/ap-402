'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { TaskList } from '@/components/TaskList';
import { TaskHistory } from '@/components/TaskHistory';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          responsible_users
        `)
        .order('next_date', { ascending: true });

      if (error) throw error;
      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Tarefas</h1>
            <Button 
              onClick={() => router.push('/configuracoes')}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Criar Nova Tarefa
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Tarefas Pendentes
            </h2>
            <TaskList tasks={tasks} loading={loading} onTaskCompleted={fetchTasks} />
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Histórico de Tarefas
            </h2>
            <TaskHistory onTaskUpdate={fetchTasks} />
          </div>
        </div>
      </main>
    </div>
  );
}
