# تقرير مطابقة Vanilla وReact

تاريخ المقارنة النهائية: 26 يوليو 2026.

## الشكل والهندسة

تم تشغيل Vanilla ونسخة إنتاج React في Edge بالحالة المحلية نفسها والخطوط نفسها،
ثم التقطت screenshots بعد اكتمال التهيئة وتعطيل الحركة.

| المقاس | الأبعاد | البكسلات المختلفة | نسبة الاختلاف | اختلافات الهندسة |
|---|---:|---:|---:|---:|
| Desktop | 1440×1000 | 0 | 0% | 0 |
| Tablet | 1024×768 | 0 | 0% | 0 |
| Mobile | 390×844 | 0 | 0% | 0 |

لم تسجل صفحات React الثلاث أي runtime errors. ظهر في أول التقاط Vanilla فقط
404 للـfavicon، وهو غير موجود في React بسبب data favicon.

الدليل الكامل:

- `migration-evidence/visual-comparison/report.json`
- صور `*-vanilla.png` و`*-react.png`
- صور `*-diff.png`

## الهيكل

- IDs الأصلية: 237.
- IDs المفقودة في React: صفر.
- ملفات CSS الأصلية: 17/17 مطابقة byte-for-byte في `src/styles` و`public/css`.
- `dangerouslySetInnerHTML`: صفر.
- classic runtime scripts في React: صفر.
- script الإنتاج: module script واحد أنشأه Vite.

الدليل: `migration-evidence/audit/report.json`.

## السلوك

تم التحقق آليًا من:

- تحميل بيانات Local Storage القديمة والاتجاه RTL/LTR.
- viewport controls والاستجابة.
- Undo/Redo.
- فتح وإغلاق Project drawer.
- إنشاء مشروع وملف والتحقق من خطأ المسار المكرر.
- استيراد HTML واستعادة المشروع بعد reload وتصدير ZIP.
- سحب عنصر من palette وإسقاطه في Canvas.
- اختيار نوع `input` من modal.
- التنقل بين CSS وJS والإعدادات والسجل ووضع الكود.
- فتح Interaction Demo وإغلاقه.
- المعاينة النهائية وsandbox ومطابقة CSS والاتجاه في التصدير.
- عدم مسح Canvas/CSS عند كتابة HTML ناقص.
- حصر CSS داخل Canvas ومنع authored `body` من إخفاء التطبيق.
- إزالة active content وevent handlers و`javascript:` عند الاستعادة.

## الفروق المقصودة

لا توجد فروق بصرية نهائية. الفروق الهندسية الداخلية هي:

- bootstrap عبر React/Vite بدل `DOMContentLoaded` وclassic scripts.
- تقسيم المحركات الكبيرة إلى chunks.
- data favicon يمنع 404 القديم.
- حارس `visibility` قبل الجاهزية يمنع رسم حالات panels الوسيطة.

Canvas نفسه يبقى مستند DOM يديره editor adapter، لأن تحويل HTML المستخدم إلى
React يتطلب `dangerouslySetInnerHTML` أو parsing/reconciliation قد يغير السلوك.

