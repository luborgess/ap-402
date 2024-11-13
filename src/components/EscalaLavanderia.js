"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, User, ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';

const LaundrySchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [showBackToCurrentButton, setShowBackToCurrentButton] = useState(false);
  
  // Lista de pessoas na escala
  const people = ['Luiz', 'Lucas', 'Gabriel', 'A definir', 'Kelvin', 'Natan', 'Bruno', 'Robson'];
  
  // Data inicial (13/11/2024)
  const startDate = new Date(2024, 10, 13);

  useEffect(() => {
    setShowBackToCurrentButton(currentWeek !== 0);
  }, [currentWeek]);
  
  // Função para calcular o índice da pessoa baseado na data
  const getPersonIndex = (date) => {
    const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    // Para datas anteriores à data inicial, precisamos ajustar o índice
    if (diffDays < 0) {
      const adjustedIndex = (people.length - (Math.abs(diffDays) % people.length)) % people.length;
      return adjustedIndex;
    }
    return diffDays % people.length;
  };
  
  // Função para obter a segunda-feira da semana
  const getMondayOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  
  // Gerar dias para a semana atual
  const getWeekSchedule = (weekOffset) => {
    const weekStart = getMondayOfWeek(new Date(startDate));
    weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return {
        date,
        person: people[getPersonIndex(date)]
      };
    });
  };

  const schedule = getWeekSchedule(currentWeek);

  // Função para formatar a data do período
  const getWeekPeriod = () => {
    const firstDay = schedule[0].date;
    const lastDay = schedule[6].date;
    
    return `${firstDay.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })} - ${lastDay.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })}`;
  };

  // Verifica se é a data atual
  const isCurrentDate = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Função para adicionar ao calendário
  const handleAddToCalendar = (date, person) => {
    try {
      const event = {
        title: `Dia de Lavar Roupa - ${person}`,
        start: date.toISOString().split('T')[0],
        end: date.toISOString().split('T')[0],
        description: `Dia designado para ${person} lavar roupa`
      };

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/-/g, '')}/${event.end.replace(/-/g, '')}&details=${encodeURIComponent(event.description)}`;

      window.open(googleCalendarUrl, '_blank');
      
      setNotification({
        show: true,
        message: 'Redirecionando para adicionar ao seu calendário!'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    } catch (error) {
      console.error('Erro ao adicionar ao calendário:', error);
      setNotification({
        show: true,
        message: 'Erro ao adicionar ao calendário. Tente novamente.'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }
  };

  // Função para voltar à semana atual
  const handleBackToCurrent = () => {
    setCurrentWeek(0);
    setNotification({
      show: true,
      message: 'Voltando para a semana atual!'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification.message}
        </div>
      )}

      {showBackToCurrentButton && (
        <button
          onClick={handleBackToCurrent}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 z-50 md:px-6"
          title="Voltar para semana atual"
        >
          <CalendarDays className="h-6 w-6" />
          <span className="hidden md:inline">Semana Atual</span>
        </button>
      )}
      
      <Card className="bg-white/45 shadow-lg backdrop-blur-md border-0">
        <CardHeader className="flex flex-col bg-blue-600 text-white rounded-t-lg p-4">
          <div className="grid grid-cols-[48px_1fr_48px] items-center w-full gap-2">
            <button 
              onClick={() => setCurrentWeek(prev => prev - 1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex flex-col items-center w-full min-w-0">
                  <div className="flex items-center justify-center gap-2 w-full">
                    <Calendar className="h-6 w-6 flex-shrink-0" />
                    <h2 className="hidden sm:block text-xl font-bold">
                      Escala de Lavagem de Roupa
                    </h2>
                    <h2 className="sm:hidden text-lg font-bold">
                      Escala
                    </h2>
                  </div>
                  <span className="text-sm md:text-base font-normal mt-1">
                    ({getWeekPeriod()})
                  </span>
                </div>

            <button 
              onClick={() => setCurrentWeek(prev => prev + 1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors w-10 h-10 flex items-center justify-center justify-self-end"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {schedule.map((day, index) => (
              <div
                key={index}
                className={`
                  bg-gray-50 rounded-lg p-4 shadow transition-transform hover:scale-105
                  ${isCurrentDate(day.date) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                `}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-blue-600 font-semibold text-center">
                    <div className="capitalize">
                      {day.date.toLocaleDateString('pt-BR', {
                        weekday: 'long'
                      })}
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
                      onClick={() => handleAddToCalendar(day.date, day.person)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-50 group relative flex items-center justify-center"
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
      </Card>
      
      <div className="mt-4 bg-white/45 rounded-lg p-4 shadow-lg backdrop-blur-md">
        <h3 className="text-lg font-semibold mb-2">Moradores:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {people.map((person, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base">{person}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaundrySchedule;