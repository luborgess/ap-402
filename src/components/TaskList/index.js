'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const frequencyMap = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal'
};

export function TaskList({ tasks, onComplete, loading }) {
  const [completingId, setCompletingId] = useState(null);

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    const toastId = toast.loading('Concluindo tarefa...');

    try {
      await onComplete(taskId);
      toast.success('Tarefa concluída com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Erro ao concluir a tarefa. Por favor, tente novamente.', { id: toastId });
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Frequência: {frequencyMap[task.frequency]}</p>
                <p>Próxima data: {format(new Date(task.next_date), "dd 'de' MMMM", { locale: ptBR })}</p>
                <p>Responsáveis: {task.responsible_users?.map(user => user.name).join(', ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={completingId === task.id}
              onClick={() => handleComplete(task.id)}
              className="ml-4"
            >
              {completingId === task.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : task.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma tarefa encontrada
        </div>
      )}
    </div>
  );
}
