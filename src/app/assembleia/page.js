'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import ProposalList from '@/components/ProposalList';
import VotingPolicy from '@/components/VotingPolicy';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import CreateProposalDialog from '@/components/CreateProposalDialog';
import { toast } from 'react-hot-toast';

export default function AssembleiaPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProposals();
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, full_name, avatar');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error.message);
        toast.error('Erro ao carregar usuários');
        return;
      }

      if (!profiles) {
        console.warn('Nenhum perfil encontrado');
        setUsers([]);
        return;
      }

      console.log('Perfis carregados:', profiles);
      setUsers(profiles);
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const fetchProposals = async () => {
    try {
      console.log('Buscando propostas...');
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          votes:proposal_votes(
            id,
            user_id,
            vote,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar propostas:', error.message);
        toast.error('Erro ao carregar propostas');
        return;
      }

      console.log('Propostas recebidas:', data);
      setProposals(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalCreated = () => {
    setShowCreateDialog(false);
    fetchProposals();
    toast.success('Proposta criada com sucesso!');
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
              <h1 className="text-2xl font-bold text-white">Assembléia</h1>
              <p className="text-gray-400">Vote e acompanhe as propostas</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </div>

          {/* Voting Policy Card */}
          <div className="mb-8">
            <VotingPolicy />
          </div>

          {/* Proposals List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : (
            <ProposalList proposals={proposals} users={users} onUpdate={fetchProposals} />
          )}
        </div>
      </main>

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onProposalCreated={handleProposalCreated}
      />
    </div>
  );
}
