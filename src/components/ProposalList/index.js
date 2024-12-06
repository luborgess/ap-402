'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymldbdtphzcetkfinykt.supabase.co';

export default function ProposalList({ proposals, onUpdate, users }) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);
  const [votingProposal, setVotingProposal] = useState(null);

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
        console.error('Error voting:', error);
        toast.error('Erro ao registrar voto. Tente novamente.');
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

  const getVoteStats = (votes) => {
    if (!votes || votes.length === 0) return { approve: 0, reject: 0, abstain: 0, total: 0 };
    
    const total = votes.length;
    const approve = votes.filter(v => v.vote === true).length;
    const reject = votes.filter(v => v.vote === false).length;
    const abstain = votes.filter(v => v.vote === null).length;
    
    return { approve, reject, abstain, total };
  };

  const getVoteStatus = (proposal) => {
    if (!proposal.votes) return 'pending';
    
    const stats = getVoteStats(proposal.votes);
    const validVotes = stats.total - stats.abstain;
    
    if (validVotes === 0) return 'pending';
    
    const approvalRate = (stats.approve / validVotes) * 100;
    const rejectionRate = (stats.reject / validVotes) * 100;
    
    if (approvalRate >= 65) {
      return 'approved';
    } else if (rejectionRate >= 70) {
      return 'rejected';
    }
    return 'pending';
  };

  const getUserVote = (proposal) => {
    if (!proposal.votes) return undefined;
    const userVote = proposal.votes.find(v => v.user_id === user.id);
    return userVote ? userVote.vote : undefined;
  };

  if (proposals.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma proposta em votação</h3>
        <p className="text-gray-400">
          Não há propostas para votação no momento. Você pode criar uma nova proposta para iniciar uma votação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => {
        const stats = getVoteStats(proposal.votes);
        const status = getVoteStatus(proposal);
        const userVote = getUserVote(proposal);
        const validVotes = stats.total - stats.abstain;
        const approvalRate = validVotes > 0 ? (stats.approve / validVotes) * 100 : 0;

        return (
          <div key={proposal.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                  <p className="text-gray-400 mt-1">{proposal.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>Criado por {users.find(u => u.id === proposal.created_by)?.name || 'Usuário'}</span>
                    <span>•</span>
                    <span>{format(new Date(proposal.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${
                      userVote === true
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-green-500/20 hover:text-green-300'
                    }`}
                    onClick={() => handleVoteClick(proposal, true)}
                  >
                    <ThumbsUp className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Aprovar</span>
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
                    <MinusCircle className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Abster-se</span>
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
                    <ThumbsDown className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Rejeitar</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">{stats.approve}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">{stats.reject}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MinusCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">{stats.abstain}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'pending' && (
                      <span className="text-gray-400">
                        {approvalRate.toFixed(1)}% de aprovação
                      </span>
                    )}
                    {status === 'approved' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proposta Aprovada</span>
                      </div>
                    )}
                    {status === 'rejected' && (
                      <div className="flex items-center gap-2 text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>Proposta Rejeitada</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      approvalRate >= 65 ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>

                {/* Lista de Votos */}
                {proposal.votes && proposal.votes.length > 0 && (
                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Votos de Aprovação */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-400">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Aprovaram</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {proposal.votes
                            .filter(vote => vote.vote === true)
                            .map(vote => {
                              const voter = users.find(u => u.id === vote.user_id);
                              return (
                                <div key={vote.id} className="flex items-center gap-2 bg-gray-800/50 rounded-full pl-1 pr-3 py-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage 
                                      src={voter?.avatar ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${voter.avatar}` : null} 
                                      alt={voter?.name} 
                                      onError={(e) => {
                                        console.log('Erro ao carregar avatar:', voter?.avatar);
                                        console.log('URL completa:', e.target.src);
                                        e.target.src = null;
                                      }}
                                    />
                                    <AvatarFallback>{voter?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-300">{voter?.name}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Votos de Rejeição */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-400">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm font-medium">Rejeitaram</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {proposal.votes
                            .filter(vote => vote.vote === false)
                            .map(vote => {
                              const voter = users.find(u => u.id === vote.user_id);
                              return (
                                <div key={vote.id} className="flex items-center gap-2 bg-gray-800/50 rounded-full pl-1 pr-3 py-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage 
                                      src={voter?.avatar ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${voter.avatar}` : null} 
                                      alt={voter?.name} 
                                      onError={(e) => {
                                        console.log('Erro ao carregar avatar:', voter?.avatar);
                                        console.log('URL completa:', e.target.src);
                                        e.target.src = null;
                                      }}
                                    />
                                    <AvatarFallback>{voter?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-300">{voter?.name}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Abstenções */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <MinusCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Abstiveram-se</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {proposal.votes
                            .filter(vote => vote.vote === null)
                            .map(vote => {
                              const voter = users.find(u => u.id === vote.user_id);
                              return (
                                <div key={vote.id} className="flex items-center gap-2 bg-gray-800/50 rounded-full pl-1 pr-3 py-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage 
                                      src={voter?.avatar ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${voter.avatar}` : null} 
                                      alt={voter?.name} 
                                      onError={(e) => {
                                        console.log('Erro ao carregar avatar:', voter?.avatar);
                                        console.log('URL completa:', e.target.src);
                                        e.target.src = null;
                                      }}
                                    />
                                    <AvatarFallback>{voter?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-300">{voter?.name}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
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
}
