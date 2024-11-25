"use client";

import React from 'react';
import { User, CalendarDays } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

const isCurrentDate = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const WeekView = ({ schedule, onAddToCalendar }) => {
  return (
    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 w-full">
        {schedule.map((day, index) => (
          <div
            key={index}
            className={`
              bg-gray-50 rounded-lg p-3 shadow transition-transform hover:scale-105
              ${isCurrentDate(day.date) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
            `}
          >
            <div className="flex flex-col items-center justify-between space-y-2">
              <div className="text-blue-600 font-semibold text-center">
                <div className="capitalize">
                  {day.date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </div>
                <div className="text-lg">
                  {day.date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-medium text-gray-800">
                  {day.person}
                </span>
              </div>
              
              <div className="h-6">
                {isCurrentDate(day.date) && (
                  <span className="text-sm text-blue-600 font-medium">
                    Hoje
                  </span>
                )}
              </div>
              
              <div className="h-8 flex items-center justify-center">
                <button
                  onClick={() => onAddToCalendar(day.date, day.person)}
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-50 group relative"
                  aria-label="Adicionar ao calendário"
                >
                  <CalendarDays className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
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
