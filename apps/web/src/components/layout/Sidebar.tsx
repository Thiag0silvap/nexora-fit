'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const navigationItems = [
  { label: 'Painel', href: '/admin' },
  { label: 'Alunos', href: '/admin/alunos' },
  { label: 'Instrutores', href: '/admin/instrutores' },
  { label: 'Exercícios', href: '/admin/exercicios' },
  { label: 'Fichas', href: '/admin/fichas' },
  { label: 'Avaliações', href: '#' },
  { label: 'Configurações', href: '#' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleItems = user?.role === 'INSTRUTOR'
    ? navigationItems.filter((item) => item.href === '/admin/fichas')
    : navigationItems;

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">NF</div>
        <div>
          <strong>Nexora Fit</strong>
          <span>Sua evolução, todos os dias.</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacao administrativa">
        {visibleItems.map((item) => {
          const active = item.href !== '#' && pathname === item.href;

          return (
            <a
              aria-current={active ? 'page' : undefined}
              className={active ? 'nav-item nav-item-active' : 'nav-item'}
              href={item.href}
              key={item.label}
            >
              <span className="nav-dot" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
