'use client';

import React from 'react';
import Image from 'next/image';
import styles from './AuthorMentorsSection.module.css';

export default function AuthorMentorsSection() {
  const mentors = [
    {
      name: 'The AI Experts Group',
      role: 'Staff ML & LLM Researchers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Kolektif engineer machine learning terkemuka yang aktif mengembangkan sistem RAG, prompt engineering tingkat lanjut, dan agen otonom produksi.',
      book: 'Modern AI Engineering Handbook',
    },
    {
      name: 'Michael Lindgren',
      role: 'Principal Design Technologist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Memimpin design system di berbagai tech unicorn. Mengkhususkan diri pada otomatisasi tokens dari Figma hingga integrasi CSS/React.',
      book: 'UI/UX Design Systems Mastery',
    },
    {
      name: 'Dr. Robert J. Chen',
      role: 'Distinguished Cloud Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      bio: '20+ tahun pengalaman merancang distributed system di Silicon Valley. Penulis panduan Microservices & Distributed Architecture.',
      book: 'Distributed Systems & Cloud Architecture',
    },
  ];

  return (
    <section id="mentors" className={styles.mentorsSection}>
      <div className="container">
        <div className={styles.header}>
          <div className="badge-pill">
            Praktisi & Penulis Resmi
          </div>
          <h2 className={styles.title}>
            Ditulis Langsung oleh <span className="text-gradient-electric">Praktisi Industri</span>
          </h2>
          <p className={styles.subtitle}>
            Bukan sekadar perangkum teori. Panduan kami disusun oleh figur-figur yang telah membangun sistem skala produksi di industri teknologi global.
          </p>
        </div>

        <div className={styles.mentorsGrid}>
          {mentors.map((mentor, idx) => (
            <div key={idx} className={styles.mentorCard}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={mentor.avatar}
                  alt={mentor.name}
                  width={90}
                  height={90}
                  className={styles.avatarImg}
                />
              </div>

              <h3 className={styles.mentorName}>{mentor.name}</h3>
              <span className={styles.mentorRole}>{mentor.role}</span>
              <p className={styles.mentorBio}>{mentor.bio}</p>

              <div className={styles.mentorBookTag}>
                📚 {mentor.book}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
