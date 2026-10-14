import { useState, useRef, useEffect, useCallback } from 'react'
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../../config/gallery'
import { useReveal } from '../../hooks/useEffects'

export default function Gallery({ isStandalone = false }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [playingVideoId, setPlayingVideoId] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const carouselRef = useRef(null)
  const videoRefs = useRef({})
  const headerRef = useReveal()

  const filteredItems = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory)

  // Scroll checking for arrow buttons
  const checkScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const t = setTimeout(checkScroll, 120)
    window.addEventListener('resize', checkScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, filteredItems])

  const scrollCarousel = (direction) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector('.gallery-card')
    const scrollAmount = card ? (card.offsetWidth + 22) * 1.5 : 450
    const offset = direction === 'left' ? -scrollAmount : scrollAmount
    el.scrollBy({ left: offset, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  // Keyboard navigation for modal
  const handleKeyDown = useCallback(
    (e) => {
      if (!selectedItem) return
      if (e.key === 'Escape') {
        setSelectedItem(null)
      } else if (e.key === 'ArrowRight') {
        const idx = GALLERY_ITEMS.findIndex((it) => it.id === selectedItem.id)
        if (idx !== -1) {
          const next = GALLERY_ITEMS[(idx + 1) % GALLERY_ITEMS.length]
          setSelectedItem(next)
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = GALLERY_ITEMS.findIndex((it) => it.id === selectedItem.id)
        if (idx !== -1) {
          const prev = GALLERY_ITEMS[(idx - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length]
          setSelectedItem(prev)
        }
      }
    },
    [selectedItem]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Toggle inline video playback
  const toggleInlineVideo = (e, id) => {
    e.stopPropagation()
    const video = videoRefs.current[id]
    if (!video) return

    if (video.paused) {
      // Pause all other videos
      Object.keys(videoRefs.current).forEach((k) => {
        if (k !== id && videoRefs.current[k]) videoRefs.current[k].pause()
      })
      video.play().catch(() => {})
      setPlayingVideoId(id)
    } else {
      video.pause()
      setPlayingVideoId(null)
    }
  }

  const openItem = (item) => {
    // Pause any inline videos
    Object.keys(videoRefs.current).forEach((k) => {
      if (videoRefs.current[k]) videoRefs.current[k].pause()
    })
    setPlayingVideoId(null)
    setSelectedItem(item)
  }

  return (
    <section className={`s gallery-section ${isStandalone ? 'standalone' : ''}`} id="gallery">
      <div className="wrap">
        <div ref={headerRef} data-in className="gallery-header">
          <div className="kicker">Memories & Highlights</div>
          <h2>Previous Expos in Action</h2>
          <p className="intro">
            Explore live footage, student-engineered battle bots, smart maze solvers, and innovation moments from our past tech showcases.
          </p>

          {/* Category Filter Tabs */}
          <div className="gallery-filters" role="tablist" aria-label="Gallery categories">
            {GALLERY_CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? GALLERY_ITEMS.length
                : GALLERY_ITEMS.filter((item) => item.category === cat.id).length
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`gallery-tab ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className="count-pill">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Gallery Carousel Container with Side Arrows */}
        <div className="gallery-carousel-wrapper">
          <button
            type="button"
            className="carousel-arrow prev"
            onClick={() => scrollCarousel('left')}
            aria-label="Previous cards"
            disabled={!canScrollLeft}
            title="Previous cards"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            ref={carouselRef}
            className="gallery-carousel-track"
            onScroll={checkScroll}
            tabIndex={0}
            role="region"
            aria-label="Previous expos card carousel"
          >
            {filteredItems.map((item, index) => {
            const isVideo = item.type === 'video'
            const isGif = item.type === 'gif'
            const isPlaying = playingVideoId === item.id

            return (
              <div
                key={item.id}
                className={`gallery-card ${item.spotlight ? 'spotlight' : ''} ${item.type}`}
                onClick={() => openItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(item) } }}
                aria-label={`View ${item.title}`}
              >
                <div className="gallery-media-wrapper">
                  {isVideo ? (
                    <div className="video-container">
                      <video
                        ref={(el) => { videoRefs.current[item.id] = el }}
                        src={item.src}
                        preload="metadata"
                        loop
                        playsInline
                        muted
                        onPlay={() => setPlayingVideoId(item.id)}
                        onPause={() => setPlayingVideoId(null)}
                      />
                      <button
                        type="button"
                        className={`video-play-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={(e) => toggleInlineVideo(e, item.id)}
                        aria-label={isPlaying ? 'Pause video' : 'Play video inline'}
                        title={isPlaying ? 'Pause video' : 'Play video'}
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </button>
                      <div className="video-duration-pill">
                        <span className="pulse-dot" /> Live Video
                      </div>
                    </div>
                  ) : (
                    <div className="img-container">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading={index < 3 ? 'eager' : 'lazy'}
                      />
                      {isGif && (
                        <div className="gif-badge">
                          <span className="pulse-dot teal" /> Animated GIF
                        </div>
                      )}
                    </div>
                  )}

                  <div className="gallery-overlay">
                    <span className="expand-hint">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Click to expand
                    </span>
                  </div>
                </div>

                <div className="gallery-info">
                  <div className="gallery-meta">
                    <span className={`pill-badge ${item.badgeColor || 'blue'}`}>{item.badge}</span>
                    <span className="gallery-year">{item.year}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.shortDesc}</p>

                  <div className="gallery-tags">
                    {item.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag-chip">{t}</span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="tag-chip more">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          </div>

          <button
            type="button"
            className="carousel-arrow next"
            onClick={() => scrollCarousel('right')}
            aria-label="Next cards"
            disabled={!canScrollRight}
            title="Next cards"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lightbox / Detail Modal */}
      {selectedItem && (
        <LightboxModal
          item={selectedItem}
          items={GALLERY_ITEMS}
          onClose={() => setSelectedItem(null)}
          onNavigate={(nextItem) => setSelectedItem(nextItem)}
        />
      )}
    </section>
  )
}

function LightboxModal({ item, items, onClose, onNavigate }) {
  const currentIndex = items.findIndex((it) => it.id === item.id)
  const isVideo = item.type === 'video'
  const videoRef = useRef(null)

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % items.length
    onNavigate(items[nextIdx])
  }

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + items.length) % items.length
    onNavigate(items[prevIdx])
  }

  // Auto-play modal video with controls
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [item, isVideo])

  return (
    <div className="gallery-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="gallery-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          title="Close (Esc)"
        >
          ✕
        </button>

        {/* Modal Layout */}
        <div className="modal-content-grid">
          {/* Media Player / Image Area */}
          <div className="modal-media-pane">
            {isVideo ? (
              <video
                key={item.id}
                ref={videoRef}
                src={item.src}
                controls
                autoPlay
                playsInline
                className="modal-video"
              />
            ) : (
              <img
                src={item.src}
                alt={item.title}
                className="modal-img"
              />
            )}

            {/* Navigation Arrows on Media */}
            <button
              type="button"
              className="media-nav-btn prev"
              onClick={handlePrev}
              aria-label="Previous item"
              title="Previous (Left Arrow)"
            >
              ‹
            </button>
            <button
              type="button"
              className="media-nav-btn next"
              onClick={handleNext}
              aria-label="Next item"
              title="Next (Right Arrow)"
            >
              ›
            </button>
          </div>

          {/* Details Pane */}
          <div className="modal-details-pane">
            <div className="modal-top-meta">
              <span className={`pill-badge ${item.badgeColor || 'blue'}`}>{item.badge}</span>
              <span className="modal-year">{item.year}</span>
              <span className="item-counter">
                {currentIndex + 1} / {items.length}
              </span>
            </div>

            <h2 className="modal-title">{item.title}</h2>
            <p className="modal-desc">{item.fullDesc}</p>

            {/* Technical Highlights / Stats */}
            {item.stats && item.stats.length > 0 && (
              <div className="modal-stats-box">
                <div className="stats-header">Engineering Highlights</div>
                <div className="stats-row">
                  {item.stats.map((st) => (
                    <div key={st.label} className="stat-chip">
                      <span className="st-val">{st.value}</span>
                      <span className="st-lbl">{st.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="modal-tags-section">
              <span className="tags-label">Tags & Focus:</span>
              <div className="modal-tags">
                {item.tags.map((t) => (
                  <span key={t} className="tag-chip">{t}</span>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="modal-footer-nav">
              <button type="button" className="nav-btn-link" onClick={handlePrev}>
                ← Previous
              </button>
              <button type="button" className="nav-btn-link" onClick={handleNext}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
