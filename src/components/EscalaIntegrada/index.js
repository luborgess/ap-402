"use client";

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, Wrench } from 'lucide-react';
import { useEscalaLavanderia } from '../EscalaLavanderia/useEscalaLavanderia';
import { WeekView } from '../EscalaLavanderia/WeekView';

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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification.message}
        </div>
      )}

      {showBackToCurrentButton && (
        <button
          onClick={handleBackToCurrent}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 z-50"
        >
          <CalendarDays className="h-6 w-6" />
          <span>Semana Atual</span>
        </button>
      )}

      {/* Escala de Lavanderia */}
      <section>
        <Card className="glass-card">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <div className="grid grid-cols-[48px_1fr_48px] items-center w-full gap-2">
              <button
                onClick={() => handleWeekChange(-1)}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Lavanderia</h2>
                </div>
                <span className="text-sm opacity-90">({getWeekPeriod()})</span>
              </div>

              <button
                onClick={() => handleWeekChange(1)}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </CardHeader>

          <WeekView schedule={schedule} onAddToCalendar={handleAddToCalendar} />
        </Card>
      </section>

      {/* Escala de Limpeza - Tela de Manutenção */}
      <section>
        <Card className="glass-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Wrench className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema em Manutenção
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              🛠️ Estamos trabalhando em melhorias significativas para o sistema de limpeza.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-blue-800 mb-2">
                Novidades em Desenvolvimento:
              </h2>
              <ul className="text-blue-700 text-sm space-y-2">
                <li>✨ Sistema de autenticação de usuários</li>
                <li>💾 Persistência de dados</li>
                <li>🔄 Sincronização em tempo real</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500">
              Agradecemos sua compreensão. Em breve estaremos de volta com novidades!
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default EscalaIntegrada;
