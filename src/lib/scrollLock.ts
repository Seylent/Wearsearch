type LockState = {
  count: number;
  overflow: string;
};

const state: LockState = {
  count: 0,
  overflow: '',
};

const canUseDom = () => typeof document !== 'undefined';

export const lockBodyScroll = () => {
  if (!canUseDom()) return;

  if (state.count === 0) {
    state.overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  state.count += 1;
};

export const unlockBodyScroll = () => {
  if (!canUseDom()) return;

  state.count = Math.max(0, state.count - 1);

  if (state.count === 0) {
    document.body.style.overflow = state.overflow;
  }
};

export const resetBodyScroll = () => {
  if (!canUseDom()) return;
  state.count = 0;
  document.body.style.overflow = state.overflow;
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
};
