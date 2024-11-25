"use client";

import { useState, useEffect } from 'react';

// Ordem correta dos residentes conforme especificado
const RESIDENTS = [
    'Robson',    // 1º
    'Luiz',   // 2º
    'Lucas',     // 3º
    'Gabriel',    // 4º
    'Kelvin',     // 8º
    'Fulano',   // 7º
    'Natan',  // 5º
    'Bruno',   // 6º
];

export const useEscalaLavanderia = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [showBackToCurrentButton, setShowBackToCurrentButton] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('');

  // Função simplificada para obter a segunda-feira da semana
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Função simplificada para calcular o offset da semana atual
  const getCurrentWeekOffset = () => {
    const today = new Date();
    const currentMonday = getMondayOfWeek(today);
    const baseMonday = getMondayOfWeek(new Date());
    return Math.floor((currentMonday - baseMonday) / (7 * 24 * 60 * 60 * 1000));
  };

  useEffect(() => {
    setCurrentWeek(getCurrentWeekOffset());
  }, []);

  useEffect(() => {
    setShowBackToCurrentButton(currentWeek !== getCurrentWeekOffset());
  }, [currentWeek]);

  const showNotification = (message, duration = 3000) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), duration);
  };

  // Função simplificada para obter a pessoa responsável pela data
  const getPersonForDate = (date) => {
    const daysSinceEpoch = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
    return RESIDENTS[daysSinceEpoch % RESIDENTS.length];
  };

  const getWeekSchedule = (weekOffset) => {
    const monday = getMondayOfWeek(new Date());
    monday.setDate(monday.getDate() + (weekOffset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      return {
        date,
        person: getPersonForDate(date)
      };
    });
  };

  const schedule = getWeekSchedule(currentWeek);

  const getWeekPeriod = () => {
    const firstDay = schedule[0].date;
    const lastDay = schedule[6].date;
    
    const formatDate = (date) => date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
    
    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  };

  const handleAddToCalendar = (date, person) => {
    try {
      const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
      const event = {
        title: `Dia de Lavar Roupas 👖`,
        description: `Dia designado para ${person} lavar roupa`
      };

      const googleCalendarUrl = 
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${
          encodeURIComponent(event.title)
        }&dates=${formattedDate}/${formattedDate}&details=${
          encodeURIComponent(event.description)
        }`;

      window.open(googleCalendarUrl, '_blank');
      showNotification('Redirecionando para adicionar ao seu calendário!');
    } catch (error) {
      console.error('Erro ao adicionar ao calendário:', error);
      showNotification('Erro ao adicionar ao calendário. Tente novamente.');
    }
  };

  const handleBackToCurrent = () => {
    setCurrentWeek(getCurrentWeekOffset());
    showNotification('Voltando para a semana atual!', 2000);
  };

  const handleWeekChange = (direction) => {
    setCurrentWeek(prev => prev + direction);
  };

  const handlePersonSelect = (event) => {
    setSelectedPerson(event.target.value);
  };

  const generateIcsFile = () => {
    if (!selectedPerson) return;

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6);

    const events = [];
    let currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      if (getPersonForDate(currentDate) === selectedPerson) {
        const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');
        
        events.push(
          `BEGIN:VEVENT
SUMMARY:Dia de Lavar Roupas 👖
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${nextDayStr}
DESCRIPTION:Dia designado para ${selectedPerson} lavar roupa
END:VEVENT`
        );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const icsData = 
`BEGIN:VCALENDAR
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
    URL.revokeObjectURL(url);
  };

  return {
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
    residents: RESIDENTS,
  };
};