export const navigateTo = (path, { replace = false } = {}) => {
  if (!path || typeof window === 'undefined') return;

  const current = `${window.location.pathname}${window.location.search}`;
  if (current === path) return;

  if (replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }

  window.dispatchEvent(new Event('app:navigate'));
};

export const handleInternalNav = (path, options) => (event) => {
  event.preventDefault();
  navigateTo(path, options);
};
