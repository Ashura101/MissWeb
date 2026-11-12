// 3D Flipbook Controller with Layer Management and Gestures

class CuteFlipBook {
  constructor() {
    this.leaves = Array.from(document.querySelectorAll('.leaf'));
    this.totalLeaves = this.leaves.length;
    this.currentLeaf = 0; // 0 = closed at cover, totalLeaves = closed at back
    this.isAnimating = false;

    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.ribbonLabel = document.getElementById('ribbonLabel');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');

    this.init();
  }

  init() {
    this.updateZIndices();
    this.setupEventListeners();
    this.updateUI();
  }

  updateZIndices() {
    this.leaves.forEach((leaf, i) => {
      if (i < this.currentLeaf) {
        // Flipped to the left: lower index = underneath higher index
        leaf.style.zIndex = i + 1;
      } else {
        // Unflipped on the right: higher index = underneath lower index
        leaf.style.zIndex = this.totalLeaves - i;
      }
    });
  }

  setupEventListeners() {
    // Next / Prev Paw Buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.flipNext());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.flipPrev());
    }

    // Front Cover "Open Book" Button
    const openBtn = document.getElementById('btnOpenBook');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.flipNext();
      });
    }

    // Leaf click interactions (Click right page to advance, left page to go back)
    this.leaves.forEach((leaf, index) => {
      leaf.addEventListener('click', (e) => {
        // Avoid intercepting interactive buttons inside pages (e.g. Send Love)
        if (e.target.closest('button') && !e.target.closest('.corner-curl')) return;

        if (index === this.currentLeaf) {
          // Top unflipped leaf clicked -> flip forward
          this.flipNext();
        } else if (index === this.currentLeaf - 1) {
          // Top flipped leaf clicked -> flip back
          this.flipPrev();
        }
      });
    });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.flipNext();
      } else if (e.key === 'ArrowLeft') {
        this.flipPrev();
      }
    });

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    const stage = document.querySelector('.book-stage');

    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        // Horizontal swipe priority
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) {
            this.flipNext();
          } else {
            this.flipPrev();
          }
        }
      }, { passive: true });
    }

    // Audio Toggle Button
    if (this.audioToggleBtn) {
      this.audioToggleBtn.addEventListener('click', () => {
        if (!window.soundCtrl) return;
        const isMuted = window.soundCtrl.toggleMute();
        const icon = this.audioToggleBtn.querySelector('.audio-icon');
        const text = this.audioToggleBtn.querySelector('.audio-text');
        if (isMuted) {
          if (icon) icon.textContent = '🔇';
          if (text) text.textContent = 'Muted';
          this.audioToggleBtn.style.opacity = '0.6';
        } else {
          if (icon) icon.textContent = '🔔';
          if (text) text.textContent = 'Sound On';
          this.audioToggleBtn.style.opacity = '1';
          window.soundCtrl.playPop();
        }
      });
    }
  }

  flipNext() {
    if (this.isAnimating || this.currentLeaf >= this.totalLeaves) return;
    this.isAnimating = true;

    const leaf = this.leaves[this.currentLeaf];
    leaf.classList.add('turning');

    // Elevate active leaf so it flies smoothly over all other pages
    leaf.style.zIndex = this.totalLeaves + 15;
    leaf.classList.add('flipped');

    if (window.soundCtrl) {
      window.soundCtrl.playPageTurn();
    }

    this.currentLeaf++;
    this.updateUI();

    setTimeout(() => {
      leaf.classList.remove('turning');
      this.updateZIndices();
      this.isAnimating = false;
    }, 850);
  }

  flipPrev() {
    if (this.isAnimating || this.currentLeaf <= 0) return;
    this.isAnimating = true;

    this.currentLeaf--;
    const leaf = this.leaves[this.currentLeaf];
    leaf.classList.add('turning');

    // Elevate active leaf during reverse turn
    leaf.style.zIndex = this.totalLeaves + 15;
    leaf.classList.remove('flipped');

    if (window.soundCtrl) {
      window.soundCtrl.playPageTurn();
    }

    this.updateUI();

    setTimeout(() => {
      leaf.classList.remove('turning');
      this.updateZIndices();
      this.isAnimating = false;
    }, 850);
  }

  updateUI() {
    const bookEl = document.getElementById('flipBook');
    if (bookEl) {
      if (this.currentLeaf === 0) {
        bookEl.classList.add('closed-front');
        bookEl.classList.remove('closed-back');
      } else if (this.currentLeaf === this.totalLeaves) {
        bookEl.classList.remove('closed-front');
        bookEl.classList.add('closed-back');
      } else {
        bookEl.classList.remove('closed-front');
        bookEl.classList.remove('closed-back');
      }
    }

    // Update Ribbon text
    if (this.ribbonLabel) {
      if (this.currentLeaf === 0) {
        this.ribbonLabel.textContent = 'Cover';
      } else if (this.currentLeaf === this.totalLeaves) {
        this.ribbonLabel.textContent = 'End 🐾';
      } else {
        const leftPage = (this.currentLeaf - 1) * 2 + 1;
        const rightPage = leftPage + 1;
        this.ribbonLabel.textContent = `${leftPage}-${rightPage}`;
      }
    }

    // Toggle Paw Button disabled state styling
    if (this.prevBtn) {
      this.prevBtn.style.opacity = this.currentLeaf === 0 ? '0.35' : '1';
      this.prevBtn.style.pointerEvents = this.currentLeaf === 0 ? 'none' : 'auto';
    }
    if (this.nextBtn) {
      this.nextBtn.style.opacity = this.currentLeaf === this.totalLeaves ? '0.35' : '1';
      this.nextBtn.style.pointerEvents = this.currentLeaf === this.totalLeaves ? 'none' : 'auto';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bookInstance = new CuteFlipBook();
});
