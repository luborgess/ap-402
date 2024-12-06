'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddItemDialog from '@/components/AddItemDialog';
import ExpensesList from '@/components/ExpensesList';

export default function DespesasPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      // Buscar as despesas compartilhadas
      const { data: items, error: itemsError } = await supabase
        .from('shared_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Erro ao buscar despesas:', itemsError.message);
        toast.error('Erro ao carregar lista de despesas');
        return;
      }

      // Buscar os perfis dos usuários
      const userIds = new Set();
      items.forEach(item => {
        userIds.add(item.created_by);
        if (Array.isArray(item.shared_with)) {
          item.shared_with.forEach(id => userIds.add(id));
        }
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError.message);
        toast.error('Erro ao carregar informações dos usuários');
        return;
      }

      // Combinar os dados
      const itemsWithProfiles = items.map(item => ({
        ...item,
        created_by_profile: profiles.find(profile => profile.id === item.created_by),
        shared_with_profiles: Array.isArray(item.shared_with) 
          ? item.shared_with.map(id => profiles.find(profile => profile.id === id)).filter(Boolean)
          : []
      }));

      setItems(itemsWithProfiles);
    } catch (error) {
      console.error('Erro inesperado ao buscar despesas:', error);
      toast.error('Erro ao carregar lista de despesas');
    } finally {
      setLoading(false);
    }
  };

  const handleItemAdded = () => {
    setShowAddDialog(false);
    fetchItems();
    toast.success('Despesa adicionada com sucesso!');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Despesas</h1>
              <p className="text-gray-400">Adicione despesas que precisam ser pagas</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>

          {/* Shopping List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <ExpensesList
              items={items}
              onUpdate={fetchItems}
            />
          )}
        </div>
      </main>

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onItemAdded={handleItemAdded}
      />
    </div>
  );
}
