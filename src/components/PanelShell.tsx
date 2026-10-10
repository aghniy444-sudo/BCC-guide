import type { ReactNode } from 'react';
import { PanelFrame, PanelMenuProvider, type NavItem } from './PanelMenu';

export default function PanelShell({
  profile,
  nav,
  homeHref,
  catalogHref = '/',
  children,
}: {
  profile: { email: string | null; role: 'admin' | 'user' };
  nav: NavItem[];
  homeHref: string;
  catalogHref?: string;
  children: ReactNode;
}) {
  return (
    <PanelMenuProvider>
      <PanelFrame profile={profile} nav={nav} homeHref={homeHref} catalogHref={catalogHref}>
        {children}
      </PanelFrame>
    </PanelMenuProvider>
  );
}
