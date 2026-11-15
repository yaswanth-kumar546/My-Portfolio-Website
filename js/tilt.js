/**
 * 3D Interactive Project Card Tilt Effect
 * Provides realistic 3D perspective rotation and dynamic gold light sheen
 */
(function() {
  const cards = document.querySelectorAll('.project-card-3d');

  cards.forEach(card => {
    let bounds;
    const shine = card.querySelector('.card-shine');

    function updateBounds() {
      bounds = card.getBoundingClientRect();
    }

    function onMouseMove(e) {
      if (!bounds) updateBounds();

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;

      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      // Max rotation 12 degrees
      const maxRotate = 10;
      const rotateX = (-center.y / (bounds.height / 2)) * maxRotate;
      const rotateY = (center.x / (bounds.width / 2)) * maxRotate;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (shine) {
        shine.style.background = `radial-gradient(circle 320px at ${leftX}px ${topY}px, rgba(247, 231, 169, 0.22) 0%, rgba(212, 175, 55, 0.06) 50%, transparent 80%)`;
      }
    }

    function onMouseEnter() {
      updateBounds();
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    }

    function onMouseLeave() {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (shine) {
        shine.style.background = 'transparent';
      }
    }

    window.addEventListener('resize', updateBounds);
    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
})();

