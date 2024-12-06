"use client";

import React from 'react';
import { User, CalendarDays } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const isCurrentDate = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const WeekView = ({ schedule, onAddToCalendar }) => {
  return (
    <CardContent className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 w-full">
        {schedule.map((day, index) => (
          <div
            key={index}
            className={cn(
              "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 transition-all hover:scale-105",
              isCurrentDate(day.date) && "ring-2 ring-blue-500 bg-blue-500/10"
            )}
          >
            <div className="flex flex-col items-center justify-between space-y-2">
              <div className="text-gray-200 font-medium text-center">
                <div className="capitalize text-sm">
                  {day.date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </div>
                <div className="text-lg font-bold">
                  {day.date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </div>
              </div>
　　 　 　 　
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-medium text-gray-200">
                  {day.person}
                </span>
              </div>
　　 　 　 　
              <div className="h-6">
                {isCurrentDate(day.date) && (
                  <span className="text-sm text-blue-400 font-medium">
                    Hoje
                  </span>
                )}
              </div>
　　 　 　 　
              <div className="h-8 flex items-center justify-center">
                <button
                  onClick={() => onAddToCalendar(day.date, day.person)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700/50 group relative"
                  aria-label="Adicionar ao calendário"
                >
                  <CalendarDays className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    Adicionar ao calendário
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};
