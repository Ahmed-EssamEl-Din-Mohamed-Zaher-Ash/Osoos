# خريطة النقل من Vanilla إلى React

## نقطة الدخول

| قبل | بعد |
|---|---|
| `../index.html` مع 19 `<script>` كلاسيكيًا | `index.html` صغير + `/src/main.jsx` كـES module |
| تهيئة `DOMContentLoaded` داخل `app.js` | `createRoot` ثم `useLegacyRuntime` |
| globals بين الملفات | imports/exports عبر Vite، مع bridge محدود لعقود الوحدات الأقدم |
| HTML كامل ثابت في ملف واحد | 10 مكوّنات JSX مولّدة + مكوّنات React ذات حالة |

## JavaScript

| ملف Vanilla | موضع React/Vite |
|---|---|
| `js/app.js` | `src/app/WebBuilderApp.js` |
| `js/elements.js` | `src/data/htmlElements.js` |
| `js/drag-drop.js` | `src/features/canvas/DragDropManager.js` |
| `js/dom-tree.js` | `src/features/dom-tree/DOMTreeManager.js` |
| `js/editor.js` | `src/features/editor/CodeEditorManager.js` |
| `js/properties.js` | `src/features/inspector/PropertiesManager.js` |
| `js/project-manager.js` | `src/features/projects/ProjectManager.js` |
| `js/style-engine.js` | `src/services/styles/OsoosStyleEngine.js` |
| History المضمّن في `app.js` | `src/services/history/HistoryManager.js` |
| منطق Local Storage المتفرق | `src/services/storage/builderStorage.js` |
| نموذج مساحة العمل داخل مدير المشروعات | `src/services/projects/workspaceModel.js` |
| `js/visual-logic-core.js` | `src/engines/visualLogicCore.js` + adapter داخلي |
| `js/interaction-hub-core.js` | `src/engines/interactionHubCore.js` + adapter داخلي |
| `js/interaction-tutorials.js` | `src/engines/interactionTutorials.js` + adapter داخلي |
| `js/visual-logic-phase-a.js` | `src/features/compat-runtime/visual-logic-phase-a.js` |
| `js/interaction-hub.js` | `src/features/compat-runtime/interaction-hub.js` |
| `js/interaction-demo.js` | `src/features/compat-runtime/interaction-demo.js` |
| `js/beginner-mode.js` | `src/features/compat-runtime/beginner-mode.js` |
| `js/responsive-shell.js` | `src/features/compat-runtime/responsive-shell.js` |
| `js/selection-toolbar-responsive.js` | `src/features/compat-runtime/selection-toolbar-responsive.js` |
| `js/dom-tree-clarity.js` | `src/features/compat-runtime/dom-tree-clarity.js` |
| `js/onboarding-tour.js` | `src/features/compat-runtime/onboarding-tour.js` |

كل صف في `compat-runtime` أصبح جزءًا من رسم تبعيات Vite ويُحمّل عبر
`import()`؛ لا توجد نسخ public تُحقن كـclassic scripts.

## CSS

الملفات الأصلية السبعة عشر موجودة بالاسم نفسه في:

- `src/styles` للاستيراد في bundle.
- `public/css` للتوافق مع التحميل الديناميكي لوضع المبتدئ.

`src/styles/index.css` يثبت ترتيب الاستيراد. الملف الجديد الوحيد المؤثر في
الإقلاع هو `react-runtime.css`، ويخفي الرسم الوسيط فقط إلى أن تكتمل تهيئة
المحرر؛ لا يغير الشكل النهائي.

## الحالة والأحداث

| المجال | المالك بعد النقل |
|---|---|
| اختيار viewport | React state في `ViewportControls` |
| autosave toggle | React state في `AutosaveToggle` |
| تمكين Undo/Redo | React state مشترك مع `HistoryManager.subscribe` |
| جاهزية وقت التشغيل | `BuilderRuntimeContext` و`useSyncExternalStore` |
| مستند المستخدم في Canvas | مدير DOM معزول |
| صيغة المشروع والملفات | `workspaceModelService` |
| التخزين الذري والنسخة التالفة | `builderStorageService` |
| CSS authored/style rules | `OsoosStyleEngine` |

## التوافق المقصود

تُعرّف بعض constructors والمحركات على `window` أثناء bootstrap لأن وحدات
Visual Logic القديمة توسع prototypes قبل إنشاء التطبيق. هذا bridge داخلي
محدود؛ مصدر الحقيقة نفسه ES modules، وملف الإنتاج لا يحمّل إلا module script
واحدًا أنشأه Vite.

