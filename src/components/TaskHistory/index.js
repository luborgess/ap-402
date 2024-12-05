'use client';

import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const frequencyMap = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal'
};

export function TaskHistory({ history, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <Card key={entry.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{entry.task?.title}</h3>
              {entry.task?.description && (
                <p className="text-gray-600 mt-1">{entry.task.description}</p>
              )}
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Frequência: {frequencyMap[entry.task?.frequency]}</p>
                <p>Completada em: {format(new Date(entry.completed_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                <p>Completada por: {entry.completed_by?.name}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma tarefa completada encontrada
        </div>
      )}
    </div>
  );
}
