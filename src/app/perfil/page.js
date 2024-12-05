'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Camera, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    quarto: '',
    bio: '',
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  // Carregar dados do perfil
  const loadProfile = async () => {
    try {
      if (!user?.id) {
        console.log('Usuário não encontrado ou ID não disponível');
        return;
      }

      console.log('Carregando perfil para usuário:', user.id);
      
      // Primeiro, tentar buscar o perfil existente
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Erro na busca do perfil:', fetchError);
        
        // Se o erro for "não encontrado", criar um novo perfil
        if (fetchError.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando novo...');
          const newProfile = {
            id: user.id,
            name: '',
            whatsapp: '',
            quarto: '',
            bio: '',
            updated_at: new Date().toISOString(),
          };

          const { data: createdProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (insertError) {
            throw new Error(`Erro ao criar perfil: ${insertError.message}`);
          }

          console.log('Novo perfil criado:', createdProfile);
          setFormData({
            name: createdProfile.name || '',
            whatsapp: createdProfile.whatsapp || '',
            quarto: createdProfile.quarto || '',
            bio: createdProfile.bio || '',
          });
          return;
        }
        
        throw new Error(`Erro ao buscar perfil: ${fetchError.message}`);
      }

      console.log('Perfil existente carregado:', profile);
      setFormData({
        name: profile.name || '',
        whatsapp: profile.whatsapp || '',
        quarto: profile.quarto || '',
        bio: profile.bio || '',
      });
      
      if (profile.avatar) {
        const { data: avatarData } = await supabase
          .storage
          .from('avatars')
          .getPublicUrl(profile.avatar);
          
        if (avatarData) {
          setAvatarUrl(avatarData.publicUrl);
        }
      }

    } catch (error) {
      console.error('Erro detalhado ao carregar perfil:', error);
      setMessage({
        type: 'error',
        content: error.message || 'Erro ao carregar perfil. Por favor, recarregue a página.'
      });
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploadLoading(true);
      const file = event.target.files?.[0];
      if (!file) {
        console.log('Nenhum arquivo selecionado');
        return;
      }

      console.log('Arquivo selecionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Iniciando upload para:', filePath);

      // Upload do arquivo para o bucket 'avatars'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload concluído:', uploadData);

      // Atualizar o perfil com o novo avatar
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      console.log('Perfil atualizado:', updateData);

      // Obter a URL pública do avatar
      const { data: avatarData } = await supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL do avatar:', avatarData);
          
      if (avatarData) {
        setAvatarUrl(avatarData.publicUrl);
        setMessage({
          type: 'success',
          content: 'Avatar atualizado com sucesso!'
        });
        setIsOpen(false);
      } else {
        throw new Error('Não foi possível obter a URL do avatar');
      }
    } catch (error) {
      console.error('Erro detalhado ao fazer upload do avatar:', error);
      setMessage({
        type: 'error',
        content: error.message || 'Erro ao atualizar avatar. Tente novamente.'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Atualizar perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const updates = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      console.log('Atualizando perfil:', updates);

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }

      setMessage({
        type: 'success',
        content: 'Perfil atualizado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({
        type: 'error',
        content: error.message || 'Erro ao atualizar perfil. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (user) {
      console.log('UseEffect triggered, user:', user);
      loadProfile();
    } else {
      console.log('Usuário não autenticado, redirecionando...');
      router.push('/');
    }
  }, [user]);

  if (!user) {
    console.log('Renderização: usuário não encontrado');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
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
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => setIsOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>

                  <Transition appear show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                              <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                              >
                                Atualizar foto de perfil
                              </Dialog.Title>
                              <div className="mt-4">
                                <div className="flex items-center justify-center">
                                  <label className="cursor-pointer">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleAvatarUpload}
                                      disabled={uploadLoading}
                                    />
                                    <div className="flex flex-col items-center space-y-2">
                                      <div className="p-4 border-2 border-dashed rounded-lg">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {uploadLoading ? 'Enviando...' : 'Clique para selecionar uma imagem'}
                                      </span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Seu Perfil</h1>
                <p className="text-gray-500">
                  Atualize suas informações pessoais
                </p>
              </div>

              {message.content && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.content}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Biografia
                    </label>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="mt-1 relative">
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="min-h-[120px] resize-none bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                      placeholder="Conte um pouco sobre você..."
                      maxLength={280}
                    />
                    <div className="absolute bottom-2 right-2 text-sm text-gray-400">
                      {formData.bio.length}/280
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Compartilhe um pouco sobre você, seus interesses e hobbies!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    WhatsApp
                  </label>
                  <Input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Seu número do WhatsApp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quarto
                  </label>
                  <Input
                    type="text"
                    value={formData.quarto}
                    onChange={(e) =>
                      setFormData({ ...formData, quarto: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Número do seu quarto"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
