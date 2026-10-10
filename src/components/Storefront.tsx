'use client';

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BooksCatalog from '@/components/BooksCatalog';
import FeaturesSection from '@/components/FeaturesSection';
import AuthorMentorsSection from '@/components/AuthorMentorsSection';
import FAQSection from '@/components/FAQSection';
import NewsletterSection from '@/components/NewsletterSection';
import Footer from '@/components/Footer';
import BookReaderModal from '@/components/BookReaderModal';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import LoginModal from '@/components/LoginModal';
import Reveal from '@/components/Reveal';
import VisitTracker from '@/components/VisitTracker';
import { SmoothScroll } from '@/components/SmoothScroll';
import { getCartSnapshot, getServerCartSnapshot, subscribeCart, writeCart } from '@/lib/cart';
import type { CatalogItem } from '@/data/catalog';

export interface SessionUser {
  email: string;
  role: 'admin' | 'user';
}

interface StorefrontProps {
  products: CatalogItem[];
  user: SessionUser | null;
}

export default function Storefront({ products, user }: StorefrontProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartIds = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const cartItems = useMemo(
    () =>
      cartIds
        .map((id) => products.find((product) => product.id === id))
        .filter((item): item is CatalogItem => Boolean(item)),
    [cartIds, products],
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const overlayOpen = isSearchOpen || isLoginOpen || isCartOpen || selectedProductId !== null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddToCart = (item: CatalogItem) => {
    const current = getCartSnapshot();
    if (current.includes(item.id)) {
      setIsCartOpen(true);
      return;
    }
    // bundle supersedes guide/decks when mixed
    const next =
      item.id === 'bundle'
        ? ['bundle']
        : [...current.filter((id) => id !== 'bundle'), item.id];
    writeCart(next);
    showToast(`"${item.title}" ditambahkan ke keranjang.`);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    writeCart(getCartSnapshot().filter((id) => id !== productId));
  };

  // Stable identity: CartDrawer's paid effect depends on this callback, so a
  // new function each render would re-trigger it.
  const handleOrderPaid = useCallback(() => {
    writeCart([]);
    showToast('Pembayaran terkonfirmasi. Akses materi Anda kini terbuka di dashboard.');
  }, []);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) ?? null
    : null;

  return (
    <SmoothScroll locked={overlayOpen}>
      <VisitTracker />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.length}
        />

        <main style={{ flex: 1, overflowX: 'clip' }}>
          <HeroSection products={products} />

          <Reveal variant="up">
            <BooksCatalog
              products={products}
              onPreview={(id) => setSelectedProductId(id)}
              onAddToCart={handleAddToCart}
            />
          </Reveal>

          <Reveal variant="left">
            <AuthorMentorsSection />
          </Reveal>
          <Reveal variant="right">
            <FeaturesSection />
          </Reveal>
          <Reveal variant="blur">
            <FAQSection />
          </Reveal>
          <Reveal variant="zoom">
            <NewsletterSection />
          </Reveal>
        </main>

        <Reveal variant="rotate">
          <Footer />
        </Reveal>

        {selectedProduct && (
          <BookReaderModal
            item={selectedProduct}
            onClose={() => setSelectedProductId(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        <SearchModal
          isOpen={isSearchOpen}
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(id) => setSelectedProductId(id)}
        />

        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          isLoggedIn={Boolean(user)}
          onRemoveItem={handleRemoveFromCart}
          onOrderPaid={handleOrderPaid}
        />

        {toastMessage && (
          <div className="toast-notice" role="status">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-electric)" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </SmoothScroll>
  );
}
