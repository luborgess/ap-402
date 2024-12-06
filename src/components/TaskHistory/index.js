'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { User, Calendar, Users } from 'lucide-react';

export function TaskHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Primeiro, buscar o histórico de tarefas
      const { data: historyData, error: historyError } = await supabase
        .from('task_history')
        .select(`
          *,
          tasks!task_history_task_id_fkey (
            title,
            responsible_users
          )
        `)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;

      // Coletar todos os IDs de usuários únicos
      const userIds = new Set();
      historyData?.forEach(record => {
        if (record.completed_by) userIds.add(record.completed_by);
        if (record.tasks?.responsible_users) {
          record.tasks.responsible_users.forEach(id => userIds.add(id));
        }
      });

      // Buscar informações dos usuários
      if (userIds.size > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', Array.from(userIds));

        if (userError) throw userError;

        const usersMap = {};
        userData?.forEach(user => {
          usersMap[user.id] = user.name;
        });
        setUsers(usersMap);
      }

      setHistory(historyData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Carregando histórico...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/20 rounded-lg p-4 border border-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <div
          key={record.id}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-white">
              {record.tasks?.title || 'Tarefa Removida'}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(record.completed_at), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium text-emerald-400">
                  Concluída por: {users[record.completed_by] || 'Usuário desconhecido'}
                </span>
              </div>
              {record.tasks?.responsible_users && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    Responsáveis: {record.tasks.responsible_users
                      .map(id => users[id] || 'Usuário desconhecido')
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {history.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 py-8">
          Nenhum histórico de tarefas encontrado
        </div>
      )}
    </div>
  );
}
