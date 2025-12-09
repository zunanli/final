import React, { useEffect, useRef, useState } from 'react';

// Minimal image carousel with seamless looping via head/tail clones.
// Key idea: track = [lastClone, ...images, firstClone], start at index=1.
// When landing on clones (index=0 or index=total+1), disable transition and jump to real slide.
const ImageCarousel = () => {
  // Fixed image URL repeated to form a simple carousel (no config for MVP)
  const IMG_URL = 'https://ife.gtimg.com/build/client/official-website/assets/expression-bg_60975e0.png';
  const images = [IMG_URL, IMG_URL, IMG_URL, IMG_URL, IMG_URL];
  const total = images.length;

  // Build slides with head/tail clones for seamless loop
  const slides = [images[total - 1], ...images, images[0]];

  // Start at 1 (first real slide). Transition toggles off when jumping from clones.
  const [index, setIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const next = () => setIndex((prev) => prev + 1);
  const prev = () => setIndex((prev) => prev - 1);

  // Normalize display index (1..total) for UI label
  const displayIndex = ((index - 1 + total) % total) + 1;

  const handleTransitionEnd = () => {
    // If we reached the head clone (index 0), jump to the real last slide
    if (index === 0) {
      setTransitionEnabled(false); // disable transition for the instant jump
      setIndex(total);
      // Re-enable transition after style flush (handled in useEffect)
      return;
    }
    // If we reached the tail clone (index total+1), jump to the real first slide
    if (index === total + 1) {
      setTransitionEnabled(false);
      setIndex(1);
      // Re-enable transition after style flush (handled in useEffect)
    }
  };

  // After jumping to real slide with transition disabled, force a reflow and re-enable transition
  useEffect(() => {
    if (!transitionEnabled && (index === 1 || index === total)) {
      // Double RAF ensures React state has flushed and DOM styles are updated
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    }
  }, [transitionEnabled, index, total]);

  return (
    <div style={{
      width: '100%',
      maxWidth: 720,
      margin: '20px auto',
      overflow: 'hidden',
      borderRadius: 8,
      border: '1px solid #ddd'
    }}>
      {/* Track uses transform translateX to slide by 100%-width increments */}
      <div
        style={{
          display: 'flex',
          transform: `translateX(-${index * 100}%)`,
          transition: transitionEnabled ? 'transform 300ms ease' : 'none',
          willChange: 'transform'
        }}
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((src, i) => (
          <div key={i} style={{ flex: '0 0 100%' }}>
            <img
              src={src}
              alt={`carousel-${i}`}
              style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      {/* Controls: always enabled; index wraps via clones for seamless loop */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
        <button onClick={prev} style={{ padding: '6px 10px' }}>Prev</button>
        <span style={{ fontSize: 12, color: '#666' }}>{displayIndex} / {total}</span>
        <button onClick={next} style={{ padding: '6px 10px' }}>Next</button>
      </div>
    </div>
  );
};

export default ImageCarousel;