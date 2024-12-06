import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ExpensesList({ items, onUpdate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar');

      if (error) throw error;

      const profileMap = {};
      data.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      setProfiles(profileMap);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('shared_expenses')
        .update({ 
          status: newStatus,
          paid_by: newStatus === 'paid' ? [user.id] : [],
          paid_shares: newStatus === 'paid' ? { [user.id]: true } : {}
        })
        .eq('id', itemId);

      if (error) throw error;
      onUpdate();
      toast.success(newStatus === 'paid' ? 'Despesa marcada como paga!' : 'Despesa marcada como pendente!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('shared_expenses')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      onUpdate();
      toast.success('Despesa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      toast.error('Erro ao remover despesa');
    } finally {
      setLoading(false);
    }
  };

  const calculateShare = (item) => {
    if (!item || typeof item.amount !== 'number') {
      return '0.00';
    }

    if (item.split_type === 'equal' && Array.isArray(item.shared_with)) {
      const totalUsers = item.shared_with.length + 1; // +1 para incluir o criador
      return (item.amount / totalUsers).toFixed(2);
    }
    
    return item.amount.toFixed(2);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhuma despesa registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const share = calculateShare(item);
        const isPaid = item.paid_by?.includes(user.id);
        const isCreator = item.created_by === user.id;
        const sharedUsers = [item.created_by].concat(Array.isArray(item.shared_with) ? item.shared_with : [])
          .filter(id => id !== user.id && id != null)
          .map(id => profiles[id])
          .filter(Boolean);

        return (
          <div
            key={item.id}
            className={`bg-gray-800 rounded-lg p-4 ${
              isPaid ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{item.description}</h3>
                  <span className="text-sm text-green-400">
                    R$ {typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}
                  </span>
                </div>
                
                {item.due_date && (
                  <p className="text-sm text-orange-400 mt-1">
                    Vence em {format(new Date(item.due_date), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                )}

                {item.notes && (
                  <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {sharedUsers.map(profile => (
                    <div key={profile.id} className="flex items-center gap-1.5 bg-gray-700/50 rounded-full px-2 py-1">
                      <Avatar className="h-4 w-4">
                        {profile.avatar ? (
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                        ) : null}
                        <AvatarFallback>
                          {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-300">{profile.name || 'Usuário'}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-gray-300">
                    Sua parte: R$ {share}
                    {item.split_type === 'equal' && ' (divisão igual)'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!isPaid && (
                  <Button
                    onClick={() => handleStatusChange(item.id, 'paid')}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-400 hover:text-green-500 hover:bg-green-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {isPaid && (
                  <Button
                    onClick={() => handleStatusChange(item.id, 'pending')}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-400 hover:text-orange-500 hover:bg-orange-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isCreator && (
                  <Button
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
