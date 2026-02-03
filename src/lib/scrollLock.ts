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
};
