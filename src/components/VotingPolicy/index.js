'use client';

import { Info } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function VotingPolicy() {
  return (
    <Collapsible className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
        <Info className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Política de Votação</h3>
          <p className="text-sm text-gray-400">Clique para ver as regras de votação</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <div>
          <h4 className="text-md font-medium text-white mb-2">Aprovação de Propostas</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Uma proposta é <span className="text-green-400">aprovada</span> quando atinge 65% ou mais de aprovação dos votos válidos</li>
            <li>Uma proposta é <span className="text-red-400">rejeitada</span> quando atinge 70% ou mais de rejeição dos votos válidos</li>
            <li>Votos de <span className="text-yellow-400">abstenção</span> não são contabilizados no cálculo de aprovação</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-white mb-2">Regras Gerais</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Cada morador tem direito a um voto por proposta</li>
            <li>Os votos podem ser alterados a qualquer momento</li>
            <li>O criador da proposta pode excluí-la antes da aprovação</li>
            <li>Propostas aprovadas ou rejeitadas não podem ser modificadas</li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
