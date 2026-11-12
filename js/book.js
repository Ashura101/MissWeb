// 3D Flipbook Controller with Dual Desktop/Mobile Presentation Engine

class CuteFlipBook {
  constructor() {
    this.bookEl = document.getElementById('flipBook');
    this.leaves = Array.from(document.querySelectorAll('.leaf'));
    this.totalLeaves = this.leaves.length; // 4 leaves
    this.totalPages = 8;                   // 8 individual pages (mobile)
    
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
    // Reset mobile classes on leaves and pages
    this.leaves.forEach(leaf => {
      leaf.classList.remove('leaf-active', 'leaf-upcoming', 'leaf-passed');
      const front = leaf.querySelector('.page-front');
      const back = leaf.querySelector('.page-back');
      if (front) {
        front.classList.remove('page-active', 'page-upcoming', 'page-passed');
      }
      if (back) {
        back.classList.remove('page-active', 'page-upcoming', 'page-passed');
      }
    });

    // Update Desktop flipped classes & leaf z-indices
    this.leaves.forEach((leaf, i) => {
      if (i < this.currentLeaf) {
        leaf.classList.add('flipped');
        leaf.style.zIndex = i + 1;
      } else {
        leaf.classList.remove('flipped');
        leaf.style.zIndex = this.totalLeaves - i;
      }
    });

    // Desktop book centering
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
    this.bookEl.classList.remove('closed-front', 'closed-back');
    this.leaves.forEach(leaf => leaf.classList.remove('flipped'));

    const activeLeafIdx = Math.floor(this.mobileStep / 2);
    const isBackOfLeaf = this.mobileStep % 2 === 1;

    this.leaves.forEach((leaf, idx) => {
      const front = leaf.querySelector('.page-front');
      const back = leaf.querySelector('.page-back');

      if (idx < activeLeafIdx) {
        // Earlier leaves are already passed to the left
        leaf.style.zIndex = idx + 1;
        leaf.className = 'leaf leaf-passed';
        if (front) front.className = 'page page-front page-passed';
        if (back) back.className = 'page page-back page-passed';
      } else if (idx === activeLeafIdx) {
        // Active leaf currently being viewed (highest z-index: 40)
        leaf.style.zIndex = 40;
        leaf.className = 'leaf leaf-active';

        if (isBackOfLeaf) {
          // Front page has turned over, back page is active
          if (front) front.className = 'page page-front page-passed';
          if (back) back.className = 'page page-back page-active';
        } else {
          // Front page is active, back page is underneath
          if (front) front.className = 'page page-front page-active';
          if (back) back.className = 'page page-back page-upcoming';
        }
      } else {
        // Upcoming leaves waiting in the right stack underneath
        leaf.style.zIndex = 20 - idx;
        leaf.className = 'leaf leaf-upcoming';
        if (front) front.className = 'page page-front page-active';
        if (back) back.className = 'page page-back page-upcoming';
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
      if (this.mobileStep >= this.totalPages - 1) return;
      this.isAnimating = true;

      const currentStep = this.mobileStep;
      const nextStep = currentStep + 1;
      const activeLeaf = this.leaves[Math.floor(currentStep / 2)];

      if (window.soundCtrl) window.soundCtrl.playPageTurn();

      if (currentStep % 2 === 0) {
        // Front page flips over to reveal the back page of the same leaf
        const front = activeLeaf.querySelector('.page-front');
        const back = activeLeaf.querySelector('.page-back');
        if (front) front.className = 'page page-front page-passed';
        if (back) back.className = 'page page-back page-active';
      } else {
        // The entire leaf folds over to reveal the next leaf
        activeLeaf.className = 'leaf leaf-passed';
        activeLeaf.style.zIndex = Math.floor(currentStep / 2) + 1;

        const nextLeaf = this.leaves[Math.floor(nextStep / 2)];
        if (nextLeaf) {
          nextLeaf.className = 'leaf leaf-active';
          nextLeaf.style.zIndex = 40;
          const nextFront = nextLeaf.querySelector('.page-front');
          if (nextFront) nextFront.className = 'page page-front page-active';
        }
      }

      this.mobileStep = nextStep;
      this.updateControls();

      setTimeout(() => {
        this.renderMobileState();
        this.isAnimating = false;
      }, 650);
    } else {
      // Desktop
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

      const currentStep = this.mobileStep;
      const prevStep = currentStep - 1;

      if (window.soundCtrl) window.soundCtrl.playPageTurn();

      if (currentStep % 2 === 1) {
        // Back page to front page of the same leaf
        const activeLeaf = this.leaves[Math.floor(currentStep / 2)];
        const front = activeLeaf.querySelector('.page-front');
        const back = activeLeaf.querySelector('.page-back');
        if (front) front.className = 'page page-front page-active';
        if (back) back.className = 'page page-back page-upcoming';
      } else {
        // Previous leaf folds back in from the left
        const prevLeaf = this.leaves[Math.floor(prevStep / 2)];
        if (prevLeaf) {
          prevLeaf.className = 'leaf leaf-active';
          prevLeaf.style.zIndex = 40;
          const prevFront = prevLeaf.querySelector('.page-front');
          const prevBack = prevLeaf.querySelector('.page-back');
          if (prevFront) prevFront.className = 'page page-front page-passed';
          if (prevBack) prevBack.className = 'page page-back page-active';
        }
      }

      this.mobileStep = prevStep;
      this.updateControls();

      setTimeout(() => {
        this.renderMobileState();
        this.isAnimating = false;
      }, 650);
    } else {
      // Desktop
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
        } else if (this.mobileStep === this.totalPages - 1) {
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
        this.nextBtn.style.opacity = this.mobileStep === this.totalPages - 1 ? '0.3' : '1';
        this.nextBtn.style.pointerEvents = this.mobileStep === this.totalPages - 1 ? 'none' : 'auto';
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

    // Page tap / click interactions
    const allPages = Array.from(document.querySelectorAll('.page'));
    allPages.forEach((page) => {
      page.addEventListener('click', (e) => {
        if (e.target.closest('button') && !e.target.closest('.corner-curl')) return;

        if (this.isMobile) {
          // On mobile: tapping right side flips next, left side flips prev
          const rect = page.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.4) {
            this.flipNext();
          } else {
            this.flipPrev();
          }
        } else {
          // On desktop
          const leaf = page.closest('.leaf');
          const leafIndex = this.leaves.indexOf(leaf);
          if (leafIndex === this.currentLeaf) {
            this.flipNext();
          } else if (leafIndex === this.currentLeaf - 1) {
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

    // Window Resize Handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        const nowMobile = window.innerWidth <= 720;
        if (wasMobile !== nowMobile) {
          if (nowMobile) {
            this.mobileStep = Math.min(this.currentLeaf * 2, this.totalPages - 1);
          } else {
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
