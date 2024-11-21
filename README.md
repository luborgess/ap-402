# Escala da Roupa 👖

Este é um projeto Next.js que gerencia a escala de lavagem de roupas em uma república universitária.

## Changelog

### v1.2.0 (21/11/2024)
- 📅 Ajuste no período de eventos do calendário
  - Eventos gerados apenas a partir do dia atual
  - Data final definida para 7 de dezembro de 2024 (fim do semestre)
  - Remoção da geração de eventos passados
  - Otimização no formato das datas ICS

### v1.1.0 (21/11/2024)
- ✨ Melhoria na visualização temporal
  - Inicialização automática na semana atual
  - Ajuste no botão "Voltar para semana atual"
  - Navegação temporal mais intuitiva
  - Melhoria na experiência do usuário

### v1.0.0 (Initial Release)
- 🎉 Funcionalidades iniciais
  - Visualização semanal da escala
  - Navegação entre semanas
  - Exportação para Google Calendar
  - Download de calendário pessoal (.ics)
  - Lista de moradores configurada
  - Interface responsiva

## Funcionalidades

- 📅 Visualização semanal da escala de lavanderia
- 🔄 Navegação intuitiva entre as semanas
- 📱 Design responsivo (mobile-first)
- 📤 Exportação de eventos para Google Calendar
- 💾 Download de calendário pessoal (.ics)
- 🎯 Identificação automática da semana atual
- 👥 Sistema de rodízio entre moradores

## Tecnologias

- Next.js 15
- React 19
- Tailwind CSS
- Shadcn/UI
- Lucide Icons

## Getting Started

```bash
npm run dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.