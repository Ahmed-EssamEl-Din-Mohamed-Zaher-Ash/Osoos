/* Elements Database for the Interactive Web Builder */

const HTML_ELEMENTS_DB = [
  // 1. المشروع والرأس <head> (6 elements)
  {
    tag: 'title',
    nameAr: 'title',
    labelAr: 'عنوان الصفحة',
    category: 'head',
    type: 'restricted',
    allowedParents: ['head', 'builder-canvas'], // Inside canvas, allowed as config badge
    desc: 'عنوان الصفحة الذي يظهر في علامة تبويب المتصفح.'
  },
  {
    tag: 'favicon',
    nameAr: 'favicon',
    labelAr: 'أيقونة الموقع',
    category: 'head',
    type: 'restricted',
    allowedParents: ['head', 'builder-canvas'],
    desc: 'أيقونة صغيرة تظهر بجانب عنوان الصفحة في المتصفح.'
  },
  {
    tag: 'meta',
    nameAr: 'meta',
    labelAr: 'وصف و SEO',
    category: 'head',
    type: 'void',
    allowedParents: ['head', 'builder-canvas'],
    desc: 'بيانات وصفية للتحكم بالـ SEO والوصف وتوافق الشاشات.'
  },
  {
    tag: 'link',
    nameAr: 'link',
    labelAr: 'خارجي CSS',
    category: 'head',
    type: 'void',
    allowedParents: ['head', 'builder-canvas'],
    desc: 'لربط ملفات التنسيق CSS الخارجية بالصفحة.'
  },
  {
    tag: 'script',
    nameAr: 'script',
    labelAr: 'خارجي JS',
    category: 'head',
    type: 'restricted',
    allowedParents: ['head', 'body', 'builder-canvas'],
    desc: 'لإدراج ملفات جافاسكريبت الخارجية أو كتابة كود تفاعلي.'
  },
  {
    tag: '@font-face',
    nameAr: 'font-face',
    labelAr: 'خط مخصص',
    category: 'head',
    type: 'restricted',
    allowedParents: ['head', 'builder-canvas'],
    desc: 'لتضمين خطوط مخصصة غير متوفرة في النظام.'
  },

  // 2. الحاويات الكتلية / بنية (13 elements)
  {
    tag: 'div',
    nameAr: 'div',
    labelAr: 'حاوية عامة',
    category: 'structure',
    type: 'block',
    desc: 'حاوية كتلة عامة تُستخدم لتجميع وتنسيق العناصر.'
  },
  {
    tag: 'section',
    nameAr: 'section',
    labelAr: 'قسم مخصص',
    category: 'structure',
    type: 'block',
    desc: 'يمثل قسماً مستقلاً في الصفحة يحتوي عادة على عنوان.'
  },
  {
    tag: 'article',
    nameAr: 'article',
    labelAr: 'مقال مستقل',
    category: 'structure',
    type: 'block',
    desc: 'محتوى مستقل بحد ذاته مثل تدوينة أو خبر صحفي.'
  },
  {
    tag: 'main',
    nameAr: 'main',
    labelAr: 'المحتوى الرئيسي',
    category: 'structure',
    type: 'block',
    desc: 'المحتوى الأساسي الفريد والوحيد للصفحة.'
  },
  {
    tag: 'header',
    nameAr: 'header',
    labelAr: 'ترويسة الصفحة',
    category: 'structure',
    type: 'block',
    desc: 'الترويسة العلوية للموقع أو لأي قسم فرعي.'
  },
  {
    tag: 'footer',
    nameAr: 'footer',
    labelAr: 'تذييل الصفحة',
    category: 'structure',
    type: 'block',
    desc: 'التذييل السفلي الذي يحتوي عادة على حقوق الملكية وروابط.'
  },
  {
    tag: 'nav',
    nameAr: 'nav',
    labelAr: 'شريط التنقل',
    category: 'structure',
    type: 'block',
    desc: 'مجموعة من روابط التنقل الرئيسية للموقع.'
  },
  {
    tag: 'aside',
    nameAr: 'aside',
    labelAr: 'شريط جانبي',
    category: 'structure',
    type: 'block',
    desc: 'محتوى جانبي مثل روابط إضافية أو إعلانات.'
  },
  {
    tag: 'form',
    nameAr: 'form',
    labelAr: 'نموذج إرسال',
    category: 'structure',
    type: 'block',
    desc: 'نموذج تفاعلي لجمع وإرسال البيانات للملقم.'
  },
  {
    tag: 'fieldset',
    nameAr: 'fieldset',
    labelAr: 'مجموعة حقول',
    category: 'structure',
    type: 'block',
    desc: 'لتجميع حقول الإدخال ذات الصلة داخل إطار.'
  },
  {
    tag: 'figure',
    nameAr: 'figure',
    labelAr: 'شكل توضيحي',
    category: 'structure',
    type: 'block',
    desc: 'حاوية للصور أو المخططات التوضيحية مع تعليقها.'
  },
  {
    tag: 'details',
    nameAr: 'details',
    labelAr: 'محتوى قابل للطي',
    category: 'structure',
    type: 'block',
    desc: 'أداة كشف تفاعلية تتيح للمستخدم إظهار أو إخفاء التفاصيل.'
  },
  {
    tag: 'dialog',
    nameAr: 'dialog',
    labelAr: 'نافذة حوار',
    category: 'structure',
    type: 'block',
    desc: 'نافذة منبثقة أو صندوق حوار تفاعلي.'
  },

  // 3. النصوص والعناوين (8 elements)
  {
    tag: 'h1',
    nameAr: 'h1',
    labelAr: 'عنوان رئيسي H1',
    category: 'text',
    type: 'block',
    desc: 'أهم عنوان في الصفحة (المستوى الأول).'
  },
  {
    tag: 'h2',
    nameAr: 'h2',
    labelAr: 'عنوان فرعي H2',
    category: 'text',
    type: 'block',
    desc: 'عنوان فرعي من المستوى الثاني.'
  },
  {
    tag: 'h3',
    nameAr: 'h3',
    labelAr: 'عنوان فرعي H3',
    category: 'text',
    type: 'block',
    desc: 'عنوان فرعي من المستوى الثالث.'
  },
  {
    tag: 'p',
    nameAr: 'p',
    labelAr: 'فقرة نصية',
    category: 'text',
    type: 'block',
    desc: 'عنصر الفقرة النصية الأساسية في عرض الكلمات.'
  },
  {
    tag: 'blockquote',
    nameAr: 'blockquote',
    labelAr: 'اقتباس كتلي',
    category: 'text',
    type: 'block',
    desc: 'اقتباس خارجي طويل يتم إزاحته وتنسيقه ككتلة.'
  },
  {
    tag: 'q',
    nameAr: 'q',
    labelAr: 'اقتباس مضمن',
    category: 'text',
    type: 'inline',
    desc: 'اقتباس نصي قصير يضاف تلقائياً علامات اقتباس له.'
  },
  {
    tag: 'pre',
    nameAr: 'pre',
    labelAr: 'نص منسق مسبقاً',
    category: 'text',
    type: 'block',
    desc: 'يعرض النصوص بالمسافات والأسطر كما كُتبت تماماً.'
  },
  {
    tag: 'code',
    nameAr: 'code',
    labelAr: 'كود برمجى',
    category: 'text',
    type: 'inline',
    desc: 'لعرض الصيغ البرمجية بخط أحادي المسافة.'
  },
  {
    tag: 'span',
    nameAr: 'span',
    labelAr: 'مضمن عام (span)',
    category: 'text',
    type: 'inline',
    desc: 'حاوية مضمنة لتنسيق جزء معين من النصوص.'
  },
  {
    tag: 'address',
    nameAr: 'address',
    labelAr: 'بيانات الاتصال',
    category: 'text',
    type: 'block',
    desc: 'معلومات الاتصال بالكاتب أو صاحب الموقع.'
  },

  // 4. تنسيق مضمن Inline (13 elements)
  {
    tag: 'strong',
    nameAr: 'strong',
    labelAr: 'نص مهم عريض',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص بوزن عريض للدلالة على الأهمية الشديدة.'
  },
  {
    tag: 'b',
    nameAr: 'b',
    labelAr: 'نص عريض (b)',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص بشكل عريض لأغراض التمييز البصري فقط.'
  },
  {
    tag: 'em',
    nameAr: 'em',
    labelAr: 'نص مائل للتوكيد',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص بشكل مائل للتوكيد اللفظي.'
  },
  {
    tag: 'i',
    nameAr: 'i',
    labelAr: 'نص مائل (i)',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص بشكل مائل لتمييزه بصرياً.'
  },
  {
    tag: 'u',
    nameAr: 'u',
    labelAr: 'نص مسطر',
    category: 'text',
    type: 'inline',
    desc: 'يضع خطاً تحت النص المكتوب.'
  },
  {
    tag: 'small',
    nameAr: 'small',
    labelAr: 'نص صغير للغاية',
    category: 'text',
    type: 'inline',
    desc: 'يجعل حجم النص أصغر مثل نصوص الشروط والأحكام.'
  },
  {
    tag: 'mark',
    nameAr: 'mark',
    labelAr: 'تظليل نصي',
    category: 'text',
    type: 'inline',
    desc: 'يظلل الخلفية باللون الأصفر لجذب الانتباه للكلمة.'
  },
  {
    tag: 'sub',
    nameAr: 'sub',
    labelAr: 'نص منخفض',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص في مستوى منخفض (مثل الصيغ الكيميائية H₂O).'
  },
  {
    tag: 'sup',
    nameAr: 'sup',
    labelAr: 'نص مرتفع',
    category: 'text',
    type: 'inline',
    desc: 'يعرض النص في مستوى مرتفع (مثل الأس الرياضي X²).'
  },
  {
    tag: 'del',
    nameAr: 'del',
    labelAr: 'نص مشطوب (محذوف)',
    category: 'text',
    type: 'inline',
    desc: 'يضع خطاً في منتصف النص للدلالة على حذفه.'
  },
  {
    tag: 'ins',
    nameAr: 'ins',
    labelAr: 'نص مضاف حديثاً',
    category: 'text',
    type: 'inline',
    desc: 'يضع خطاً تحت النص للدلالة على إضافته وتعديله.'
  },
  {
    tag: 'abbr',
    nameAr: 'abbr',
    labelAr: 'اختصار نصي',
    category: 'text',
    type: 'inline',
    desc: 'يوفر تلميحاً يظهر عند وضع مؤشر الفأرة على الاختصار.'
  },
  {
    tag: 'kbd',
    nameAr: 'kbd',
    labelAr: 'زر لوحة المفاتيح',
    category: 'text',
    type: 'inline',
    desc: 'يمثل مدخلات لوحة المفاتيح للمستخدم (مثل Ctrl).'
  },

  // 5. القوائم (6 elements)
  {
    tag: 'ul',
    nameAr: 'ul',
    labelAr: 'قائمة نقطية',
    category: 'lists-tables',
    type: 'block',
    desc: 'قائمة غير مرتبة تظهر عناصرها بنقاط دائرية.'
  },
  {
    tag: 'ol',
    nameAr: 'ol',
    labelAr: 'قائمة مرقمة',
    category: 'lists-tables',
    type: 'block',
    desc: 'قائمة مرتبة متسلسلة تظهر عناصرها بأرقام أو أحرف.'
  },
  {
    tag: 'li',
    nameAr: 'li',
    labelAr: 'عنصر قائمة',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['ul', 'ol'],
    desc: 'يمثل عنصراً فردياً بداخل القائمة النقطية أو الرقمية.'
  },
  {
    tag: 'dl',
    nameAr: 'dl',
    labelAr: 'قائمة وصفية',
    category: 'lists-tables',
    type: 'block',
    desc: 'قائمة تحتوي على مصطلحات وتعاريف مقابلة لها.'
  },
  {
    tag: 'dt',
    nameAr: 'dt',
    labelAr: 'مصطلح وصفي',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['dl'],
    desc: 'الاسم أو المصطلح المراد تعريفه داخل القائمة الوصفية.'
  },
  {
    tag: 'dd',
    nameAr: 'dd',
    labelAr: 'تعريف المصطلح',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['dl'],
    desc: 'شرح أو تعريف المصطلح الوارد في قائمة dl.'
  },

  // 6. الجداول (8 elements)
  {
    tag: 'table',
    nameAr: 'table',
    labelAr: 'جدول كامل',
    category: 'lists-tables',
    type: 'block',
    desc: 'يُستخدم لعرض البيانات على شكل شبكة من الصفوف والأعمدة.'
  },
  {
    tag: 'caption',
    nameAr: 'caption',
    labelAr: 'عنوان الجدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['table'],
    desc: 'يوفر عنواناً توضيحياً أو وصفاً مختصراً للجدول.'
  },
  {
    tag: 'thead',
    nameAr: 'thead',
    labelAr: 'رأس الجدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['table'],
    desc: 'يحتوي على صفوف العناوين الرئيسية للجدول.'
  },
  {
    tag: 'tbody',
    nameAr: 'tbody',
    labelAr: 'جسم الجدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['table'],
    desc: 'يحتوي على البيانات الأساسية ومحتوى الجدول.'
  },
  {
    tag: 'tfoot',
    nameAr: 'tfoot',
    labelAr: 'تذييل الجدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['table'],
    desc: 'يحتوي على مجاميع أو ملاحظات في أسفل الجدول.'
  },
  {
    tag: 'tr',
    nameAr: 'tr',
    labelAr: 'صف جدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['table', 'thead', 'tbody', 'tfoot'],
    desc: 'يمثل صفاً أفقياً من الخلايا داخل الجدول.'
  },
  {
    tag: 'th',
    nameAr: 'th',
    labelAr: 'خلية رأس جدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['tr'],
    desc: 'خلية عنوان في صف الجدول تظهر عادة بخط عريض.'
  },
  {
    tag: 'td',
    nameAr: 'td',
    labelAr: 'خلية بيانات جدول',
    category: 'lists-tables',
    type: 'restricted',
    allowedParents: ['tr'],
    desc: 'خلية بيانات عادية تحتوي على محتوى الصف.'
  },

  // 7. الوسائط والتضمين (9 elements)
  {
    tag: 'img',
    nameAr: 'img',
    labelAr: 'صورة',
    category: 'media',
    type: 'void',
    desc: 'عنصر فارغ يُستخدم لإدراج صورة عن طريق رابط المصدر.'
  },
  {
    tag: 'picture',
    nameAr: 'picture',
    labelAr: 'صورة متجاوبة',
    category: 'media',
    type: 'block',
    desc: 'حاوية تتيح تقديم عدة مصادر للصور بناءً على الشاشة.'
  },
  {
    tag: 'video',
    nameAr: 'video',
    labelAr: 'فيديو تفاعلي',
    category: 'media',
    type: 'block',
    desc: 'لتضمين وعرض مقاطع الفيديو مباشرة مع أزرار تشغيل.'
  },
  {
    tag: 'audio',
    nameAr: 'audio',
    labelAr: 'صوتيات',
    category: 'media',
    type: 'block',
    desc: 'لتشغيل الملفات الصوتية داخل الصفحة.'
  },
  {
    tag: 'iframe',
    nameAr: 'iframe',
    labelAr: 'إطار صفحة خارجي',
    category: 'media',
    type: 'block',
    desc: 'لتضمين صفحة ويب خارجية بالكامل داخل الصفحة الحالية.'
  },
  {
    tag: 'svg',
    nameAr: 'svg',
    labelAr: 'رسم متجهي (SVG)',
    category: 'media',
    type: 'block',
    desc: 'رسم متجهي عالي الدقة مبني على الأكواد الرياضية.'
  },
  {
    tag: 'canvas',
    nameAr: 'canvas',
    labelAr: 'لوحة رسم برمجية',
    category: 'media',
    type: 'block',
    desc: 'منطقة تفاعلية للرسم الثنائي وثلاثي الأبعاد باستخدام JS.'
  },
  {
    tag: 'figcaption',
    nameAr: 'figcaption',
    labelAr: 'تعليق الشكل',
    category: 'media',
    type: 'restricted',
    allowedParents: ['figure'],
    desc: 'تعليق نصي مصاحب للشكل التوضيحي figure.'
  },
  {
    tag: 'source',
    nameAr: 'source',
    labelAr: 'مصدر وسائط',
    category: 'media',
    type: 'restricted',
    allowedParents: ['video', 'audio', 'picture'],
    desc: 'يحدد موارد متعددة للوسائط للـ video أو picture.'
  },

  // 8. النماذج والإدخال (14 elements)
  {
    tag: 'input',
    nameAr: 'input',
    labelAr: 'حقل إدخال (input)',
    category: 'forms',
    type: 'void',
    desc: 'حقل إدخال بيانات مرن يدعم 14 نوعاً مختلفاً.'
  },
  {
    tag: 'textarea',
    nameAr: 'textarea',
    labelAr: 'منطقة نصية متعددة الأسطر',
    category: 'forms',
    type: 'inline',
    desc: 'حقل نصي كبير يتيح للمستخدم إدخال فقرات كاملة.'
  },
  {
    tag: 'select',
    nameAr: 'select',
    labelAr: 'قائمة منسدلة',
    category: 'forms',
    type: 'inline',
    desc: 'قائمة تتيح للمستخدم الاختيار من بين عدة خيارات.'
  },
  {
    tag: 'option',
    nameAr: 'option',
    labelAr: 'خيار قائمة منسدلة',
    category: 'forms',
    type: 'restricted',
    allowedParents: ['select', 'optgroup'],
    desc: 'خيار فردي متاح للاختيار داخل قائمة select.'
  },
  {
    tag: 'label',
    nameAr: 'label',
    labelAr: 'تسمية حقل',
    category: 'forms',
    type: 'inline',
    desc: 'تسمية توضيحية مرتبطة بحقل إدخال لتسهيل الاستخدام.'
  },
  {
    tag: 'button',
    nameAr: 'button',
    labelAr: 'زر تفاعلي',
    category: 'forms',
    type: 'inline',
    desc: 'زر قابل للنقر لتنفيذ عمليات تفاعلية أو إرسال النماذج.'
  },
  {
    tag: 'legend',
    nameAr: 'legend',
    labelAr: 'تسمية الإطار',
    category: 'forms',
    type: 'restricted',
    allowedParents: ['fieldset'],
    desc: 'عنوان لمجموعة الحقول المحاطة بـ fieldset.'
  },
  {
    tag: 'datalist',
    nameAr: 'datalist',
    labelAr: 'قائمة اقتراحات',
    category: 'forms',
    type: 'block',
    desc: 'يوفر خيارات اقتراحات تلقائية لحقل الإدخال أثناء الكتابة.'
  },
  {
    tag: 'progress',
    nameAr: 'progress',
    labelAr: 'شريط تقدم العمل',
    category: 'forms',
    type: 'inline',
    desc: 'شريط يوضح حالة تقدم عملية ما حتى الاكتمال.'
  },
  {
    tag: 'meter',
    nameAr: 'meter',
    labelAr: 'مقياس القيمة',
    category: 'forms',
    type: 'inline',
    desc: 'مقياس يوضح قيمة تقع ضمن نطاق محدد معروف (مثل سعة القرص).'
  },
  {
    tag: 'output',
    nameAr: 'output',
    labelAr: 'مخرج بيانات',
    category: 'forms',
    type: 'inline',
    desc: 'عنصر يمثل نتيجة عملية حسابية أو نصية.'
  },
  {
    tag: 'optgroup',
    nameAr: 'optgroup',
    labelAr: 'مجموعة خيارات',
    category: 'forms',
    type: 'restricted',
    allowedParents: ['select'],
    desc: 'لتجميع الخيارات المتشابهة داخل select تحت اسم تصنيفي.'
  },
  {
    tag: 'summary',
    nameAr: 'summary',
    labelAr: 'ملخص التفاصيل',
    category: 'forms',
    type: 'restricted',
    allowedParents: ['details'],
    desc: 'عنوان الملخص الظاهر لعنصر الكشف details.'
  },

  // 9. روابط ودلالية أخرى (6 elements)
  {
    tag: 'a',
    nameAr: 'a',
    labelAr: 'رابط تفعبي',
    category: 'other',
    type: 'inline',
    desc: 'رابط تشعبي لنقل المستخدم لصفحة أخرى أو لقسم آخر.'
  },
  {
    tag: 'hr',
    nameAr: 'hr',
    labelAr: 'خط فاصل أفقي',
    category: 'other',
    type: 'void',
    desc: 'عنصر فارغ يرسم خطاً أفقياً للفصل بين المواضيع.'
  },
  {
    tag: 'br',
    nameAr: 'br',
    labelAr: 'سطر جديد',
    category: 'other',
    type: 'void',
    desc: 'عنصر فارغ يقوم بنقل النص للسطر التالي فوراً.'
  },
  {
    tag: 'time',
    nameAr: 'time',
    labelAr: 'تاريخ/وقت',
    category: 'other',
    type: 'inline',
    desc: 'تاريخ أو وقت محدد يسهل على محركات البحث قراءته.'
  },
  {
    tag: 'template',
    nameAr: 'template',
    labelAr: 'قالب غير مرئي',
    category: 'other',
    type: 'block',
    desc: 'محتوى خفي لا يُعرض عند تحميل الصفحة، بل يُستنسخ عبر JS.'
  },
  {
    tag: 'wbr',
    nameAr: 'wbr',
    labelAr: 'كسر الكلمة الاختياري',
    category: 'other',
    type: 'void',
    desc: 'يحدد مكاناً مناسباً لكسر الكلمة والانتقال لسطر جديد إذا لزم.'
  }
];

// Helper to get element by tag name
function getElementInfo(tag) {
  return HTML_ELEMENTS_DB.find(el => el.tag === tag);
}

export { HTML_ELEMENTS_DB, getElementInfo };
