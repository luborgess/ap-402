'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { PlusCircle, Loader2, X } from 'lucide-react';

export function TaskForm({ onSubmit, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    responsible_users: [],
    next_date: new Date().toISOString().split('T')[0],
    ...initialData
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name');
    
    if (!error) {
      setUsers(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        responsible_users: [],
        next_date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const addResponsible = (userId) => {
    if (!formData.responsible_users.includes(userId)) {
      setFormData({
        ...formData,
        responsible_users: [...formData.responsible_users, userId]
      });
    }
  };

  const removeResponsible = (userId) => {
    setFormData({
      ...formData,
      responsible_users: formData.responsible_users.filter(id => id !== userId)
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Frequência</label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsáveis</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.responsible_users.map((userId) => {
              const user = users.find(u => u.id === userId);
              return user ? (
                <div 
                  key={userId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {user.name}
                  <button
                    type="button"
                    onClick={() => removeResponsible(userId)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
          <Select onValueChange={addResponsible}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar responsável" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter(user => !formData.responsible_users.includes(user.id))
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Próxima Data</label>
          <Input
            type="date"
            required
            value={formData.next_date}
            onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={loading || formData.responsible_users.length === 0}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar' : 'Criar'} Tarefa
        </Button>
      </form>
    </Card>
  );
}
