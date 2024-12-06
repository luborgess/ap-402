'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { User, Calendar, Users, FileDown } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';

export function TaskHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Primeiro, buscar o histórico de tarefas
      const { data: historyData, error: historyError } = await supabase
        .from('task_history')
        .select(`
          *,
          tasks!task_history_task_id_fkey (
            title,
            responsible_users
          )
        `)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;

      // Coletar todos os IDs de usuários únicos
      const userIds = new Set();
      historyData?.forEach(record => {
        if (record.completed_by) userIds.add(record.completed_by);
        if (record.tasks?.responsible_users) {
          record.tasks.responsible_users.forEach(id => userIds.add(id));
        }
      });

      // Buscar informações dos usuários
      if (userIds.size > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', Array.from(userIds));

        if (userError) throw userError;

        const usersMap = {};
        userData?.forEach(user => {
          usersMap[user.id] = user.name;
        });
        setUsers(usersMap);
      }

      setHistory(historyData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.message);
      toast.error('Erro ao buscar histórico');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      
      // Buscar todo o histórico para o PDF (sem limite)
      const { data: fullHistory, error: historyError } = await supabase
        .from('task_history')
        .select(`
          *,
          tasks!task_history_task_id_fkey (
            title,
            responsible_users
          )
        `)
        .order('completed_at', { ascending: false });

      if (historyError) throw historyError;

      // Criar o PDF
      const doc = new jsPDF();

      // Adicionar título
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Relatório de Histórico de Tarefas', 14, 25);
      
      // Adicionar data de geração e usuário
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 14, 35);
      doc.text(`Solicitado por: ${users[user?.id] || 'Usuário não identificado'}`, 14, 42);

      // Preparar dados para a tabela
      const tableData = fullHistory.map(record => [
        record.tasks?.title || 'Tarefa Removida',
        format(new Date(record.completed_at), "dd/MM/yyyy HH:mm"),
        users[record.completed_by] || 'Usuário não encontrado',
        record.tasks?.responsible_users?.map(id => users[id]).join(', ') || 'N/A'
      ]);

      // Configurar margens maiores para o rodapé
      const marginBottom = 40;

      // Adicionar tabela
      doc.autoTable({
        startY: 50,
        head: [['Tarefa', 'Data de Conclusão', 'Concluído por', 'Responsáveis']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [64, 64, 64],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 40 },
          3: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { bottom: marginBottom }
      });

      // Adicionar disclaimer no rodapé
      const pageCount = doc.internal.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        const pageHeight = doc.internal.pageSize.height;
        const disclaimerY = pageHeight - 35;
        
        // Adicionar linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(14, disclaimerY - 5, doc.internal.pageSize.width - 14, disclaimerY - 5);
        
        // Adicionar disclaimer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        
        // Primeiro parágrafo do disclaimer
        doc.text(
          'CONFIDENCIAL: Este documento contém informações do AP 402 que podem ser compartilhadas apenas com a administração das moradias universitárias.',
          doc.internal.pageSize.width / 2,
          disclaimerY,
          { 
            align: 'center',
            maxWidth: doc.internal.pageSize.width - 28
          }
        );
        
        // Segundo parágrafo do disclaimer com mais espaço
        doc.text(
          'A distribuição ou reprodução deste conteúdo para outros fins é estritamente proibida.',
          doc.internal.pageSize.width / 2,
          disclaimerY + 8,
          { 
            align: 'center',
            maxWidth: doc.internal.pageSize.width - 28
          }
        );
        
        // Adicionar número da página com mais espaço
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Salvar o PDF
      doc.save('historico-tarefas-ap402.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Carregando histórico...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/20 rounded-lg p-4 border border-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        
        <Button
          onClick={generatePDF}
          disabled={generatingPDF}
          className="bg-gray-800 hover:bg-gray-700 text-white"
        >
          {generatingPDF ? (
            <>Gerando PDF...</>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Gerar PDF
            </>
          )}
        </Button>
      </div>

      {history.map((record) => (
        <div
          key={record.id}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-white">
              {record.tasks?.title || 'Tarefa Removida'}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(record.completed_at), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium text-emerald-400">
                  Concluída por: {users[record.completed_by] || 'Usuário desconhecido'}
                </span>
              </div>
              {record.tasks?.responsible_users && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    Responsáveis: {record.tasks.responsible_users
                      .map(id => users[id] || 'Usuário desconhecido')
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {history.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 py-8">
          Nenhum histórico de tarefas encontrado
        </div>
      )}
    </div>
  );
}
