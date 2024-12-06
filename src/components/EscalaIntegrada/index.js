"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, Wrench } from 'lucide-react';
import { useEscalaLavanderia } from '../EscalaLavanderia/useEscalaLavanderia';
import { WeekView } from '../EscalaLavanderia/WeekView';
import { cn } from '@/lib/utils';

const EscalaIntegrada = () => {
  const {
    schedule,
    notification,
    showBackToCurrentButton,
    handleBackToCurrent,
    handleWeekChange,
    handleAddToCalendar,
    getWeekPeriod,
  } = useEscalaLavanderia();

  return (
    <div className="space-y-6">
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification.message}
        </div>
      )}

      {showBackToCurrentButton && (
        <button
          onClick={handleBackToCurrent}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center gap-2 z-50"
        >
          <CalendarDays className="h-6 w-6" />
          <span>Semana Atual</span>
        </button>
      )}

      {/* Escala de Lavanderia */}
      <section>
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Lavanderia
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWeekChange(-1)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-gray-400 font-medium">
                {getWeekPeriod()}
              </div>
              <button
                onClick={() => handleWeekChange(1)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
          <WeekView schedule={schedule} onAddToCalendar={handleAddToCalendar} />
        </Card>
      </section>

      {/* Escala de Limpeza - Tela de Manutenção */}
      <section>
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="bg-blue-500/10 p-4 rounded-full">
              <Wrench className="h-12 w-12 text-blue-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Sistema em Manutenção
              </h3>
              <p className="text-gray-400">
                🛠️ Estamos trabalhando em melhorias significativas para o sistema de limpeza.
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 w-full max-w-md">
              <h4 className="font-semibold text-gray-200 mb-3">
                Novidades em Desenvolvimento:
              </h4>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Sistema de autenticação de usuários
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Perfil do usuário
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">○</span>
                  Persistência de dados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">○</span>
                  Sincronização em tempo real
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default EscalaIntegrada;
