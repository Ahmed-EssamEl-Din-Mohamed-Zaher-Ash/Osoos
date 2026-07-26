/* دروس «أُسُس» الجاهزة — كتالوج بيانات خالص، بلا أي اعتماد على المتصفح.
   كل درس يبني تطبيقًا حقيقيًا خطوة بخطوة، وكل خطوة تقول:
     ماذا نضيف (op)، ولماذا نضيفه (why)، وفي أي قائمة يقع (board).

   الترتيب داخل كل درس هو ترتيب الملف الناتج نفسه:
     أولًا التعريف (الصناديق)، ثم المُشغِّل، ثم الشرط، ثم خطوات التنفيذ.
   لهذا تبدأ أغلب الدروس بخطوة «لا تفعل شيئًا الآن» — وهي بالضبط الفكرة
   التي يشرحها حقل why: السطر يحجز خانة لقيمة ستُستعمل بعد قليل.

   الأدوار (roles) أسماء بشرية للعناصر التي يحتاجها الدرس. المُشغِّل يطابقها
   بعناصر الصفحة الفعلية، والمستخدم يستطيع تغيير أي مطابقة. الدور الاختياري
   (optional) تُتخطّى خطواته إن لم يوجد له عنصر، فيبقى الدرس صالحًا. */

(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OsoosInteractionTutorials = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  /* اختصارات تبني كائن الخطوة، لتبقى قوائم الدروس مقروءة كنصّ لا كشيفرة */

  function box(name, valueType, initialValue, title, why) {
    return { id: `box-${name}`, title, why, board: 'declare', op: { type: 'box', name, valueType, initialValue } };
  }

  function trigger(role, event, title, why) {
    return { id: `trigger-${role}`, title, why, board: 'execute', op: { type: 'trigger', role, event } };
  }

  function condition(role, operator, compareValue, title, why) {
    return { id: 'condition', title, why, board: 'execute', op: { type: 'condition', role, operator, compareValue } };
  }

  /* op.group: outside = بلا شرط، inside = عند تحقق الشرط، else = خلافه */
  function step(id, group, kind, title, why, extra) {
    return {
      id, title, why, board: 'execute',
      op: Object.assign({ type: 'action', group, kind }, extra || {})
    };
  }

  const outside = (id, kind, title, why, extra) => step(id, 'outside', kind, title, why, extra);
  const inside = (id, kind, title, why, extra) => step(id, 'inside', kind, title, why, extra);
  const otherwise = (id, kind, title, why, extra) => step(id, 'else', kind, title, why, extra);

  const TUTORIALS = [

    /* ───────────────────────── ١ ───────────────────────── */
    {
      id: 'counter',
      title: 'عدّاد النقرات',
      subtitle: 'زر يحفظ كم مرة ضغطته',
      icon: 'fa-circle-plus',
      difficulty: 1,
      tags: ['صندوق', 'عدّاد', 'كونسول'],
      intro: 'أصغر تطبيق فيه ذاكرة: الصفحة تتذكّر رقمًا وتزيده مع كل ضغطة. لو فهمت هذا الدرس فهمت معنى «الصندوق».',
      event: 'click',
      roles: [
        { key: 'button', label: 'الزر الذي تضغطه', tag: 'button', hint: 'أي زر في الصفحة' },
        { key: 'display', label: 'المكان الذي يظهر فيه الرقم', tag: 'span', hint: 'عنصر نصّي مثل span أو div' }
      ],
      steps: [
        box('clicks', 'Number', '0', 'افتح صندوقًا اسمه clicks',
          'هذا السطر لا ينفّذ شيئًا الآن. هو يحجز خانة في الذاكرة اسمها clicks وبداخلها الرقم صفر. بدون هذه الخانة لا يوجد مكان يُحفظ فيه العدد، وكل ضغطة ستبدأ من الصفر من جديد.'),
        trigger('button', 'click', 'اربط الزر بحدث الضغط',
          'من هنا يبدأ التنفيذ. كل ما يأتي بعد هذه الخطوة لن يعمل إلا لحظة ضغط المستخدم على الزر — لا قبلها ولا بعدها.'),
        outside('bump', 'incrementVariable', 'زد الرقم داخل الصندوق واعرضه',
          'الآن نستعمل الخانة التي حجزناها: نقرأ ما بداخلها، نضيف واحدًا، ونعيد الناتج إليها. ثم نكتب الرقم الجديد داخل العنصر ليراه المستخدم. لاحظ أن الزيادة والعرض شيئان مختلفان: الأول يغيّر الذاكرة، والثاني يغيّر الشاشة.',
          { targetRole: 'display', params: { variableName: 'clicks', step: '1', display: 'yes' } }),
        outside('log', 'consoleLog', 'اطبع الرقم في الكونسول',
          'الكونسول نافذتك على ما يجري داخل البرنامج. اضغط الزر وافتح الكونسول (F12): سترى الرقم يتغيّر مع كل ضغطة. هذه أسرع طريقة للتأكد أن الصندوق يعمل فعلًا بدل التخمين.',
          { valueMode: 'variable', valueVariable: 'clicks', params: { label: 'عدد النقرات', level: 'log' } })
      ]
    },

    /* ───────────────────────── ٢ ───────────────────────── */
    {
      id: 'charCounter',
      title: 'عدّاد الحروف',
      subtitle: 'يعدّ ما تكتبه لحظة بلحظة ويحذّرك عند التجاوز',
      icon: 'fa-i-cursor',
      difficulty: 1,
      tags: ['نصوص', 'شرط', 'حدث input'],
      intro: 'أول درس فيه شرط حقيقي: الرقم يُحسب دائمًا، لكن اللون يتغيّر فقط عند تجاوز الحدّ.',
      event: 'input',
      roles: [
        { key: 'input', label: 'الحقل الذي تكتب فيه', tag: 'input', hint: 'input أو textarea' },
        { key: 'display', label: 'المكان الذي يظهر فيه العدد', tag: 'span', hint: 'عنصر نصّي' }
      ],
      steps: [
        trigger('input', 'input', 'اربط الحقل بحدث الكتابة',
          'حدث input يعمل مع كل حرف تكتبه أو تمسحه — لا عند الانتهاء. لهذا يبدو العدّاد «حيًّا».'),
        outside('count', 'stringLength', 'اقرأ طول النص واحفظه في صندوق',
          'نقرأ ما في الحقل الآن، نحسب عدد حروفه، ونضع الناتج في صندوق اسمه charCount. الحساب وحده لا يُظهر شيئًا على الشاشة — لذلك نحتاج الخطوة التالية.',
          { valueMode: 'element', valueRole: 'input', params: { resultName: 'charCount' } }),
        outside('show', 'setText', 'اكتب العدد داخل العنصر',
          'هنا فقط تنتقل القيمة من الذاكرة إلى الشاشة. هذه هي الحدود الفاصلة بين «البيانات» و«العرض»: خطوة تحسب، وخطوة تعرض.',
          { targetRole: 'display', valueMode: 'variable', valueVariable: 'charCount' }),
        condition('input', 'lengthGreater', '20', 'ضع شرطًا: هل تجاوز النص ٢٠ حرفًا؟',
          'الشرط سؤال بـ«نعم أو لا» يُطرح لحظة التنفيذ. ما بعده ينقسم إلى طريقين: طريق «نعم» وطريق «لا». الخطوات السابقة تبقى خارج الشرط لأنها تعمل في الحالتين.'),
        inside('warn', 'setColor', 'إذا تجاوز: لوّن العدد بالأحمر',
          'هذه الخطوة تعمل فقط حين يكون الجواب «نعم». جرّب أن تكتب أقل من ٢٠ حرفًا ولن تعمل أبدًا.',
          { targetRole: 'display', value: '#ef4444' }),
        otherwise('ok', 'setColor', 'وإلا: أعده إلى الأخضر',
          'وهذه تعمل حين يكون الجواب «لا». وجودها مهم: بدونها سيبقى اللون أحمر حتى بعد أن تمسح الحروف الزائدة، لأن لا أحد أعاده.',
          { targetRole: 'display', value: '#10b981' })
      ]
    },

    /* ───────────────────────── ٣ ───────────────────────── */
    {
      id: 'todoList',
      title: 'قائمة المهام',
      subtitle: 'اكتب مهمة، اضغط، تُضاف إلى القائمة',
      icon: 'fa-list-check',
      difficulty: 2,
      tags: ['قائمة بيانات', 'شرط', 'عرض'],
      intro: 'الدرس الذي يجمع كل شيء: صندوق قائمة، شرط يمنع الفراغ، وعرض يعيد رسم القائمة من البيانات. انتبه للفكرة المحورية: نحن لا نضيف عنصرًا إلى الشاشة، بل نضيف قيمة إلى القائمة ثم نعيد رسم الشاشة منها.',
      event: 'click',
      roles: [
        { key: 'input', label: 'حقل كتابة المهمة', tag: 'input', hint: 'حقل نصّي' },
        { key: 'button', label: 'زر الإضافة', tag: 'button', hint: 'الزر الذي يضيف المهمة' },
        { key: 'list', label: 'القائمة التي تظهر فيها المهام', tag: 'ul', hint: 'عنصر ul أو ol فارغ' },
        { key: 'count', label: 'عدّاد المهام', tag: 'span', hint: 'عنصر نصّي يعرض العدد', optional: true }
      ],
      steps: [
        box('tasks', 'Array', '[]', 'افتح صندوق قائمة اسمه tasks',
          'صندوق عادي يحمل قيمة واحدة. صندوق القائمة يحمل قيمًا كثيرة بالترتيب. نبدأ فارغًا [] لأن المستخدم لم يكتب شيئًا بعد. مرة أخرى: هذا السطر لا يعرض شيئًا، هو يجهّز المكان فقط.'),
        trigger('button', 'click', 'اربط زر الإضافة بحدث الضغط',
          'كل ما بعده يعمل لحظة الضغط. لاحظ أننا اخترنا الزر لا الحقل: الحقل يُكتب فيه، والزر هو من يُطلق العملية.'),
        condition('input', 'notEmpty', '', 'ضع شرطًا: هل الحقل غير فارغ؟',
          'بدون هذا الشرط سيضيف المستخدم مهامًا فارغة كلما ضغط الزر بالخطأ. الشرط هنا حارس على البيانات قبل دخولها.'),
        inside('push', 'arrayPush', 'أضف ما كُتب إلى القائمة',
          'نقرأ قيمة الحقل ونضعها في آخر صندوق القائمة. حتى هذه اللحظة لم يتغيّر شيء على الشاشة إطلاقًا — البيانات تغيّرت والعرض لم يتغيّر بعد. هذا الفصل هو أهم فكرة في الدرس.',
          { valueMode: 'element', valueRole: 'input', params: { arrayName: 'tasks' } }),
        inside('render', 'renderList', 'أعد رسم القائمة من البيانات',
          'الآن نمسح ما في عنصر القائمة ونعيد بناءه من صندوق tasks. لهذا تظهر المهمة الجديدة. وميزة هذه الطريقة أن الشاشة تطابق البيانات دائمًا: لو حذفت أو رتّبت لاحقًا، ستكفي إعادة الرسم نفسها.',
          { targetRole: 'list', params: { arrayName: 'tasks', itemTag: 'li' } }),
        inside('count', 'arrayLength', 'احسب عدد المهام',
          'قراءة طول القائمة لا تغيّرها. نضع الناتج في صندوق جديد اسمه tasksCount لنعرضه بعد قليل.',
          { params: { arrayName: 'tasks', resultName: 'tasksCount' } }),
        inside('showCount', 'setText', 'اعرض العدد للمستخدم',
          'نقل القيمة من الذاكرة إلى الشاشة، تمامًا كما فعلنا في درس عدّاد الحروف. تكرار النمط نفسه في سياق جديد هو ما يثبّته في ذهنك.',
          { targetRole: 'count', valueMode: 'variable', valueVariable: 'tasksCount' }),
        inside('clear', 'clearInput', 'فرّغ الحقل استعدادًا للمهمة التالية',
          'لمسة صغيرة لكنها الفرق بين تطبيق مزعج وتطبيق مريح: المستخدم يكتب المهمة التالية فورًا بلا مسح يدوي.',
          { targetRole: 'input' }),
        otherwise('hintEmpty', 'setPlaceholder', 'وإلا: نبّهه داخل الحقل نفسه',
          'حين يكون الحقل فارغًا لا نضيف شيئًا، لكن الصمت التام يُربك المستخدم. نكتب له التنبيه في مكان نظره — داخل الحقل — بدل نافذة تقطع عمله.',
          { targetRole: 'input', value: 'اكتب المهمة أولًا' })
      ]
    },

    /* ───────────────────────── ٤ ───────────────────────── */
    {
      id: 'carousel',
      title: 'معرض الصور',
      subtitle: 'زر ينقلك بين الصور ويعود للأولى تلقائيًا',
      icon: 'fa-images',
      difficulty: 2,
      tags: ['قائمة بيانات', 'موضع', 'دوران'],
      intro: 'هنا تتعلّم الفكرة التي يقوم عليها كل معرض صور: قائمة بالصور، ورقم يقول «أين نحن الآن».',
      event: 'click',
      roles: [
        { key: 'button', label: 'زر «التالي»', tag: 'button', hint: 'الزر الذي ينقل الصورة' },
        { key: 'image', label: 'الصورة المعروضة', tag: 'img', hint: 'عنصر img' }
      ],
      steps: [
        box('slides', 'Array', "['https://picsum.photos/id/1015/600/400', 'https://picsum.photos/id/1025/600/400', 'https://picsum.photos/id/1035/600/400']",
          'افتح قائمة بروابط الصور',
          'الصور ليست في الصفحة، بل في قائمة داخل الذاكرة. عنصر img واحد فقط يعرض واحدة منها في كل مرة. لو أردت صورة رابعة تضيفها هنا ولا تلمس الصفحة إطلاقًا.'),
        box('slideIndex', 'Number', '0', 'افتح صندوقًا للموضع الحالي',
          'رقم صغير يحمل معنى كبير: «أي صورة نعرضها الآن». الموضع يبدأ من صفر لا من واحد — أول عنصر في أي قائمة موضعه صفر. هذه نقطة يخطئ فيها الجميع في البداية.'),
        trigger('button', 'click', 'اربط الزر بحدث الضغط',
          'من هنا يبدأ التنفيذ مع كل ضغطة على «التالي».'),
        outside('next', 'incrementVariable', 'زد الموضع ودُر داخل القائمة',
          'زيادة عادية، لكن مع «دُر داخل القائمة»: عند آخر صورة يعود الرقم إلى الصفر بدل أن يتجاوز نهاية القائمة. اختر «لا» في خانة العرض لأن هذا الرقم داخلي — المستخدم لا يريد رؤيته، يريد رؤية الصورة.',
          { params: { variableName: 'slideIndex', step: '1', display: 'no', cycleArray: 'slides' } }),
        outside('pick', 'arrayItem', 'خذ رابط الصورة الموجودة في هذا الموضع',
          'عندنا الموضع، ونريد ما بداخله. هذه الخطوة تفتح القائمة عند الرقم وتخرج القيمة إلى صندوق currentSlide. لاحظ الاتجاه: من الرقم إلى القيمة.',
          { params: { arrayName: 'slides', index: 'slideIndex', resultName: 'currentSlide' } }),
        outside('apply', 'setSrc', 'ضع الرابط في الصورة',
          'الخطوة الوحيدة التي تلمس الشاشة. الخطوتان قبلها عملتا في الذاكرة فقط. هذا هو ترتيب أي تطبيق حقيقي: احسب أولًا، اعرض أخيرًا.',
          { targetRole: 'image', valueMode: 'variable', valueVariable: 'currentSlide' })
      ]
    },

    /* ───────────────────────── ٥ ───────────────────────── */
    {
      id: 'slider',
      title: 'شريط التحكم',
      subtitle: 'اسحب الشريط فيتغيّر عرض العمود أمامك',
      icon: 'fa-sliders',
      difficulty: 2,
      tags: ['نصوص', 'تنسيق', 'حدث input'],
      intro: 'درس صغير يكشف حقيقة مهمة: قيمة الشريط رقم، لكن CSS لا يفهم الرقم وحده — يحتاج «50%». لذلك سنبني النص بأنفسنا.',
      event: 'input',
      roles: [
        { key: 'range', label: 'شريط التحكم', tag: 'input', inputType: 'range', hint: 'input من نوع range' },
        { key: 'bar', label: 'العمود الذي يتغيّر عرضه', tag: 'div', hint: 'عنصر div له لون خلفية' },
        { key: 'label', label: 'المكان الذي تظهر فيه النسبة', tag: 'span', hint: 'عنصر نصّي', optional: true }
      ],
      steps: [
        trigger('range', 'input', 'اربط الشريط بحدث السحب',
          'حدث input يعمل أثناء السحب نفسه، لا بعد إفلات الإصبع. لهذا يبدو التغيير فوريًا.'),
        outside('read', 'setVariable', 'اقرأ قيمة الشريط واحفظها',
          'نأخذ القيمة الحالية ونضعها في صندوق level. الشريط يعطينا رقمًا مثل 50، بلا أي وحدة قياس.',
          { valueMode: 'element', valueRole: 'range', params: { variableName: 'level' } }),
        outside('unit', 'stringConcat', 'ألصق علامة % بالرقم',
          'هنا لبّ الدرس: 50 وحده لا معنى له في CSS، أما "50%" فله معنى. نلصق العلامة بالرقم فينتج نصّ صالح للاستعمال في التنسيق. هذه العملية اسمها «الدمج».',
          { valueMode: 'variable', valueVariable: 'level', params: { suffix: '%', separator: '', resultName: 'levelWidth' } }),
        outside('apply', 'setStyle', 'اجعل عرض العمود يساوي هذا النص',
          'الآن نعطي CSS ما يفهمه. جرّب السحب: العمود يتحرّك مع إصبعك.',
          { targetRole: 'bar', valueMode: 'variable', valueVariable: 'levelWidth', params: { property: 'width' } }),
        outside('show', 'setText', 'اعرض النسبة مكتوبة',
          'نستعمل النص نفسه مرة أخرى. صندوق واحد يخدم مكانين: التنسيق والعرض. هذه فائدة حفظ القيمة في صندوق بدل حسابها مرتين.',
          { targetRole: 'label', valueMode: 'variable', valueVariable: 'levelWidth' })
      ]
    },

    /* ───────────────────────── ٦ ───────────────────────── */
    {
      id: 'searchFilter',
      title: 'بحث فوري',
      subtitle: 'اكتب حرفًا فتُصفّى القائمة أمامك',
      icon: 'fa-magnifying-glass',
      difficulty: 3,
      tags: ['قائمة بيانات', 'تصفية', 'عرض'],
      intro: 'ثلاث خطوات فقط، لكنها تشرح كيف تعمل كل خانة بحث رأيتها في حياتك: اقرأ ما كُتب، صفِّ البيانات، أعد الرسم.',
      event: 'input',
      roles: [
        { key: 'input', label: 'خانة البحث', tag: 'input', hint: 'حقل نصّي' },
        { key: 'list', label: 'القائمة التي تُصفّى', tag: 'ul', hint: 'عنصر ul أو ol' }
      ],
      steps: [
        box('items', 'Array', "['تفاح', 'موز', 'برتقال', 'تمر', 'عنب', 'تين']",
          'افتح قائمة بالبيانات الأصلية',
          'انتبه: هذه هي القائمة الكاملة، ولن نغيّرها أبدًا. التصفية ستنتج قائمة جديدة وتترك الأصل سليمًا — وإلا فقدت البيانات مع أول بحث ولن تعود.'),
        trigger('input', 'input', 'اربط خانة البحث بحدث الكتابة',
          'مع كل حرف تُعاد العملية كاملة من أولها. هذا ما يجعل النتيجة تتبع الكتابة لحظة بلحظة.'),
        outside('read', 'setVariable', 'اقرأ ما كتبه المستخدم',
          'نضع النص المكتوب في صندوق searchText لنقارن به في الخطوة التالية.',
          { valueMode: 'element', valueRole: 'input', params: { variableName: 'searchText' } }),
        outside('filter', 'arrayFilter', 'صفِّ القائمة بما يحتوي هذا النص',
          'اكتب اسم الصندوق searchText في خانة المقارنة لا كلمة ثابتة — فتقارن بما بداخله لحظة التنفيذ. الناتج قائمة جديدة اسمها foundItems، والقائمة الأصلية كما هي.',
          { params: { arrayName: 'items', operator: 'includes', compareValue: 'searchText', resultName: 'foundItems' } }),
        outside('render', 'renderList', 'اعرض القائمة المُصفّاة',
          'نرسم من foundItems لا من items. امسح ما كتبته وستعود القائمة كاملة تلقائيًا — لأن التصفية بنصّ فارغ تُبقي كل شيء.',
          { targetRole: 'list', params: { arrayName: 'foundItems', itemTag: 'li' } })
      ]
    },

    /* ───────────────────────── ٧ ───────────────────────── */
    {
      id: 'darkMode',
      title: 'الوضع الليلي',
      subtitle: 'زر يبدّل مظهر الصفحة ويتذكّر اختيارك',
      icon: 'fa-moon',
      difficulty: 2,
      tags: ['صندوق منطقي', 'أصناف', 'تخزين'],
      intro: 'أول درس يتذكّر شيئًا بعد إغلاق الصفحة. ستتعلّم فيه الصندوق المنطقي (نعم/لا) والتخزين الدائم.',
      event: 'click',
      roles: [
        { key: 'button', label: 'زر التبديل', tag: 'button', hint: 'زر الوضع الليلي' },
        { key: 'page', label: 'الحاوية التي يتغيّر مظهرها', tag: 'div', hint: 'الإطار الخارجي للصفحة' }
      ],
      steps: [
        box('isDark', 'Boolean', 'false', 'افتح صندوقًا منطقيًا اسمه isDark',
          'صندوق لا يقبل إلا قيمتين: صحيح أو خطأ. نبدأ بـ false أي «الوضع النهاري». الصندوق المنطقي هو الطريقة التي يحفظ بها البرنامج حالة تُشبه المفتاح: مضاء أو مطفأ.'),
        trigger('button', 'click', 'اربط الزر بحدث الضغط',
          'كل ضغطة ستقلب الحالة إلى عكسها.'),
        outside('toggle', 'toggleBoolean', 'اقلب الحالة وبدّل الصنف معها',
          'خطوة واحدة تفعل شيئين مترابطين: تقلب قيمة الصندوق إلى عكسها، وتضيف صنف dark إلى العنصر أو تزيله تبعًا للقيمة الجديدة. التنسيق نفسه مكتوب في CSS — نحن نكتفي بتشغيله وإطفائه.',
          { targetRole: 'page', params: { variableName: 'isDark', className: 'dark' } }),
        outside('save', 'localStorageSet', 'احفظ الاختيار في المتصفح',
          'الصندوق يعيش في الذاكرة، والذاكرة تُمسح عند إغلاق الصفحة. التخزين يكتب القيمة على قرص المستخدم فتبقى بعد إغلاق المتصفح. هذا الفرق بين «يتذكّر أثناء الجلسة» و«يتذكّر دائمًا».',
          { valueMode: 'variable', valueVariable: 'isDark', params: { key: 'osoosTheme' } }),
        outside('log', 'consoleLog', 'اطبع الحالة في الكونسول',
          'راقب القيمة تنقلب بين true و false مع كل ضغطة. رؤية الصندوق يتغيّر تجعل الفكرة ملموسة بدل أن تكون تخمينًا.',
          { valueMode: 'variable', valueVariable: 'isDark', params: { label: 'الوضع الليلي', level: 'log' } })
      ]
    },

    /* ───────────────────────── ٨ ───────────────────────── */
    {
      id: 'modal',
      title: 'نافذة منبثقة',
      subtitle: 'زر يفتح النافذة ويغلقها',
      icon: 'fa-window-maximize',
      difficulty: 1,
      tags: ['إظهار وإخفاء', 'صندوق منطقي'],
      intro: 'درس قصير يوضّح فكرة «الحالة»: الشاشة تعرض شيئًا، والذاكرة تعرف لماذا تعرضه.',
      event: 'click',
      roles: [
        { key: 'button', label: 'الزر الذي يفتح ويغلق', tag: 'button', hint: 'زر واحد يقوم بالأمرين' },
        { key: 'modal', label: 'النافذة نفسها', tag: 'div', hint: 'الصندوق الذي يظهر ويختفي' }
      ],
      steps: [
        box('isOpen', 'Boolean', 'false', 'افتح صندوقًا منطقيًا اسمه isOpen',
          'قد تسأل: لماذا نحفظ الحالة والشاشة تُظهرها أصلًا؟ لأن سؤال الشاشة بطيء وهشّ، أما الصندوق فجواب فوري ومؤكّد. البرامج الحقيقية تحتفظ بحالتها في الذاكرة وتجعل الشاشة تتبعها.'),
        trigger('button', 'click', 'اربط الزر بحدث الضغط',
          'الزر نفسه يفتح ويغلق — لأن كل ضغطة تقلب الحالة إلى عكسها.'),
        outside('flag', 'toggleBoolean', 'اقلب الحالة وبدّل صنف الظهور',
          'قيمة الصندوق تنقلب، والصنف is-open يُضاف أو يُزال معها. من هذه اللحظة تستطيع أن تسأل «هل النافذة مفتوحة؟» وتحصل على جواب من الذاكرة مباشرة.',
          { targetRole: 'modal', params: { variableName: 'isOpen', className: 'is-open' } }),
        outside('visible', 'toggleVisibility', 'أظهر النافذة أو أخفها',
          'الصنف يتكفّل بالمظهر، وهذه الخطوة تتكفّل بالوجود نفسه: العنصر يختفي عن القارئ الآلي وعن ترتيب التنقل بلوحة المفاتيح، لا عن العين فقط.',
          { targetRole: 'modal' }),
        outside('log', 'consoleLog', 'اطبع الحالة لتتابعها',
          'اضغط مرتين وراقب الكونسول: true ثم false. هذا هو معنى «التبديل» مرئيًّا.',
          { valueMode: 'variable', valueVariable: 'isOpen', params: { label: 'النافذة مفتوحة', level: 'log' } })
      ]
    },

    /* ───────────────────────── ٩ ───────────────────────── */
    {
      id: 'formValidate',
      title: 'تحقّق من النموذج',
      subtitle: 'يفحص البريد قبل الإرسال ويردّ عليك',
      icon: 'fa-circle-check',
      difficulty: 2,
      tags: ['شرط', 'رسائل'],
      intro: 'أوضح درس لفهم الطريقين: طريق «نعم» وطريق «لا». كل واحد منهما يكتب رسالة مختلفة ولونًا مختلفًا.',
      event: 'click',
      roles: [
        { key: 'input', label: 'حقل البريد', tag: 'input', hint: 'حقل يكتب فيه المستخدم بريده' },
        { key: 'button', label: 'زر الإرسال', tag: 'button', hint: 'الزر الذي يبدأ الفحص' },
        { key: 'message', label: 'مكان الرسالة', tag: 'span', hint: 'عنصر نصّي تحت الحقل' }
      ],
      steps: [
        trigger('button', 'click', 'اربط زر الإرسال بحدث الضغط',
          'الفحص يبدأ عند الضغط لا أثناء الكتابة — حتى لا نزعج المستخدم قبل أن ينتهي.'),
        condition('input', 'includes', '@', 'ضع شرطًا: هل يحتوي البريد على @؟',
          'فحص مبسّط لكنه حقيقي. المهم أن تفهم الشكل: سؤال واحد ينقسم بعده المسار إلى فرعين لا يلتقيان.'),
        inside('okText', 'setText', 'إذا نعم: اكتب رسالة القبول',
          'الفرع الأول. لن تصل إليه إلا إذا تحقّق الشرط.',
          { targetRole: 'message', value: 'البريد صحيح ✓' }),
        inside('okColor', 'setColor', 'ولوّنها بالأخضر',
          'خطوتان داخل الفرع نفسه تعملان معًا. الترتيب مهم: الرسالة أولًا ثم لونها.',
          { targetRole: 'message', value: '#10b981' }),
        otherwise('badText', 'setText', 'وإلا: اكتب سبب الرفض',
          'الفرع الثاني. لاحظ أننا نقول للمستخدم ما ينقصه بالضبط، لا مجرد «خطأ». الرسالة المفيدة نصفها الحل.',
          { targetRole: 'message', value: 'اكتب بريدًا صحيحًا فيه @' }),
        otherwise('badColor', 'setColor', 'ولوّنها بالأحمر',
          'الآن جرّب: اكتب بريدًا صحيحًا ثم خاطئًا. الرسالة واللون يتبدّلان معًا لأن كل فرع يكتب نسخته كاملة.',
          { targetRole: 'message', value: '#ef4444' })
      ]
    },

    /* ───────────────────────── ١٠ ───────────────────────── */
    {
      id: 'shoppingCart',
      title: 'سلة المشتريات',
      subtitle: 'أضف أسعارًا فيُحسب المجموع تلقائيًا',
      icon: 'fa-cart-shopping',
      difficulty: 3,
      tags: ['قائمة بيانات', 'حساب', 'عرض'],
      intro: 'نفس هيكل قائمة المهام، لكن بدل عدّ العناصر نجمع قيمها. لو أتقنت الدرسين معًا تكون قد فهمت كيف تُبنى أغلب التطبيقات.',
      event: 'click',
      roles: [
        { key: 'input', label: 'حقل السعر', tag: 'input', hint: 'حقل رقمي' },
        { key: 'button', label: 'زر الإضافة', tag: 'button', hint: 'زر «أضف إلى السلة»' },
        { key: 'list', label: 'قائمة الأسعار', tag: 'ul', hint: 'عنصر ul' },
        { key: 'total', label: 'مكان المجموع', tag: 'span', hint: 'عنصر نصّي' }
      ],
      steps: [
        box('prices', 'Array', '[]', 'افتح قائمة فارغة للأسعار',
          'مكان تتجمّع فيه الأسعار واحدًا بعد الآخر. فارغة الآن لأن السلة فارغة.'),
        trigger('button', 'click', 'اربط زر الإضافة بحدث الضغط',
          'كل ضغطة تعني «أضف هذا السعر إلى السلة».'),
        condition('input', 'notEmpty', '', 'ضع شرطًا: هل كُتب سعر؟',
          'حارس على البيانات: سعر فارغ يفسد المجموع كله، ومنعه هنا أسهل من إصلاحه لاحقًا.'),
        inside('push', 'arrayPush', 'أضف السعر إلى القائمة',
          'القيمة تدخل الذاكرة. الشاشة لم تتغيّر بعد — كما تعلّمنا في قائمة المهام.',
          { valueMode: 'element', valueRole: 'input', params: { arrayName: 'prices' } }),
        inside('render', 'renderList', 'اعرض الأسعار في القائمة',
          'إعادة رسم كاملة من البيانات. نفس الخطوة تمامًا التي استعملناها في قائمة المهام وبحث فوري — لأن الفكرة واحدة مهما اختلف التطبيق.',
          { targetRole: 'list', params: { arrayName: 'prices', itemTag: 'li' } }),
        inside('sum', 'arraySum', 'اجمع كل الأرقام في القائمة',
          'الفرق الوحيد عن قائمة المهام: هناك عددنا العناصر، وهنا نجمع قيمها. القائمة نفسها لا تتغيّر — الجمع قراءة لا تعديل.',
          { params: { arrayName: 'prices', resultName: 'totalPrice' } }),
        inside('show', 'setText', 'اعرض المجموع',
          'من الذاكرة إلى الشاشة. أضف ثلاثة أسعار وراقب المجموع يتغيّر مع كل إضافة.',
          { targetRole: 'total', valueMode: 'variable', valueVariable: 'totalPrice' }),
        inside('clear', 'clearInput', 'فرّغ حقل السعر',
          'استعداد للسعر التالي بلا مسح يدوي.',
          { targetRole: 'input' }),
        otherwise('hint', 'setPlaceholder', 'وإلا: نبّه داخل الحقل',
          'تنبيه هادئ في مكان نظر المستخدم بدل نافذة تقطع عمله.',
          { targetRole: 'input', value: 'اكتب السعر أولًا' })
      ]
    },

    /* ───────────────────────── ١١ ───────────────────────── */
    {
      id: 'livePreview',
      title: 'معاينة حيّة',
      subtitle: 'ما تكتبه يظهر فورًا في مكان آخر',
      icon: 'fa-eye',
      difficulty: 1,
      tags: ['ربط', 'حدث input'],
      intro: 'أبسط شكل من أشكال «الربط»: حقل يكتب، وعنصر آخر يعكس ما كُتب لحظة بلحظة.',
      event: 'input',
      roles: [
        { key: 'input', label: 'الحقل الذي تكتب فيه', tag: 'input', hint: 'input أو textarea' },
        { key: 'preview', label: 'مكان المعاينة', tag: 'div', hint: 'عنصر يعرض النص' }
      ],
      steps: [
        trigger('input', 'input', 'اربط الحقل بحدث الكتابة',
          'مع كل حرف. جرّب لاحقًا تغيير الحدث إلى change وستلاحظ أن المعاينة لم تعد فورية — فرق الحدثين يظهر بالتجربة أسرع من أي شرح.'),
        outside('mirror', 'setText', 'انسخ النص إلى مكان المعاينة',
          'قراءة من عنصر وكتابة في عنصر آخر. لاحظ أننا لم نستعمل أي صندوق هنا: القيمة تنتقل مباشرة لأننا لا نحتاج حفظها أو تعديلها.',
          { targetRole: 'preview', valueMode: 'element', valueRole: 'input' }),
        outside('len', 'stringLength', 'احسب طول النص',
          'الآن نحتاج صندوقًا فعلًا، لأننا سنستعمل الرقم في الخطوة التالية. هذا هو معيار الحاجة إلى صندوق: هل ستستعمل القيمة مرة أخرى؟',
          { valueMode: 'element', valueRole: 'input', params: { resultName: 'previewLength' } }),
        outside('log', 'consoleLog', 'اطبع الطول في الكونسول',
          'الكونسول مكان مناسب للأرقام التي تهمّك أنت كمطوّر ولا تهمّ المستخدم. لا تُثقل الشاشة بما يخصّك وحدك.',
          { valueMode: 'variable', valueVariable: 'previewLength', params: { label: 'طول النص', level: 'log' } })
      ]
    },

    /* ───────────────────────── ١٢ ───────────────────────── */
    {
      id: 'accordion',
      title: 'لوحة قابلة للطي',
      subtitle: 'عنوان يفتح ما تحته ويغلقه',
      icon: 'fa-chevron-down',
      difficulty: 2,
      tags: ['إظهار وإخفاء', 'وصولية'],
      intro: 'يشبه النافذة المنبثقة، لكنه يضيف درسًا مهمًّا: كيف تخبر قارئ الشاشة بما يراه المبصر.',
      event: 'click',
      roles: [
        { key: 'button', label: 'عنوان اللوحة', tag: 'button', hint: 'الزر الذي تضغطه' },
        { key: 'panel', label: 'المحتوى الذي ينطوي', tag: 'div', hint: 'الصندوق الذي يظهر ويختفي' }
      ],
      steps: [
        box('isExpanded', 'Boolean', 'false', 'افتح صندوقًا منطقيًا للحالة',
          'مطويّة في البداية. القيمة false تعني «مغلقة».'),
        trigger('button', 'click', 'اربط العنوان بحدث الضغط',
          'العنوان نفسه هو المفتاح — لهذا يجب أن يكون زرًّا لا مجرّد نصّ، حتى يعمل بلوحة المفاتيح أيضًا.'),
        outside('flag', 'toggleBoolean', 'اقلب الحالة وبدّل الصنف',
          'الصندوق ينقلب والصنف يتبعه، تمامًا كما في الوضع الليلي والنافذة المنبثقة. ثلاثة تطبيقات مختلفة تستعمل النمط نفسه — هكذا تُبنى المهارة.',
          { targetRole: 'panel', params: { variableName: 'isExpanded', className: 'is-expanded' } }),
        outside('visible', 'toggleVisibility', 'أظهر المحتوى أو أخفه',
          'الإخفاء الحقيقي يخرج المحتوى من ترتيب التنقل بلوحة المفاتيح، فلا يتوه المستخدم في محتوى غير مرئي.',
          { targetRole: 'panel' }),
        outside('aria', 'setAttribute', 'أخبر قارئ الشاشة بالحالة',
          'خاصية aria-expanded تنقل الحالة إلى من لا يرى الشاشة. نضع فيها قيمة الصندوق نفسها، فتبقى مطابقة للواقع دائمًا. هذا هو الفرق بين واجهة تعمل وواجهة تعمل للجميع.',
          { targetRole: 'button', valueMode: 'variable', valueVariable: 'isExpanded', params: { name: 'aria-expanded' } })
      ]
    },

    /* ───────────────────────── ١٣ ───────────────────────── */
    {
      id: 'copyToClipboard',
      title: 'نسخ إلى الحافظة',
      subtitle: 'زر ينسخ النص ويؤكّد النسخ',
      icon: 'fa-copy',
      difficulty: 1,
      tags: ['متصفح', 'شرط', 'رسائل'],
      intro: 'درس قصير يفتح بابًا جديدًا: أدوات المتصفح نفسه، لا الصفحة فقط.',
      event: 'click',
      roles: [
        { key: 'input', label: 'الحقل الذي يحمل النص', tag: 'input', hint: 'حقل فيه النص المراد نسخه' },
        { key: 'button', label: 'زر النسخ', tag: 'button', hint: 'الزر الذي ينسخ' },
        { key: 'message', label: 'مكان رسالة التأكيد', tag: 'span', hint: 'عنصر نصّي', optional: true }
      ],
      steps: [
        trigger('button', 'click', 'اربط زر النسخ بحدث الضغط',
          'النسخ يحتاج فعلًا صريحًا من المستخدم — المتصفح لا يسمح بالنسخ التلقائي حمايةً له.'),
        condition('input', 'notEmpty', '', 'ضع شرطًا: هل يوجد نص أصلًا؟',
          'نسخ الفراغ عملية بلا معنى تُربك المستخدم برسالة نجاح كاذبة. الشرط يمنعها.'),
        inside('copy', 'clipboard', 'انسخ محتوى الحقل إلى الحافظة',
          'هذه الخطوة لا تلمس الصفحة إطلاقًا — تتحدّث إلى المتصفح نفسه. جرّب بعدها اللصق في أي مكان خارج المتصفح وستجد النص هناك.',
          { valueMode: 'element', valueRole: 'input' }),
        inside('ok', 'setText', 'أكّد للمستخدم أن النسخ تمّ',
          'النسخ عملية غير مرئية تمامًا: لا شيء على الشاشة يتغيّر. بدون هذه الرسالة سيضغط المستخدم مرتين وثلاثًا ظنًّا أن الزر معطّل.',
          { targetRole: 'message', value: 'تم النسخ ✓' }),
        otherwise('empty', 'setText', 'وإلا: قل له إن الحقل فارغ',
          'رسالة صادقة تشرح سبب عدم حدوث شيء، بدل صمت يبدو كعطل.',
          { targetRole: 'message', value: 'لا يوجد نص لنسخه' })
      ]
    },

    /* ───────────────────────── ١٤ ───────────────────────── */
    {
      id: 'stringLab',
      title: 'مختبر النصوص',
      subtitle: 'قصّ النص وغيّر حروفه وراقب كل خطوة في الكونسول',
      icon: 'fa-scissors',
      difficulty: 2,
      tags: ['نصوص', 'كونسول', 'تقطيع'],
      intro: 'درس للتجريب لا لبناء تطبيق: تكتب نصًّا، فتراه يُقصّ ويتحوّل، وتتابع كل قيمة وسيطة في الكونسول. هكذا يجرّب المبرمجون أفكارهم قبل استعمالها.',
      event: 'click',
      roles: [
        { key: 'input', label: 'حقل النص', tag: 'input', hint: 'اكتب فيه جملة' },
        { key: 'button', label: 'زر التنفيذ', tag: 'button', hint: 'الزر الذي يشغّل العمليات' },
        { key: 'output', label: 'مكان الناتج', tag: 'span', hint: 'عنصر نصّي', optional: true }
      ],
      steps: [
        trigger('button', 'click', 'اربط الزر بحدث الضغط',
          'كل ضغطة تُعيد تشغيل سلسلة العمليات على النص الموجود حينها.'),
        outside('read', 'setVariable', 'اقرأ النص واحفظه في صندوق',
          'نحفظه لأننا سنطبّق عليه أكثر من عملية. لو استعملناه مرة واحدة لما احتجنا الصندوق.',
          { valueMode: 'element', valueRole: 'input', params: { variableName: 'fullText' } }),
        outside('slice', 'stringSlice', 'اقطع أول خمسة حروف',
          'القصّ يبدأ من الموضع صفر وينتهي قبل الموضع خمسة — أي خمسة حروف. القاعدة نفسها التي رأيتها في القوائم: العدّ يبدأ من صفر، والنهاية غير داخلة. والأهم: النص الأصلي لم يُمَسّ، خرج منه نصّ جديد.',
          { valueMode: 'variable', valueVariable: 'fullText', params: { start: '0', end: '5', resultName: 'firstPart' } }),
        outside('upper', 'stringCase', 'حوّل النص الأصلي إلى حروف كبيرة',
          'عملية أخرى على النص نفسه. لاحظ أن fullText ما زال كما كتبه المستخدم: كل عملية تنتج نسخة جديدة ولا تُتلف الأصل. هذه فكرة تتكرر في النصوص والقوائم معًا.',
          { valueMode: 'variable', valueVariable: 'fullText', params: { mode: 'upper', resultName: 'upperText' } }),
        outside('logSlice', 'consoleLog', 'اطبع الجزء المقطوع',
          'افتح الكونسول (F12) واضغط الزر. رؤية القيمة الوسيطة بعينك أسرع طريق لفهم ما فعلته العملية.',
          { valueMode: 'variable', valueVariable: 'firstPart', params: { label: 'أول خمسة حروف', level: 'log' } }),
        outside('logUpper', 'consoleLog', 'اطبع النص بحروف كبيرة',
          'قيمتان مطبوعتان من نص واحد. هذه هي طريقة العمل الحقيقية: تجرّب، تطبع، تقارن، ثم تقرّر أيّ ناتج ستعرضه.',
          { valueMode: 'variable', valueVariable: 'upperText', params: { label: 'بحروف كبيرة', level: 'log' } }),
        outside('show', 'setText', 'اعرض الجزء المقطوع على الشاشة',
          'وأخيرًا ننقل ما يهمّ المستخدم إلى الشاشة، ونترك الباقي في الكونسول لنا.',
          { targetRole: 'output', valueMode: 'variable', valueVariable: 'firstPart' })
      ]
    }
  ];

  const BY_ID = TUTORIALS.reduce((map, tutorial) => {
    map[tutorial.id] = tutorial;
    return map;
  }, {});

  function getTutorial(id) {
    return BY_ID[String(id || '')] || null;
  }

  /* بطاقة مختصرة لشاشة الاختيار: بلا خطوات، حتى لا تُنسخ البيانات كاملة */
  function listTutorials() {
    return TUTORIALS.map(tutorial => ({
      id: tutorial.id,
      title: tutorial.title,
      subtitle: tutorial.subtitle,
      icon: tutorial.icon,
      difficulty: tutorial.difficulty,
      tags: (tutorial.tags || []).slice(),
      intro: tutorial.intro,
      stepCount: tutorial.steps.length,
      roleCount: tutorial.roles.length
    }));
  }

  /* فحص ذاتيّ للكتالوج: يمسك أخطاء الكتابة (دور غير معرَّف، خطوة بلا سبب،
     لوح لا يطابق نوع الخطوة) قبل أن تصل إلى المستخدم كدرس مكسور. */
  function validateTutorials() {
    const errors = [];
    const seen = new Set();

    TUTORIALS.forEach(tutorial => {
      const where = `الدرس ${tutorial.id}`;
      if (seen.has(tutorial.id)) errors.push(`${where}: معرّف مكرّر.`);
      seen.add(tutorial.id);

      ['title', 'subtitle', 'icon', 'intro'].forEach(field => {
        if (!String(tutorial[field] || '').trim()) errors.push(`${where}: الحقل ${field} فارغ.`);
      });

      const roleKeys = new Set();
      (tutorial.roles || []).forEach(role => {
        if (!role.key) errors.push(`${where}: دور بلا مفتاح.`);
        if (roleKeys.has(role.key)) errors.push(`${where}: الدور ${role.key} مكرّر.`);
        roleKeys.add(role.key);
        if (!String(role.label || '').trim()) errors.push(`${where}: الدور ${role.key} بلا اسم بشري.`);
      });

      if (!Array.isArray(tutorial.steps) || !tutorial.steps.length) {
        errors.push(`${where}: بلا خطوات.`);
        return;
      }

      const stepIds = new Set();
      let triggerCount = 0;
      let conditionCount = 0;
      let sawExecute = false;
      const boxNames = new Set();

      tutorial.steps.forEach((entry, index) => {
        const at = `${where} · الخطوة ${index + 1}`;
        if (!entry.id) errors.push(`${at}: بلا معرّف.`);
        if (stepIds.has(entry.id)) errors.push(`${at}: المعرّف ${entry.id} مكرّر.`);
        stepIds.add(entry.id);
        if (!String(entry.title || '').trim()) errors.push(`${at}: بلا عنوان.`);
        if (!String(entry.why || '').trim()) errors.push(`${at}: بلا شرح للفائدة.`);

        const op = entry.op || {};
        const expectedBoard = op.type === 'box' || op.type === 'preCode' || op.type === 'recipe' ? 'declare' : 'execute';
        if (entry.board !== expectedBoard) {
          errors.push(`${at}: اللوح ${entry.board} لا يطابق نوع الخطوة ${op.type}.`);
        }
        /* التعريف يسبق التنفيذ في الملف، فيسبقه في الدرس أيضًا */
        if (entry.board === 'execute') sawExecute = true;
        else if (sawExecute) errors.push(`${at}: خطوة تعريف بعد خطوات تنفيذ — الترتيب يخالف ترتيب الملف.`);

        if (op.type === 'box') {
          if (boxNames.has(op.name)) errors.push(`${at}: الصندوق ${op.name} معرَّف مرتين.`);
          boxNames.add(op.name);
          if (!/^[A-Za-z_$][\w$]*$/.test(String(op.name || ''))) errors.push(`${at}: اسم صندوق غير صالح.`);
        }
        if (op.type === 'trigger') {
          triggerCount += 1;
          if (index !== tutorial.steps.findIndex(item => item.op && item.op.type === 'trigger')) return;
        }
        if (op.type === 'condition') conditionCount += 1;

        ['role', 'targetRole', 'valueRole'].forEach(field => {
          const value = op[field];
          if (value && !roleKeys.has(value)) errors.push(`${at}: الدور ${value} غير معرَّف في الدرس.`);
        });

        if (op.type === 'action' && !['inside', 'else', 'outside'].includes(op.group)) {
          errors.push(`${at}: مجموعة غير معروفة ${op.group}.`);
        }
        if (op.type === 'action' && !op.kind) errors.push(`${at}: بطاقة بلا نوع.`);
      });

      if (triggerCount !== 1) errors.push(`${where}: يجب أن يحمل مُشغّلًا واحدًا لا ${triggerCount}.`);
      if (conditionCount > 1) errors.push(`${where}: شرط واحد على الأكثر.`);

      /* بطاقات inside/else بلا شرط تسقط في العدم، وشرط بلا بطاقات يُلغى */
      const branched = tutorial.steps.some(entry =>
        entry.op && entry.op.type === 'action' && ['inside', 'else'].includes(entry.op.group));
      if (branched && !conditionCount) errors.push(`${where}: توجد خطوات متفرّعة بلا شرط يفتحها.`);
      if (conditionCount && !branched) errors.push(`${where}: شرط بلا خطوات متفرّعة تحته.`);
    });

    return { valid: errors.length === 0, errors };
  }

  return { TUTORIALS, getTutorial, listTutorials, validateTutorials };
});
