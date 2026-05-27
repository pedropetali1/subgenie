import type { Locale } from '@/types';

export const messages = {
  'pt-BR': {
    'nav.home': 'Início',
    'nav.subscriptions': 'Assinaturas',
    'nav.insights': 'Insights',
    'nav.settings': 'Configurações',
    'nav.signOut': 'Sair',
    'nav.upgrade': '⚡ Conhecer Premium',
    'nav.planFree': 'Plano Free',
    'nav.planPremium': 'Plano Premium ⚡',

    'dashboard.greeting': 'Bom dia 👋',
    'dashboard.subtitle': 'Aqui está um resumo das suas assinaturas.',
    'dashboard.new': '+ Nova assinatura',
    'dashboard.monthly': 'Gasto mensal',
    'dashboard.annual': 'Gasto anual estimado',
    'dashboard.upcoming': 'Próximos 7 dias',
    'dashboard.upcomingTitle': 'Próximas cobranças',
    'dashboard.viewAll': 'Ver todas →',
    'dashboard.emptyTitle': 'Nenhuma assinatura ainda',
    'dashboard.emptyDesc':
      'Comece adicionando uma assinatura pra acompanhar seus gastos.',
    'dashboard.emptyCta': '+ Adicionar primeira assinatura',

    'subs.title': 'Assinaturas',
    'subs.count': 'cadastrada(s)',
    'subs.new': '+ Nova',
    'subs.export': 'Exportar CSV',
    'subs.filter.all': 'Todas categorias',
    'subs.sort.next': 'Próxima cobrança',
    'subs.sort.name': 'Nome (A-Z)',
    'subs.sort.price': 'Maior valor',

    'insights.title': 'Insights',
    'insights.subtitle': 'Análise dos seus gastos com assinaturas.',

    'settings.title': 'Configurações',
    'settings.subtitle': 'Gerencie seu perfil, plano e alertas.',
    'settings.appearance': 'Aparência',
    'settings.theme': 'Tema',
    'settings.theme.dark': 'Escuro',
    'settings.theme.light': 'Claro',
    'settings.theme.system': 'Sistema',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.push': 'Notificações push (no navegador)',

    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Deletar',
  },
  en: {
    'nav.home': 'Home',
    'nav.subscriptions': 'Subscriptions',
    'nav.insights': 'Insights',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign out',
    'nav.upgrade': '⚡ Go Premium',
    'nav.planFree': 'Free plan',
    'nav.planPremium': 'Premium ⚡',

    'dashboard.greeting': 'Good day 👋',
    'dashboard.subtitle': "Here's an overview of your subscriptions.",
    'dashboard.new': '+ New subscription',
    'dashboard.monthly': 'Monthly spend',
    'dashboard.annual': 'Estimated annual spend',
    'dashboard.upcoming': 'Next 7 days',
    'dashboard.upcomingTitle': 'Upcoming charges',
    'dashboard.viewAll': 'View all →',
    'dashboard.emptyTitle': 'No subscriptions yet',
    'dashboard.emptyDesc':
      'Start by adding a subscription to track your spending.',
    'dashboard.emptyCta': '+ Add your first subscription',

    'subs.title': 'Subscriptions',
    'subs.count': 'tracked',
    'subs.new': '+ New',
    'subs.export': 'Export CSV',
    'subs.filter.all': 'All categories',
    'subs.sort.next': 'Next charge',
    'subs.sort.name': 'Name (A-Z)',
    'subs.sort.price': 'Highest amount',

    'insights.title': 'Insights',
    'insights.subtitle': 'Analysis of your subscription spending.',

    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your profile, plan and alerts.',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.theme.system': 'System',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.push': 'Push notifications (in browser)',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
  },
} as const;

export type MessageKey = keyof (typeof messages)['pt-BR'];

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? messages['pt-BR'][key] ?? key;
}
