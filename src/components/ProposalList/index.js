'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { ThumbsUp, ThumbsDown, Users, Calendar, AlertTriangle, CheckCircle2, XCircle, Trash2, MinusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Progress } from "../ui/progress";

export default function ProposalList({ proposals, onUpdate }) {
  const { user } = useAuth();
  const [votingProposal, setVotingProposal] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);

  const handleVoteClick = (proposal, vote) => {
    setVotingProposal(proposal);
    setCurrentVote(vote);
    setShowDialog(true);
  };

  const handleVoteConfirm = async () => {
    if (!votingProposal || currentVote === undefined) return;

    try {
      // Verificar se o usuário já votou
      const { data: existingVote, error: checkError } = await supabase
        .from('proposal_votes')
        .select('*')
        .eq('proposal_id', votingProposal.id)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking vote:', checkError);
        toast.error('Erro ao verificar voto existente');
        return;
      }

      let error;
      if (existingVote) {
        // Atualizar voto existente
        const { error: updateError } = await supabase
          .from('proposal_votes')
          .update({ vote: currentVote })
          .eq('id', existingVote.id);
        error = updateError;
      } else {
        // Criar novo voto
        const { error: insertError } = await supabase
          .from('proposal_votes')
          .insert({
            proposal_id: votingProposal.id,
            user_id: user.id,
            vote: currentVote
          });
        error = insertError;
      }

      if (error) {
        if (error.message?.includes('already approved or rejected')) {
          toast.error('Não é possível votar em propostas já aprovadas ou rejeitadas');
        } else {
          toast.error('Erro ao registrar voto. Tente novamente.');
        }
        console.error('Error voting:', error);
        return;
      }

      toast.success('Voto registrado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Erro ao registrar voto. Tente novamente.');
    } finally {
      setShowDialog(false);
      setVotingProposal(null);
      setCurrentVote(null);
    }
  };

  const handleDeleteProposal = async (proposal) => {
    try {
      if (!proposal?.id || !user?.id) {
        toast.error('Dados inválidos para exclusão');
        return;
      }

      if (proposal.created_by !== user.id) {
        toast.error('Você só pode excluir suas próprias propostas');
        return;
      }

      // Tenta excluir a proposta
      const { error } = await supabase
        .from('proposals')
        .delete()
        .match({ id: proposal.id });

      if (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir proposta');
        return;
      }

      toast.success('Proposta excluída com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir proposta');
    }
  };

  const getVoteStats = (votes) => {
    if (!votes || votes.length === 0) return { approve: 0, reject: 0, abstain: 0, total: 0 };
    
    const total = votes.length;
    const approve = votes.filter(v => v.vote === true).length;
    const reject = votes.filter(v => v.vote === false).length;
    const abstain = votes.filter(v => v.vote === null).length;
    
    return { approve, reject, abstain, total };
  };

  const getVoteStatus = (proposal) => {
    if (!proposal.votes) return null;
    
    const stats = getVoteStats(proposal.votes);
    const validVotes = stats.total - stats.abstain;
    
    if (validVotes === 0) return 'pending';
    
    const approvalRate = (stats.approve / validVotes) * 100;
    
    if (approvalRate >= 65) {
      return 'approved';
    } else if (stats.reject / validVotes >= 0.7) {
      return 'rejected';
    }
    return 'pending';
  };

  const getUserVote = (proposal) => {
    if (!proposal.votes) return null;
    const userVote = proposal.votes.find(v => v.user_id === user.id);
    return userVote ? userVote.vote : undefined;
  };

  if (proposals.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-3">Nenhuma proposta em votação</h3>
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-gray-400">
            Não há propostas para votação no momento. Você pode criar uma nova proposta para iniciar uma votação.
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">• Propostas são aprovadas com 65% dos votos favoráveis</p>
            <p className="mb-2">• Propostas são rejeitadas com 70% dos votos contrários</p>
            <p>• Abstenções não são contabilizadas no cálculo final</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Política de Votação</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-medium">Aprovação</p>
              <p className="text-sm text-gray-400">Requer 65% ou mais de votos favoráveis</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-medium">Rejeição</p>
              <p className="text-sm text-gray-400">Ocorre com 70% ou mais de votos contrários</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <MinusCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-yellow-400 font-medium">Abstenções</p>
              <p className="text-sm text-gray-400">Não são contabilizadas no resultado final</p>
            </div>
          </div>
        </div>
      </div>
      {proposals.map((proposal) => {
        const stats = getVoteStats(proposal.votes);
        const status = getVoteStatus(proposal);
        const userVote = getUserVote(proposal);
        const validVotes = stats.total - stats.abstain;
        const approvalRate = validVotes > 0 ? (stats.approve / validVotes) * 100 : 0;

        return (
          <div
            key={proposal.id}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
          >
            {/* Status Badge and Delete Button */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4">
                <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                {status && (
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${status === 'approved' ? 'bg-green-500/20 text-green-300' :
                      status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'}
                  `}>
                    {status === 'approved' ? 'Aprovada' :
                     status === 'rejected' ? 'Rejeitada' :
                     'Em votação'}
                  </span>
                )}
              </div>
              {proposal.created_by === user.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDeleteProposal(proposal)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-4">{proposal.description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  Criada em {format(new Date(proposal.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{stats.total} votos</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">{stats.approve} aprovações</span>
                <span className="text-yellow-400">{stats.abstain} abstenções</span>
                <span className="text-red-400">{stats.reject} rejeições</span>
              </div>
              <Progress value={approvalRate} className="h-2" />
              <p className="text-sm text-gray-400 text-center">
                {approvalRate.toFixed(1)}% de aprovação {stats.abstain > 0 && `(${stats.abstain} abstenções)`}
              </p>
            </div>

            {/* Vote Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 ${
                  userVote === true
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-green-500/20 hover:text-green-300'
                }`}
                onClick={() => handleVoteClick(proposal, true)}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${
                  userVote === null
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-yellow-500/20 hover:text-yellow-300'
                }`}
                onClick={() => handleVoteClick(proposal, null)}
              >
                <MinusCircle className="w-4 h-4 mr-2" />
                Abster-se
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${
                  userVote === false
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-red-500/20 hover:text-red-300'
                }`}
                onClick={() => handleVoteClick(proposal, false)}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogContent className="bg-gray-900 border border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Confirmar {currentVote === true ? 'Aprovação' : currentVote === false ? 'Rejeição' : 'Abstenção'}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    {currentVote === true ? 'Você está aprovando esta proposta.' : 
                     currentVote === false ? 'Você está rejeitando esta proposta.' :
                     'Você está se abstendo de votar nesta proposta.'}
                    <br />
                    Esta ação pode ser alterada posteriormente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleVoteConfirm}
                    className={`${
                      currentVote === true ? 'bg-green-500 hover:bg-green-600' :
                      currentVote === false ? 'bg-red-500 hover:bg-red-600' :
                      'bg-yellow-500 hover:bg-yellow-600'
                    } text-white`}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
}
