/*
 * Beginner / advanced experience mode for Osoos.
 *
 * The module intentionally owns its DOM and styling hooks.  The only host
 * requirement is loading this script; it injects css/beginner-mode.css by
 * itself and leaves the application's existing tabs and preview handlers in
 * charge of their own state.
 */
(function initializeBeginnerModeModule() {
  'use strict';

  const MODE_BEGINNER = 'beginner';
  const MODE_ADVANCED = 'advanced';
  const STORAGE_KEY = 'osoos:experience-mode';
  const activeScript = document.currentScript;
  let activeMode = MODE_BEGINNER;
  let generatedIdSequence = 0;

  function ensureStylesheet() {
    if (document.querySelector('link[data-osoos-beginner-mode-styles]')) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.dataset.osoosBeginnerModeStyles = 'true';
    stylesheet.href = activeScript && activeScript.src
      ? new URL('../css/beginner-mode.css', activeScript.src).href
      : 'css/beginner-mode.css';
    document.head.appendChild(stylesheet);
  }

  function appendChildren(parent, children) {
    const queue = Array.isArray(children) ? children : [children];
    queue.flat(Infinity).forEach(child => {
      if (child === null || child === undefined || child === false) return;
      parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return parent;
  }

  function createNode(tagName, options = {}, children = []) {
    const node = document.createElement(tagName);

    if (options.id) node.id = options.id;
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;

    Object.entries(options.attributes || {}).forEach(([name, value]) => {
      if (value === false || value === null || value === undefined) return;
      node.setAttribute(name, value === true ? '' : String(value));
    });

    Object.entries(options.style || {}).forEach(([property, value]) => {
      if (value !== null && value !== undefined) node.style.setProperty(property, String(value));
    });

    return appendChildren(node, children);
  }

  function nextComponentId(prefix) {
    let id;
    do {
      generatedIdSequence += 1;
      id = `${prefix}-${Date.now().toString(36)}-${generatedIdSequence.toString(36)}`;
    } while (document.getElementById(id));
    return id;
  }

  function makeHeroComponent() {
    const sectionId = nextComponentId('ready-hero');
    const titleId = nextComponentId('ready-hero-title');

    return createNode('section', {
      id: sectionId,
      attributes: { 'aria-labelledby': titleId },
      style: {
        direction: 'rtl',
        padding: '72px 24px',
        overflow: 'hidden',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 52%, #db2777 100%)',
        'border-radius': '24px',
        'text-align': 'center'
      }
    }, [
      createNode('p', {
        text: 'ابدأ فكرتك اليوم',
        style: {
          margin: '0 0 12px',
          color: '#fde68a',
          'font-size': '14px',
          'font-weight': '700'
        }
      }),
      createNode('h1', {
        id: titleId,
        text: 'عنوان واضح يشرح قيمة موقعك',
        style: {
          margin: '0 auto 16px',
          'max-width': '760px',
          color: '#ffffff',
          'font-size': 'clamp(32px, 6vw, 58px)',
          'line-height': '1.2'
        }
      }),
      createNode('p', {
        text: 'أضف وصفًا قصيرًا يساعد الزائر على فهم ما تقدمه، ثم وجّهه إلى الخطوة التالية.',
        style: {
          margin: '0 auto 28px',
          'max-width': '640px',
          color: '#ede9fe',
          'font-size': '17px',
          'line-height': '1.8'
        }
      }),
      createNode('div', {
        style: {
          display: 'flex',
          'flex-wrap': 'wrap',
          'justify-content': 'center',
          gap: '12px'
        }
      }, [
        createNode('button', {
          text: 'ابدأ الآن',
          attributes: { type: 'button' },
          style: {
            padding: '13px 24px',
            border: '0',
            color: '#312e81',
            background: '#ffffff',
            'border-radius': '12px',
            'font-family': 'inherit',
            'font-size': '15px',
            'font-weight': '700',
            cursor: 'pointer'
          }
        }),
        createNode('a', {
          text: 'اعرف المزيد',
          attributes: { href: '#' },
          style: {
            padding: '12px 24px',
            border: '1px solid rgba(255, 255, 255, 0.55)',
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.08)',
            'border-radius': '12px',
            'font-size': '15px',
            'font-weight': '700',
            'text-decoration': 'none'
          }
        })
      ])
    ]);
  }

  function makeNavigationComponent() {
    const navigationId = nextComponentId('ready-navigation');
    const linkStyle = {
      color: '#334155',
      'font-size': '14px',
      'font-weight': '600',
      'text-decoration': 'none'
    };

    const links = ['الرئيسية', 'الخدمات', 'من نحن', 'تواصل معنا'].map(label =>
      createNode('li', { style: { margin: '0' } }, [
        createNode('a', { text: label, attributes: { href: '#' }, style: linkStyle })
      ])
    );

    return createNode('nav', {
      id: navigationId,
      attributes: { 'aria-label': 'التنقل الرئيسي' },
      style: {
        direction: 'rtl',
        display: 'flex',
        'flex-wrap': 'wrap',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: '18px',
        padding: '16px 22px',
        border: '1px solid #e2e8f0',
        color: '#0f172a',
        background: '#ffffff',
        'border-radius': '16px',
        'box-shadow': '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }, [
      createNode('a', {
        text: 'علامتك',
        attributes: { href: '#', 'aria-label': 'الصفحة الرئيسية' },
        style: {
          color: '#6d28d9',
          'font-size': '20px',
          'font-weight': '800',
          'text-decoration': 'none'
        }
      }),
      createNode('ul', {
        style: {
          display: 'flex',
          'flex-wrap': 'wrap',
          'align-items': 'center',
          gap: '18px',
          margin: '0',
          padding: '0',
          'list-style': 'none'
        }
      }, links),
      createNode('button', {
        text: 'ابدأ مشروعك',
        attributes: { type: 'button' },
        style: {
          padding: '10px 16px',
          border: '0',
          color: '#ffffff',
          background: '#6d28d9',
          'border-radius': '10px',
          'font-family': 'inherit',
          'font-weight': '700',
          cursor: 'pointer'
        }
      })
    ]);
  }

  function makeCardsComponent() {
    const sectionId = nextComponentId('ready-cards');
    const titleId = nextComponentId('ready-cards-title');
    const cards = [
      ['01', 'سرعة في الإنجاز', 'ابدأ من مكوّن جاهز ثم عدّل النص والألوان بما يناسب فكرتك.'],
      ['02', 'تصميم مرن', 'تتجاوب البطاقات تلقائيًا مع المساحة المتاحة على الشاشة.'],
      ['03', 'محتوى واضح', 'قسّم المعلومات إلى نقاط قصيرة يسهل على الزائر قراءتها وفهمها.']
    ].map(([number, title, description]) =>
      createNode('article', {
        style: {
          flex: '1 1 220px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          'border-radius': '18px',
          'box-shadow': '0 12px 32px rgba(15, 23, 42, 0.06)'
        }
      }, [
        createNode('span', {
          text: number,
          style: {
            display: 'inline-grid',
            width: '38px',
            height: '38px',
            'place-items': 'center',
            margin: '0 0 18px',
            color: '#6d28d9',
            background: '#ede9fe',
            'border-radius': '12px',
            'font-size': '13px',
            'font-weight': '800'
          }
        }),
        createNode('h3', {
          text: title,
          style: {
            margin: '0 0 10px',
            color: '#0f172a',
            'font-size': '20px'
          }
        }),
        createNode('p', {
          text: description,
          style: {
            margin: '0',
            color: '#64748b',
            'font-size': '14px',
            'line-height': '1.75'
          }
        })
      ])
    );

    return createNode('section', {
      id: sectionId,
      attributes: { 'aria-labelledby': titleId },
      style: {
        direction: 'rtl',
        padding: '52px 24px',
        background: '#f8fafc',
        'border-radius': '24px'
      }
    }, [
      createNode('h2', {
        id: titleId,
        text: 'لماذا يختارنا العملاء؟',
        style: {
          margin: '0 0 10px',
          color: '#0f172a',
          'font-size': 'clamp(26px, 4vw, 38px)',
          'text-align': 'center'
        }
      }),
      createNode('p', {
        text: 'ثلاث فوائد أساسية يمكنك استبدالها بمزايا منتجك أو خدمتك.',
        style: {
          margin: '0 auto 30px',
          'max-width': '560px',
          color: '#64748b',
          'font-size': '15px',
          'line-height': '1.7',
          'text-align': 'center'
        }
      }),
      createNode('div', {
        style: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap: '16px'
        }
      }, cards)
    ]);
  }

  function makeContactComponent() {
    const sectionId = nextComponentId('ready-contact');
    const titleId = nextComponentId('ready-contact-title');
    const nameId = nextComponentId('ready-contact-name');
    const emailId = nextComponentId('ready-contact-email');
    const messageId = nextComponentId('ready-contact-message');
    const fieldStyle = {
      width: '100%',
      padding: '12px 14px',
      border: '1px solid #cbd5e1',
      color: '#0f172a',
      background: '#ffffff',
      'border-radius': '10px',
      'font-family': 'inherit',
      'font-size': '14px',
      'box-sizing': 'border-box'
    };

    function makeField(label, input) {
      return createNode('div', { style: { display: 'grid', gap: '7px' } }, [
        createNode('label', {
          text: label,
          attributes: { for: input.id },
          style: { color: '#334155', 'font-size': '13px', 'font-weight': '700' }
        }),
        input
      ]);
    }

    const nameInput = createNode('input', {
      id: nameId,
      attributes: { type: 'text', name: 'name', placeholder: 'الاسم الكامل', autocomplete: 'name' },
      style: fieldStyle
    });
    const emailInput = createNode('input', {
      id: emailId,
      attributes: { type: 'email', name: 'email', placeholder: 'name@example.com', autocomplete: 'email' },
      style: fieldStyle
    });
    const messageInput = createNode('textarea', {
      id: messageId,
      attributes: { name: 'message', rows: '5', placeholder: 'كيف يمكننا مساعدتك؟' },
      style: { ...fieldStyle, resize: 'vertical', 'min-height': '120px' }
    });

    return createNode('section', {
      id: sectionId,
      attributes: { 'aria-labelledby': titleId },
      style: {
        direction: 'rtl',
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '32px',
        padding: '42px 28px',
        color: '#0f172a',
        background: '#f1f5f9',
        'border-radius': '24px'
      }
    }, [
      createNode('div', {}, [
        createNode('p', {
          text: 'تواصل معنا',
          style: {
            margin: '0 0 8px',
            color: '#6d28d9',
            'font-size': '14px',
            'font-weight': '800'
          }
        }),
        createNode('h2', {
          id: titleId,
          text: 'يسعدنا سماع فكرتك',
          style: {
            margin: '0 0 12px',
            color: '#0f172a',
            'font-size': 'clamp(26px, 4vw, 38px)'
          }
        }),
        createNode('p', {
          text: 'استخدم هذا النموذج كنقطة بداية، ثم اربطه لاحقًا بطريقة الإرسال المناسبة لمشروعك.',
          style: {
            margin: '0',
            'max-width': '440px',
            color: '#64748b',
            'font-size': '15px',
            'line-height': '1.8'
          }
        })
      ]),
      createNode('form', {
        attributes: { 'aria-label': 'نموذج التواصل' },
        style: {
          display: 'grid',
          gap: '15px',
          padding: '22px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          'border-radius': '16px',
          'box-shadow': '0 14px 34px rgba(15, 23, 42, 0.08)'
        }
      }, [
        makeField('الاسم', nameInput),
        makeField('البريد الإلكتروني', emailInput),
        makeField('رسالتك', messageInput),
        createNode('button', {
          text: 'إرسال الرسالة',
          attributes: { type: 'button' },
          style: {
            padding: '13px 18px',
            border: '0',
            color: '#ffffff',
            background: '#6d28d9',
            'border-radius': '10px',
            'font-family': 'inherit',
            'font-size': '14px',
            'font-weight': '800',
            cursor: 'pointer'
          }
        })
      ])
    ]);
  }

  const READY_COMPONENTS = Object.freeze([
    Object.freeze({
      id: 'hero',
      title: 'قسم ترحيبي',
      description: 'عنوان ووصف وزران للبداية.',
      icon: 'fa-wand-magic-sparkles',
      create: makeHeroComponent
    }),
    Object.freeze({
      id: 'navigation',
      title: 'شريط تنقل',
      description: 'شعار وروابط وزر إجراء واضح.',
      icon: 'fa-bars',
      create: makeNavigationComponent
    }),
    Object.freeze({
      id: 'cards',
      title: 'بطاقات',
      description: 'ثلاث بطاقات مرنة لعرض المزايا.',
      icon: 'fa-table-cells-large',
      create: makeCardsComponent
    }),
    Object.freeze({
      id: 'contact',
      title: 'نموذج تواصل',
      description: 'حقول اسم وبريد ورسالة جاهزة.',
      icon: 'fa-envelope',
      create: makeContactComponent
    })
  ]);

  function getGalleryStatus() {
    return document.getElementById('beginner-components-status');
  }

  function reportGalleryStatus(message, isError = false) {
    const status = getGalleryStatus();
    if (!status) return;
    status.textContent = message;
    status.dataset.status = isError ? 'error' : 'success';
  }

  function addReadyComponent(componentId) {
    const definition = READY_COMPONENTS.find(item => item.id === componentId);
    const app = window.appInstance;
    const canvas = document.getElementById('builder-canvas');

    if (!definition || !canvas || !app) {
      reportGalleryStatus('تعذّرت الإضافة الآن. انتظر اكتمال تحميل المحرر ثم حاول مجددًا.', true);
      return null;
    }

    if (typeof app.selectElement !== 'function' || typeof app.syncAll !== 'function' ||
        !app.history || typeof app.history.saveState !== 'function') {
      reportGalleryStatus('واجهة المحرر غير جاهزة لإضافة المكوّن.', true);
      return null;
    }

    try {
      const component = definition.create();
      canvas.appendChild(component);

      if (typeof app.reattachCanvasListeners === 'function') app.reattachCanvasListeners();
      app.selectElement(component);
      app.syncAll();
      app.history.saveState(`إضافة مكوّن جاهز: ${definition.title}`);

      if (typeof app.updateHighlighter === 'function') app.updateHighlighter();
      component.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      const message = `تمت إضافة «${definition.title}». حدده على اللوحة لتعديل محتواه وخصائصه.`;
      reportGalleryStatus(message);
      if (typeof app.showToastNotice === 'function') app.showToastNotice(message);
      return component;
    } catch (error) {
      console.error('تعذّرت إضافة المكوّن الجاهز.', error);
      reportGalleryStatus('حدث خطأ أثناء إضافة المكوّن. لم تتغير قائمة العناصر الأصلية.', true);
      return null;
    }
  }

  function setupReadyComponentsPanel() {
    const panelContent = document.querySelector('.side-panel.panel-right > .panel-content');
    if (!panelContent || panelContent.querySelector('.beginner-components-panel')) return;

    const originalNodes = Array.from(panelContent.childNodes);
    const gallery = createNode('section', {
      className: 'beginner-components-panel',
      attributes: { 'aria-labelledby': 'beginner-components-title' }
    });
    const heading = createNode('div', { className: 'beginner-components-heading' }, [
      createNode('i', {
        className: 'fas fa-shapes',
        attributes: { 'aria-hidden': 'true' }
      }),
      createNode('div', {}, [
        createNode('strong', {
          id: 'beginner-components-title',
          className: 'beginner-components-title',
          text: 'مكونات جاهزة'
        }),
        createNode('span', {
          className: 'beginner-components-description',
          text: 'أضف قسمًا كاملًا بنقرة واحدة، ثم عدّل نصوصه وألوانه.'
        })
      ])
    ]);
    const grid = createNode('div', { className: 'beginner-components-grid' });

    READY_COMPONENTS.forEach(definition => {
      const button = createNode('button', {
        className: 'ready-component-card',
        attributes: {
          type: 'button',
          'data-component-id': definition.id,
          'aria-describedby': 'beginner-components-status'
        }
      }, [
        createNode('i', {
          className: `fas ${definition.icon} ready-component-card-icon`,
          attributes: { 'aria-hidden': 'true' }
        }),
        createNode('span', {}, [
          createNode('span', { className: 'ready-component-card-title', text: definition.title }),
          createNode('span', { className: 'ready-component-card-description', text: definition.description })
        ])
      ]);
      button.addEventListener('click', () => addReadyComponent(definition.id));
      grid.appendChild(button);
    });

    const status = createNode('p', {
      id: 'beginner-components-status',
      className: 'beginner-components-status',
      text: 'اختر مكوّنًا لإضافته في نهاية الصفحة.',
      attributes: { 'aria-live': 'polite' }
    });
    appendChildren(gallery, [heading, grid, status]);

    const catalogueDetails = createNode('details', {
      className: 'beginner-html-details',
      attributes: { 'data-beginner-html-catalogue': 'true' }
    });
    const catalogueSummary = createNode('summary', { text: 'عناصر HTML المتقدمة' });
    const catalogueBody = createNode('div', { className: 'beginner-html-details-body' });
    originalNodes.forEach(node => catalogueBody.appendChild(node));
    appendChildren(catalogueDetails, [catalogueSummary, catalogueBody]);

    panelContent.appendChild(gallery);
    panelContent.appendChild(catalogueDetails);
    catalogueDetails.open = activeMode === MODE_ADVANCED;
  }

  function markAdvancedCssControls() {
    const advancedAnchorIds = [
      'display-segmented',
      'position-segmented',
      'prop-transition-duration',
      'units-segmented',
      'breakpoints-segmented'
    ];
    const accordions = new Set();

    advancedAnchorIds.forEach(id => {
      const control = document.getElementById(id);
      const accordion = control && control.closest('.accordion');
      if (accordion) accordions.add(accordion);
    });

    accordions.forEach(accordion => {
      accordion.classList.add('beginner-advanced-accordion');
      const summary = accordion.querySelector(':scope > .accordion-summary');
      if (!summary || summary.querySelector('.beginner-advanced-badge')) return;
      summary.appendChild(createNode('span', {
        className: 'beginner-advanced-badge',
        text: 'متقدم',
        attributes: { 'aria-label': 'قسم متقدم' }
      }));
    });

    const importantToggle = document.getElementById('prop-important');
    const importantLabel = importantToggle && importantToggle.closest('label');
    const pseudoStates = document.getElementById('pseudo-states-row');
    const customFontArea = document.getElementById('custom-font-area');
    const textEffects = document.querySelectorAll('.text-effect-area');

    [importantLabel, pseudoStates, customFontArea, ...textEffects].forEach(control => {
      if (control) control.classList.add('beginner-advanced-control');
    });
  }

  function setAdvancedAccordionState(mode) {
    document.querySelectorAll('.beginner-advanced-accordion').forEach(accordion => {
      if (mode === MODE_BEGINNER) {
        if (!Object.prototype.hasOwnProperty.call(accordion.dataset, 'beginnerWasOpen')) {
          accordion.dataset.beginnerWasOpen = String(accordion.classList.contains('open'));
        }
        accordion.classList.remove('open');
      } else if (Object.prototype.hasOwnProperty.call(accordion.dataset, 'beginnerWasOpen')) {
        accordion.classList.toggle('open', accordion.dataset.beginnerWasOpen === 'true');
        delete accordion.dataset.beginnerWasOpen;
      }
    });
  }

  function normalizeMode(mode) {
    return mode === MODE_ADVANCED ? MODE_ADVANCED : MODE_BEGINNER;
  }

  function readSavedMode() {
    try {
      return normalizeMode(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return MODE_BEGINNER;
    }
  }

  function saveMode(mode) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Storage may be unavailable in private or sandboxed browsing contexts.
    }
  }

  function updateModeToggle(mode) {
    const toggle = document.getElementById('beginner-mode-toggle');
    if (!toggle) return;

    const isAdvanced = mode === MODE_ADVANCED;
    const icon = toggle.querySelector('.beginner-mode-toggle-icon');
    const label = toggle.querySelector('.beginner-mode-toggle-label');

    toggle.dataset.mode = mode;
    toggle.setAttribute('aria-pressed', String(isAdvanced));
    toggle.setAttribute(
      'aria-label',
      isAdvanced ? 'الوضع المتقدم مفعّل. اضغط للتبديل إلى الوضع المبسّط.' : 'الوضع المبسّط مفعّل. اضغط للتبديل إلى الوضع المتقدم.'
    );
    toggle.title = isAdvanced ? 'التبديل إلى الوضع المبسّط' : 'التبديل إلى الوضع المتقدم';
    if (label) label.textContent = isAdvanced ? 'الوضع المتقدم' : 'الوضع المبسّط';
    if (icon) icon.className = `fas ${isAdvanced ? 'fa-sliders' : 'fa-seedling'} beginner-mode-toggle-icon`;
  }

  function setMode(requestedMode, options = {}) {
    const mode = normalizeMode(requestedMode);
    const shouldPersist = options.persist !== false;
    const shouldAnnounce = options.announce === true;
    activeMode = mode;

    if (document.body) {
      document.body.classList.toggle('osoos-beginner-mode', mode === MODE_BEGINNER);
      document.body.classList.toggle('osoos-advanced-mode', mode === MODE_ADVANCED);
      document.body.dataset.osoosExperienceMode = mode;
    }

    markAdvancedCssControls();
    setAdvancedAccordionState(mode);

    const catalogue = document.querySelector('.beginner-html-details');
    if (catalogue) catalogue.open = mode === MODE_ADVANCED;
    updateModeToggle(mode);
    if (shouldPersist) saveMode(mode);

    window.dispatchEvent(new CustomEvent('osoos:experience-mode-change', {
      detail: { mode }
    }));

    if (shouldAnnounce && window.appInstance && typeof window.appInstance.showToastNotice === 'function') {
      window.appInstance.showToastNotice(
        mode === MODE_BEGINNER
          ? 'تم تفعيل الوضع المبسّط. الأدوات المتقدمة ما زالت متاحة عند الحاجة.'
          : 'تم تفعيل الوضع المتقدم وإظهار جميع أدوات المحرر.'
      );
    }

    return mode;
  }

  function setupModeToggle() {
    if (document.getElementById('beginner-mode-toggle')) return;
    const headerActions = document.querySelector('.app-header .header-actions');
    if (!headerActions) return;

    const toggle = createNode('button', {
      id: 'beginner-mode-toggle',
      className: 'btn btn-secondary',
      attributes: { type: 'button' }
    }, [
      createNode('i', {
        className: 'fas fa-seedling beginner-mode-toggle-icon',
        attributes: { 'aria-hidden': 'true' }
      }),
      createNode('span', { className: 'beginner-mode-toggle-label', text: 'الوضع المبسّط' })
    ]);

    toggle.addEventListener('click', () => {
      setMode(activeMode === MODE_BEGINNER ? MODE_ADVANCED : MODE_BEGINNER, {
        persist: true,
        announce: true
      });
    });
    headerActions.insertBefore(toggle, headerActions.firstChild);
  }

  function init() {
    if (!document.body || document.body.dataset.osoosBeginnerModeReady === 'true') return;
    document.body.dataset.osoosBeginnerModeReady = 'true';

    ensureStylesheet();
    setupModeToggle();
    setupReadyComponentsPanel();
    markAdvancedCssControls();
    setMode(readSavedMode(), { persist: true, announce: false });
  }

  ensureStylesheet();

  window.OsoosExperienceMode = Object.freeze({
    beginner: MODE_BEGINNER,
    advanced: MODE_ADVANCED,
    storageKey: STORAGE_KEY,
    getMode: () => activeMode,
    setMode: mode => setMode(mode, { persist: true, announce: false }),
    addComponent: addReadyComponent,
    components: READY_COMPONENTS.map(({ id, title, description }) => ({ id, title, description }))
  });

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) setMode(event.newValue, { persist: false, announce: false });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
