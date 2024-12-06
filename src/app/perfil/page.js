'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Loader2, Sparkles, Trophy, User, Calendar, Instagram, Linkedin, Phone, UserCircle, Plus, Users } from 'lucide-react';
import Header from '@/components/Header';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [socialLinks, setSocialLinks] = useState({ instagram: '', linkedin: '' });
  const [birthDate, setBirthDate] = useState('');
  const [editingSocial, setEditingSocial] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  async function getProfile() {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setBio(profile.bio || '');
        setName(profile.name || '');
        setSocialLinks({
          instagram: profile.instagram || '',
          linkedin: profile.linkedin || ''
        });
        // Adjust the received date to local format
        if (profile.birth_date) {
          const date = new Date(profile.birth_date);
          date.setDate(date.getDate() + 1);
          setBirthDate(date.toISOString().split('T')[0]);
        } else {
          setBirthDate('');
        }
        setEmergencyContact({
          name: profile.emergency_contact_name || '',
          phone: profile.emergency_contact_phone || '',
          relation: profile.emergency_contact_relation || ''
        });
        
        if (profile.avatar) {
          const { data: avatarData } = await supabase
            .storage
            .from('avatars')
            .getPublicUrl(profile.avatar);
            
          if (avatarData?.publicUrl) {
            setAvatarUrl(avatarData.publicUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setMessage({
        type: 'error',
        content: 'Erro ao carregar perfil. Por favor, tente novamente.'
      });
    }
  }

  async function handleNameUpdate() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: 'Nome atualizado com sucesso!' 
      });
      setEditingName(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        content: 'Erro ao atualizar nome. Por favor, tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmergencyContactUpdate() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          emergency_contact_name: emergencyContact.name,
          emergency_contact_phone: emergencyContact.phone,
          emergency_contact_relation: emergencyContact.relation,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: 'Contato de emergência atualizado com sucesso!' 
      });
      setEditingEmergency(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        content: 'Erro ao atualizar contato de emergência. Por favor, tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBioUpdate() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: 'Biografia atualizada com sucesso!' 
      });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        content: 'Erro ao atualizar biografia. Por favor, tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLinksUpdate() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          instagram: socialLinks.instagram,
          linkedin: socialLinks.linkedin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: 'Redes sociais atualizadas com sucesso!' 
      });
      setEditingSocial(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        content: 'Erro ao atualizar redes sociais. Por favor, tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBirthDateUpdate() {
    try {
      setLoading(true);
      
      // Ajusta a data para o fuso horário de São Paulo
      const [year, month, day] = birthDate.split('-');
      const adjustedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
      const formattedDate = adjustedDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          birth_date: formattedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: 'Data de nascimento atualizada com sucesso!' 
      });
      setEditingBirthDate(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        content: 'Erro ao atualizar data de nascimento. Por favor, tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(event) {
    try {
      setUploadLoading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Atualizar perfil com o caminho do arquivo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar: fileName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Obter URL pública
      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Erro ao obter URL da imagem');
      }

      setAvatarUrl(urlData.publicUrl);
      setIsOpen(false);
      setMessage({ 
        type: 'success', 
        content: 'Foto de perfil atualizada com sucesso!' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Erro ao atualizar foto de perfil' 
      });
    } finally {
      setUploadLoading(false);
    }
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>

          {/* Card Principal do Perfil */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar e Upload */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50"
                  onClick={() => setIsOpen(true)}
                >
                  <Camera className="h-4 w-4 text-gray-300" />
                </Button>
              </div>

              {/* Nome */}
              <div className="w-full text-center">
                {editingName ? (
                  <div className="space-y-4">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="text-center bg-gray-900/50 border-gray-700 text-white"
                    />
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={handleNameUpdate}
                        disabled={loading}
                        className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar Nome'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingName(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative inline-block">
                    <h2 className="text-2xl font-bold text-white">
                      {name || user?.email?.split('@')[0]}
                    </h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UserCircle className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                )}
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Biografia */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Biografia</h2>
                <p className="text-gray-400">Conte um pouco sobre você</p>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Compartilhe um pouco sobre você, seus interesses e hobbies..."
                className="min-h-[120px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                maxLength={280}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {bio.length}/280 caracteres
                </span>
                <Button
                  onClick={handleBioUpdate}
                  disabled={loading}
                  className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Biografia'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Redes Sociais */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-pink-500/10 p-3 rounded-full">
                <Instagram className="h-6 w-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Redes Sociais</h2>
                <p className="text-gray-400">Conecte-se comigo</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSocial(!editingSocial)}
                className="text-gray-400 hover:text-white"
              >
                {editingSocial ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
            {editingSocial ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Instagram</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">@</span>
                    <Input
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="seu.usuario"
                      className="flex-1 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">LinkedIn</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">linkedin.com/in/</span>
                    <Input
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="seu-perfil"
                      className="flex-1 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSocialLinksUpdate}
                  disabled={loading}
                  className="w-full bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Redes Sociais'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <a
                  href={`https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@{socialLinks.instagram || 'Adicionar Instagram'}</span>
                </a>
                <a
                  href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>{socialLinks.linkedin ? `linkedin.com/in/${socialLinks.linkedin}` : 'Adicionar LinkedIn'}</span>
                </a>
              </div>
            )}
          </Card>

          {/* Data de Nascimento */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Aniversário</h2>
                <p className="text-gray-400">Quando você nasceu?</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingBirthDate(!editingBirthDate)}
                className="text-gray-400 hover:text-white"
              >
                {editingBirthDate ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
            {editingBirthDate ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleBirthDateUpdate}
                  disabled={loading}
                  className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Data de Nascimento'
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-gray-400">
                {birthDate ? (
                  (() => {
                    const [year, month, day] = birthDate.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    });
                  })()
                ) : (
                  'Adicionar data de nascimento'
                )}
              </div>
            )}
          </Card>

          {/* Contato de Emergência */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Contato de Emergência</h2>
                <p className="text-gray-400">Quem devemos contatar em caso de emergência?</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingEmergency(!editingEmergency)}
                className="text-gray-400 hover:text-white"
              >
                {editingEmergency ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
            {editingEmergency ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Nome do Contato</Label>
                  <Input
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                    className="w-full bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Telefone</Label>
                  <Input
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Relação</Label>
                  <Input
                    value={emergencyContact.relation}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, relation: e.target.value }))}
                    placeholder="Ex: Pai, Mãe, Cônjuge"
                    className="w-full bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleEmergencyContactUpdate}
                  disabled={loading}
                  className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Contato de Emergência'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 text-gray-400">
                {emergencyContact.name ? (
                  <>
                    <p><span className="text-gray-500">Nome:</span> {emergencyContact.name}</p>
                    <p><span className="text-gray-500">Telefone:</span> {emergencyContact.phone}</p>
                    <p><span className="text-gray-500">Relação:</span> {emergencyContact.relation}</p>
                  </>
                ) : (
                  'Adicionar contato de emergência'
                )}
              </div>
            )}
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Conquistas</h3>
                  <p className="text-gray-400">Em breve</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Nível</h3>
                  <p className="text-gray-400">Em breve</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Informações do Apartamento */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-orange-500/10 p-3 rounded-full">
                {/* <Home className="h-6 w-6 text-orange-400" /> */}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Apartamento</h2>
                <p className="text-gray-400">Informações do seu apartamento</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Número</p>
                <p className="text-white">402</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Bloco</p>
                <p className="text-white">A</p>
              </div>
            </div>
          </Card>

          {/* Contato */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-full">
                {/* <Mail className="h-6 w-6 text-blue-400" /> */}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Contato</h2>
                <p className="text-gray-400">Suas informações de contato</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Modal de Upload */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white mb-4"
                  >
                    Alterar Avatar
                  </Dialog.Title>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Selecione uma nova imagem
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-gray-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <input
                          type="file"
                          id="avatar"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAvatarUpload}
                          disabled={uploadLoading}
                        />
                        <label
                          htmlFor="avatar"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="p-4 rounded-lg">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-400">
                              {uploadLoading ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Enviando...</span>
                                </div>
                              ) : (
                                'Clique para selecionar uma imagem'
                              )}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                        onClick={() => setIsOpen(false)}
                        disabled={uploadLoading}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
