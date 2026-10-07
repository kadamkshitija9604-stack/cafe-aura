import React, { useState, useEffect } from 'react';
import './GalleryPage.css';

/* ---------------- PURE GALLERY PHOTO COLLECTION ---------------- */
export const PURE_PHOTOS = [
  { id: 1, src: '/images/photo1.jpg', aspect: 'tall' },
  { id: 2, src: '/images/photo4.jpg', aspect: 'normal' },
  { id: 3, src: '/images/photo2.jpg', aspect: 'normal' },
  { id: 4, src: '/Sunflower Summer Mood 🌻 Cozy Coffee, Books & Warm Late Summer Vibes.jpg', aspect: 'tall' },
  { id: 5, src: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=1000&auto=format&fit=crop', aspect: 'normal' },
  { id: 6, src: '/Lunch 🥙.jpg', aspect: 'wide' },
  { id: 7, src: '/Inspirational Quotes and Productivity Tips for a Success Mindset.jpg', aspect: 'normal' },
  { id: 8, src: '/images/photo7.jpg', aspect: 'normal' },
  { id: 9, src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop', aspect: 'tall' },
  { id: 10, src: '/images/photo6.jpg', aspect: 'tall' },
  { id: 11, src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop', aspect: 'normal' },
  { id: 12, src: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000&auto=format&fit=crop', aspect: 'normal' },
  { id: 13, src: '/Charming Floral Coffee Shop.jpg', aspect: 'tall' },
  { id: 14, src: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000&auto=format&fit=crop', aspect: 'normal' },
  { id: 15, src: '/Dinner date.jpg', aspect: 'normal' },
  { id: 16, src: '/images/photo5.jpg', aspect: 'tall' },
  { id: 17, src: '/images/photo3.jpg', aspect: 'normal' },
  { id: 18, src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop', aspect: 'wide' },
  { id: 19, src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop', aspect: 'normal' },
  { id: 20, src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1000&auto=format&fit=crop', aspect: 'tall' }
];

export default function GalleryPage({ onBackToHome }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev + 1) % PURE_PHOTOS.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev - 1 + PURE_PHOTOS.length) % PURE_PHOTOS.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

  return (
    <div className="pure-gallery-page">
      {/* Top Header */}
      <header className="pure-gallery-header">
        <div className="wrap pure-gallery-header-inner">
          <button className="pure-back-btn" onClick={onBackToHome}>
            <span>←</span> Back to Home
          </button>
          <div className="pure-gallery-title">Cafe Aura Gallery</div>
          <div className="pure-photo-count">{PURE_PHOTOS.length} Photos</div>
        </div>
      </header>

      {/* Pure Photo Grid */}
      <main className="pure-gallery-container wrap">
        <div className="pure-photo-grid">
          {PURE_PHOTOS.map((photo, idx) => (
            <div
              key={photo.id}
              className={`pure-photo-item ${photo.aspect}`}
              onClick={() => setSelectedPhotoIndex(idx)}
            >
              <img src={photo.src} alt={`Cafe Aura Photo ${photo.id}`} loading="lazy" />
              <div className="pure-photo-overlay">
                <div className="pure-expand-icon">⤢</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fullscreen Photo Lightbox */}
      {selectedPhotoIndex !== null && (
        <div className="pure-lightbox" onClick={() => setSelectedPhotoIndex(null)}>
          <button
            className="pure-lightbox-close"
            onClick={() => setSelectedPhotoIndex(null)}
            title="Close (Esc)"
          >
            ✕
          </button>

          <button
            className="pure-lightbox-arrow prev"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhotoIndex((prev) => (prev - 1 + PURE_PHOTOS.length) % PURE_PHOTOS.length);
            }}
            title="Previous (Left Arrow)"
          >
            ‹
          </button>

          <div className="pure-lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={PURE_PHOTOS[selectedPhotoIndex].src}
              alt="Cafe Aura Full Preview"
              className="pure-lightbox-img"
            />
          </div>

          <button
            className="pure-lightbox-arrow next"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhotoIndex((prev) => (prev + 1) % PURE_PHOTOS.length);
            }}
            title="Next (Right Arrow)"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
