"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, User, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const LaundrySchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [showBackToCurrentButton, setShowBackToCurrentButton] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('');
  
  // Lista de pessoas na escala
  const people = ['Luiz', 'Lucas', 'Gabriel', 'A definir', 'Kelvin', 'Natan', 'Bruno', 'Robson'];
  
  // Data inicial (13/11/2024)
  const startDate = new Date(2024, 10, 13);

  // Calcula a diferença entre a semana atual e a semana inicial
  const calculateInitialWeek = () => {
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks;
  };

  // Inicializa com a semana atual
  useEffect(() => {
    const initialWeek = calculateInitialWeek();
    setCurrentWeek(initialWeek);
  }, []);

  useEffect(() => {
    setShowBackToCurrentButton(currentWeek !== calculateInitialWeek());
  }, [currentWeek]);

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
        title: `Dia de Lavar Roupas 👖`,
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
  setCurrentWeek(calculateInitialWeek());
  setNotification({
    show: true,
    message: 'Voltando para a semana atual!'
  });
  setTimeout(() => setNotification({ show: false, message: '' }), 2000);
};

// Função para gerar arquivo .ics
const generateIcsFile = () => {
  if (!selectedPerson) return;

  // Define a data inicial como a data atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Remove o horário para comparação precisa
  
  // Define a data final como 7 de dezembro de 2024
  const endDate = new Date(2025, 02, 8); // (0-based)

  const events = [];
  let currentDate = new Date(today);
  
  while (currentDate <= endDate) {
    const personIndex = getPersonIndex(currentDate);
    if (people[personIndex] === selectedPerson) {
      // Formata a data no padrão ICS (YYYYMMDD)
      const startDateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDateStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');
      
      events.push(`BEGIN:VEVENT
SUMMARY:Dia de Lavar Roupas 👖
DTSTART;VALUE=DATE:${startDateStr}
DTEND;VALUE=DATE:${endDateStr}
DESCRIPTION:Dia designado para ${selectedPerson} lavar roupa
END:VEVENT`);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Laundry Schedule//EN
CALSCALE:GREGORIAN
${events.join('\n')}
END:VCALENDAR`;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${selectedPerson}-laundry-schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Libera o URL após o download
};
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
              onClick={() => setCurrentWeek(prev => prev - 1)}
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
              onClick={() => setCurrentWeek(prev => prev + 1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center justify-self-end"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-5 sm:h-6 w-5 sm:w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {schedule.map((day, index) => (
              <div
                key={index}
                className={`
                  bg-gray-50 rounded-lg p-3 shadow transition-transform hover:scale-105
                  ${isCurrentDate(day.date) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${index === 0 ? 'sm:col-span-1 lg:col-span-1' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-between space-y-2">
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
                    <User className="h-5 sm:h-5 w-5 sm:w-5 text-gray-600" />
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
                      <CalendarDays className="h-5 sm:h-5 w-5 sm:w-5" />
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
      <div className="flex flex-col items-center gap-4">
        <div className="mt-4 sm:mt-6 bg-white/10 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between">
          <h3 className="bg-blue-600 rounded-md text-lg sm:text-xl font-semibold mb-2 sm:mb-0 px-2 py-1 text-white">
            Escala 2024.2:
          </h3>
          <div className="flex items-center gap-4 justify-center px-2 py-1 ">
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="bg-blue-600 px-2 py-1 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              <option value="">Selecione seu nome</option>
              {people.map((person, index) => (
                <option key={index} value={person}>{person}</option>
              ))}
            </select>
            {selectedPerson && (
              <button
                onClick={generateIcsFile}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download ⬇️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundrySchedule;