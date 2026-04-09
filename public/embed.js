/**
 * TakeShape Contact + Video Intake Embed Script
 *
 * Inline usage:
 * <div id="takeshape-embed-container"></div>
 * <script src="https://app.yourdomain.com/embed.js"></script>
 * <script>
 *   TakeShapeEmbed.init({
 *     mode: 'inline',
 *     container: 'takeshape-embed-container',
 *     providerId: 'YOUR_PROVIDER_ID'
 *   });
 * </script>
 *
 * Modal usage:
 * <script src="https://app.yourdomain.com/embed.js"></script>
 * <script>
 *   TakeShapeEmbed.init({
 *     mode: 'modal',
 *     providerId: 'YOUR_PROVIDER_ID',
 *     buttonText: 'Send Us A Video'
 *   });
 * </script>
 */

(function (window, document) {
  'use strict';

  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="/embed.js"]');

  const scriptSrc =
    (scriptTag && scriptTag.getAttribute('src')) ||
    '/embed.js';

  const scriptUrl = new URL(scriptSrc, window.location.href);

  const DEFAULT_OPTIONS = {
    mode: 'inline',
    container: 'takeshape-embed-container',
    width: '100%',
    height: '760px',
    iframePath: '/embed/intake',
    providerId: '',
    buttonText: 'Get a Quote',
    buttonPosition: 'bottom-right',
    buttonBackgroundColor: '#c20a3e',
    buttonTextColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
    modalMaxWidth: '1200px',
    modalBackdrop: 'rgba(0, 0, 0, 0.66)',
    closeOnBackdrop: true,
    params: null,
    onComplete: null,
    onError: null,
  };

  const instances = [];

  function toCssLength(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'number') return value + 'px';
    return String(value);
  }

  function buildIframeUrl(options) {
    const baseUrl = options.baseUrl
      ? new URL(options.baseUrl)
      : new URL(scriptUrl.origin);

    const path = String(options.iframePath || '/embed/intake');
    const url = new URL(path, baseUrl);
    const params = new URLSearchParams();

    if (options.providerId) {
      params.set('providerId', String(options.providerId));
    }

    if (options.params && typeof options.params === 'object') {
      Object.keys(options.params).forEach(function (key) {
        const value = options.params[key];
        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          params.set(key, String(value));
        }
      });
    }

    const query = params.toString();
    if (query) {
      url.search = query;
    }

    return url.toString();
  }

  function createIframe(options) {
    const iframe = document.createElement('iframe');
    iframe.src = buildIframeUrl(options);
    iframe.width = toCssLength(options.width, '100%');
    iframe.height = toCssLength(options.height, '760px');
    iframe.style.width = toCssLength(options.width, '100%');
    iframe.style.height = toCssLength(options.height, '760px');
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.backgroundColor = '#ffffff';
    iframe.style.borderRadius = toCssLength(
      options.borderRadius,
      '10px'
    );
    iframe.style.boxShadow = options.boxShadow;
    iframe.allow =
      'camera; microphone; autoplay; clipboard-write; fullscreen';
    iframe.allowFullscreen = true;

    return iframe;
  }

  function getContainer(options) {
    if (options.container instanceof HTMLElement) {
      return options.container;
    }

    if (typeof options.container === 'string') {
      return document.getElementById(options.container);
    }

    return null;
  }

  function createInlineInstance(options) {
    const container = getContainer(options);

    if (!container) {
      console.error(
        'TakeShape Embed: container not found for inline mode.'
      );
      return null;
    }

    const iframe = createIframe(options);
    container.innerHTML = '';
    container.appendChild(iframe);

    return {
      type: 'inline',
      iframe: iframe,
      open: function () {},
      close: function () {},
      destroy: function () {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      },
    };
  }

  function resolveButtonPosition(position) {
    if (position === 'bottom-left') {
      return { bottom: '20px', left: '20px' };
    }

    if (position === 'top-right') {
      return { top: '20px', right: '20px' };
    }

    if (position === 'top-left') {
      return { top: '20px', left: '20px' };
    }

    return { bottom: '20px', right: '20px' };
  }

  function createModalInstance(options) {
    const iframe = createIframe(options);

    const backdrop = document.createElement('div');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.style.position = 'fixed';
    backdrop.style.inset = '0';
    backdrop.style.display = 'none';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.padding = '24px';
    backdrop.style.background = options.modalBackdrop;
    backdrop.style.zIndex = '2147483646';

    const shell = document.createElement('div');
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.maxWidth = toCssLength(
      options.modalMaxWidth,
      '1200px'
    );
    shell.style.maxHeight = 'calc(100vh - 48px)';

    iframe.style.width = '100%';
    iframe.style.height = 'min(760px, calc(100vh - 70px))';
    iframe.style.maxHeight = 'calc(100vh - 70px)';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.borderRadius = '0';
    iframe.style.boxShadow = 'none';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close form');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '-10px';
    closeButton.style.top = '-10px';
    closeButton.style.width = '36px';
    closeButton.style.height = '36px';
    closeButton.style.border = '0';
    closeButton.style.borderRadius = '999px';
    closeButton.style.background = '#ffffff';
    closeButton.style.color = '#111111';
    closeButton.style.fontSize = '28px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.18)';
    closeButton.style.lineHeight = '1';

    shell.appendChild(iframe);
    shell.appendChild(closeButton);
    backdrop.appendChild(shell);
    document.body.appendChild(backdrop);

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.textContent = options.buttonText;
    launcher.style.position = 'fixed';
    launcher.style.zIndex = '2147483645';
    launcher.style.border = '0';
    launcher.style.cursor = 'pointer';
    launcher.style.borderRadius = '999px';
    launcher.style.padding = '14px 20px';
    launcher.style.fontSize = '18px';
    launcher.style.fontWeight = '700';
    launcher.style.background = options.buttonBackgroundColor;
    launcher.style.color = options.buttonTextColor;
    launcher.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.28)';

    const pos = resolveButtonPosition(options.buttonPosition);
    Object.keys(pos).forEach(function (key) {
      launcher.style[key] = pos[key];
    });

    document.body.appendChild(launcher);

    function openModal() {
      backdrop.style.display = 'flex';
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      backdrop.style.display = 'none';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    launcher.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    if (options.closeOnBackdrop) {
      backdrop.addEventListener('click', function (event) {
        if (event.target === backdrop) {
          closeModal();
        }
      });
    }

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    return {
      type: 'modal',
      iframe: iframe,
      launcher: launcher,
      backdrop: backdrop,
      open: openModal,
      close: closeModal,
      destroy: function () {
        closeModal();

        if (launcher.parentNode) {
          launcher.parentNode.removeChild(launcher);
        }

        if (backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
      },
    };
  }

  function registerMessageListener(instance, options) {
    function onMessage(event) {
      if (!event.data || event.data.type !== 'takeshape-embed') {
        return;
      }

      if (
        event.data.action === 'resize' &&
        event.data.data &&
        event.data.data.height &&
        instance.type === 'inline'
      ) {
        instance.iframe.style.height =
          String(event.data.data.height) + 'px';
      }

      if (
        event.data.action === 'complete' &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete(event.data.data || null);
      }

      if (
        event.data.action === 'error' &&
        typeof options.onError === 'function'
      ) {
        options.onError(event.data.data || null);
      }
    }

    window.addEventListener('message', onMessage);

    return function cleanup() {
      window.removeEventListener('message', onMessage);
    };
  }

  const TakeShapeEmbed = {
    init: function init(userOptions) {
      const options = Object.assign(
        {},
        DEFAULT_OPTIONS,
        userOptions || {}
      );

      const mode = String(options.mode || 'inline').toLowerCase();
      const instance =
        mode === 'modal'
          ? createModalInstance(options)
          : createInlineInstance(options);

      if (!instance) {
        return null;
      }

      const cleanupListener = registerMessageListener(
        instance,
        options
      );

      const controller = {
        iframe: instance.iframe,
        open: instance.open,
        close: instance.close,
        destroy: function destroy() {
          cleanupListener();
          instance.destroy();
        },
      };

      instances.push(controller);
      return controller;
    },

    destroyAll: function destroyAll() {
      while (instances.length > 0) {
        const next = instances.pop();
        if (next) {
          next.destroy();
        }
      }
    },

    buildUrl: function buildUrl(options) {
      const merged = Object.assign({}, DEFAULT_OPTIONS, options || {});
      return buildIframeUrl(merged);
    },
  };

  window.TakeShapeEmbed = TakeShapeEmbed;
})(window, document);
