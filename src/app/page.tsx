'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BooksCatalog from '@/components/BooksCatalog';
import FeaturesSection from '@/components/FeaturesSection';
import AuthorMentorsSection from '@/components/AuthorMentorsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import NewsletterSection from '@/components/NewsletterSection';
import Footer from '@/components/Footer';
import BookReaderModal from '@/components/BookReaderModal';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import LoginModal from '@/components/LoginModal';
import { BOOKS_DATA, Book } from '@/data/booksData';

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddToCart = (book: Book) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev;
      }
      return [...prev, { book, quantity: 1 }];
    });
    showToast(`"${book.title}" berhasil ditambahkan ke keranjang belanja!`);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    showToast('🎉 Pembayaran Berhasil! Tautan unduhan dan lisensi telah dikirim ke email Anda.');
  };

  const handleLoginSuccess = (userEmail: string) => {
    showToast(`Selamat datang kembali, ${userEmail}!`);
  };

  const selectedBook = selectedBookId
    ? BOOKS_DATA.find((b) => b.id === selectedBookId) || null
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Reference Replica Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <HeroSection
          onOpenPreview={(bookId) => setSelectedBookId(bookId)}
          onAddToCart={handleAddToCart}
          onExploreCatalog={() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <BooksCatalog
          onPreview={(bookId) => setSelectedBookId(bookId)}
          onAddToCart={handleAddToCart}
        />

        <AuthorMentorsSection />

        <FeaturesSection />

        <TestimonialsSection />

        <FAQSection />

        <NewsletterSection onShowToast={showToast} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Sample Reader Modal */}
      {selectedBook && (
        <BookReaderModal
          book={selectedBook}
          onClose={() => setSelectedBookId(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBook={(bookId) => {
          setSelectedBookId(bookId);
        }}
      />

      {/* Interactive Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
