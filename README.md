# AP 402 - Sistema de Gestão de Tarefas 

Uma aplicação web moderna para gerenciar tarefas e responsabilidades em uma república universitária.

## Funcionalidades Principais

### Gestão de Usuários 
- Autenticação com email/senha ou Google
- Perfis personalizados com:
  - Nome
  - Foto de perfil
  - Número do quarto
  - WhatsApp
  - Bio

### Gestão de Tarefas 
- Criação de tarefas com:
  - Título e descrição
  - Múltiplos responsáveis
  - Frequência (diária, semanal, mensal)
  - Data de próxima execução
- Visualização de tarefas pendentes
- Marcação de tarefas concluídas
- Histórico completo de tarefas realizadas

### Interface Moderna 
- Design responsivo (mobile-first)
- Tema claro com elementos em gradiente
- Feedback visual com toasts
- Componentes interativos modernos

## Tecnologias Utilizadas

### Frontend
- Next.js 13 (App Router)
- React 18
- Tailwind CSS
- Shadcn/UI
- Lucide Icons
- date-fns para formatação de datas
- React Hot Toast para notificações

### Backend
- Supabase para:
  - Autenticação
  - Banco de dados PostgreSQL
  - Storage para avatares
  - Row Level Security (RLS)

### Tabelas do Banco
- `profiles`: Informações dos usuários
- `tasks`: Tarefas e suas configurações
- `task_history`: Histórico de conclusões

## Instalação e Execução

1. Clone o repositório:
```bash
git clone [url-do-repositório]
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

4. Execute o projeto:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas
├── components/            # Componentes React
│   ├── Auth/             # Componentes de autenticação
│   ├── TaskForm/         # Formulário de tarefas
│   ├── TaskList/         # Lista de tarefas
│   ├── TaskHistory/      # Histórico de tarefas
│   └── ui/               # Componentes UI reutilizáveis
├── contexts/             # Contextos React
├── lib/                  # Utilitários e configurações
└── styles/              # Estilos globais
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Changelog

### v2.0.0 (Atual)
- Sistema completo de gestão de tarefas
- Perfis de usuário com fotos
- Interface moderna e responsiva
- Histórico detalhado de tarefas
- Autenticação segura
- Design system com Shadcn/UI