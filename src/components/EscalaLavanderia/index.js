"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, User, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useEscalaLavanderia } from './useEscalaLavanderia';
import { WeekView } from './WeekView';
import { DownloadSection } from './DownloadSection';

const EscalaLavanderia = () => {
  const {
    currentWeek,
    schedule,
    selectedPerson,
    notification,
    showBackToCurrentButton,
    handleBackToCurrent,
    handleWeekChange,
    handleAddToCalendar,
    handlePersonSelect,
    generateIcsFile,
    getWeekPeriod,
  } = useEscalaLavanderia();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col min-h-screen">
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification.message}
        </div>
      )}

      {showBackToCurrentButton && (
        <button
          onClick={handleBackToCurrent}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 z-50"
          title="Voltar para semana atual"
        >
          <CalendarDays className="h-5 sm:h-6 w-5 sm:w-6" />
          <span className="hidden sm:inline">Semana Atual</span>
        </button>
      )}

      <Card className="bg-white/10 shadow-lg backdrop-blur-md border-0 w-full">
        <CardHeader className="flex flex-col bg-blue-600 text-white rounded-t-lg p-4 sm:p-6">
          <div className="grid grid-cols-[40px_1fr_40px] sm:grid-cols-[48px_1fr_48px] items-center w-full gap-2">
            <button
              onClick={() => handleWeekChange(-1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-5 sm:h-6 w-5 sm:w-6" />
            </button>

            <div className="flex flex-col items-center w-full min-w-0">
              <div className="flex items-center justify-center gap-2 w-full">
                <Calendar className="h-5 sm:h-6 w-5 sm:w-6 flex-shrink-0" />
                <h2 className="hidden sm:block text-xl font-bold">
                  Escala de Lavagem de Roupa
                </h2>
                <h2 className="sm:hidden text-lg font-bold">
                  Escala
                </h2>
              </div>
              <span className="text-sm sm:text-base font-normal mt-1">
                ({getWeekPeriod()})
              </span>
            </div>

            <button
              onClick={() => handleWeekChange(1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center justify-self-end"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-5 sm:h-6 w-5 sm:w-6" />
            </button>
          </div>
        </CardHeader>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 m-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Aviso de Manutenção:</span> O sistema de lavanderia está passando por manutenção programada. Algumas funcionalidades podem estar temporariamente indisponíveis.
              </p>
            </div>
          </div>
        </div>

        <WeekView schedule={schedule} onAddToCalendar={handleAddToCalendar} />
      </Card>

      <DownloadSection
        selectedPerson={selectedPerson}
        onPersonSelect={handlePersonSelect}
        onDownload={generateIcsFile}
      />
    </div>
  );
};

export default EscalaLavanderia;
