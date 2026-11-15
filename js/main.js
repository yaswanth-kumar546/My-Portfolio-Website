/**
 * Main Portfolio Controller for Yejarla Yaswanth Kumar
 * Handles GSAP animations, audio feedback, modals, filtering, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Custom Cursor
  initCustomCursor();

  // Initialize Sound System
  initSoundFX();

  // Initialize Navigation & ScrollSpy
  initNavigation();

  // Initialize Skill Filters
  initSkillFilters();

  // Initialize Project Filters
  initProjectFilters();

  // Initialize Modals
  initModals();

  // Initialize Contact & Clipboard
  initContactActions();

  // GSAP Entrance Animations
  initGSAPAnimations();
});

/* ==========================================================================
   Custom Cursor
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  requestAnimationFrame(renderRing);

  // Hover states on clickable items
  const clickables = document.querySelectorAll('a, button, input, textarea, .project-card-3d, .skill-card, .stat-card, .clickable');
  clickables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-active'));
  });
}

/* ==========================================================================
   Web Audio API Synthesized Sound System
   ========================================================================== */
let audioCtx = null;
let soundEnabled = localStorage.getItem('yaswanth_sound_enabled') === 'true';

function initSoundFX() {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  const soundBars = document.querySelector('.sound-bars');
  const soundStateLabel = document.getElementById('sound-state-label');

  function updateSoundUI() {
    if (soundEnabled) {
      soundBars?.classList.add('playing');
      if (soundStateLabel) soundStateLabel.textContent = 'FX: ON';
      toggleBtn?.setAttribute('title', 'Mute Sound FX');
    } else {
      soundBars?.classList.remove('playing');
      if (soundStateLabel) soundStateLabel.textContent = 'FX: OFF';
      toggleBtn?.setAttribute('title', 'Enable Sound FX');
    }
  }

  updateSoundUI();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('yaswanth_sound_enabled', soundEnabled);
      updateSoundUI();
      if (soundEnabled) playHapticSound(880, 'sine', 0.04);
    });
  }

  // Attach subtle clicks to key buttons
  const buttons = document.querySelectorAll('.btn-gold-primary, .btn-gold-outline, .skill-tab-btn, .project-tab-btn, .modal-close-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (soundEnabled) playHapticSound(540, 'triangle', 0.03);
    });
  });
}

function playHapticSound(freq = 600, type = 'sine', duration = 0.04) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context fallback
  }
}

/* ==========================================================================
   Navigation & ScrollSpy
   ========================================================================== */
function initNavigation() {
  const navbar = document.querySelector('.navbar-fixed');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky Navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('nav-scrolled');
    } else {
      navbar?.classList.remove('nav-scrolled');
    }

    // ScrollSpy active link detection
    let currentId = '';
    const scrollPosition = window.scrollY + 250;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile drawer events
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileDrawer() {
    mobileDrawer?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileDrawer));
}

/* ==========================================================================
   Skill Category Filtering
   ========================================================================== */
function initSkillFilters() {
  const filterBtns = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Project Category Filtering
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.project-tab-btn');
  const projectCards = document.querySelectorAll('.project-card-filter-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Modals Management
   ========================================================================== */
const projectDetails = {
  mindwell: {
    title: 'MindWell AI: Multimodal Mental Wellness Prediction & Real-Time Support',
    subtitle: 'Final Year Capstone Project — Deep Learning, NLP & Real-time Conversational Agent',
    badge: 'Flagship AI Project',
    architecture: 'Deep Neural Networks (DNN) + Long Short-Term Memory (LSTM) + Support Vector Machine (SVM)',
    overview: 'An end-to-end artificial intelligence framework engineered to identify potential mental wellness strain among youth based on digital and social media interaction patterns. Integrated with a real-time empathetic conversational engine providing instantaneous, non-clinical supportive dialogues.',
    contributions: [
      'Engineered an NLP preprocessing pipeline using NLTK and custom tokenizers, extracting sentiment polarity, cognitive load markers, and behavioral vocabulary.',
      'Designed and benchmarked a multi-model ensemble combining Deep Neural Networks (DNN), LSTM sequential models, and Support Vector Machines (SVM).',
      'Developed a real-time conversational system capable of sentiment-aware empathetic dialogues, offering non-clinical emotional support.',
      'Optimized model inference latency for real-time web deployment with high classification accuracy.'
    ],
    stack: ['Python', 'PyTorch', 'TensorFlow', 'NLTK', 'LSTM', 'DNN', 'SVM', 'NumPy', 'Pandas'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  vinometric: {
    title: 'VinoMetric: High-Dimensional Wine Quality Analytics & Automated Feature Pipeline',
    subtitle: 'Minor Project — Advanced Exploratory Data Analysis & Predictive Modeling',
    badge: 'Data Science & Statistical ML',
    architecture: 'Vectorized Data Cleaning + Correlation Automation + Distribution Engineering',
    overview: 'A comprehensive exploratory data analysis and feature engineering pipeline on high-dimensional physicochemical wine quality datasets. Formulated to uncover hidden collinearities between acidity, alcohol density, sulfur dioxide ratios, and final sensory quality scores.',
    contributions: [
      'Executed robust data cleaning pipelines handling missing values, anomalies, and multi-collinear variables using Pandas and NumPy.',
      'Automated correlation matrix extraction and feature importance ranking to identify pivotal physicochemical predictors of wine ratings.',
      'Constructed publication-grade statistical visualizations with Seaborn and Matplotlib (histograms, pairplots, bivariate kernel density plots).',
      'Extracted actionable feature subsets to prime downstream regression and classification models.'
    ],
    stack: ['Python', 'Pandas', 'NumPy', 'Seaborn', 'Matplotlib', 'Statistical Modeling'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  coder: {
    title: 'Coder – Online Coding Web Application',
    subtitle: 'Interactive Code Sandbox & Problem Solving Platform',
    badge: 'Web Development',
    architecture: 'Frontend (HTML, CSS, JS) + Python Backend Execution Engine',
    overview: 'An interactive coding platform designed to help users practice programming, write code, test algorithms, and sharpen their problem-solving skills in real time. Features an integrated code editor with live syntax styling and rapid execution feedback.',
    contributions: [
      'Designed an intuitive, responsive code editor interface with custom syntax highlighting, line numbers, and theme toggling.',
      'Built a lightweight Python backend execution engine that receives user code, validates syntax, and streams standard output and errors.',
      'Created structured algorithm challenges for students and aspiring developers to practice Data Structures and Algorithms.',
      'Implemented client-side caching to prevent accidental loss of user code during browser sessions.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Python', 'Code Editor Engine', 'Problem Solving UI'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  ai_prompt_gen: {
    title: 'AI Prompt Generator Website',
    subtitle: 'Intelligent Prompt Engineering & Task Optimization Platform',
    badge: 'Artificial Intelligence',
    architecture: 'Prompt Formulation Engine + Context Injector + Multi-Model Templates',
    overview: 'An AI-powered website that helps users generate highly effective, tailored prompts for different AI tools (ChatGPT, Claude, Gemini, Midjourney) and complex tasks. Eliminates prompt ambiguity and drastically improves LLM output accuracy.',
    contributions: [
      'Architected prompt engineering algorithms incorporating role definition, context framing, few-shot examples, and output constraints.',
      'Categorized prompts across engineering disciplines: code generation, debugging, system architecture, research synthesis, and creative ideation.',
      'Added dynamic variable injection fields allowing users to customize parameters (tone, output schema, depth) with real-time preview.',
      'Integrated one-click clipboard copying and prompt history management for streamlined productivity.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Prompt Engineering', 'AI Architecture', 'Modern UI'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  xmaster_hub: {
    title: 'XMasterPyHub – Official Educational Platform',
    subtitle: 'Open-Access Developer & Engineering Learning Hub',
    badge: 'Educational Technology',
    architecture: 'Categorized Resource Ingestion + Study Repository + Community Gateway',
    overview: 'The official digital platform for XMasterPyHub, an educational initiative providing free programming resources, B.Tech study materials, picture notes, roadmaps, interview preparation packages, Python, SQL, DSA resources, and job notifications to students across universities.',
    contributions: [
      'Structured comprehensive resource directories for B.Tech R20 regulation subjects, semester handbooks, and faculty PPT slides.',
      'Curated visual "Picture Notes" that deconstruct intricate Python, SQL, and DSA concepts into digestible infographics.',
      'Designed comprehensive developer roadmaps for AI/ML, Data Science, and Full-Stack Web Development.',
      'Maintained a verified tech job alerts and internship opportunity repository to assist fresh graduates.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Resource Hub', 'Responsive UI', 'Content Architecture'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  interest_calc: {
    title: 'Premium Interest Calculator Website',
    subtitle: 'Modern Financial Analytics & Compound Growth Engine',
    badge: 'Web Application',
    architecture: 'Financial Math Engine + Dynamic Sliders + Interactive Data Breakdown',
    overview: 'A modern, high-precision interest calculator website crafted with a luxurious metallic interface that helps users calculate simple interest, compound interest, maturity amounts, and expected investment returns with instant visual feedback.',
    contributions: [
      'Formulated real-time mathematical algorithms for compound interest compounding frequencies (annually, quarterly, monthly).',
      'Constructed dynamic range sliders and numeric input sync for fluid user manipulation without page reloads.',
      'Visualized financial growth comparisons between principal investment and earned interest returns.',
      'Ensured 100% mobile-friendly responsive layout with high-contrast numerical metrics.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'Financial Algorithms', 'Interactive UI'],
    github: 'https://github.com/yaswanthkumaryejarla'
  },
  portfolio_suites: {
    title: 'Personal Portfolio Websites',
    subtitle: 'Bespoke Luxury Web Experiences & Modern UI/UX Development',
    badge: 'Web Development',
    architecture: 'Modular Web Architecture + GSAP Animations + 3D Micro-interactions',
    overview: 'Designing and developing high-performance, responsive personal portfolio websites with modern UI/UX, professional layouts, smooth animations, and interactive elements tailored for software developers and AI/ML engineers.',
    contributions: [
      'Engineered obsidian and metallic gold luxury design systems utilizing advanced CSS3 variables, glassmorphism, and radial gradients.',
      'Integrated GSAP and ScrollTrigger for staggered entrance reveals and active scrollspy navigation tracking.',
      'Implemented real-time 3D perspective mouse tilt transformations with dynamic specular reflection overlays.',
      'Achieved 100% cross-device responsiveness with zero framework bloat for instantaneous load times.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'GSAP Animations', '3D Transforms', 'UI/UX Design'],
    github: 'https://github.com/yaswanthkumaryejarla'
  }
};

function initModals() {
  const modal = document.getElementById('project-detail-modal');
  const resumeModal = document.getElementById('resume-viewer-modal');
  const certificateModal = document.getElementById('certificate-viewer-modal');
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

  // Project cards click
  const detailButtons = document.querySelectorAll('.open-project-detail-btn');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.getAttribute('data-project');
      const data = projectDetails[projectId];
      if (data && modal) {
        populateProjectModal(data);
        openModal(modal);
      }
    });
  });

  // Resume modal triggers
  const resumeTriggers = document.querySelectorAll('.open-resume-modal-btn');
  resumeTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(resumeModal);
    });
  });

  // Certificate modal triggers
  const certTriggers = document.querySelectorAll('.open-certificate-modal-btn');
  certTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const certTitle = btn.getAttribute('data-cert-title') || 'Certificate of Completion';
      const certOrg = btn.getAttribute('data-cert-org') || 'Authorized Issuer';
      const certDate = btn.getAttribute('data-cert-date') || 'Verified Credential';
      
      const modalTitleEl = document.getElementById('cert-modal-title');
      const modalOrgEl = document.getElementById('cert-modal-org');
      const modalDateEl = document.getElementById('cert-modal-date');
      
      if (modalTitleEl) modalTitleEl.textContent = certTitle;
      if (modalOrgEl) modalOrgEl.textContent = certOrg;
      if (modalDateEl) modalDateEl.textContent = certDate;

      openModal(certificateModal);
    });
  });

  // Close modals
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Close on outer backdrop click
  [modal, resumeModal, certificateModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeAllModals();
      });
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeAllModals() {
  document.querySelectorAll('.portfolio-modal').forEach(m => m.classList.remove('is-open'));
  document.body.style.overflow = '';
}

function populateProjectModal(data) {
  document.getElementById('modal-project-title').textContent = data.title;
  document.getElementById('modal-project-subtitle').textContent = data.subtitle;
  document.getElementById('modal-project-badge').textContent = data.badge;
  document.getElementById('modal-project-arch').textContent = data.architecture;
  document.getElementById('modal-project-overview').textContent = data.overview;
  
  const contribContainer = document.getElementById('modal-project-contributions');
  contribContainer.innerHTML = '';
  data.contributions.forEach(item => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2.5 text-zinc-300 text-sm leading-relaxed';
    li.innerHTML = `<span class="text-gold-champagne mt-1">✦</span> <span>${item}</span>`;
    contribContainer.appendChild(li);
  });

  const stackContainer = document.getElementById('modal-project-stack');
  stackContainer.innerHTML = '';
  data.stack.forEach(tech => {
    const span = document.createElement('span');
    span.className = 'tech-tag';
    span.textContent = tech;
    stackContainer.appendChild(span);
  });

  const githubBtn = document.getElementById('modal-project-github');
  if (githubBtn) githubBtn.href = data.github || 'https://github.com/yaswanthkumaryejarla';
}

/* ==========================================================================
   Contact Actions & Copy-to-Clipboard
   ========================================================================== */
function initContactActions() {
  // Copy buttons
  const copyButtons = document.querySelectorAll('.copy-trigger-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Copied!';
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        });
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('portfolio-contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const formStatus = document.getElementById('contact-form-status');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="status-dot-pulse"></span> Transmitting Message...';

      // Simulate sending and trigger mailto fallback option
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> Message Dispatched';
        if (window.lucide) window.lucide.createIcons();

        if (formStatus) {
          formStatus.innerHTML = `
            <div class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm">
              <p class="font-semibold mb-1">✓ Thank you, ${name}! Your transmission has been queued.</p>
              <p class="text-zinc-400 text-xs">A direct email draft is also prepared for immediate reach. You can also contact directly at <a href="mailto:yaswanthkumaryejarla@gmail.com" class="text-gold-champagne underline">yaswanthkumaryejarla@gmail.com</a>.</p>
            </div>
          `;
        }

        showToast('Message sent! Yaswanth will reply shortly.');
        contactForm.reset();

        // Create mailto link
        const mailtoUri = `mailto:yaswanthkumaryejarla@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry from ' + name)}&body=${encodeURIComponent("Sender: " + name + " (" + email + ")\n\n" + message)}`;
        window.open(mailtoUri, '_blank');
      }, 800);
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    toast.className = 'fixed bottom-8 right-8 z-50 bg-zinc-900 border border-gold-primary/60 text-gold-bright px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center gap-3 backdrop-blur-md transition-all duration-300 transform translate-y-12 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="text-gold-champagne">✦</span> <span>${message}</span>`;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
  }, 3200);
}

/* ==========================================================================
   GSAP Entrance Animations
   ========================================================================== */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;

  // Hero Reveal
  gsap.from('.hero-badge-anim', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('.hero-title-anim', {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.35
  });

  gsap.from('.hero-subtitle-anim', {
    y: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.5
  });

  gsap.from('.hero-stats-anim', {
    y: 35,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.65
  });

  gsap.from('.hero-btn-anim', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.85
  });

  // ScrollTrigger Animations
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal-on-scroll').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.stagger-card-grid').forEach(grid => {
      const cards = grid.children;
      gsap.from(cards, {
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });
    });
  }
}
