# قائمة الصفحات والمكوّنات

## الصفحات

التطبيق صفحة تشغيل واحدة فقط، لذلك لم يُضف Router. الصفحة تحتوي أوضاعًا داخلية
وليست URL routes:

- Designer
- Code workspace
- Final preview overlay
- Project drawer
- Interaction Hub / Interaction Demo
- Onboarding

## شجرة React

```text
App
└─ BuilderRuntimeProvider
   └─ StaticShell
      ├─ AppContainer
      │  ├─ AppHeader
      │  │  ├─ ViewportControls
      │  │  ├─ AutosaveToggle
      │  │  ├─ UndoButton
      │  │  └─ RedoButton
      │  └─ WorkspaceShell
      │     ├─ NavigationRail
      │     ├─ InspectorPanel
      │     ├─ CanvasWorkspace
      │     │  └─ BottomDock
      │     └─ ElementsPanel
      └─ InputTypeModal
```

## المكوّنات المولّدة

المكوّنات التالية تُولّد ميكانيكيًا من `../index.html` بواسطة
`scripts/generate-shell.mjs` للحفاظ على ترتيب DOM وIDs وARIA:

- `StaticShell`
- `AppContainer`
- `AppHeader`
- `WorkspaceShell`
- `NavigationRail`
- `InspectorPanel`
- `CanvasWorkspace`
- `BottomDock`
- `ElementsPanel`
- `InputTypeModal`

المولّد يتحقق من 237 ID. ستة IDs تُنتجها مكوّنات React ذات الحالة، والـ231
الباقية تأتي من الهيكل المولّد.

## مكوّنات الحالة المكتوبة يدويًا

- `BuilderRuntimeProvider`: يربط React بوقت تشغيل المحرر من دون race عند الجاهزية.
- `ViewportControls`: يزامن حالة الأزرار مع Canvas وbreakpoints.
- `AutosaveToggle`: controlled input ويطلب الحفظ عند التفعيل.
- `UndoButton` و`RedoButton`: يشتركان في subscription للسجل لتحديث disabled state.

## طبقات غير مرئية كمكوّنات

- `WebBuilderApp`: منسق lifecycle والأحداث عالية المستوى.
- `DragDropManager`: إسقاط عناصر HTML والقيود.
- `DOMTreeManager`: شجرة المستند وإعادة الترتيب.
- `CodeEditorManager`: مزامنة HTML/CSS/JS.
- `PropertiesManager`: خصائص العنصر وCSS.
- `ProjectManager`: المشروعات والملفات والاستيراد والتصدير.
- المحركات والخدمات في `engines` و`services`.

