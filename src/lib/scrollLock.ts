type LockState = {
  count: number;
  overflow: string;
  paddingRight: string;
};

const state: LockState = {
  count: 0,
  overflow: '',
  paddingRight: '',
};

const canUseDom = () => typeof document !== 'undefined';

const getScrollbarWidth = () => {
  if (!canUseDom()) return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

const applyScrollLock = () => {
  const scrollbarWidth = getScrollbarWidth();
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.setAttribute('data-scroll-locked', 'true');
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
};

const removeScrollLock = () => {
  document.body.style.overflow = state.overflow || '';
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = state.paddingRight || '';
  document.body.removeAttribute('data-scroll-locked');
};

export const lockBodyScroll = () => {
  if (!canUseDom()) return;

  if (state.count === 0) {
    state.overflow = document.body.style.overflow;
    state.paddingRight = document.body.style.paddingRight;
    applyScrollLock();
  }

  state.count += 1;
};

export const unlockBodyScroll = () => {
  if (!canUseDom()) return;

  state.count = Math.max(0, state.count - 1);

  if (state.count === 0) {
    removeScrollLock();
  }
};

export const resetBodyScroll = () => {
  if (!canUseDom()) return;
  state.count = 0;
  state.overflow = '';
  state.paddingRight = '';
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.paddingRight = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.touchAction = '';
  document.documentElement.style.position = '';
  document.body.classList.remove('overflow-hidden', 'overflow-y-hidden', 'touch-none', 'fixed');
  document.documentElement.classList.remove(
    'overflow-hidden',
    'overflow-y-hidden',
    'touch-none',
    'fixed'
  );
  document.body.removeAttribute('data-scroll-locked');
};
