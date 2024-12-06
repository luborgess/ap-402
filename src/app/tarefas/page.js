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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            
            <Button 
              onClick={() => router.push('/configuracoes')}
              className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-600/50"
            >
              Criar Nova Tarefa
            </Button>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <TaskList tasks={tasks} loading={loading} onTaskCompleted={fetchTasks} />
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
              Histórico de Tarefas
            </h2>
            <TaskHistory onTaskUpdate={fetchTasks} />
          </div>
        </div>
      </main>
    </div>
  );
}
