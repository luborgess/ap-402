'use client';

import { Users, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

export default function VotingPolicy() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="bg-blue-500/10 p-2 rounded-full w-fit">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Política de Votação</h3>
          <p className="text-sm text-gray-400 mt-0.5">Regras para aprovação de propostas</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
          <div className="mt-1">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-medium">Aprovação</p>
            <p className="text-sm text-gray-400">Requer 65% ou mais de votos favoráveis</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
          <div className="mt-1">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-medium">Rejeição</p>
            <p className="text-sm text-gray-400">Ocorre com 70% ou mais de votos contrários</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3 sm:col-span-2 lg:col-span-1">
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
  );
}
