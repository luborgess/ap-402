import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AddItemDialog({ open, onOpenChange, onItemAdded }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .neq('id', user.id);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || selectedUsers.length === 0) {
      toast.error('Por favor, preencha os campos obrigatórios e selecione pelo menos um usuário');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('shared_expenses')
        .insert({
          description,
          amount: parseFloat(amount),
          due_date: dueDate || null,
          notes,
          created_by: user.id,
          split_type: splitType,
          shared_with: selectedUsers,
          status: 'pending'
        });

      if (error) throw error;

      setDescription('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setSplitType('equal');
      setSelectedUsers([]);
      onItemAdded();
      toast.success('Despesa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Despesa Compartilhada</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione uma nova despesa para compartilhar com outros moradores.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Ex: Conta de luz"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Valor Total</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Ex: 150.00"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Vencimento (opcional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-gray-800 border-gray-700"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="splitType">Tipo de Divisão</Label>
              <Select value={splitType} onValueChange={setSplitType} disabled={loading}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="equal">Dividir Igualmente</SelectItem>
                  <SelectItem value="custom">Divisão Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Compartilhar com</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {users.map((u) => (
                  <Button
                    key={u.id}
                    type="button"
                    variant={selectedUsers.includes(u.id) ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      selectedUsers.includes(u.id)
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => handleUserToggle(u.id)}
                    disabled={loading}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{u.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Ex: Vencimento todo dia 15"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Adicionando...' : 'Adicionar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
