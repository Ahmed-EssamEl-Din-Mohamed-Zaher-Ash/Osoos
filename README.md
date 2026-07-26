# أُسُس — نسخة React

هذه نسخة مستقلة من التطبيق الأصلي مبنية بـ React 19 وVite. توجد داخل
`react-migration` ولا تستبدل ملفات Vanilla الموجودة في المجلد الأب.

النتيجة الحالية:

- واجهة التطبيق الأساسية مكوّنات JSX حقيقية تحت React root واحد.
- لا يوجد `dangerouslySetInnerHTML` في كود React.
- لا توجد ملفات JavaScript كلاسيكية تُحمّل وقت التشغيل؛ كل المحركات والميزات
  تدخل عبر ES modules وVite.
- مفاتيح Local Storage وصيغة المشروعات والاتجاه RTL وسلوك التصدير بقيت متوافقة.
- ملفات CSS الأصلية السبعة عشر منسوخة byte-for-byte وبالترتيب نفسه.
- مقارنة آلية على سطح المكتب واللوحي والهاتف سجّلت صفر بكسل مختلف.

## المتطلبات

- Node.js 20.19+ أو 22.12+
- npm
- Microsoft Edge مطلوب فقط لاختبارات Playwright المهيأة حاليًا

## التشغيل

```powershell
cd D:\1-a\react-migration
npm install
npm run dev
```

يفتح Vite خادم التطوير محليًا. يمكن تحديد المنفذ عند الحاجة:

```powershell
npm run dev -- --port 5173
```

## أوامر المشروع

| الأمر | الغرض |
|---|---|
| `npm run dev` | تشغيل خادم التطوير |
| `npm run build` | إنشاء نسخة الإنتاج في `dist` |
| `npm run preview` | معاينة نسخة الإنتاج |
| `npm run lint` | فحص ESLint |
| `npm run test:run` | تشغيل اختبارات Vitest مرة واحدة |
| `npm run test:e2e` | البناء ثم تشغيل Playwright |
| `npm run audit:migration` | تدقيق IDs وCSS والوحدات وغياب `dangerouslySetInnerHTML` |
| `npm run verify:ci` | lint + unit tests + build من دون الاعتماد على ملفات Vanilla في المجلد الأب |
| `npm run verify` | lint + unit tests + build + migration audit |
| `npm run compare:visual` | مقارنة Vanilla وReact بصريًا بعد تشغيل الخادمين المطلوبين |

## البناء والنشر

```powershell
npm run build
npm run preview -- --host 127.0.0.1
```

مجلد `dist` تطبيق static ويمكن نشره على أي استضافة ملفات ثابتة. قيمة `base`
في Vite هي `./`، لذلك تعمل الأصول عند النشر في جذر النطاق أو مجلد فرعي.
يبقى Google Fonts وFont Awesome مصدرين خارجيين كما كانا في النسخة الأصلية.

### GitHub Pages

المشروع مجهز للنشر التلقائي من فرع `main` عبر GitHub Actions. بعد رفعه، اختر
`Settings` → `Pages` → `Source: GitHub Actions`. راجع
[دليل النشر على GitHub Pages](docs/GITHUB_PAGES.md) للخطوات الكاملة.

## البنية

```text
src/
  app/                  منسق تطبيق أُسُس
  components/           عناصر React ذات الحالة
  context/              ربط React بوقت تشغيل المحرر
  data/                 قاعدة بيانات عناصر HTML
  engines/              محركات Visual Logic وInteraction
  features/             Canvas وDOM Tree والمحرر والخصائص والمشروعات
  legacy-generated/     JSX مولّد ميكانيكيًا من الهيكل الأصلي
  legacy-runtime/       ترتيب تهيئة وحدات المحرر
  services/             التخزين والسجل ونموذج المشروعات ومحرك CSS
  styles/               CSS الأصلي + حارس رسم React
tests/
  unit/                 Vitest
  e2e/                  Playwright
scripts/                التوليد والمقارنة والتدقيق
baseline/               دليل Vanilla قبل النقل
migration-evidence/     تقارير وصور المقارنة والأداء
```

## حدّ المحرر المقصود

React يملك هيكل التطبيق وحالة عناصر الواجهة البسيطة مثل viewport وautosave
وUndo/Redo. أما محتوى `#builder-canvas` فهو مستند HTML ينشئه المستخدم بحرية،
لذلك يظل تحت مدير DOM معزول بدل إدخاله إلى React عبر
`dangerouslySetInnerHTML`. نفس طبقة المحرر تدير شجرة DOM والـoverlays المعتمدة
على العنصر المحدد. هذه حدود adapter مقصودة حتى لا تتدخل React reconciliation
في مستند المستخدم أو تغيّر السلوك القديم.

## التوافق

- لا يوجد React Router لأن المنتج صفحة تشغيل واحدة بلا مسارات تطبيقية.
- التخزين يستخدم المفاتيح القديمة نفسها، ومنها
  `osoos-project-workspace-v1` و`builder-html` و`builder-css`.
- تظل حماية HTML الناقص، حصر CSS، مطابقة المعاينة والتصدير، allowlist التنظيف،
  والنسخة الاحتياطية لمساحة العمل التالفة فعالة.
- ترتيب وحدات Interaction/Visual Logic السابق محفوظ صراحة قبل وبعد إنشاء
  `WebBuilderApp`.

## مستندات التسليم

- [خريطة النقل](docs/MIGRATION_MAP.md)
- [قائمة المكوّنات](docs/COMPONENT_INVENTORY.md)
- [تقرير المطابقة](docs/COMPARISON_REPORT.md)
- [تقرير الأداء](docs/PERFORMANCE_REPORT.md)
- [تقرير القبول](docs/ACCEPTANCE_REPORT.md)

## تحسينات مستقبلية غير مطبقة

- تحميل Visual Logic وInteraction Demo عند أول استخدام فقط لتصغير النقل الأولي.
- استضافة subset محلي من الخطوط والأيقونات لتقليل الاعتماد على الشبكة.
- نقل overlays الكبيرة تدريجيًا إلى React portals بعد تثبيت عقود المحركات.
- تقسيم CSS حسب مساحة العمل مع إبقاء snapshot بصري في CI.
- إضافة matrix لمتصفحات Chromium وFirefox وWebKit في CI.
