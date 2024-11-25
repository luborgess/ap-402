"use client";

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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

  // Configuração das escalas de limpeza
  const escalasLimpeza = {
    banheiroEsquerdo: ['Lucas', 'Bruno', 'Kelvin', 'Robson'],
    banheiroDireito: ['Luiz', 'Gabriel', 'Natan', 'Fulano'],
    salaCozinha: [
      ['Bruno', 'Fulano'],
      ['Luiz', 'Lucas'],
      ['Gabriel', 'Natan'],
      ['Kelvin', 'Robson']
    ]
  };

  // Função para obter a data atual formatada
  const getFormattedDate = (addDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toLocaleDateString('pt-BR');
  };

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

      {/* Escala de Limpeza */}
      <section className="space-y-6">
        <Card className="glass-card">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              <h2 className="text-xl font-bold">Limpeza</h2>
            </div>
            <p className="text-sm opacity-90">Próximas 4 semanas</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banheiro Esquerdo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Banheiro Esquerdo</h3>
                {escalasLimpeza.banheiroEsquerdo.map((pessoa, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{pessoa}</span>
                    <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
                  </div>
                ))}
              </div>

              {/* Banheiro Direito */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Banheiro Direito</h3>
                {escalasLimpeza.banheiroDireito.map((pessoa, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{pessoa}</span>
                    <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sala e Cozinha */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Sala e Cozinha</h3>
              {escalasLimpeza.salaCozinha.map((dupla, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-medium">{dupla[0]} e {dupla[1]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default EscalaIntegrada;
