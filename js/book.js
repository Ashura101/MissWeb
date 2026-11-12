// 3D Flipbook Controller with Dual Desktop/Mobile Presentation Engine

class CuteFlipBook {
  constructor() {
    this.bookEl = document.getElementById('flipBook');
    this.leaves = Array.from(document.querySelectorAll('.leaf'));
    this.totalLeaves = this.leaves.length; // 4 leaves
    this.totalMobileSteps = this.totalLeaves * 2; // 8 individual pages
    
    this.isMobile = window.innerWidth <= 720;
    this.currentLeaf = 0; // Desktop leaf state (0 to 4)
    this.mobileStep = 0;  // Mobile page state (0 to 7)
    this.isAnimating = false;

    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.ribbonLabel = document.getElementById('ribbonLabel');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.applyMode();
  }

  applyMode() {
    this.isMobile = window.innerWidth <= 720;
    if (this.isMobile) {
      this.bookEl.classList.add('is-mobile');
      this.renderMobileState();
    } else {
      this.bookEl.classList.remove('is-mobile');
      this.renderDesktopState();
    }
  }

  /* =========================================
     DESKTOP RENDERING (2-Page Open Spread)
  ========================================= */
  renderDesktopState() {
    // Clear mobile-specific classes
    this.leaves.forEach(leaf => {
      leaf.classList.remove('mobile-flipped', 'mobile-dismissed');
    });

    // Update Desktop flipped classes & z-indices
    this.leaves.forEach((leaf, i) => {
      if (i < this.currentLeaf) {
        leaf.classList.add('flipped');
        leaf.style.zIndex = i + 1;
      } else {
        leaf.classList.remove('flipped');
        leaf.style.zIndex = this.totalLeaves - i;
      }
    });

    // Closed cover / backbook centering on desktop
    if (this.currentLeaf === 0) {
      this.bookEl.classList.add('closed-front');
      this.bookEl.classList.remove('closed-back');
    } else if (this.currentLeaf === this.totalLeaves) {
      this.bookEl.classList.remove('closed-front');
      this.bookEl.classList.add('closed-back');
    } else {
      this.bookEl.classList.remove('closed-front');
      this.bookEl.classList.remove('closed-back');
    }

    this.updateControls();
  }

  /* =========================================
     MOBILE RENDERING (8 Sequential Pages)
  ========================================= */
  renderMobileState() {
    // Clear desktop-specific classes
    this.bookEl.classList.remove('closed-front', 'closed-back');
    this.leaves.forEach(leaf => leaf.classList.remove('flipped'));

    const activeLeafIdx = Math.floor(this.mobileStep / 2);
    const isBackOfLeaf = this.mobileStep % 2 === 1;

    this.leaves.forEach((leaf, i) => {
      if (i < activeLeafIdx) {
        // Earlier leaves are dismissed to the left
        leaf.classList.remove('mobile-flipped');
        leaf.classList.add('mobile-dismissed');
        leaf.style.zIndex = i + 1;
      } else if (i === activeLeafIdx) {
        // Current active leaf
        leaf.classList.remove('mobile-dismissed');
        if (isBackOfLeaf) {
          leaf.classList.add('mobile-flipped'); // Flip to show back face centered
        } else {
          leaf.classList.remove('mobile-flipped'); // Show front face
        }
        leaf.style.zIndex = 30;
      } else {
        // Upcoming leaves waiting underneath
        leaf.classList.remove('mobile-flipped', 'mobile-dismissed');
        leaf.style.zIndex = 20 - i;
      }
    });

    this.updateControls();
  }

  /* =========================================
     NAVIGATION: NEXT & PREVIOUS
  ========================================= */
  flipNext() {
    if (this.isAnimating) return;

    if (this.isMobile) {
      if (this.mobileStep >= this.totalMobileSteps - 1) return;
      this.isAnimating = true;
      this.mobileStep++;
      if (window.soundCtrl) window.soundCtrl.playPageTurn();
      this.renderMobileState();
      setTimeout(() => { this.isAnimating = false; }, 750);
    } else {
      if (this.currentLeaf >= this.totalLeaves) return;
      this.isAnimating = true;
      const leaf = this.leaves[this.currentLeaf];
      leaf.classList.add('turning', 'flipped');
      leaf.style.zIndex = this.totalLeaves + 15;
      
      if (window.soundCtrl) window.soundCtrl.playPageTurn();
      this.currentLeaf++;
      this.renderDesktopState();
      
      setTimeout(() => {
        leaf.classList.remove('turning');
        this.renderDesktopState();
        this.isAnimating = false;
      }, 850);
    }
  }

  flipPrev() {
    if (this.isAnimating) return;

    if (this.isMobile) {
      if (this.mobileStep <= 0) return;
      this.isAnimating = true;
      this.mobileStep--;
      if (window.soundCtrl) window.soundCtrl.playPageTurn();
      this.renderMobileState();
      setTimeout(() => { this.isAnimating = false; }, 750);
    } else {
      if (this.currentLeaf <= 0) return;
      this.isAnimating = true;
      this.currentLeaf--;
      const leaf = this.leaves[this.currentLeaf];
      leaf.classList.add('turning');
      leaf.classList.remove('flipped');
      leaf.style.zIndex = this.totalLeaves + 15;

      if (window.soundCtrl) window.soundCtrl.playPageTurn();
      this.renderDesktopState();

      setTimeout(() => {
        leaf.classList.remove('turning');
        this.renderDesktopState();
        this.isAnimating = false;
      }, 850);
    }
  }

  /* =========================================
     UPDATE UI CONTROLS & RIBBON BADGE
  ========================================= */
  updateControls() {
    if (this.isMobile) {
      // Mobile ribbon label (Step 0 to 7)
      if (this.ribbonLabel) {
        if (this.mobileStep === 0) {
          this.ribbonLabel.textContent = 'Cover';
        } else if (this.mobileStep === this.totalMobileSteps - 1) {
          this.ribbonLabel.textContent = 'End 🐾';
        } else {
          this.ribbonLabel.textContent = `${this.mobileStep} / 6`;
        }
      }

      // Mobile button disable states
      if (this.prevBtn) {
        this.prevBtn.style.opacity = this.mobileStep === 0 ? '0.3' : '1';
        this.prevBtn.style.pointerEvents = this.mobileStep === 0 ? 'none' : 'auto';
      }
      if (this.nextBtn) {
        this.nextBtn.style.opacity = this.mobileStep === this.totalMobileSteps - 1 ? '0.3' : '1';
        this.nextBtn.style.pointerEvents = this.mobileStep === this.totalMobileSteps - 1 ? 'none' : 'auto';
      }
    } else {
      // Desktop ribbon label (Leaves 0 to 4)
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

      // Desktop button disable states
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

  /* =========================================
     EVENT LISTENERS & TOUCH GESTURES
  ========================================= */
  setupEventListeners() {
    // Next / Prev Paw Buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.flipNext();
      });
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.flipPrev();
      });
    }

    // Cover "Open Book" Button
    const openBtn = document.getElementById('btnOpenBook');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.flipNext();
      });
    }

    // Leaf click interactions
    this.leaves.forEach((leaf, index) => {
      leaf.addEventListener('click', (e) => {
        if (e.target.closest('button') && !e.target.closest('.corner-curl')) return;

        if (this.isMobile) {
          // On mobile: clicking right half flips next, left half flips prev
          const rect = leaf.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.4) {
            this.flipNext();
          } else {
            this.flipPrev();
          }
        } else {
          // On desktop
          if (index === this.currentLeaf) {
            this.flipNext();
          } else if (index === this.currentLeaf - 1) {
            this.flipPrev();
          }
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
    let touchStartTime = 0;
    const stage = document.querySelector('.book-stage');

    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const dx = touchEndX - touchStartX;
          const dy = touchEndY - touchStartY;
          const dt = Date.now() - touchStartTime;

          // Horizontal swipe detected
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2 && dt < 600) {
            if (dx < 0) {
              this.flipNext();
            } else {
              this.flipPrev();
            }
          }
        }
      }, { passive: true });
    }

    // Audio Toggle Button
    if (this.audioToggleBtn) {
      this.audioToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // Responsive Window Resize Handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        const nowMobile = window.innerWidth <= 720;
        if (wasMobile !== nowMobile) {
          if (nowMobile) {
            // Map currentLeaf to mobileStep
            this.mobileStep = Math.min(this.currentLeaf * 2, this.totalMobileSteps - 1);
          } else {
            // Map mobileStep to currentLeaf
            this.currentLeaf = Math.min(Math.ceil(this.mobileStep / 2), this.totalLeaves);
          }
          this.applyMode();
        }
      }, 150);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bookInstance = new CuteFlipBook();
});
