/**
 * NanoScholar: Ultra-Low-Bandwidth Vanilla Frontend Controller
 * Complete interactive study portal with:
 * - 4-Theme Switcher (Ocean Light, Midnight Dark, Solar Sepia, Emerald Eco)
 * - 3D Interactive Flashcards Hub with 3 Difficulty Levels
 * - Gamified Quiz Arena with 3 Difficulty Levels
 * - Continuous Scroll-Based Navigation with Active Scrollspy
 * Zero framework runtime. Zero external CDN calls. Payload < 25 KB.
 */

import {
  LESSONS,
  SUBJECTS,
  FLASHCARDS,
  Lesson,
  QuizQuestion,
  Flashcard,
  DifficultyLevel,
  getAllQuizQuestions
} from './data.ts';

// State Types
interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  selectedOption: number | null;
  isAnswered: boolean;
  history: {
    question: QuizQuestion;
    userChoice: number;
    isCorrect: boolean;
  }[];
  activeSubject: string;
  activeDifficulty: string;
}

interface FlashcardSession {
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  masteredIds: number[];
  activeSubject: string;
  activeDifficulty: string;
}

interface ReadingRecord {
  percent: number;
  completed: boolean;
  lastReadTimestamp: number;
}

interface AppState {
  currentTheme: string;
  activeLessonId: string;
  selectedSubject: string;
  searchQuery: string;
  fontSize: 'normal' | 'large' | 'xl';
  isTextOnly: boolean;
  offlineLessonIds: string[];
  readingProgress: Record<string, ReadingRecord>;
  speechSynthUtterance: SpeechSynthesisUtterance | null;
  isSpeaking: boolean;
  quickHeroQuestionIndex: number;
  quiz: QuizSession;
  flashcard: FlashcardSession;
}

const STORAGE_KEYS = {
  THEME: 'nanoscholar_theme_v2',
  OFFLINE_LESSONS: 'nanoscholar_offline_lessons',
  SAVED_PROGRESS: 'nanoscholar_progress',
  FLASHCARD_MASTERED: 'nanoscholar_flashcard_mastered',
  READING_PROGRESS: 'nanoscholar_reading_progress_v2',
};

// Initialize State
const state: AppState = {
  currentTheme: localStorage.getItem(STORAGE_KEYS.THEME) || 'theme-ocean',
  activeLessonId: 'biology-photosynthesis',
  selectedSubject: 'all',
  searchQuery: '',
  fontSize: 'normal',
  isTextOnly: false,
  offlineLessonIds: loadSavedLessonIds(),
  readingProgress: loadReadingProgress(),
  speechSynthUtterance: null,
  isSpeaking: false,
  quickHeroQuestionIndex: 0,
  quiz: {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    selectedOption: null,
    isAnswered: false,
    history: [],
    activeSubject: 'all',
    activeDifficulty: 'all',
  },
  flashcard: {
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    masteredIds: loadMasteredFlashcardIds(),
    activeSubject: 'all',
    activeDifficulty: 'all',
  },
};

function loadReadingProgress(): Record<string, ReadingRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading reading progress', e);
  }
  return {
    'biology-photosynthesis': { percent: 45, completed: false, lastReadTimestamp: Date.now() },
    'math-pythagoras': { percent: 100, completed: true, lastReadTimestamp: Date.now() },
  };
}

function saveReadingProgress() {
  try {
    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(state.readingProgress));
  } catch (e) {
    console.error('Error saving reading progress', e);
  }
}

function getGlobalReadingStats() {
  const total = LESSONS.length;
  let completedCount = 0;
  let totalPercentSum = 0;

  LESSONS.forEach((lesson) => {
    const rec = state.readingProgress[lesson.id];
    if (rec) {
      if (rec.completed) completedCount++;
      totalPercentSum += Math.min(100, rec.percent);
    }
  });

  const avgPercent = total > 0 ? Math.round(totalPercentSum / total) : 0;
  return {
    total,
    completedCount,
    avgPercent,
  };
}

function updateGlobalReadingUI() {
  const stats = getGlobalReadingStats();

  const telemetryEl = document.getElementById('telemetry-read-progress');
  if (telemetryEl) {
    telemetryEl.textContent = `${stats.completedCount}/${stats.total} (${stats.avgPercent}%)`;
    if (stats.completedCount === stats.total) {
      telemetryEl.style.background = 'var(--color-success-bg)';
      telemetryEl.style.color = 'var(--color-success-text)';
      telemetryEl.style.borderColor = 'var(--color-success-border)';
    }
  }

  const globalCountEl = document.getElementById('global-read-count');
  const globalPctEl = document.getElementById('global-read-percent');
  const globalBadgeEl = document.getElementById('global-read-badge');
  const globalFillEl = document.getElementById('global-progress-fill');

  if (globalCountEl) globalCountEl.textContent = `${stats.completedCount} of ${stats.total}`;
  if (globalPctEl) globalPctEl.textContent = `${stats.avgPercent}%`;
  if (globalFillEl) {
    globalFillEl.style.width = `${stats.avgPercent}%`;
    if (stats.avgPercent >= 100) {
      globalFillEl.style.background = 'var(--color-success)';
    }
  }
  if (globalBadgeEl) {
    if (stats.completedCount === stats.total) {
      globalBadgeEl.className = 'progress-badge completed';
      globalBadgeEl.textContent = '✓ All Curricula Completed';
    } else if (stats.completedCount > 0 || stats.avgPercent > 0) {
      globalBadgeEl.className = 'progress-badge in-progress';
      globalBadgeEl.textContent = `${stats.avgPercent}% Read`;
    } else {
      globalBadgeEl.className = 'progress-badge not-started';
      globalBadgeEl.textContent = 'Not Started';
    }
  }
}

function loadSavedLessonIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_LESSONS);
    return raw ? JSON.parse(raw) : ['biology-photosynthesis', 'math-pythagoras'];
  } catch (e) {
    return ['biology-photosynthesis'];
  }
}

function saveSavedLessonIds() {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_LESSONS, JSON.stringify(state.offlineLessonIds));
  } catch (e) {
    console.error('Storage error', e);
  }
}

function loadMasteredFlashcardIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARD_MASTERED);
    return raw ? JSON.parse(raw) : [1, 4];
  } catch (e) {
    return [1, 4];
  }
}

function saveMasteredFlashcards() {
  try {
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_MASTERED, JSON.stringify(state.flashcard.masteredIds));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// Toast helper
function showToast(message: string, duration = 3000) {
  const toast = document.getElementById('toast-message');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Live Bandwidth & Telemetry Estimator
function updateTelemetry() {
  const htmlSize = document.documentElement.outerHTML.length;
  const totalBytes = htmlSize + 16000;
  const kb = (totalBytes / 1024).toFixed(1);
  const time2G = (totalBytes / 1024 / 6.25).toFixed(1);

  const payloadEl = document.getElementById('telemetry-payload');
  const speedEl = document.getElementById('telemetry-speed');
  const connEl = document.getElementById('telemetry-connection');

  if (payloadEl) payloadEl.textContent = `${kb} KB`;
  if (speedEl) speedEl.textContent = `~${time2G}s on 2G`;

  if (connEl) {
    const isOnline = navigator.onLine;
    connEl.textContent = isOnline ? 'Online (2G Ready)' : 'Offline Vault Active';
    connEl.style.color = isOnline ? 'var(--color-success)' : 'var(--color-warning)';
  }
}

// ==========================================================================
// THEME CHANGER SYSTEM
// ==========================================================================

function applyTheme(themeName: string) {
  state.currentTheme = themeName;
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);

  document.body.classList.remove('theme-ocean', 'theme-midnight', 'theme-sepia', 'theme-emerald');
  document.body.classList.add(themeName);

  // Update active indicator in header
  document.querySelectorAll('.theme-btn-dot').forEach((btn) => {
    const t = (btn as HTMLElement).getAttribute('data-theme');
    if (t === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const names: Record<string, string> = {
    'theme-ocean': 'Ocean Light Theme',
    'theme-midnight': 'Midnight Dark Theme (OLED Battery Saver)',
    'theme-sepia': 'Solar Sepia Theme (Eye Comfort)',
    'theme-emerald': 'Emerald Eco Theme (SDG 4)',
  };

  showToast(`Switched to ${names[themeName] || themeName}`);
}

// Smooth Scroll to Section
function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    const headerOffset = 70;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

// Select active lesson and scroll smoothly to Study Reader
function selectLesson(lessonId: string, smoothScroll = true) {
  state.activeLessonId = lessonId;
  localStorage.setItem(STORAGE_KEYS.SAVED_PROGRESS, lessonId);

  const resumeBtn = document.getElementById('home-resume-btn');
  const activeObj = LESSONS.find((l) => l.id === lessonId);
  if (resumeBtn && activeObj) {
    resumeBtn.textContent = `Continue: ${activeObj.title}`;
  }

  renderActiveLesson();

  if (smoothScroll) {
    scrollToSection('reader');
  }
}

// Toggle Save for Offline
function toggleSaveLesson(lessonId: string) {
  const index = state.offlineLessonIds.indexOf(lessonId);
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return;

  if (index === -1) {
    state.offlineLessonIds.push(lessonId);
    saveSavedLessonIds();
    showToast(`Saved "${lesson.title}" for offline study (${lesson.payloadSize})`);
  } else {
    state.offlineLessonIds.splice(index, 1);
    saveSavedLessonIds();
    showToast(`Removed "${lesson.title}" from offline storage`);
  }

  renderCourseCatalog();
  renderOfflineVault();
  updateReaderSaveButton();
}

// ==========================================================================
// COURSE CATALOG & SEARCH
// ==========================================================================

function renderCourseCatalog() {
  const container = document.getElementById('catalog-cards-grid');
  const countEl = document.getElementById('catalog-results-count');
  if (!container) return;

  const filtered = LESSONS.filter((lesson) => {
    const matchesSubject = state.selectedSubject === 'all' || lesson.subjectId === state.selectedSubject || lesson.subject.toLowerCase().includes(state.selectedSubject.toLowerCase());
    const query = state.searchQuery.toLowerCase();
    const matchesQuery = !query || lesson.title.toLowerCase().includes(query) || lesson.summary.toLowerCase().includes(query) || lesson.subject.toLowerCase().includes(query);
    return matchesSubject && matchesQuery;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${LESSONS.length} modules (${(filtered.reduce((acc, l) => acc + parseFloat(l.payloadSize), 0)).toFixed(1)} KB total payload)`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--color-surface); border: 1px dashed var(--color-border-dark); border-radius: var(--radius-lg);">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No modules found for "${state.searchQuery}"</p>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Try adjusting your search terms or browse all curriculum subjects.</p>
        <button id="clear-search-btn" class="btn btn-secondary btn-sm">Reset Search Filter</button>
      </div>
    `;
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.selectedSubject = 'all';
        const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement;
        const select = document.getElementById('catalog-subject-select') as HTMLSelectElement;
        if (searchInput) searchInput.value = '';
        if (select) select.value = 'all';
        renderCourseCatalog();
      });
    }
    return;
  }

  container.innerHTML = filtered
    .map((lesson, idx) => {
      const isSaved = state.offlineLessonIds.includes(lesson.id);
      const readRec = state.readingProgress[lesson.id] || { percent: 0, completed: false };
      const isCompleted = readRec.completed || readRec.percent >= 90;
      const readBadgeClass = isCompleted ? 'completed' : readRec.percent > 0 ? 'in-progress' : 'not-started';
      const readBadgeText = isCompleted ? '✓ Read' : readRec.percent > 0 ? `${readRec.percent}% read` : 'Unread';

      return `
      <article class="edu-card reveal-on-scroll delay-${(idx % 3) + 1}" aria-label="${lesson.title}">
        <div class="card-header">
          <div class="card-meta">
            <span style="font-weight: 700; color: var(--color-primary);">${lesson.subject}</span>
            <span class="card-meta-sep" aria-hidden="true">·</span>
            <span>${lesson.level}</span>
            <span class="card-meta-sep" aria-hidden="true">·</span>
            <span>${lesson.readTime}</span>
          </div>
          <h3 class="card-title">${lesson.title}</h3>
          <p class="card-desc">${lesson.summary}</p>

          <!-- Module Reading Progress Bar -->
          <div class="card-read-meta">
            <span style="color: var(--color-text-dim); font-size: 0.75rem; font-weight: 600;">Reading Progress:</span>
            <span class="progress-badge ${readBadgeClass}">${readBadgeText}</span>
          </div>
          <div class="card-read-track" title="${readRec.percent}% read">
            <div class="card-read-fill ${isCompleted ? 'completed' : ''}" style="width: ${readRec.percent}%;"></div>
          </div>
        </div>
        <div class="card-footer">
          <span class="payload-indicator" title="Transferred payload">${lesson.payloadSize}</span>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm save-lesson-btn" data-id="${lesson.id}" title="${isSaved ? 'Stored on device' : 'Save for offline'}">
              ${isSaved ? '✓ Saved' : '+ Save'}
            </button>
            <button class="btn btn-secondary btn-sm flash-module-btn" data-id="${lesson.subjectId}" title="Review flashcards for this topic">
              Cards
            </button>
            <button class="btn btn-primary btn-sm read-lesson-btn" data-id="${lesson.id}">
              Study ↓
            </button>
          </div>
        </div>
      </article>
    `;
    })
    .join('');

  initScrollReveal();

  container.querySelectorAll('.read-lesson-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) selectLesson(id, true);
    });
  });

  container.querySelectorAll('.save-lesson-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) toggleSaveLesson(id);
    });
  });

  container.querySelectorAll('.flash-module-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const subj = (e.currentTarget as HTMLElement).getAttribute('data-id') || 'all';
      startFlashcardsSession(subj, 'all');
      scrollToSection('flashcards');
    });
  });
}

// ==========================================================================
// READING PROGRESS ENGINE (PER-LESSON & CURRICULUM-WIDE)
// ==========================================================================

function renderArticleProgressUI() {
  const rec = state.readingProgress[state.activeLessonId] || {
    percent: 0,
    completed: false,
    lastReadTimestamp: Date.now(),
  };

  const valEl = document.getElementById('article-progress-percent');
  const fillEl = document.getElementById('article-progress-bar-fill');
  const badgeEl = document.getElementById('article-progress-status-badge');
  const cardEl = document.getElementById('reader-reading-progress-card');
  const markBtn = document.getElementById('toggle-mark-read-btn');
  const estTimeEl = document.getElementById('article-progress-time-est');

  if (valEl) valEl.textContent = `${rec.percent}%`;
  if (fillEl) {
    fillEl.style.width = `${rec.percent}%`;
    if (rec.completed || rec.percent >= 90) {
      fillEl.classList.add('completed');
    } else {
      fillEl.classList.remove('completed');
    }
  }

  if (badgeEl) {
    if (rec.completed) {
      badgeEl.className = 'progress-badge completed';
      badgeEl.textContent = '✓ Read';
    } else if (rec.percent > 0) {
      badgeEl.className = 'progress-badge in-progress';
      badgeEl.textContent = 'Reading';
    } else {
      badgeEl.className = 'progress-badge not-started';
      badgeEl.textContent = 'Unread';
    }
  }

  if (cardEl) {
    if (rec.completed) {
      cardEl.classList.add('completed');
    } else {
      cardEl.classList.remove('completed');
    }
  }

  if (markBtn) {
    markBtn.textContent = rec.completed ? '✓ Read (Reset)' : 'Mark as Read ✓';
  }

  if (estTimeEl) {
    if (rec.completed) {
      estTimeEl.textContent = '✓ Module completed';
    } else {
      const remainingPct = 100 - rec.percent;
      const mins = Math.max(1, Math.round((remainingPct / 100) * 3));
      estTimeEl.textContent = `~${mins} min left`;
    }
  }
}

function checkArticleScrollProgress() {
  const article = document.getElementById('lesson-article-target');
  if (!article) return;

  const rect = article.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const articleHeight = rect.height;

  if (articleHeight <= 100) return;

  // How far the viewport bottom has scrolled through the article
  const visiblePixels = windowHeight - rect.top;
  let pct = Math.round((visiblePixels / articleHeight) * 100);
  pct = Math.min(100, Math.max(0, pct));

  const currentRec = state.readingProgress[state.activeLessonId] || {
    percent: 0,
    completed: false,
    lastReadTimestamp: Date.now(),
  };

  // Only ratchet progress upward so scrolling back up doesn't lose reading credit
  if (pct > currentRec.percent) {
    currentRec.percent = pct;
    currentRec.lastReadTimestamp = Date.now();
    if (pct >= 90 && !currentRec.completed) {
      currentRec.completed = true;
      const lesson = LESSONS.find((l) => l.id === state.activeLessonId);
      showToast(`🎉 Completed reading "${lesson ? lesson.title : 'module'}"!`);
      renderCourseCatalog();
      renderSidebarList();
    }
    state.readingProgress[state.activeLessonId] = currentRec;
    saveReadingProgress();
    updateGlobalReadingUI();
    renderArticleProgressUI();
  }
}

function toggleMarkLessonRead() {
  const currentRec = state.readingProgress[state.activeLessonId] || {
    percent: 0,
    completed: false,
    lastReadTimestamp: Date.now(),
  };

  if (currentRec.completed) {
    currentRec.completed = false;
    currentRec.percent = 0;
    showToast('Reset reading progress for this module.');
  } else {
    currentRec.completed = true;
    currentRec.percent = 100;
    showToast('✓ Marked module as fully read!');
  }

  currentRec.lastReadTimestamp = Date.now();
  state.readingProgress[state.activeLessonId] = currentRec;
  saveReadingProgress();
  renderArticleProgressUI();
  updateGlobalReadingUI();
  renderCourseCatalog();
  renderSidebarList();
}

function renderSidebarList() {
  const sidebarList = document.getElementById('reader-sidebar-list');
  if (!sidebarList) return;

  sidebarList.innerHTML = LESSONS.map((item) => {
    const isActive = item.id === state.activeLessonId;
    const readRec = state.readingProgress[item.id] || { percent: 0, completed: false };
    const isDone = readRec.completed || readRec.percent >= 90;
    const pillClass = isDone ? 'completed' : readRec.percent > 0 ? 'in-progress' : 'not-started';
    const pillText = isDone ? '✓ Read' : readRec.percent > 0 ? `${readRec.percent}%` : '0%';

    return `
      <li class="lesson-list-item">
        <button class="lesson-select-btn ${isActive ? 'active' : ''}" data-id="${item.id}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.2rem;">
            <span style="font-size:0.75rem; color:var(--color-text-dim); font-weight:600;">${item.subject}</span>
            <span class="sidebar-read-pill ${pillClass}">${pillText}</span>
          </div>
          <span style="font-weight: ${isActive ? '700' : '500'};">${item.title}</span>
        </button>
      </li>
    `;
  }).join('');

  sidebarList.querySelectorAll('.lesson-select-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) selectLesson(id, false);
    });
  });
}

// ==========================================================================
// STUDY READER VIEW
// ==========================================================================

function renderActiveLesson() {
  const lesson = LESSONS.find((l) => l.id === state.activeLessonId) || LESSONS[0];
  const container = document.getElementById('lesson-article-target');

  renderSidebarList();

  if (!container) return;

  const isSaved = state.offlineLessonIds.includes(lesson.id);

  container.innerHTML = `
    <header class="reader-header">
      <div class="card-meta">
        <span style="font-weight: 700; color: var(--color-primary);">${lesson.subject}</span>
        <span class="card-meta-sep" aria-hidden="true">·</span>
        <span>${lesson.level}</span>
        <span class="card-meta-sep" aria-hidden="true">·</span>
        <span>${lesson.readTime}</span>
        <span class="card-meta-sep" aria-hidden="true">·</span>
        <span class="payload-indicator">Payload: ${lesson.payloadSize}</span>
      </div>
      <h1 style="margin: 0.5rem 0 0.75rem 0;">${lesson.title}</h1>
      <p style="font-size: 1.05rem; color: var(--color-text-muted); margin-bottom: 1rem; line-height: 1.6;">${lesson.summary}</p>
      
      <div class="reader-toolbar">
        <div class="toolbar-actions">
          <button id="reader-save-btn" class="btn btn-secondary btn-sm">
            ${isSaved ? '✓ Saved Offline' : '+ Save Offline'}
          </button>
          <button id="reader-speak-btn" class="btn btn-secondary btn-sm" title="Listen with local speech synthesizer (0 KB data)">
            🔊 Read Aloud
          </button>
          <button id="reader-export-btn" class="btn btn-secondary btn-sm" title="Download lightweight plaintext notes">
            ⬇ Export .txt
          </button>
          <button id="reader-print-btn" class="btn btn-secondary btn-sm" title="Ink-saving print format">
            🖨 Print
          </button>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button id="reader-flashcards-btn" class="btn btn-secondary btn-sm">
            🎴 Flashcards ↓
          </button>
          <button id="reader-quiz-btn" class="btn btn-primary btn-sm">
            🎯 Quiz (${lesson.quiz.length} Qs) ↓
          </button>
        </div>
      </div>
    </header>

    <!-- Interactive Lesson Reading Progress Bar -->
    <div class="reading-progress-card" id="reader-reading-progress-card">
      <div class="reading-progress-header">
        <div class="reading-progress-left">
          <span style="font-size: 1.1rem;" aria-hidden="true">📖</span>
          <span class="reading-progress-label">Lesson Reading Progress:</span>
          <strong id="article-progress-percent" class="reading-progress-val">0%</strong>
          <span id="article-progress-status-badge" class="progress-badge not-started">Unread</span>
        </div>
        <div class="reading-progress-right">
          <span id="article-progress-time-est" style="font-size: 0.8rem; color: var(--color-text-dim);">~3 min remaining</span>
          <button id="toggle-mark-read-btn" class="btn btn-secondary btn-sm" title="Mark this lesson as completed">
            Mark as Read ✓
          </button>
        </div>
      </div>
      <div class="reading-progress-track" role="progressbar" aria-label="Current lesson read progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        <div class="reading-progress-fill" id="article-progress-bar-fill" style="width: 0%;"></div>
      </div>
    </div>

    <section class="concept-box" aria-label="Key Concepts">
      <strong>Core Concepts Summary:</strong>
      <ul style="margin: 0.4rem 0 0 1.25rem; padding: 0;">
        ${lesson.keyConcepts.map((kc) => `<li><strong>${kc.title}:</strong> ${kc.desc}</li>`).join('')}
      </ul>
    </section>

    <figure class="diagram-box">
      ${lesson.svgDiagram}
      <div class="text-diagram-fallback" aria-label="Text diagram representation">
        ${escapeHtml(lesson.textDiagramFallback)}
      </div>
      <figcaption>${lesson.diagramCaption}</figcaption>
    </figure>

    ${lesson.contentSections
      .map(
        (sec) => `
      <section style="margin-bottom: 1.75rem;">
        <h2>${sec.heading}</h2>
        ${sec.paragraphs.map((p) => `<p style="line-height:1.65;">${p}</p>`).join('')}
        ${sec.keyTakeaway ? `<div class="concept-box" style="margin-top: 0.85rem;">${sec.keyTakeaway}</div>` : ''}
      </section>
    `
      )
      .join('')}

    <section style="margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
      <h3>Essential Vocabulary & Reference Terms</h3>
      <dl class="edu-terms">
        ${lesson.definitions
          .map(
            (d) => `
          <dt>${d.term}</dt>
          <dd>${d.definition}</dd>
        `
          )
          .join('')}
      </dl>
    </section>

    <section style="margin-top: 2.5rem; border: 1px solid var(--color-primary-border); background: var(--color-primary-light); padding: 1.5rem; border-radius: var(--radius-lg);">
      <h3 style="margin-top: 0; color: var(--color-primary);">Practice What You Just Read</h3>
      <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1rem;">
        Reinforce your memory with 3D Flashcards or test your understanding with multi-level quiz questions.
      </p>
      <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
        <button id="reader-launch-cards-bottom" class="btn btn-secondary">
          🎴 Launch Topic Flashcards ↓
        </button>
        <button id="reader-launch-quiz-bottom" class="btn btn-primary">
          🎯 Start Topic Assessment (${lesson.quiz.length} Questions) ↓
        </button>
      </div>
    </section>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2.5rem; border-top: 1px solid var(--color-border); padding-top: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
      <button id="prev-lesson-nav" class="btn btn-secondary btn-sm">← Previous Module</button>
      <button id="next-lesson-nav" class="btn btn-secondary btn-sm">Next Module →</button>
    </div>
  `;

  // Reader event handlers
  const saveBtn = document.getElementById('reader-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', () => toggleSaveLesson(lesson.id));

  const speakBtn = document.getElementById('reader-speak-btn');
  if (speakBtn) speakBtn.addEventListener('click', () => toggleSpeech(lesson));

  const exportBtn = document.getElementById('reader-export-btn');
  if (exportBtn) exportBtn.addEventListener('click', () => exportLessonText(lesson));

  const printBtn = document.getElementById('reader-print-btn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const flashBtn = document.getElementById('reader-flashcards-btn');
  if (flashBtn) {
    flashBtn.addEventListener('click', () => {
      startFlashcardsSession(lesson.subjectId, 'all');
      scrollToSection('flashcards');
    });
  }

  const quizBtn = document.getElementById('reader-quiz-btn');
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      startQuizSession(lesson.subjectId, 'all');
      scrollToSection('quiz-arena');
    });
  }

  const bottomFlashBtn = document.getElementById('reader-launch-cards-bottom');
  if (bottomFlashBtn) {
    bottomFlashBtn.addEventListener('click', () => {
      startFlashcardsSession(lesson.subjectId, 'all');
      scrollToSection('flashcards');
    });
  }

  const bottomQuizBtn = document.getElementById('reader-launch-quiz-bottom');
  if (bottomQuizBtn) {
    bottomQuizBtn.addEventListener('click', () => {
      startQuizSession(lesson.subjectId, 'all');
      scrollToSection('quiz-arena');
    });
  }

  const currentIndex = LESSONS.findIndex((l) => l.id === lesson.id);
  const prevBtn = document.getElementById('prev-lesson-nav') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('next-lesson-nav') as HTMLButtonElement | null;

  if (prevBtn) {
    prevBtn.disabled = currentIndex === 0;
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) selectLesson(LESSONS[currentIndex - 1].id, false);
    });
  }

  if (nextBtn) {
    nextBtn.disabled = currentIndex === LESSONS.length - 1;
    nextBtn.addEventListener('click', () => {
      if (currentIndex < LESSONS.length - 1) selectLesson(LESSONS[currentIndex + 1].id, false);
    });
  }

  const markReadBtn = document.getElementById('toggle-mark-read-btn');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', toggleMarkLessonRead);
  }

  renderArticleProgressUI();
}

function updateReaderSaveButton() {
  const saveBtn = document.getElementById('reader-save-btn');
  if (saveBtn) {
    const isSaved = state.offlineLessonIds.includes(state.activeLessonId);
    saveBtn.textContent = isSaved ? '✓ Saved Offline' : '+ Save Offline';
  }
}

// Text-to-Speech Engine
function toggleSpeech(lesson: Lesson) {
  if (!('speechSynthesis' in window)) {
    showToast('Browser text-to-speech is not supported on this device.');
    return;
  }

  if (state.isSpeaking) {
    stopSpeech();
    return;
  }

  const textContent = `${lesson.title}. Subject: ${lesson.subject}. ${lesson.summary}. ${lesson.contentSections
    .map((s) => s.heading + '. ' + s.paragraphs.join(' '))
    .join('. ')}`;

  const utterance = new SpeechSynthesisUtterance(textContent);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    state.isSpeaking = false;
    updateSpeechButton();
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    updateSpeechButton();
  };

  window.speechSynthesis.speak(utterance);
  state.isSpeaking = true;
  state.speechSynthUtterance = utterance;
  updateSpeechButton();
  showToast('Playing audio reading via local device engine (0 bytes downloaded)');
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.isSpeaking = false;
  state.speechSynthUtterance = null;
  updateSpeechButton();
}

function updateSpeechButton() {
  const btn = document.getElementById('reader-speak-btn');
  if (btn) {
    btn.textContent = state.isSpeaking ? '⏹ Stop Audio' : '🔊 Read Aloud';
  }
}

function exportLessonText(lesson: Lesson) {
  const textContent = `=====================================================
NANOSCHOLAR STUDY SHEET (Learn Without Limits)
UN SDG 4: Quality Education - Low-Bandwidth Portal
=====================================================

Title: ${lesson.title}
Subject: ${lesson.subject} | Level: ${lesson.level}
Estimated Read Time: ${lesson.readTime}

SUMMARY:
${lesson.summary}

KEY CONCEPTS:
${lesson.keyConcepts.map((k, i) => `${i + 1}. ${k.title}: ${k.desc}`).join('\n')}

TEXT DIAGRAM:
${lesson.textDiagramFallback}

CONTENT:
${lesson.contentSections
  .map(
    (sec) => `
--- ${sec.heading} ---
${sec.paragraphs.join('\n\n')}
`
  )
  .join('\n')}

VOCABULARY:
${lesson.definitions.map((d) => `* ${d.term}: ${d.definition}`).join('\n')}

=====================================================
NanoScholar: Free educational portal for all networks.
=====================================================`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NanoScholar_${lesson.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${lesson.id}.txt (${(textContent.length / 1024).toFixed(1)} KB)`);
}

// ==========================================================================
// INTERACTIVE 3D FLASHCARDS HUB (WITH 3 DIFFICULTY TIERS)
// ==========================================================================

function startFlashcardsSession(subject = 'all', difficulty = 'all') {
  state.flashcard.activeSubject = subject;
  state.flashcard.activeDifficulty = difficulty;
  state.flashcard.isFlipped = false;

  let pool = [...FLASHCARDS];

  if (subject !== 'all') {
    pool = pool.filter((c) => c.subjectId === subject);
  }

  if (difficulty !== 'all') {
    pool = pool.filter((c) => c.difficulty === difficulty);
  }

  state.flashcard.cards = pool;
  state.flashcard.currentIndex = 0;

  renderFlashcardsFilters();
  renderCurrentFlashcard();
}

function renderFlashcardsFilters() {
  const subjContainer = document.getElementById('flashcards-subject-pills');
  const diffContainer = document.getElementById('flashcards-difficulty-pills');

  if (subjContainer) {
    subjContainer.innerHTML = SUBJECTS.map((s) => {
      const isActive = state.flashcard.activeSubject === s.id;
      return `<button class="pill-btn ${isActive ? 'active' : ''}" data-subject="${s.id}">${s.name}</button>`;
    }).join('');

    subjContainer.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const s = (e.currentTarget as HTMLElement).getAttribute('data-subject') || 'all';
        startFlashcardsSession(s, state.flashcard.activeDifficulty);
      });
    });
  }

  if (diffContainer) {
    const diffs = [
      { id: 'all', label: 'All Levels' },
      { id: 'level-1', label: 'Level 1: Foundation' },
      { id: 'level-2', label: 'Level 2: Intermediate' },
      { id: 'level-3', label: 'Level 3: Advanced' },
    ];
    diffContainer.innerHTML = diffs.map((d) => {
      const isActive = state.flashcard.activeDifficulty === d.id;
      return `<button class="pill-btn ${isActive ? 'active' : ''}" data-diff="${d.id}">${d.label}</button>`;
    }).join('');

    diffContainer.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const d = (e.currentTarget as HTMLElement).getAttribute('data-diff') || 'all';
        startFlashcardsSession(state.flashcard.activeSubject, d);
      });
    });
  }
}

function renderCurrentFlashcard() {
  const cardStage = document.getElementById('flashcard-render-stage');
  const counterEl = document.getElementById('flashcard-counter-text');
  const progressFill = document.getElementById('flashcard-progress-fill');
  const masteryStatEl = document.getElementById('flashcards-mastered-stat');

  const { cards, currentIndex, isFlipped, masteredIds } = state.flashcard;
  const total = cards.length;

  // Update mastery count
  const masteredCount = cards.filter((c) => masteredIds.includes(c.id)).length;
  if (masteryStatEl) {
    masteryStatEl.textContent = `⭐ ${masteredCount} of ${total} Mastered`;
  }

  if (total === 0) {
    if (cardStage) {
      cardStage.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-lg);">
          <p style="font-weight: 600;">No flashcards match this filter combination.</p>
          <button id="flashcards-reset-filter-btn" class="btn btn-secondary btn-sm">Reset Filters</button>
        </div>
      `;
      const rBtn = document.getElementById('flashcards-reset-filter-btn');
      if (rBtn) {
        rBtn.addEventListener('click', () => startFlashcardsSession('all', 'all'));
      }
    }
    return;
  }

  const card = cards[currentIndex];
  const isMastered = masteredIds.includes(card.id);

  if (counterEl) {
    counterEl.textContent = `Card ${currentIndex + 1} of ${total}`;
  }
  if (progressFill) {
    const pct = Math.round(((currentIndex + 1) / total) * 100);
    progressFill.style.width = `${pct}%`;
  }

  if (!cardStage) return;

  const diffTagClass = card.difficulty === 'level-1' ? 'diff-tag-1' : card.difficulty === 'level-2' ? 'diff-tag-2' : 'diff-tag-3';

  cardStage.innerHTML = `
    <div class="flashcard-3d-stage">
      <div class="flashcard-inner ${isFlipped ? 'flipped' : ''}" id="flashcard-interactive-box" tabindex="0" role="button" aria-label="Flashcard: Click or press Space to flip">
        
        <!-- FRONT OF CARD -->
        <div class="flashcard-face flashcard-front">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="quiz-q-category">${card.subjectName}</span>
            <span class="diff-tag ${diffTagClass}">${card.difficultyLabel}</span>
          </div>

          <div class="flashcard-q-prompt">
            ${escapeHtml(card.front)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 0.75rem; font-size: 0.825rem; color: var(--color-text-dim);">
            <span>${card.hint ? `💡 Hint: ${escapeHtml(card.hint)}` : 'Tap to reveal answer'}</span>
            <span style="font-weight: 600; color: var(--color-primary);">Click or Space to Flip ↺</span>
          </div>
        </div>

        <!-- BACK OF CARD -->
        <div class="flashcard-face flashcard-back">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="quiz-q-category">${card.subjectName}</span>
            <span class="diff-tag ${diffTagClass}">${card.difficultyLabel}</span>
          </div>

          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.4rem;">
              Explanation / Answer:
            </div>
            <div class="flashcard-answer-text">
              ${escapeHtml(card.back)}
            </div>
            ${card.formulaOrKey ? `<div class="flashcard-formula-box">${escapeHtml(card.formulaOrKey)}</div>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 0.75rem;">
            <button id="fc-mark-review-btn" class="small-btn" style="color: var(--color-danger); border-color: var(--color-danger-border);">
              Needs Review
            </button>
            <button id="fc-mark-mastered-btn" class="small-btn" style="color: var(--color-success); border-color: var(--color-success-border); font-weight: 700;">
              ${isMastered ? '✓ Mastered' : '⭐ Mark as Mastered'}
            </button>
            <span style="font-size: 0.8rem; color: var(--color-text-dim);">Flip Back ↺</span>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach card flip
  const cardBox = document.getElementById('flashcard-interactive-box');
  if (cardBox) {
    cardBox.addEventListener('click', (e) => {
      // Don't flip if user clicked button on back
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      state.flashcard.isFlipped = !state.flashcard.isFlipped;
      cardBox.classList.toggle('flipped', state.flashcard.isFlipped);
    });

    cardBox.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        state.flashcard.isFlipped = !state.flashcard.isFlipped;
        cardBox.classList.toggle('flipped', state.flashcard.isFlipped);
      }
    });
  }

  // Mastery buttons
  const masterBtn = document.getElementById('fc-mark-mastered-btn');
  if (masterBtn) {
    masterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!masteredIds.includes(card.id)) {
        masteredIds.push(card.id);
        saveMasteredFlashcards();
        showToast(`Marked card #${card.id} as Mastered ⭐`);
        renderCurrentFlashcard();
      }
    });
  }

  const reviewBtn = document.getElementById('fc-mark-review-btn');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mIdx = masteredIds.indexOf(card.id);
      if (mIdx !== -1) {
        masteredIds.splice(mIdx, 1);
        saveMasteredFlashcards();
        showToast('Moved card back to study queue');
        renderCurrentFlashcard();
      } else {
        showToast('Added to review queue');
      }
    });
  }
}

// Flashcard controls
function setupFlashcardControls() {
  const prevBtn = document.getElementById('fc-prev-btn');
  const nextBtn = document.getElementById('fc-next-btn');
  const flipBtn = document.getElementById('fc-flip-btn');
  const shuffleBtn = document.getElementById('fc-shuffle-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.flashcard.currentIndex > 0) {
        state.flashcard.currentIndex--;
        state.flashcard.isFlipped = false;
        renderCurrentFlashcard();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.flashcard.currentIndex < state.flashcard.cards.length - 1) {
        state.flashcard.currentIndex++;
        state.flashcard.isFlipped = false;
        renderCurrentFlashcard();
      } else {
        showToast('Reached the end of this deck! Reviewing from the start.');
        state.flashcard.currentIndex = 0;
        state.flashcard.isFlipped = false;
        renderCurrentFlashcard();
      }
    });
  }

  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      const box = document.getElementById('flashcard-interactive-box');
      if (box) {
        state.flashcard.isFlipped = !state.flashcard.isFlipped;
        box.classList.toggle('flipped', state.flashcard.isFlipped);
      }
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      state.flashcard.cards = [...state.flashcard.cards].sort(() => 0.5 - Math.random());
      state.flashcard.currentIndex = 0;
      state.flashcard.isFlipped = false;
      renderCurrentFlashcard();
      showToast('Shuffled flashcard deck');
    });
  }
}

// ==========================================================================
// INTERACTIVE GAMIFIED QUIZ ARENA (WITH 3 DIFFICULTY TIERS)
// ==========================================================================

function startQuizSession(subject = 'all', difficulty = 'all') {
  state.quiz.activeSubject = subject;
  state.quiz.activeDifficulty = difficulty;

  let pool = getAllQuizQuestions();

  if (subject !== 'all') {
    pool = pool.filter((q) => q.subjectId === subject);
  }

  if (difficulty !== 'all') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  state.quiz.questions = shuffled.slice(0, 5);
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.streak = 0;
  state.quiz.selectedOption = null;
  state.quiz.isAnswered = false;
  state.quiz.history = [];

  renderQuizFilters();
  renderCurrentQuizQuestion();
}

function renderQuizFilters() {
  const subjContainer = document.getElementById('quiz-subject-pills-container');
  const diffContainer = document.getElementById('quiz-difficulty-pills-container');

  if (subjContainer) {
    subjContainer.innerHTML = SUBJECTS.map((s) => {
      const isActive = state.quiz.activeSubject === s.id;
      return `<button class="pill-btn ${isActive ? 'active' : ''}" data-subject="${s.id}">${s.name}</button>`;
    }).join('');

    subjContainer.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const subj = (e.currentTarget as HTMLElement).getAttribute('data-subject') || 'all';
        startQuizSession(subj, state.quiz.activeDifficulty);
      });
    });
  }

  if (diffContainer) {
    const diffs = [
      { id: 'all', label: 'All Levels' },
      { id: 'level-1', label: 'Level 1: Foundation' },
      { id: 'level-2', label: 'Level 2: Intermediate' },
      { id: 'level-3', label: 'Level 3: Advanced' },
    ];
    diffContainer.innerHTML = diffs.map((d) => {
      const isActive = state.quiz.activeDifficulty === d.id;
      return `<button class="pill-btn ${isActive ? 'active' : ''}" data-diff="${d.id}">${d.label}</button>`;
    }).join('');

    diffContainer.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const d = (e.currentTarget as HTMLElement).getAttribute('data-diff') || 'all';
        startQuizSession(state.quiz.activeSubject, d);
      });
    });
  }
}

function renderCurrentQuizQuestion() {
  const qCard = document.getElementById('quiz-active-question-card');
  const compCard = document.getElementById('quiz-completion-card');
  const progressFill = document.getElementById('quiz-progress-fill');
  const scoreTicker = document.getElementById('quiz-score-ticker');
  const streakTicker = document.getElementById('quiz-streak-ticker');
  const counterText = document.getElementById('quiz-question-counter');

  if (compCard) compCard.style.display = 'none';
  if (qCard) qCard.style.display = 'block';

  const { questions, currentIndex, score, streak } = state.quiz;
  const total = questions.length;

  if (total === 0) {
    if (qCard) {
      qCard.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <p style="font-weight:600;">No questions found for this topic and difficulty level.</p>
          <button id="quiz-reset-filters-btn" class="btn btn-secondary btn-sm">Reset Quiz Filters</button>
        </div>
      `;
      const rBtn = document.getElementById('quiz-reset-filters-btn');
      if (rBtn) rBtn.addEventListener('click', () => startQuizSession('all', 'all'));
    }
    return;
  }

  const q = questions[currentIndex];
  state.quiz.isAnswered = false;
  state.quiz.selectedOption = null;

  const pct = Math.round(((currentIndex) / total) * 100);
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (scoreTicker) scoreTicker.textContent = `${score} XP`;
  if (streakTicker) streakTicker.textContent = streak > 0 ? `🔥 ${streak}` : `0`;
  if (counterText) counterText.textContent = `Question ${currentIndex + 1} of ${total}`;

  if (!qCard) return;

  const letters = ['A', 'B', 'C', 'D'];
  const diffTagClass = q.difficulty === 'level-1' ? 'diff-tag-1' : q.difficulty === 'level-2' ? 'diff-tag-2' : 'diff-tag-3';

  qCard.innerHTML = `
    <div class="quiz-q-meta">
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <span class="quiz-q-category">${q.subjectName}</span>
        <span class="diff-tag ${diffTagClass}">${q.difficultyLabel}</span>
      </div>
      <span style="font-weight: 600; color: var(--color-text-dim);">+100 Points</span>
    </div>

    <h2 class="quiz-question-prompt">${q.question}</h2>

    <div class="quiz-options-list" id="quiz-options-container">
      ${q.options
        .map(
          (opt, idx) => `
        <button class="quiz-option-btn" data-index="${idx}">
          <span class="quiz-option-letter">${letters[idx]}</span>
          <span style="flex: 1;">${escapeHtml(opt)}</span>
        </button>
      `
        )
        .join('')}
    </div>

    <div id="quiz-explanation-box" class="quiz-explanation-card"></div>

    <div class="quiz-footer-actions">
      <span style="font-size: 0.85rem; color: var(--color-text-dim);">Select an answer to verify</span>
      <button id="quiz-next-btn" class="btn btn-primary" style="display: none;">
        ${currentIndex === total - 1 ? 'View Final Results →' : 'Next Question →'}
      </button>
    </div>
  `;

  const optionButtons = qCard.querySelectorAll('.quiz-option-btn');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (state.quiz.isAnswered) return;
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
      handleOptionSelected(idx, q);
    });
  });

  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.quiz.currentIndex < total - 1) {
        state.quiz.currentIndex++;
        renderCurrentQuizQuestion();
      } else {
        renderQuizCompletion();
      }
    });
  }
}

function handleOptionSelected(selectedIndex: number, question: QuizQuestion) {
  state.quiz.isAnswered = true;
  state.quiz.selectedOption = selectedIndex;

  const isCorrect = selectedIndex === question.correctIndex;
  if (isCorrect) {
    state.quiz.score += 100;
    state.quiz.streak++;
  } else {
    state.quiz.streak = 0;
  }

  state.quiz.history.push({
    question,
    userChoice: selectedIndex,
    isCorrect,
  });

  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  optionButtons.forEach((btn, idx) => {
    (btn as HTMLButtonElement).disabled = true;
    if (idx === question.correctIndex) {
      btn.classList.add('correct');
    } else if (idx === selectedIndex) {
      btn.classList.add('incorrect');
    }
  });

  const expBox = document.getElementById('quiz-explanation-box');
  if (expBox) {
    expBox.style.display = 'block';
    expBox.className = `quiz-explanation-card ${isCorrect ? 'correct' : 'incorrect'}`;
    expBox.innerHTML = `
      <strong>${isCorrect ? '✓ Correct Answer!' : '✗ Not Quite.'}</strong> ${escapeHtml(question.explanation)}
    `;
  }

  const scoreTicker = document.getElementById('quiz-score-ticker');
  const streakTicker = document.getElementById('quiz-streak-ticker');
  if (scoreTicker) scoreTicker.textContent = `${state.quiz.score} XP`;
  if (streakTicker) streakTicker.textContent = state.quiz.streak > 0 ? `🔥 ${state.quiz.streak}` : `0`;

  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) {
    nextBtn.style.display = 'inline-flex';
    nextBtn.focus();
  }
}

function renderQuizCompletion() {
  const qCard = document.getElementById('quiz-active-question-card');
  const compCard = document.getElementById('quiz-completion-card');
  const progressFill = document.getElementById('quiz-progress-fill');

  if (qCard) qCard.style.display = 'none';
  if (!compCard) return;

  compCard.style.display = 'block';
  if (progressFill) progressFill.style.width = '100%';

  const total = state.quiz.questions.length;
  const correctCount = state.quiz.history.filter((h) => h.isCorrect).length;
  const accuracy = Math.round((correctCount / total) * 100);

  let badgeTitle = 'Scholar in Training';
  let badgeDesc = 'Keep reviewing the flashcards and study modules to master every topic.';
  if (accuracy === 100) {
    badgeTitle = '🏆 NanoScholar Master';
    badgeDesc = 'Flawless performance! You answered every question with perfect accuracy.';
  } else if (accuracy >= 80) {
    badgeTitle = '🌟 Honor Roll Scholar';
    badgeDesc = 'Outstanding grasp of foundational scientific and mathematical concepts.';
  } else if (accuracy >= 60) {
    badgeTitle = '📚 Proficient Learner';
    badgeDesc = 'Good effort! Review the detailed explanations below to reinforce your understanding.';
  }

  const circ = 352;
  const offset = circ - (accuracy / 100) * circ;

  compCard.innerHTML = `
    <div class="score-circle-wrap">
      <svg width="140" height="140" class="score-circle-svg">
        <circle cx="70" cy="70" r="56" stroke="var(--color-border)" stroke-width="10" fill="none" />
        <circle cx="70" cy="70" r="56" stroke="var(--color-primary)" stroke-width="10" fill="none"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s ease;" />
      </svg>
      <div class="score-circle-text">${accuracy}%</div>
    </div>

    <h2 style="margin-top: 0; font-size: 1.6rem;">${badgeTitle}</h2>
    <p style="color: var(--color-text-muted); max-width: 50ch; margin: 0 auto 1.5rem auto;">${badgeDesc}</p>

    <div class="stats-strip" style="max-width: 650px; margin: 0 auto 2rem auto;">
      <div class="stat-box">
        <div class="stat-num">${correctCount} / ${total}</div>
        <div class="stat-label">Correct Answers</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${state.quiz.score}</div>
        <div class="stat-label">Total XP Points</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${state.quiz.history.reduce((max, h) => h.isCorrect ? Math.max(max, 1) : max, 0)}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="stat-box">
        <div class="stat-num" style="color: var(--color-success);">&lt; 0.5 KB</div>
        <div class="stat-label">Data Transferred</div>
      </div>
    </div>

    <div class="review-items-list">
      <h3 style="margin-top: 0; margin-bottom: 1rem;">Assessment Question Review</h3>
      ${state.quiz.history
        .map(
          (item, idx) => `
        <div class="review-item-row" style="border-left: 4px solid ${item.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'};">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem;">
            ${idx + 1}. ${escapeHtml(item.question.question)}
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 0.25rem;">
            Your Answer: <strong style="color: ${item.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'};">
              ${escapeHtml(item.question.options[item.userChoice])} (${item.isCorrect ? '✓ Correct' : '✗ Missed'})
            </strong>
          </div>
          ${
            !item.isCorrect
              ? `<div style="font-size: 0.85rem; color: var(--color-success); margin-bottom: 0.25rem;">
                  Correct Answer: <strong>${escapeHtml(item.question.options[item.question.correctIndex])}</strong>
                 </div>`
              : ''
          }
          <div style="font-size: 0.8rem; color: var(--color-text-dim); margin-top: 0.4rem;">
            <strong>Explanation:</strong> ${escapeHtml(item.question.explanation)}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
      <button id="quiz-retry-btn" class="btn btn-primary">Retake Quiz</button>
      <button id="quiz-other-subject-btn" class="btn btn-secondary">Try Another Level/Subject</button>
      <button id="quiz-flashcards-cta-btn" class="btn btn-secondary">Review with Flashcards ↓</button>
      <button id="quiz-download-report-btn" class="btn btn-secondary">Download Scorecard (.txt)</button>
    </div>
  `;

  const retryBtn = document.getElementById('quiz-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      startQuizSession(state.quiz.activeSubject, state.quiz.activeDifficulty);
    });
  }

  const otherSubjBtn = document.getElementById('quiz-other-subject-btn');
  if (otherSubjBtn) {
    otherSubjBtn.addEventListener('click', () => {
      startQuizSession('all', 'all');
    });
  }

  const fcCtaBtn = document.getElementById('quiz-flashcards-cta-btn');
  if (fcCtaBtn) {
    fcCtaBtn.addEventListener('click', () => {
      startFlashcardsSession(state.quiz.activeSubject, state.quiz.activeDifficulty);
      scrollToSection('flashcards');
    });
  }

  const downloadBtn = document.getElementById('quiz-download-report-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadQuizReport);
  }

  compCard.scrollIntoView({ behavior: 'smooth' });
}

function downloadQuizReport() {
  const { score, history, activeSubject, activeDifficulty } = state.quiz;
  const total = history.length;
  const correct = history.filter((h) => h.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);

  const report = `=====================================================
NANOSCHOLAR ASSESSMENT REPORT
Subject: ${activeSubject.toUpperCase()} | Tier: ${activeDifficulty.toUpperCase()}
Score: ${score} XP | Accuracy: ${accuracy}% (${correct}/${total} Correct)
=====================================================

DETAILED BREAKDOWN:
${history
  .map(
    (h, idx) => `
${idx + 1}. [${h.question.difficultyLabel}] ${h.question.question}
Your Choice: ${h.question.options[h.userChoice]} [${h.isCorrect ? 'CORRECT' : 'INCORRECT'}]
Correct Answer: ${h.question.options[h.question.correctIndex]}
Pedagogical Note: ${h.question.explanation}
`
  )
  .join('\n')}

=====================================================
NanoScholar: Learn Without Limits.
=====================================================`;

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NanoScholar_Quiz_Report_${accuracy}pct.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded quiz report summary');
}

// ==========================================================================
// HOMEPAGE QUICK QUIZ SPRINT WIDGET
// ==========================================================================

function renderHeroQuickQuiz() {
  const container = document.getElementById('hero-quick-quiz-container');
  if (!container) return;

  const allQ = getAllQuizQuestions();
  const q = allQ[state.quickHeroQuestionIndex % allQ.length];

  const diffTagClass = q.difficulty === 'level-1' ? 'diff-tag-1' : q.difficulty === 'level-2' ? 'diff-tag-2' : 'diff-tag-3';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
      <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">
        Quick 60-Second Knowledge Sprint
      </span>
      <span class="diff-tag ${diffTagClass}">${q.difficultyLabel}</span>
    </div>
    <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 1rem; color: var(--color-text);">
      ${escapeHtml(q.question)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1rem;">
      ${q.options
        .map(
          (opt, idx) => `
        <button class="hero-quiz-opt small-btn" data-idx="${idx}" style="text-align: left; padding: 0.55rem 0.75rem; font-size: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);">
          <strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(opt)}
        </button>
      `
        )
        .join('')}
    </div>
    <div id="hero-quiz-feedback" style="display: none; font-size: 0.8rem; margin-bottom: 0.75rem; padding: 0.5rem; border-radius: 4px;"></div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <button id="hero-quiz-next-btn" class="btn btn-secondary btn-sm">Skip / Next</button>
      <button id="hero-quiz-full-btn" class="btn btn-primary btn-sm">Quiz Arena ↓</button>
    </div>
  `;

  container.querySelectorAll('.hero-quiz-opt').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      const isCorrect = idx === q.correctIndex;
      const fb = document.getElementById('hero-quiz-feedback');
      if (fb) {
        fb.style.display = 'block';
        fb.style.backgroundColor = isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger-bg)';
        fb.style.color = isCorrect ? 'var(--color-success-text)' : 'var(--color-danger-text)';
        fb.style.border = `1px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`;
        fb.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${escapeHtml(q.explanation)}`;
      }
      container.querySelectorAll('.hero-quiz-opt').forEach((b, bIdx) => {
        (b as HTMLButtonElement).disabled = true;
        if (bIdx === q.correctIndex) {
          (b as HTMLElement).style.borderColor = 'var(--color-success)';
          (b as HTMLElement).style.backgroundColor = 'var(--color-success-bg)';
          (b as HTMLElement).style.fontWeight = 'bold';
        }
      });
    });
  });

  const nextBtn = document.getElementById('hero-quiz-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.quickHeroQuestionIndex++;
      renderHeroQuickQuiz();
    });
  }

  const fullBtn = document.getElementById('hero-quiz-full-btn');
  if (fullBtn) {
    fullBtn.addEventListener('click', () => {
      scrollToSection('quiz-arena');
    });
  }
}

// ==========================================================================
// OFFLINE VAULT VIEW
// ==========================================================================

function renderOfflineVault() {
  const container = document.getElementById('offline-vault-list');
  const storageCountEl = document.getElementById('vault-storage-used');
  if (!container) return;

  const savedLessons = LESSONS.filter((l) => state.offlineLessonIds.includes(l.id));
  const rawBytes = JSON.stringify(savedLessons).length;
  const storageKb = (rawBytes / 1024).toFixed(1);

  if (storageCountEl) {
    storageCountEl.textContent = `${savedLessons.length} lessons stored (${storageKb} KB of ~5,000 KB browser cache capacity used)`;
  }

  if (savedLessons.length === 0) {
    container.innerHTML = `
      <div class="vault-empty-state">
        <h3 style="margin-top: 0;">No Offline Lessons Stored</h3>
        <p>Save lessons while you have a connection so you can study anytime with zero network usage.</p>
        <button id="vault-browse-btn" class="btn btn-primary btn-sm">Browse Lessons Catalog</button>
      </div>
    `;
    const bBtn = document.getElementById('vault-browse-btn');
    if (bBtn) bBtn.addEventListener('click', () => scrollToSection('curriculum'));
    return;
  }

  container.innerHTML = `
    <div class="grid-2">
      ${savedLessons
        .map(
          (lesson) => `
        <article class="edu-card">
          <div class="card-header">
            <div class="card-meta">
              <span style="font-weight:700; color:var(--color-primary);">${lesson.subject}</span>
              <span class="card-meta-sep" aria-hidden="true">·</span>
              <span>${lesson.readTime}</span>
            </div>
            <h3 class="card-title">${lesson.title}</h3>
            <p class="card-desc">${lesson.summary}</p>
          </div>
          <div class="card-footer">
            <span class="payload-indicator">Cached (${lesson.payloadSize})</span>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm vault-remove-btn" data-id="${lesson.id}">Remove</button>
              <button class="btn btn-primary btn-sm vault-read-btn" data-id="${lesson.id}">Study ↓</button>
            </div>
          </div>
        </article>
      `
        )
        .join('')}
    </div>
  `;

  container.querySelectorAll('.vault-read-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) selectLesson(id, true);
    });
  });

  container.querySelectorAll('.vault-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) toggleSaveLesson(id);
    });
  });
}

function exportAllOfflineNotes() {
  const savedLessons = LESSONS.filter((l) => state.offlineLessonIds.includes(l.id));
  if (savedLessons.length === 0) {
    showToast('No saved lessons to export.');
    return;
  }

  const combined = `=====================================================
NANOSCHOLAR - COMPLETE OFFLINE REVISION NOTEBOOK
${savedLessons.length} Modules Compiled for Offline Study
=====================================================

${savedLessons
  .map(
    (l, idx) => `
-----------------------------------------------------
MODULE ${idx + 1}: ${l.title} (${l.subject})
-----------------------------------------------------
Summary: ${l.summary}

Key Concepts:
${l.keyConcepts.map((k) => `* ${k.title}: ${k.desc}`).join('\n')}

Definitions:
${l.definitions.map((d) => `* ${d.term}: ${d.definition}`).join('\n')}
`
  )
  .join('\n\n')}
`;

  const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NanoScholar_Offline_Notebook_${savedLessons.length}_lessons.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported all ${savedLessons.length} modules (${(combined.length / 1024).toFixed(1)} KB)`);
}

function clearOfflineCache() {
  if (confirm('Clear all offline cached study modules from this browser?')) {
    state.offlineLessonIds = [];
    saveSavedLessonIds();
    renderOfflineVault();
    showToast('Offline cache cleared.');
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ==========================================================================
// SCROLLSPY & SCROLL PROGRESS
// ==========================================================================

function initScrollProgressAndSpy() {
  const progressBar = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const siteHeader = document.querySelector('.site-header');

  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (siteHeader) {
      if (scrollTop > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    if (scrollTopBtn) {
      if (scrollTop > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    let currentActiveId = '';
    sections.forEach((sec) => {
      const top = (sec as HTMLElement).offsetTop - 120;
      const height = (sec as HTMLElement).offsetHeight;
      if (scrollTop >= top && scrollTop < top + height) {
        currentActiveId = sec.getAttribute('id') || '';
      }
    });

    if (currentActiveId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentActiveId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Update real-time active lesson reading progress
    checkArticleScrollProgress();
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

function initPacketRaceSimulator() {
  const rerunBtn = document.getElementById('rerun-packet-race-btn');
  if (!rerunBtn) return;

  rerunBtn.addEventListener('click', () => {
    const dots = document.querySelectorAll('.packet-dot');
    dots.forEach((d) => {
      const el = d as HTMLElement;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    showToast('Restarted packet race');
  });
}

function setupEventListeners() {
  window.addEventListener('online', updateTelemetry);
  window.addEventListener('offline', updateTelemetry);

  // Theme Picker Dots
  document.querySelectorAll('.theme-btn-dot').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const t = (e.currentTarget as HTMLElement).getAttribute('data-theme');
      if (t) applyTheme(t);
    });
  });

  const textOnlyToggle = document.getElementById('toggle-text-only-btn');
  if (textOnlyToggle) {
    textOnlyToggle.addEventListener('click', () => {
      state.isTextOnly = !state.isTextOnly;
      document.body.classList.toggle('text-only', state.isTextOnly);
      textOnlyToggle.textContent = state.isTextOnly ? 'Diagrams: Off' : 'Diagrams: On';
      showToast(state.isTextOnly ? 'Text-Only Mode: Vector diagrams hidden' : 'Diagrams Enabled');
    });
  }

  const fontCycleBtn = document.getElementById('toggle-font-btn');
  if (fontCycleBtn) {
    fontCycleBtn.addEventListener('click', () => {
      document.body.classList.remove('font-large', 'font-xl');
      if (state.fontSize === 'normal') {
        state.fontSize = 'large';
        document.body.classList.add('font-large');
        fontCycleBtn.textContent = 'Font: Large';
      } else if (state.fontSize === 'large') {
        state.fontSize = 'xl';
        document.body.classList.add('font-xl');
        fontCycleBtn.textContent = 'Font: XL';
      } else {
        state.fontSize = 'normal';
        fontCycleBtn.textContent = 'Font: Normal';
      }
    });
  }

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = (e.currentTarget as HTMLElement).getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const targetId = href.substring(1);
        scrollToSection(targetId);
      }
    });
  });

  const homeBrowseBtn = document.getElementById('home-browse-btn');
  if (homeBrowseBtn) homeBrowseBtn.addEventListener('click', () => scrollToSection('curriculum'));

  const homeResumeBtn = document.getElementById('home-resume-btn');
  if (homeResumeBtn) {
    homeResumeBtn.addEventListener('click', () => {
      const savedId = localStorage.getItem(STORAGE_KEYS.SAVED_PROGRESS) || 'biology-photosynthesis';
      selectLesson(savedId, true);
    });
  }

  const homeQuizLaunchBtn = document.getElementById('home-quiz-launch-btn');
  if (homeQuizLaunchBtn) {
    homeQuizLaunchBtn.addEventListener('click', () => scrollToSection('quiz-arena'));
  }

  const homeCardsLaunchBtn = document.getElementById('home-cards-launch-btn');
  if (homeCardsLaunchBtn) {
    homeCardsLaunchBtn.addEventListener('click', () => scrollToSection('flashcards'));
  }

  document.querySelectorAll('.home-subject-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const subj = (e.currentTarget as HTMLElement).getAttribute('data-subject');
      if (subj) {
        state.selectedSubject = subj;
        const sel = document.getElementById('catalog-subject-select') as HTMLSelectElement;
        if (sel) sel.value = subj;
        renderCourseCatalog();
        scrollToSection('curriculum');
      }
    });
  });

  const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = (e.target as HTMLInputElement).value;
      renderCourseCatalog();
    });
  }

  const subjectSelect = document.getElementById('catalog-subject-select') as HTMLSelectElement;
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      state.selectedSubject = (e.target as HTMLSelectElement).value;
      renderCourseCatalog();
    });
  }

  const exportAllBtn = document.getElementById('vault-export-all-btn');
  if (exportAllBtn) exportAllBtn.addEventListener('click', exportAllOfflineNotes);

  const clearVaultBtn = document.getElementById('vault-clear-all-btn');
  if (clearVaultBtn) clearVaultBtn.addEventListener('click', clearOfflineCache);

  const dataBudgetInput = document.getElementById('sim-budget-input') as HTMLInputElement;
  const budgetOutput = document.getElementById('sim-budget-result');
  if (dataBudgetInput && budgetOutput) {
    const calc = () => {
      const mb = parseFloat(dataBudgetInput.value) || 10;
      const totalKb = mb * 1024;
      const lessonCount = Math.floor(totalKb / 14);
      const videoMinutes = (mb / 15).toFixed(1);
      budgetOutput.innerHTML = `
        With <strong>${mb} MB</strong> of mobile data:
        <ul style="margin: 0.5rem 0 0 1.25rem;">
          <li><strong>${lessonCount.toLocaleString()}</strong> complete NanoScholar lessons with diagrams & quizzes.</li>
          <li>Or barely <strong>${videoMinutes} minutes</strong> of low-quality video streaming before data runs out.</li>
        </ul>
      `;
    };
    dataBudgetInput.addEventListener('input', calc);
    calc();
  }

  setupFlashcardControls();

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const targetEl = e.target as HTMLElement;
    if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'SELECT' || targetEl.tagName === 'TEXTAREA')) {
      return;
    }

    if (e.altKey) {
      if (e.key === '1') { e.preventDefault(); scrollToSection('overview'); }
      else if (e.key === '2') { e.preventDefault(); scrollToSection('curriculum'); }
      else if (e.key === '3') { e.preventDefault(); scrollToSection('reader'); }
      else if (e.key === '4') { e.preventDefault(); scrollToSection('flashcards'); }
      else if (e.key === '5') { e.preventDefault(); scrollToSection('quiz-arena'); }
      else if (e.key === '6') { e.preventDefault(); scrollToSection('packet-lab'); }
      else if (e.key === '7') { e.preventDefault(); scrollToSection('offline-vault'); }
    } else if (e.key === 'ArrowRight') {
      const fcSec = document.getElementById('flashcards');
      if (fcSec) {
        const rect = fcSec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const nextBtn = document.getElementById('fc-next-btn');
          if (nextBtn) nextBtn.click();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      const fcSec = document.getElementById('flashcards');
      if (fcSec) {
        const rect = fcSec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const prevBtn = document.getElementById('fc-prev-btn');
          if (prevBtn) prevBtn.click();
        }
      }
    }
  });
}

function init() {
  applyTheme(state.currentTheme);
  setupEventListeners();
  renderCourseCatalog();
  renderActiveLesson();
  startFlashcardsSession('all', 'all');
  startQuizSession('all', 'all');
  renderHeroQuickQuiz();
  renderOfflineVault();
  initScrollProgressAndSpy();
  initScrollReveal();
  initPacketRaceSimulator();
  updateGlobalReadingUI();
  updateTelemetry();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
