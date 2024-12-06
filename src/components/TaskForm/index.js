'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Command } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, add } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from 'react-hot-toast';

export function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .not('name', 'is', null)  // Only get profiles with names
        .order('name');

      if (error) throw error;
      
      // Filter out any profiles without names and format them
      const validUsers = (data || []).filter(profile => profile.name);
      setUsers(validUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calcular próxima data com base na frequência
      const nextDate = add(new Date(), {
        days: frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30,
      });

      const { error } = await supabase.from('tasks').insert([
        {
          title,
          description,
          frequency,
          responsible_users: selectedUsers.map(user => user.id),
          next_date: format(nextDate, 'yyyy-MM-dd', { locale: ptBR }),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setTitle('');
      setDescription('');
      setFrequency('daily');
      setSelectedUsers([]);
      
      if (onTaskAdded) {
        onTaskAdded();
      }
      toast.success('Tarefa criada com sucesso!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Responsáveis</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedUsers.length === 0
                ? "Selecione os responsáveis..."
                : `${selectedUsers.length} selecionado(s)`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command className="w-full">
              <div className="max-h-60 overflow-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-accent",
                      selectedUsers.some(u => u.id === user.id) && "bg-accent"
                    )}
                    onClick={() => {
                      setSelectedUsers(prev => {
                        const isSelected = prev.some(u => u.id === user.id);
                        if (isSelected) {
                          return prev.filter(u => u.id !== user.id);
                        } else {
                          return [...prev, user];
                        }
                      });
                    }}
                  >
                    <span>{user.name}</span>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequência</Label>
        <Select
          value={frequency}
          onValueChange={setFrequency}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Frequência</SelectLabel>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !title || selectedUsers.length === 0}>
        {loading ? "Criando..." : "Criar Tarefa"}
      </Button>
    </form>
  );
}
