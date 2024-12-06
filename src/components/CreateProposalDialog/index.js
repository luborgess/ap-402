'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function CreateProposalDialog({ open, onClose, onProposalCreated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('proposals')
        .insert({
          title: formData.title,
          description: formData.description,
          created_by: user.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setFormData({ title: '', description: '' });
      onProposalCreated();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Erro ao criar proposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Proposta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Título
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da proposta"
              className="bg-gray-800/50 border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes da proposta"
              className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 text-white hover:bg-gray-700"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Proposta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
