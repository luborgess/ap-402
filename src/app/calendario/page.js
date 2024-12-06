'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Header from '@/components/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const darkThemeStyles = `
  .rbc-calendar {
    background: transparent;
    color: #fff;
    font-size: 14px;
  }
  @media (max-width: 640px) {
    .rbc-calendar {
      font-size: 12px;
    }
    .rbc-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
    .rbc-toolbar-label {
      margin: 8px 0;
    }
    .rbc-btn-group {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 4px;
    }
    .rbc-header {
      padding: 4px;
    }
    .rbc-toolbar button {
      padding: 6px 4px;
    }
    .rbc-time-content {
      max-height: 400px;
      overflow-y: auto;
    }
  }
  .rbc-toolbar button {
    color: #fff;
    background: rgba(31, 41, 55, 0.5);
    border: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-toolbar button:hover {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(75, 85, 99, 0.7);
  }
  .rbc-toolbar button.rbc-active {
    background: rgba(59, 130, 246, 0.5) !important;
    color: #fff !important;
    border-color: rgba(59, 130, 246, 0.5) !important;
  }
  .rbc-header {
    color: rgba(156, 163, 175, 1);
    border-bottom: 1px solid rgba(75, 85, 99, 0.5);
    font-weight: 500;
    padding: 8px;
  }
  .rbc-today {
    background-color: rgba(31, 41, 55, 0.3) !important;
  }
  .rbc-off-range-bg {
    background: rgba(31, 41, 55, 0.2);
  }
  .rbc-day-bg + .rbc-day-bg,
  .rbc-header + .rbc-header,
  .rbc-time-header-content,
  .rbc-time-view,
  .rbc-time-content,
  .rbc-events-container,
  .rbc-time-slot,
  .rbc-time-gutter,
  .rbc-day-slot,
  .rbc-time-column,
  .rbc-row-bg,
  .rbc-time-header {
    border-color: rgba(75, 85, 99, 0.5) !important;
  }
  .rbc-time-view,
  .rbc-month-view {
    background: transparent;
    border: 1px solid rgba(75, 85, 99, 0.5);
    border-radius: 0.5rem;
    min-height: 600px;
  }
  .rbc-time-content {
    border-top: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-time-header-content {
    border-left: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-time-header.rbc-overflowing {
    border-right: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-timeslot-group {
    border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-event {
    background-color: rgba(59, 130, 246, 0.5);
    color: #fff;
    border: none;
    border-radius: 0.3rem;
    padding: 2px 5px;
  }
  .rbc-show-more {
    color: rgba(59, 130, 246, 0.8);
    font-weight: 500;
  }
  .rbc-time-content {
    background: transparent;
  }
  .rbc-time-header-content {
    background: transparent;
  }
  .rbc-month-row,
  .rbc-time-header {
    background: transparent;
  }
  .rbc-date-cell {
    color: #fff;
    font-weight: 400;
  }
  .rbc-button-link {
    color: currentColor;
  }
  .rbc-day-bg {
    background: rgba(31, 41, 55, 0.3);
  }
  .rbc-time-gutter .rbc-timeslot-group {
    border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-allday-cell {
    max-height: 50px;
  }
  .rbc-time-view .rbc-header {
    border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  }
  .rbc-day-slot .rbc-time-slot {
    border-top: none;
  }
  .rbc-current-time-indicator {
    background-color: rgba(59, 130, 246, 0.8);
  }
`;

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const onNavigate = (newDate) => {
    setDate(newDate);
  };

  useEffect(() => {
    if (!user) return;
    console.log('User authenticated:', user);
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks for user:', user.id);
      
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .contains('responsible_users', [user.id]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw tasks:', tasks);

      if (!tasks || tasks.length === 0) {
        console.log('No tasks found');
        setEvents([]);
        return;
      }

      const formattedEvents = tasks.map(task => {
        console.log('Processing task:', task);
        if (!task.next_date) {
          console.log('Task missing next_date:', task.id);
          return null;
        }

        return {
          id: task.id,
          title: task.title || 'Sem título',
          start: new Date(task.next_date),
          end: new Date(task.next_date),
          allDay: true,
          resource: {
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            frequency: task.frequency
          }
        };
      }).filter(Boolean); // Remove null events

      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = 'rgba(59, 130, 246, 0.5)'; // default blue

    // Cor baseada na prioridade
    switch (event.resource?.priority) {
      case 'high':
        backgroundColor = 'rgba(239, 68, 68, 0.5)'; // red
        break;
      case 'medium':
        backgroundColor = 'rgba(245, 158, 11, 0.5)'; // yellow
        break;
      case 'low':
        backgroundColor = 'rgba(34, 197, 94, 0.5)'; // green
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '0.3rem',
        opacity: 0.8,
        color: '#fff',
        border: 'none',
        display: 'block'
      }
    };
  };

  const EventComponent = ({ event }) => (
    <div className="text-sm">
      <div className="font-medium">{event.title}</div>
      {event.resource?.description && (
        <div className="text-xs opacity-75 truncate">
          {event.resource.description}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <style jsx global>{darkThemeStyles}</style>
      <Header />
      <main className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="bg-blue-500/10 p-3 rounded-full w-fit">
            <Calendar className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Calendário</h1>
            <p className="text-sm sm:text-base text-gray-400">Gerencie seus eventos</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl text-white">Agenda</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-400">Visualize e gerencie seus eventos</p>
                </div>
                <Button className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-[700px] sm:h-[700px]">
                <BigCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  messages={{
                    next: "Próximo",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    agenda: "Agenda",
                    date: "Data",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "Não há tarefas neste período.",
                    showMore: (total) => `+${total} mais`,
                    allDay: "Dia inteiro"
                  }}
                  culture="pt-BR"
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView={window?.innerWidth < 640 ? 'agenda' : 'month'}
                  min={new Date(new Date().setHours(6, 0, 0))}
                  max={new Date(new Date().setHours(23, 0, 0))}
                  step={30}
                  timeslots={2}
                  getNow={() => new Date()}
                  showMultiDayTimes
                  date={date}
                  onNavigate={onNavigate}
                  popup
                  selectable
                  eventPropGetter={eventStyleGetter}
                  components={{
                    event: EventComponent
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
