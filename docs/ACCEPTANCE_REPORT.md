# تقرير اختبارات القبول

## النتائج النهائية

| المجموعة | النتيجة |
|---|---:|
| اختبارات Vanilla الأصلية | 126/126 |
| Vitest في React | 35/35 |
| Playwright في React | 18/18 |
| تدقيق النقل | 7/7 |
| المقارنة البصرية | 3/3 بمقدار 0 بكسل مختلف |
| Build إنتاج | ناجح |
| ESLint | بلا أخطاء أو تحذيرات |

مجموعة Playwright الأساسية تعمل على:

- Desktop: 1440×1000
- Tablet: 1024×768
- Mobile: 390×844

وتعمل مجموعة التدفقات الكاملة الإضافية على Desktop، بينما تغطي المجموعة
الأساسية التشغيل والتخزين والviewport وUndo/Redo وحماية HTML على المقاسات
الثلاثة.

## نطاق Vitest

- التخزين الذري والنسخة الاحتياطية للبيانات التالفة.
- History manager والاشتراكات.
- نموذج مساحة العمل وإصلاحه.
- Style engine.
- Visual Logic وInteraction Hub core.
- توليد JavaScript حديث بلا metadata مشفّرة أو cleanup registry عالمي.
- الشروط المخصّصة لنوع العنصر والتنفيذ المباشر بلا شرط افتراضي.
- Interaction tutorials.
- قاعدة بيانات عناصر HTML.
- runtime manifest وترتيب الوحدات.
- اكتمال React static shell والـIDs.

## نطاق Playwright

- تهيئة React root ووقت تشغيل المحرر بلا runtime errors.
- عدم وجود classic script injection.
- بيانات Local Storage القديمة وRTL/LTR.
- viewport responsive controls.
- Project drawer.
- Undo/Redo.
- HTML الناقص.
- تنقل المساحات وInteraction Demo.
- مسميات مصمّم التفاعلات الجديدة وفحوص الزر ذات المعنى.
- drag-and-drop وinput modal.
- إسقاط `li` من أي جزء في صف `ul` وإعادة ترتيبها بجوار `li` أخرى من دون
  مناطق رفض زائفة.
- إنشاء/تحقق/استيراد/reload/تصدير للمشروع.
- CSS isolation وsanitization.
- final preview sandbox وتشغيل JavaScript خارجيًا عن HTML.
- فصل JavaScript في ملف مستقل داخل مخرجات المشروع.

## ملاحظة خط أساس Vanilla

اختبارات القبول القديمة المبنية على CDP كانت تحتوي فشلين هَشّين قبل React:

- `interaction-hub.acceptance.js` في readiness بعد reload.
- `selection-toolbar-responsive.acceptance.js` في control متوقع.

لم تُستخدم هاتان النتيجتان كإخفاق React. غطّت Playwright نفس المساحات باختبارات
deterministic مرتبطة بعلامة `data-react-migration-ready`.

## أوامر إعادة التحقق

```powershell
npm run verify
npm run test:e2e
```
