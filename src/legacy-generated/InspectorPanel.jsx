/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

export function InspectorPanel() {
  return (
    <section className={"side-panel panel-left"}>
      {"\n        "}
      <div className={"panel-header"}>
        {"\n          "}
        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
          {"\n            "}
          <span id={"left-panel-title"}>
            {"التنسيق – كل خصائص CSS"}
          </span>
          {"\n            "}
          <span style={{"fontSize":"11px","color":"var(--text-muted)"}} id={"left-panel-count"}>
            {"148 خاصية"}
          </span>
          {"\n          "}
        </div>
        {"\n          "}
        <button className={"panel-toggle-btn"} id={"collapse-left-btn"} title={"طوي القائمة"}>
          {"\n            "}
          <i className={"fas fa-chevron-right"}></i>
          {"\n          "}
        </button>
        {"\n        "}
      </div>
      {"\n        \n        "}
      <div className={"panel-content"} style={{"position":"relative","overflowY":"auto"}}>
        {"\n          "}
        {"\n          "}
        <div id={"css-properties-container"} style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
          {"\n          "}
          {"\n          "}
          <div style={{"backgroundColor":"var(--bg-tertiary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)","padding":"8px","marginBottom":"12px"}}>
            {"\n            "}
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px"}}>
              {"\n              "}
              <span className={"selector-badge"} id={"active-selector-display"} style={{"marginBottom":"0"}}>
                {"#hero .card"}
              </span>
              {"\n              "}
              <div className={"element-ancestry"} id={"element-ancestry"} hidden></div>
              {"\n              "}
              <label className={"checkbox-container"}>
                {"\n                "}
                <input type={"checkbox"} id={"prop-important"} />
                {"\n                "}
                <span className={"checkbox-custom"}></span>
                {"\n                "}
                <span style={{"fontSize":"10px","fontFamily":"monospace"}}>
                  {"!important"}
                </span>
                {"\n              "}
              </label>
              {"\n            "}
            </div>
            {"\n            \n            "}
            {"\n            "}
            <div style={{"display":"flex","flexWrap":"wrap","gap":"4px","borderTop":"1px solid var(--border-color)","paddingTop":"6px"}} id={"pseudo-states-row"}>
              {"\n              "}
              <button className={"btn btn-outline active pseudo-btn"} data-state={"normal"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"عادي"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"hover"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"hover:"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"active"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"active:"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"focus"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"focus:"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"nth-child"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"nth-child:"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"before"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"+ before::"}
              </button>
              {"\n              "}
              <button className={"btn btn-outline pseudo-btn"} data-state={"after"} style={{"height":"22px","padding":"0 6px","fontSize":"9px"}}>
                {"+ after::"}
              </button>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n          \n          "}
          {"\n          "}
          <div style={{"backgroundColor":"rgba(16, 185, 129, 0.08)","border":"1px dashed var(--accent-green)","color":"var(--accent-green)","padding":"6px 10px","borderRadius":"var(--radius-md)","fontSize":"9px","marginBottom":"12px","display":"flex","alignItems":"center","justifyContent":"space-between","cursor":"pointer"}} title={"اضغط لقطع التوارث"}>
            {"\n            "}
            <span>
              {"موروث من body: font-family · color"}
            </span>
            {"\n            "}
            <i className={"fas fa-unlink"}></i>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          {"\n          "}
          <div className={"accordion open"} id={"accordion-image-editor"} style={{"display":"none","borderBottom":"1px solid var(--border-color)","background":"rgba(245, 158, 11, 0.03)"}}>
            {"\n            "}
            <div className={"accordion-summary"} style={{"color":"var(--accent-orange)","fontWeight":"bold","fontSize":"12px","padding":"12px 8px","cursor":"pointer","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
              {"\n              "}
              <span>
                <i className={"fas fa-image"} style={{"marginLeft":"6px"}}></i>
                {"محرر الصورة (Image Editor)"}
              </span>
              {"\n            "}
            </div>
            {"\n            "}
            <div className={"accordion-details"} style={{"padding":"12px","display":"block","background":"rgba(0, 0, 0, 0.2)"}}>
              {"\n              "}
              {"\n              "}
              <div style={{"display":"flex","justifyContent":"center","marginBottom":"10px","background":"rgba(0, 0, 0, 0.4)","padding":"8px","borderRadius":"var(--radius-md)","border":"1px solid var(--border-color)","position":"relative","minHeight":"80px","alignItems":"center"}}>
                {"\n                "}
                <img id={"prop-img-preview"} src={undefined} style={{"maxWidth":"100%","maxHeight":"100px","objectFit":"contain","borderRadius":"var(--radius-sm)","display":"none"}} />
                {"\n                "}
                <div id={"prop-img-preview-placeholder"} style={{"color":"var(--text-muted)","fontSize":"10px","padding":"10px 0"}}>
                  <i className={"fas fa-image"} style={{"fontSize":"24px","marginBottom":"6px","display":"block","textAlign":"center"}}></i>
                  {"لا توجد صورة معاينة"}
                </div>
                {"\n              "}
              </div>
              {"\n              \n              "}
              {"\n              "}
              <div style={{"marginBottom":"10px"}}>
                {"\n                "}
                <input type={"file"} id={"prop-img-file"} accept={"image/*"} style={{"display":"none"}} />
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-img-file-btn"} style={{"width":"100%","height":"28px","fontSize":"11px","display":"flex","alignItems":"center","justifyContent":"center","gap":"6px","padding":"0"}}>
                  {"\n                  "}
                  <i className={"fas fa-upload"}></i>
                  {" اختيار صورة من الجهاز\n                "}
                </button>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div id={"prop-img-size-warning"} style={{"display":"none","color":"var(--accent-orange)","fontSize":"10px","background":"rgba(245, 158, 11, 0.1)","border":"1px solid rgba(245, 158, 11, 0.3)","padding":"6px","borderRadius":"var(--radius-sm)","marginBottom":"10px","lineHeight":"1.4"}}>
                {"\n                ⚠️ تنبيه: حجم الصورة كبير جداً. استخدام صور كبيرة كـ Data URL يزيد من حجم ملف HTML المصدّر ويقلل من سرعة التحميل.\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"رابط الصورة URL"}
                </span>
                {"\n                "}
                <input type={"text"} id={"prop-img-src"} className={"css-prop-field"} style={{"width":"130px","fontFamily":"monospace","height":"26px","padding":"0 8px","fontSize":"11px"}} placeholder={"https://example.com/img.jpg"} />
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"النص البديل Alt"}
                </span>
                {"\n                "}
                <input type={"text"} id={"prop-img-alt"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}} placeholder={"وصف الصورة"} />
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"ملاءمة الصورة (Fit)"}
                </span>
                {"\n                "}
                <select id={"prop-img-fit"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}}>
                  {"\n                  "}
                  <option value={"cover"}>
                    {"cover"}
                  </option>
                  {"\n                  "}
                  <option value={"contain"}>
                    {"contain"}
                  </option>
                  {"\n                  "}
                  <option value={"fill"}>
                    {"fill"}
                  </option>
                  {"\n                  "}
                  <option value={"none"}>
                    {"none"}
                  </option>
                  {"\n                  "}
                  <option value={"scale-down"}>
                    {"scale-down"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"6px","marginTop":"8px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-img-remove"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"إزالة الصورة"}
                </button>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-img-replace"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"استبدال الصورة"}
                </button>
                {"\n              "}
              </div>
              {"\n              "}
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"6px","marginTop":"6px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-img-cancel"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"إلغاء"}
                </button>
                {"\n                "}
                <button type={"button"} className={"btn btn-primary"} id={"prop-img-apply"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"تطبيق"}
                </button>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion open"} id={"accordion-text-editor"} style={{"display":"none","borderBottom":"1px solid var(--border-color)","background":"rgba(245, 158, 11, 0.03)"}}>
            {"\n            "}
            <div className={"accordion-summary"} style={{"color":"var(--accent-orange)","fontWeight":"bold","fontSize":"12px","padding":"12px 8px","cursor":"pointer","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
              {"\n              "}
              <span>
                <i className={"fas fa-align-right"} style={{"marginLeft":"6px"}}></i>
                {"محرر المحتوى (Text Editor)"}
              </span>
              {"\n            "}
            </div>
            {"\n            "}
            <div className={"accordion-details"} style={{"padding":"12px","display":"block","background":"rgba(0, 0, 0, 0.2)"}}>
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","flexDirection":"column","alignItems":"stretch","gap":"6px","marginBottom":"10px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","textAlign":"right","marginBottom":"2px"}}>
                  {"محتوى النص (Content)"}
                </span>
                {"\n                "}
                <textarea id={"prop-text-content"} className={"css-prop-field"} style={{"width":"100%","height":"80px","fontSize":"11px","padding":"8px","resize":"vertical","fontFamily":"inherit","lineHeight":"1.4","backgroundColor":"var(--bg-tertiary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-sm)","color":"var(--text-main)"}} placeholder={"اكتب نص العنصر هنا..."}></textarea>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"طريقة التطبيق"}
                </span>
                {"\n                "}
                <select id={"prop-text-mode"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}}>
                  {"\n                  "}
                  <option value={"textContent"}>
                    {"textContent (افتراضي)"}
                  </option>
                  {"\n                  "}
                  <option value={"innerText"}>
                    {"innerText"}
                  </option>
                  {"\n                  "}
                  <option value={"innerHTML"}>
                    {"innerHTML (متقدم)"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div id={"prop-text-html-warning"} style={{"display":"none","color":"var(--accent-orange)","fontSize":"10px","background":"rgba(245, 158, 11, 0.1)","border":"1px solid rgba(245, 158, 11, 0.3)","padding":"6px","borderRadius":"var(--radius-sm)","marginBottom":"10px","lineHeight":"1.4"}}>
                {"\n                ⚠️ تحذير: استخدام innerHTML قد يسبب ثغرات أمنية (XSS) أو يكسر بنية الصفحة إذا تم كتابة وسوم غير مغلقة بشكل صحيح.\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"display":"flex","gap":"6px","marginTop":"8px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-text-restore"} style={{"flex":"1","height":"28px","fontSize":"11px","padding":"0"}}>
                  {"استعادة النص"}
                </button>
                {"\n              "}
              </div>
              {"\n              "}
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"6px","marginTop":"6px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-text-cancel"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"إلغاء"}
                </button>
                {"\n                "}
                <button type={"button"} className={"btn btn-primary"} id={"prop-text-apply"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"تطبيق"}
                </button>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion open"} id={"accordion-link-editor"} style={{"display":"none","borderBottom":"1px solid var(--border-color)","background":"rgba(245, 158, 11, 0.03)"}}>
            {"\n            "}
            <div className={"accordion-summary"} style={{"color":"var(--accent-orange)","fontWeight":"bold","fontSize":"12px","padding":"12px 8px","cursor":"pointer","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
              {"\n              "}
              <span>
                <i className={"fas fa-link"} style={{"marginLeft":"6px"}}></i>
                {"محرر الرابط (Link Editor)"}
              </span>
              {"\n            "}
            </div>
            {"\n            "}
            <div className={"accordion-details"} style={{"padding":"12px","display":"block","background":"rgba(0, 0, 0, 0.2)"}}>
              {"\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"نص الرابط"}
                </span>
                {"\n                "}
                <input type={"text"} id={"prop-link-text"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}} placeholder={"نص الرابط الظاهر"} />
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"نوع الرابط"}
                </span>
                {"\n                "}
                <select id={"prop-link-type"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}}>
                  {"\n                  "}
                  <option value={"external"}>
                    {"رابط خارجي"}
                  </option>
                  {"\n                  "}
                  <option value={"internal"}>
                    {"صفحة داخلية"}
                  </option>
                  {"\n                  "}
                  <option value={"section"}>
                    {"قسم داخل الصفحة"}
                  </option>
                  {"\n                  "}
                  <option value={"mailto"}>
                    {"بريد إلكتروني (mailto)"}
                  </option>
                  {"\n                  "}
                  <option value={"tel"}>
                    {"رقم هاتف (tel)"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"رابط التوجيه (href)"}
                </span>
                {"\n                "}
                <input type={"text"} id={"prop-link-href"} className={"css-prop-field"} style={{"width":"130px","fontFamily":"monospace","height":"26px","padding":"0 8px","fontSize":"11px"}} placeholder={"https://example.com"} />
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"فتح الرابط (target)"}
                </span>
                {"\n                "}
                <select id={"prop-link-target"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}}>
                  {"\n                  "}
                  <option value={"_self"}>
                    {"نفس التبويب (_self)"}
                  </option>
                  {"\n                  "}
                  <option value={"_blank"}>
                    {"تبويب جديد (_blank)"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px","gap":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"11px","color":"var(--text-muted)","flex":"1"}}>
                  {"خاصية rel"}
                </span>
                {"\n                "}
                <input type={"text"} id={"prop-link-rel"} className={"css-prop-field"} style={{"width":"130px","height":"26px","padding":"0 8px","fontSize":"11px"}} placeholder={"noopener noreferrer"} />
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"display":"flex","gap":"6px","marginTop":"8px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-link-test"} style={{"flex":"1","height":"28px","fontSize":"11px","padding":"0","display":"flex","alignItems":"center","justifyContent":"center","gap":"4px"}}>
                  {"\n                  "}
                  <i className={"fas fa-external-link-alt"}></i>
                  {" تجربة الرابط\n                "}
                </button>
                {"\n              "}
              </div>
              {"\n              "}
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"6px","marginTop":"6px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-secondary"} id={"prop-link-cancel"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"إلغاء"}
                </button>
                {"\n                "}
                <button type={"button"} className={"btn btn-primary"} id={"prop-link-apply"} style={{"height":"28px","fontSize":"11px","padding":"0"}}>
                  {"تطبيق"}
                </button>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion open"} id={"accordion-flex-layout"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"Flex — الحاوية والابن "}
              <span className={"flex-status-indicator"} id={"flex-status-indicator"}>
                {"—"}
              </span>
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-scope-guide container-guide"}>
                {"\n                "}
                <i className={"fas fa-boxes-stacked"}></i>
                {"\n                "}
                <span>
                  <strong>
                    {"خصائص الحاوية/الأب:"}
                  </strong>
                  {" تُضاف للعنصر المختار وتُنظّم أبناءه المباشرين."}
                </span>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"segmented-control display-segments"} id={"display-segmented"} data-css-property={"display"} data-scope={"container"}>
                {"\n                "}
                <button className={"segment-btn"} data-val={"none"}>
                  {"none"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"inline"}>
                  {"inline"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"inline-block"}>
                  {"inline-block"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"block"}>
                  {"block"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"flex"}>
                  {"flex"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"inline-flex"}>
                  {"inline-flex"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"grid"}>
                  {"grid"}
                </button>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"flex-only-section flex-container-controls"} data-scope={"container"}>
                {"\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"flex-direction"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wide-segments"} id={"flex-dir-segmented"} data-css-property={"flex-direction"} data-scope={"container"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"row"}>
                      {"صف"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"row-reverse"}>
                      {"صف معكوس"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"column"}>
                      {"عمود"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"column-reverse"}>
                      {"عمود معكوس"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"flex-wrap"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control"} id={"flex-wrap-segmented"} data-css-property={"flex-wrap"} data-scope={"container"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"nowrap"}>
                      {"nowrap"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"wrap"}>
                      {"wrap"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"wrap-reverse"}>
                      {"reverse"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row css-prop-row-stacked"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"justify-content"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wrap-segments"} id={"justify-segmented"} data-css-property={"justify-content"} data-scope={"container"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-start"}>
                      {"بداية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"center"}>
                      {"وسط"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-end"}>
                      {"نهاية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"space-between"}>
                      {"بين"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"space-around"}>
                      {"حول"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"space-evenly"}>
                      {"بالتساوي"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"align-items"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wrap-segments"} id={"align-segmented"} data-css-property={"align-items"} data-scope={"container"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-start"}>
                      {"بداية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"center"}>
                      {"وسط"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-end"}>
                      {"نهاية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"stretch"}>
                      {"تمدد"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"baseline"}>
                      {"baseline"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row css-prop-row-stacked"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"align-content"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wrap-segments"} id={"align-content-segmented"} data-css-property={"align-content"} data-scope={"container"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"stretch"}>
                      {"تمدد"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-start"}>
                      {"بداية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"center"}>
                      {"وسط"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-end"}>
                      {"نهاية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"space-between"}>
                      {"بين"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"space-around"}>
                      {"حول"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"gap"}
                  </span>
                  {"\n                  "}
                  <div className={"range-with-value"}>
                    {"\n                    "}
                    <input type={"range"} className={"prop-slider"} id={"prop-gap-slider"} min={"0"} max={"96"} defaultValue={"0"} data-css-property={"gap"} data-scope={"container"} />
                    {"\n                    "}
                    <span className={"slider-val"} id={"prop-gap-val"}>
                      {"0px"}
                    </span>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"compact-field-grid"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"row-gap"}
                    </span>
                    <input type={"text"} className={"css-prop-field"} id={"prop-row-gap"} defaultValue={"0px"} data-css-property={"row-gap"} data-scope={"container"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"column-gap"}
                    </span>
                    <input type={"text"} className={"css-prop-field"} id={"prop-column-gap"} defaultValue={"0px"} data-css-property={"column-gap"} data-scope={"container"} />
                  </label>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"flex-item-divider"}></div>
              {"\n              "}
              <div className={"css-scope-guide item-guide"}>
                {"\n                "}
                <i className={"fas fa-cube"}></i>
                {"\n                "}
                <span>
                  <strong>
                    {"خصائص عنصر Flex الابن:"}
                  </strong>
                  {" تُضاف للعنصر المختار نفسه، وليس للأب."}
                </span>
                {"\n              "}
              </div>
              {"\n              "}
              <div className={"flex-item-context-status"} id={"flex-item-context-status"}>
                {"اختر ابناً داخل حاوية Flex."}
              </div>
              {"\n              "}
              <div className={"flex-item-controls"} data-scope={"item"}>
                {"\n                "}
                <div className={"css-prop-row css-prop-row-stacked"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"flex presets"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wrap-segments"} id={"flex-preset-segmented"} data-css-property={"flex"} data-scope={"item"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"0 1 auto"}>
                      {"initial"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"1 1 0%"}>
                      {"fill"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"0 0 auto"}>
                      {"none"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"1 0 auto"}>
                      {"grow"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n                "}
                <label className={"css-inline-field"}>
                  <span>
                    {"flex"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"prop-flex-value"} defaultValue={"0 1 auto"} data-css-property={"flex"} data-scope={"item"} />
                </label>
                {"\n                "}
                <div className={"compact-field-grid compact-field-grid-3"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"grow"}
                    </span>
                    <input type={"number"} min={"0"} step={"0.1"} className={"css-prop-field"} id={"prop-flex-grow"} defaultValue={"0"} data-css-property={"flex-grow"} data-scope={"item"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"shrink"}
                    </span>
                    <input type={"number"} min={"0"} step={"0.1"} className={"css-prop-field"} id={"prop-flex-shrink"} defaultValue={"1"} data-css-property={"flex-shrink"} data-scope={"item"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"basis"}
                    </span>
                    <input type={"text"} className={"css-prop-field"} id={"prop-flex-basis"} defaultValue={"auto"} data-css-property={"flex-basis"} data-scope={"item"} />
                  </label>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <label className={"css-inline-field"}>
                    <span>
                      {"order"}
                    </span>
                    <input type={"number"} className={"css-prop-field"} id={"prop-flex-order"} defaultValue={"0"} data-css-property={"order"} data-scope={"item"} />
                  </label>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"css-prop-row css-prop-row-stacked"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"align-self"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control wrap-segments"} id={"align-self-segmented"} data-css-property={"align-self"} data-scope={"item"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"auto"}>
                      {"auto"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-start"}>
                      {"بداية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"center"}>
                      {"وسط"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"flex-end"}>
                      {"نهاية"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"stretch"}>
                      {"تمدد"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n          \n          "}
          {"\n          "}
          <div className={"accordion open"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"Box Model والأبعاد"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              \n              "}
              {"\n              "}
              <div className={"box-model-widget"}>
                {"\n                "}
                <div className={"box-margin"} style={{"backgroundColor":"var(--bg-hover)"}}>
                  {"\n                  "}
                  {"\n                  "}
                  <span className={"box-value top"} data-prop={"margin-top"} id={"bm-mt"}>
                    {"12"}
                  </span>
                  {"\n                  "}
                  <span className={"box-value bottom"} data-prop={"margin-bottom"} id={"bm-mb"}>
                    {"12"}
                  </span>
                  {"\n                  "}
                  <span className={"box-value left"} data-prop={"margin-left"} id={"bm-ml"}>
                    {"auto"}
                  </span>
                  {"\n                  "}
                  <span className={"box-value right"} data-prop={"margin-right"} id={"bm-mr"}>
                    {"auto"}
                  </span>
                  {"\n                  \n                  "}
                  <div className={"box-padding"} style={{"backgroundColor":"rgba(16, 185, 129, 0.05)","borderColor":"rgba(16, 185, 129, 0.2)"}}>
                    {"\n                    "}
                    {"\n                    "}
                    <span className={"box-value top"} data-prop={"padding-top"} id={"bm-pt"}>
                      {"16"}
                    </span>
                    {"\n                    "}
                    <span className={"box-value bottom"} data-prop={"padding-bottom"} id={"bm-pb"}>
                      {"16"}
                    </span>
                    {"\n                    "}
                    <span className={"box-value left"} data-prop={"padding-left"} id={"bm-pl"}>
                      {"16"}
                    </span>
                    {"\n                    "}
                    <span className={"box-value right"} data-prop={"padding-right"} id={"bm-pr"}>
                      {"16"}
                    </span>
                    {"\n                    \n                    "}
                    <div className={"box-center"} id={"bm-dimensions"} style={{"backgroundColor":"var(--bg-primary)"}}>
                      {"\n                      120 × 240\n                    "}
                    </div>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-dimension-controls"}>
                {"\n                "}
                <div className={"css-scope-guide neutral-guide"}>
                  <i className={"fas fa-ruler-combined"}></i>
                  <span>
                    {"اكتب القيمة مباشرة: "}
                    <code>
                      {"320px"}
                    </code>
                    {" أو "}
                    <code>
                      {"50%"}
                    </code>
                    {" أو "}
                    <code>
                      {"clamp(16rem, 50vw, 60rem)"}
                    </code>
                    {"."}
                  </span>
                </div>
                {"\n                "}
                <datalist id={"css-size-presets"}>
                  {"\n                  "}
                  <option value={"auto"}></option>
                  <option value={"100%"}></option>
                  <option value={"fit-content"}></option>
                  {"\n                  "}
                  <option value={"min-content"}></option>
                  <option value={"max-content"}></option>
                  <option value={"100vw"}></option>
                  <option value={"100vh"}></option>
                  {"\n                "}
                </datalist>
                {"\n                "}
                <div className={"compact-field-grid"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"width"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-width-select"} defaultValue={"auto"} data-css-property={"width"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"height"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-height-select"} defaultValue={"auto"} data-css-property={"height"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"min-width"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-min-width"} defaultValue={"0px"} data-css-property={"min-width"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"max-width"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-max-width"} defaultValue={"none"} data-css-property={"max-width"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"min-height"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-min-height"} defaultValue={"0px"} data-css-property={"min-height"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"max-height"}
                    </span>
                    <input list={"css-size-presets"} type={"text"} className={"css-prop-field"} id={"prop-max-height"} defaultValue={"none"} data-css-property={"max-height"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"aspect-ratio"}
                    </span>
                    <input type={"text"} className={"css-prop-field"} id={"prop-aspect-ratio"} defaultValue={"auto"} placeholder={"16 / 9"} data-css-property={"aspect-ratio"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"overflow"}
                    </span>
                    <select className={"css-prop-field"} id={"prop-overflow"} data-css-property={"overflow"}>
                      <option value={"visible"}>
                        {"visible"}
                      </option>
                      <option value={"hidden"}>
                        {"hidden"}
                      </option>
                      <option value={"clip"}>
                        {"clip"}
                      </option>
                      <option value={"scroll"}>
                        {"scroll"}
                      </option>
                      <option value={"auto"}>
                        {"auto"}
                      </option>
                    </select>
                  </label>
                  {"\n                "}
                </div>
                {"\n\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"box-sizing"}
                  </span>
                  {"\n                  "}
                  <div className={"segmented-control"} id={"box-sizing-segmented"} data-css-property={"box-sizing"}>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"content-box"}>
                      {"content-box"}
                    </button>
                    {"\n                    "}
                    <button className={"segment-btn"} data-val={"border-box"}>
                      {"border-box"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"الموضع والطبقات"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-scope-guide neutral-guide"}>
                <i className={"fas fa-crosshairs"}></i>
                <span>
                  {"الإزاحات تعمل فقط مع position غير "}
                  <code>
                    {"static"}
                  </code>
                  {". اكتب "}
                  <code>
                    {"auto"}
                  </code>
                  {" أو قيمة بأي وحدة."}
                </span>
              </div>
              {"\n              "}
              <div className={"segmented-control position-segments"} id={"position-segmented"} data-css-property={"position"}>
                {"\n                "}
                <button className={"segment-btn"} data-val={"static"}>
                  {"static"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"relative"}>
                  {"relative"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"absolute"}>
                  {"absolute"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"fixed"}>
                  {"fixed"}
                </button>
                {"\n                "}
                <button className={"segment-btn"} data-val={"sticky"}>
                  {"sticky"}
                </button>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"compact-field-grid position-offset-grid"}>
                {"\n                "}
                <label>
                  <span>
                    {"top"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"prop-top"} defaultValue={"auto"} data-css-property={"top"} />
                </label>
                {"\n                "}
                <label>
                  <span>
                    {"right"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"prop-right"} defaultValue={"auto"} data-css-property={"right"} />
                </label>
                {"\n                "}
                <label>
                  <span>
                    {"bottom"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"prop-bottom"} defaultValue={"auto"} data-css-property={"bottom"} />
                </label>
                {"\n                "}
                <label>
                  <span>
                    {"left"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"prop-left"} defaultValue={"auto"} data-css-property={"left"} />
                </label>
                {"\n                "}
                <label>
                  <span>
                    {"z-index"}
                  </span>
                  <input type={"number"} className={"css-prop-field"} id={"prop-z-index"} placeholder={"auto"} data-css-property={"z-index"} />
                </label>
                {"\n                "}
                <label>
                  <span>
                    {"float"}
                  </span>
                  <select className={"css-prop-field"} id={"prop-float"} data-css-property={"float"}>
                    <option value={"none"}>
                      {"none"}
                    </option>
                    <option value={"left"}>
                      {"left"}
                    </option>
                    <option value={"right"}>
                      {"right"}
                    </option>
                  </select>
                </label>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"الألوان والخلفيات"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"النص"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"4px"}}>
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"color-hex-text"} defaultValue={"#2A1D05"} style={{"width":"70px","height":"22px","fontFamily":"monospace","fontSize":"10px","textAlign":"left","direction":"ltr"}} />
                  {"\n                  "}
                  <input type={"color"} className={"color-picker-swatch"} id={"prop-color"} defaultValue={"#2A1D05"} style={{"border":"none","width":"22px","height":"22px","padding":"0","background":"none","cursor":"pointer"}} />
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"الخلفية"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"4px"}}>
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"bg-hex-text"} defaultValue={"#FFFAF0"} style={{"width":"70px","height":"22px","fontFamily":"monospace","fontSize":"10px","textAlign":"left","direction":"ltr"}} />
                  {"\n                  "}
                  <input type={"color"} className={"color-picker-swatch"} id={"prop-bg"} defaultValue={"#FFFAF0"} style={{"border":"none","width":"22px","height":"22px","padding":"0","background":"none","cursor":"pointer"}} />
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"gradient-builder"} id={"gradient-builder"}>
                {"\n                "}
                <div className={"css-prop-row"} style={{"marginTop":"8px"}}>
                  {"\n                  "}
                  <span className={"css-prop-label"} data-css-property={"background-image"}>
                    {"تدرج الخلفية"}
                  </span>
                  {"\n                  "}
                  <select id={"gradient-type"} className={"css-prop-field"} style={{"width":"76px","height":"22px","fontSize":"10px","padding":"0 4px"}}>
                    {"\n                    "}
                    <option value={"none"} selected>
                      {"بدون"}
                    </option>
                    {"\n                    "}
                    <option value={"linear"}>
                      {"خطي"}
                    </option>
                    {"\n                    "}
                    <option value={"radial"}>
                      {"دائري"}
                    </option>
                    {"\n                  "}
                  </select>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"css-prop-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"اللونان"}
                  </span>
                  {"\n                  "}
                  <div style={{"display":"flex","alignItems":"center","gap":"6px"}}>
                    {"\n                    "}
                    <input type={"color"} className={"color-picker-swatch"} id={"gradient-color-1"} defaultValue={"#f59e0b"} title={"لون البداية"} style={{"border":"none","width":"22px","height":"22px","padding":"0","background":"none","cursor":"pointer"}} />
                    {"\n                    "}
                    <input type={"color"} className={"color-picker-swatch"} id={"gradient-color-2"} defaultValue={"#3b82f6"} title={"لون النهاية"} style={{"border":"none","width":"22px","height":"22px","padding":"0","background":"none","cursor":"pointer"}} />
                    {"\n                    "}
                    <button type={"button"} className={"btn btn-outline"} id={"gradient-swap-btn"} title={"تبديل اللونين"} style={{"height":"22px","padding":"0 7px","fontSize":"10px"}}>
                      <i className={"fas fa-right-left"}></i>
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"css-prop-row"} id={"gradient-angle-row"}>
                  {"\n                  "}
                  <span className={"css-prop-label"}>
                    {"الزاوية"}
                  </span>
                  {"\n                  "}
                  <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                    {"\n                    "}
                    <input type={"range"} className={"prop-slider"} id={"gradient-angle"} min={"0"} max={"360"} defaultValue={"90"} style={{"flex":"1"}} />
                    {"\n                    "}
                    <span className={"slider-val"} id={"gradient-angle-val"}>
                      {"90°"}
                    </span>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"gradient-live-preview"} id={"gradient-live-preview"} title={"معاينة التدرج الحالي"}></div>
                {"\n              "}
              </div>
              {"\n              \n\n\n              "}
              <div className={"background-image-editor"}>
                {"\n                "}
                <div className={"css-scope-guide neutral-guide"}>
                  <i className={"fas fa-image"}></i>
                  <span>
                    {"أضف رابط صورة أو ارفع ملفًا؛ الخلفية ستُكتب كـ "}
                    <code>
                      {"background-image"}
                    </code>
                    {" داخل CSS."}
                  </span>
                </div>
                {"\n                "}
                <label className={"css-inline-field css-inline-field-stacked"}>
                  {"\n                  "}
                  <span>
                    {"رابط الصورة URL"}
                  </span>
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-bg-image-url"} placeholder={"https://example.com/background.jpg"} dir={"ltr"} data-css-property={"background-image"} />
                  {"\n                "}
                </label>
                {"\n                "}
                <input type={"file"} id={"prop-bg-image-file"} accept={"image/*"} hidden />
                {"\n                "}
                <div className={"background-image-actions"}>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-secondary"} id={"choose-bg-image-btn"}>
                    <i className={"fas fa-upload"}></i>
                    {" رفع صورة"}
                  </button>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-outline"} id={"remove-bg-image-btn"}>
                    <i className={"fas fa-times"}></i>
                    {" إزالة"}
                  </button>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"compact-field-grid"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"size"}
                    </span>
                    <select className={"css-prop-field"} id={"prop-bg-size"} data-css-property={"background-size"}>
                      <option value={"cover"}>
                        {"cover"}
                      </option>
                      <option value={"contain"}>
                        {"contain"}
                      </option>
                      <option value={"auto"}>
                        {"auto"}
                      </option>
                      <option value={"100% 100%"}>
                        {"stretch"}
                      </option>
                    </select>
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"position"}
                    </span>
                    <input type={"text"} className={"css-prop-field"} id={"prop-bg-position"} defaultValue={"center center"} data-css-property={"background-position"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"repeat"}
                    </span>
                    <select className={"css-prop-field"} id={"prop-bg-repeat"} data-css-property={"background-repeat"}>
                      <option value={"no-repeat"}>
                        {"no-repeat"}
                      </option>
                      <option value={"repeat"}>
                        {"repeat"}
                      </option>
                      <option value={"repeat-x"}>
                        {"repeat-x"}
                      </option>
                      <option value={"repeat-y"}>
                        {"repeat-y"}
                      </option>
                    </select>
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"attachment"}
                    </span>
                    <select className={"css-prop-field"} id={"prop-bg-attachment"} data-css-property={"background-attachment"}>
                      <option value={"scroll"}>
                        {"scroll"}
                      </option>
                      <option value={"fixed"}>
                        {"fixed"}
                      </option>
                      <option value={"local"}>
                        {"local"}
                      </option>
                    </select>
                  </label>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"الحدود والزوايا والظلال"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              \n              "}
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"radius"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"4px"}}>
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-radius-1"} defaultValue={"10"} style={{"width":"24px","height":"22px","fontSize":"10px","textAlign":"center","padding":"0"}} title={"أعلى يسار"} />
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-radius-2"} defaultValue={"10"} style={{"width":"24px","height":"22px","fontSize":"10px","textAlign":"center","padding":"0"}} title={"أعلى يمين"} />
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-radius-3"} defaultValue={"10"} style={{"width":"24px","height":"22px","fontSize":"10px","textAlign":"center","padding":"0"}} title={"أسفل يمين"} />
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-radius-4"} defaultValue={"10"} style={{"width":"24px","height":"22px","fontSize":"10px","textAlign":"center","padding":"0"}} title={"أسفل يسار"} />
                  {"\n                  "}
                  <button className={"btn btn-outline"} style={{"width":"22px","height":"22px","padding":"0"}}>
                    <i className={"fas fa-link"} style={{"fontSize":"8px"}}></i>
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"border"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"4px"}}>
                  {"\n                  "}
                  <input type={"text"} className={"css-prop-field"} id={"prop-border-width"} defaultValue={"2px"} style={{"width":"32px","height":"22px","fontSize":"10px","textAlign":"center","padding":"0"}} />
                  {"\n                  "}
                  <select className={"css-prop-field"} id={"prop-border-style"} style={{"width":"56px","height":"22px","fontSize":"9px","padding":"0 2px"}}>
                    {"\n                    "}
                    <option value={"solid"} selected>
                      {"solid"}
                    </option>
                    {"\n                    "}
                    <option value={"dashed"}>
                      {"dashed"}
                    </option>
                    {"\n                    "}
                    <option value={"dotted"}>
                      {"dotted"}
                    </option>
                    {"\n                    "}
                    <option value={"none"}>
                      {"none"}
                    </option>
                    {"\n                  "}
                  </select>
                  {"\n                  "}
                  <input type={"color"} className={"color-picker-swatch"} id={"prop-border-color"} defaultValue={"#f59e0b"} style={{"border":"none","width":"22px","height":"22px","padding":"0","background":"none","cursor":"pointer"}} />
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"borderTop":"1px solid var(--border-color)","paddingTop":"8px","marginTop":"8px"}}>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px"}}>
                  {"\n                  "}
                  <span style={{"fontSize":"10px","color":"var(--text-muted)","fontWeight":"600"}}>
                    {"الظلال (Box Shadows)"}
                  </span>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-outline"} id={"add-shadow-layer"} style={{"height":"20px","fontSize":"9px","padding":"0 6px"}}>
                    {"+ إضافة ظل"}
                  </button>
                  {"\n                "}
                </div>
                {"\n                \n                "}
                {"\n                "}
                <div style={{"display":"flex","flexDirection":"column","gap":"6px"}} id={"shadow-layers-list"}>
                  {"\n                  "}
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"الخطوط والنصوص"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-prop-row"} style={{"position":"relative"}}>
                {"\n                "}
                <span className={"css-prop-label"} data-css-property={"font-family"}>
                  {"الخط"}
                </span>
                {"\n                "}
                <button type={"button"} className={"css-prop-field font-picker-btn"} id={"font-picker-btn"} style={{"flex":"1","height":"24px","fontSize":"11px","cursor":"pointer","textAlign":"right"}}>
                  {"اختر الخط… "}
                  <i className={"fas fa-chevron-down"} style={{"fontSize":"8px","opacity":".6"}}></i>
                </button>
                {"\n              "}
              </div>
              {"\n              "}
              <div id={"font-picker-pop"} className={"font-picker-pop"} hidden></div>
              {"\n              "}
              <details className={"custom-font-area"} id={"custom-font-area"}>
                {"\n                "}
                <summary>
                  <i className={"fas fa-plus"}></i>
                  {" خط مخصص (رابط أو ملف)"}
                </summary>
                {"\n                "}
                <label className={"css-inline-field css-inline-field-stacked"}>
                  <span>
                    {"رابط الخط (Google Fonts أو ملف CSS)"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"custom-font-url"} placeholder={"https://fonts.googleapis.com/css2?family=..."} dir={"ltr"} />
                </label>
                {"\n                "}
                <label className={"css-inline-field css-inline-field-stacked"}>
                  <span>
                    {"اسم عائلة الخط (Family)"}
                  </span>
                  <input type={"text"} className={"css-prop-field"} id={"custom-font-family"} placeholder={"Rubik"} dir={"ltr"} />
                </label>
                {"\n                "}
                <div className={"background-image-actions"}>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-secondary"} id={"add-font-link-btn"}>
                    <i className={"fas fa-link"}></i>
                    {" إضافة بالرابط"}
                  </button>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-outline"} id={"upload-font-btn"}>
                    <i className={"fas fa-upload"}></i>
                    {" رفع ملف خط"}
                  </button>
                  {"\n                  "}
                  <input type={"file"} id={"custom-font-file"} accept={".woff2,.woff,.ttf,.otf"} hidden />
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"css-scope-guide neutral-guide"}>
                  <i className={"fas fa-circle-info"}></i>
                  <span>
                    {"الرابط يُحقن تلقائياً في <head> عند التصدير، وملف الخط يتحول إلى "}
                    <code>
                      {"@font-face"}
                    </code>
                    {" داخل CSS المشروع."}
                  </span>
                </div>
                {"\n              "}
              </details>
              {"\n\n              "}
              <div className={"css-prop-row"} style={{"marginTop":"8px"}}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"الحجم"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-font-size-slider"} min={"10"} max={"72"} defaultValue={"16"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-font-size-val"}>
                    {"16px"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"الوزن"}
                </span>
                {"\n                "}
                <div className={"segmented-control"} id={"font-weight-segmented"} style={{"display":"flex","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-md)","width":"140px"}}>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"400"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"400"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"500"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"500"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"700"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"700"}
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"محاذاة"}
                </span>
                {"\n                "}
                <div className={"segmented-control"} id={"text-align-segmented"} style={{"display":"flex","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-md)","width":"140px"}}>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"left"} style={{"flex":"1","height":"22px","fontSize":"10px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    <i className={"fas fa-align-left"}></i>
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"center"} style={{"flex":"1","height":"22px","fontSize":"10px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    <i className={"fas fa-align-center"}></i>
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"right"} style={{"flex":"1","height":"22px","fontSize":"10px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    <i className={"fas fa-align-right"}></i>
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"justify"} style={{"flex":"1","height":"22px","fontSize":"10px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    <i className={"fas fa-align-justify"}></i>
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"display":"flex","gap":"4px","marginTop":"6px"}}>
                {"\n                "}
                <div style={{"flex":"1","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-sm)","padding":"3px","display":"flex","alignItems":"center","justifyContent":"space-between","fontSize":"9px","fontFamily":"monospace"}}>
                  {"\n                  "}
                  <span style={{"color":"var(--text-muted)"}}>
                    {"line-h"}
                  </span>
                  {"\n                  "}
                  <input type={"text"} id={"prop-line-height"} defaultValue={"1.6"} style={{"width":"24px","border":"none","background":"transparent","color":"#fff","textAlign":"center","fontSize":"9px","outline":"none"}} />
                  {"\n                "}
                </div>
                {"\n                "}
                <div style={{"flex":"1","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-sm)","padding":"3px","display":"flex","alignItems":"center","justifyContent":"space-between","fontSize":"9px","fontFamily":"monospace"}}>
                  {"\n                  "}
                  <span style={{"color":"var(--text-muted)"}}>
                    {"spacing"}
                  </span>
                  {"\n                  "}
                  <input type={"text"} id={"prop-letter-spacing"} defaultValue={"0"} style={{"width":"24px","border":"none","background":"transparent","color":"#fff","textAlign":"center","fontSize":"9px","outline":"none"}} />
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <details className={"text-effect-area"}>
                <summary data-css-property={"text-shadow"}>
                  <i className={"fas fa-clone"}></i>
                  {" ظل النص"}
                </summary>
                {"\n                "}
                <div className={"compact-field-grid"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"X"}
                    </span>
                    <input type={"range"} className={"prop-slider"} id={"tshadow-x"} min={"-20"} max={"20"} defaultValue={"2"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"Y"}
                    </span>
                    <input type={"range"} className={"prop-slider"} id={"tshadow-y"} min={"-20"} max={"20"} defaultValue={"2"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"Blur"}
                    </span>
                    <input type={"range"} className={"prop-slider"} id={"tshadow-blur"} min={"0"} max={"30"} defaultValue={"4"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"اللون"}
                    </span>
                    <input type={"color"} className={"color-picker-swatch"} id={"tshadow-color"} defaultValue={"#000000"} />
                  </label>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"background-image-actions"}>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-secondary"} id={"tshadow-apply"}>
                    <i className={"fas fa-check"}></i>
                    {" تطبيق الظل"}
                  </button>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-outline"} id={"tshadow-remove"}>
                    <i className={"fas fa-times"}></i>
                    {" إزالة"}
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </details>
              {"\n              "}
              <details className={"text-effect-area"}>
                <summary data-css-property={"background-clip"}>
                  <i className={"fas fa-fill-drip"}></i>
                  {" تدرج النص"}
                </summary>
                {"\n                "}
                <div className={"compact-field-grid"}>
                  {"\n                  "}
                  <label>
                    <span>
                      {"من"}
                    </span>
                    <input type={"color"} className={"color-picker-swatch"} id={"tgrad-color-1"} defaultValue={"#f59e0b"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"إلى"}
                    </span>
                    <input type={"color"} className={"color-picker-swatch"} id={"tgrad-color-2"} defaultValue={"#ef4444"} />
                  </label>
                  {"\n                  "}
                  <label>
                    <span>
                      {"الزاوية"}
                    </span>
                    <input type={"range"} className={"prop-slider"} id={"tgrad-angle"} min={"0"} max={"360"} defaultValue={"90"} />
                  </label>
                  {"\n                "}
                </div>
                {"\n                "}
                <div className={"background-image-actions"}>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-secondary"} id={"tgrad-apply"}>
                    <i className={"fas fa-check"}></i>
                    {" تطبيق التدرج"}
                  </button>
                  {"\n                  "}
                  <button type={"button"} className={"btn btn-outline"} id={"tgrad-remove"}>
                    <i className={"fas fa-times"}></i>
                    {" إزالة"}
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </details>
              {"\n              "}
              <button type={"button"} className={"btn btn-outline"} id={"open-icon-picker-btn"} style={{"width":"100%","height":"24px","fontSize":"10px","marginTop":"6px"}}>
                <i className={"fas fa-icons"} style={{"marginLeft":"4px"}}></i>
                {" إدراج أيقونة في العنصر المحدد"}
              </button>
              {"\n\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"القوائم (Lists)"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-scope-guide neutral-guide"}>
                <i className={"fas fa-list"}></i>
                <span>
                  {"حدد عنصر القائمة نفسه "}
                  <code>
                    {"ul"}
                  </code>
                  {" أو "}
                  <code>
                    {"ol"}
                  </code>
                  {" (من شريط المسار بالأعلى أو شجرة DOM) ثم نسّق."}
                </span>
              </div>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"} data-css-property={"list-style-type"}>
                  {"شكل العلامة"}
                </span>
                {"\n                "}
                <select className={"css-prop-field"} id={"prop-list-style-type"} style={{"width":"130px","height":"22px","fontSize":"10px"}}>
                  {"\n                  "}
                  <option value={"disc"}>
                    {"● دائرة مصمتة (disc)"}
                  </option>
                  {"\n                  "}
                  <option value={"circle"}>
                    {"○ دائرة مفرغة (circle)"}
                  </option>
                  {"\n                  "}
                  <option value={"square"}>
                    {"■ مربع (square)"}
                  </option>
                  {"\n                  "}
                  <option value={"decimal"}>
                    {"1. أرقام (decimal)"}
                  </option>
                  {"\n                  "}
                  <option value={"arabic-indic"}>
                    {"١. أرقام هندية"}
                  </option>
                  {"\n                  "}
                  <option value={"lower-alpha"}>
                    {"a. حروف لاتينية"}
                  </option>
                  {"\n                  "}
                  <option value={"none"}>
                    {"بدون علامة"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"} data-css-property={"list-style-position"}>
                  {"مكان العلامة"}
                </span>
                {"\n                "}
                <select className={"css-prop-field"} id={"prop-list-style-position"} style={{"width":"130px","height":"22px","fontSize":"10px"}}>
                  {"\n                  "}
                  <option value={"outside"}>
                    {"خارج النص (outside)"}
                  </option>
                  {"\n                  "}
                  <option value={"inside"}>
                    {"داخل النص (inside)"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"} data-css-property={"padding-inline-start"}>
                  {"إزاحة القائمة"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-list-indent"} min={"0"} max={"60"} defaultValue={"24"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-list-indent-val"}>
                    {"24px"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"} data-css-property={"row-gap"}>
                  {"تباعد العناصر"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-list-gap"} min={"0"} max={"30"} defaultValue={"0"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-list-gap-val"}>
                    {"0px"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"الحركة – Transitions / Animations"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"المدة"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-transition-duration"} min={"0"} max={"2000"} step={"50"} defaultValue={"300"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-transition-duration-val"} style={{"minWidth":"48px"}}>
                    {"300ms"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"السلاسة"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"6px","flex":"1","justifyContent":"flex-end"}}>
                  {"\n                  "}
                  <select className={"css-prop-field"} id={"prop-transition-timing"} style={{"width":"80px","height":"22px","fontSize":"10px","padding":"0 4px"}}>
                    {"\n                    "}
                    <option value={"linear"}>
                      {"linear"}
                    </option>
                    {"\n                    "}
                    <option value={"ease"}>
                      {"ease"}
                    </option>
                    {"\n                    "}
                    <option value={"ease-in"}>
                      {"ease-in"}
                    </option>
                    {"\n                    "}
                    <option value={"ease-out"}>
                      {"ease-out"}
                    </option>
                    {"\n                    "}
                    <option value={"ease-in-out"} selected>
                      {"ease-in-out"}
                    </option>
                    {"\n                  "}
                  </select>
                  {"\n                  "}
                  {"\n                  "}
                  <div style={{"width":"32px","height":"22px","border":"1px solid var(--border-color)","background":"var(--bg-primary)","borderRadius":"var(--radius-sm)","position":"relative","overflow":"hidden"}}>
                    {"\n                    "}
                    <svg viewBox={"0 0 100 100"} style={{"width":"100%","height":"100%","stroke":"var(--accent-orange)","strokeWidth":"8","fill":"none","transform":"scaleY(-1)"}}>
                      {"\n                      "}
                      <path d={"M 0 0 C 42 0, 58 100, 100 100"}></path>
                      {"\n                    "}
                    </svg>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"الخاصية"}
                </span>
                {"\n                "}
                <select className={"css-prop-field"} id={"prop-transition-property"} style={{"width":"120px","height":"22px","fontSize":"10px"}}>
                  {"\n                  "}
                  <option value={"all"} selected>
                    {"all (كل الخصائص)"}
                  </option>
                  {"\n                  "}
                  <option value={"opacity"}>
                    {"opacity"}
                  </option>
                  {"\n                  "}
                  <option value={"transform"}>
                    {"transform"}
                  </option>
                  {"\n                  "}
                  <option value={"background-color"}>
                    {"background-color"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"borderTop":"1px solid var(--border-color)","paddingTop":"8px","marginTop":"8px"}}>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"6px"}}>
                  {"\n                  "}
                  <span style={{"fontSize":"9px","color":"var(--text-muted)"}}>
                    {"Keyframes"}
                  </span>
                  {"\n                  "}
                  <i className={"fas fa-play"} style={{"fontSize":"8px","color":"var(--accent-orange)","cursor":"pointer"}}></i>
                  {"\n                "}
                </div>
                {"\n                "}
                {"\n                "}
                <div style={{"height":"12px","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-full)","position":"relative","cursor":"pointer","marginBottom":"4px"}}>
                  {"\n                  "}
                  <span className={"keyframe-diamond"} style={{"position":"absolute","left":"10%","top":"2px","width":"6px","height":"6px","background":"var(--accent-orange)","transform":"rotate(45deg)","cursor":"pointer"}} title={"10%"}></span>
                  {"\n                  "}
                  <span className={"keyframe-diamond"} style={{"position":"absolute","left":"50%","top":"2px","width":"6px","height":"6px","background":"var(--accent-orange)","transform":"rotate(45deg)","cursor":"pointer"}} title={"50%"}></span>
                  {"\n                  "}
                  <span className={"keyframe-diamond"} style={{"position":"absolute","left":"90%","top":"2px","width":"6px","height":"6px","background":"var(--accent-orange)","transform":"rotate(45deg)","cursor":"pointer"}} title={"90%"}></span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"} id={"accordion-media-filters"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"وسائط وفلاتر"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              {"\n              "}
              <div style={{"backgroundColor":"rgba(59, 130, 246, 0.05)","border":"1px solid rgba(59, 130, 246, 0.15)","color":"var(--accent-blue)","padding":"6px","borderRadius":"var(--radius-sm)","fontSize":"9px","marginBottom":"8px"}}>
                {"\n                "}
                <i className={"fas fa-info-circle"}></i>
                {" قسم سياقي: يظهر تلقائياً للعناصر المتوافقة.\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"object-fit"}
                </span>
                {"\n                "}
                <div className={"segmented-control"} id={"object-fit-segmented"} style={{"display":"flex","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-md)","width":"140px"}}>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"fill"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"fill"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"contain"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"contain"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"cover"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"cover"}
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"marginTop":"6px"}}>
                {"\n                "}
                <span className={"css-prop-label"} style={{"fontSize":"10px"}}>
                  {"الموضع"}
                </span>
                {"\n                "}
                <div style={{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"2px","width":"36px","height":"36px","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-sm)"}}>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"var(--accent-orange)","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                  "}
                  <span style={{"width":"6px","height":"6px","background":"#444","borderRadius":"50%","cursor":"pointer"}}></span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div className={"css-prop-row"} style={{"marginTop":"6px"}}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"blur"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-blur-slider"} min={"0"} max={"20"} defaultValue={"0"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-blur-val"}>
                    {"0px"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"سطوع"}
                </span>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":"1"}}>
                  {"\n                  "}
                  <input type={"range"} className={"prop-slider"} id={"prop-brightness-slider"} min={"50"} max={"150"} defaultValue={"100"} style={{"flex":"1"}} />
                  {"\n                  "}
                  <span className={"slider-val"} id={"prop-brightness-val"}>
                    {"100%"}
                  </span>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              <div className={"css-prop-row"} style={{"marginTop":"6px"}}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"قناع"}
                </span>
                {"\n                "}
                <select className={"css-prop-field"} id={"prop-mask"} style={{"width":"100px","height":"22px","fontSize":"10px"}}>
                  {"\n                  "}
                  <option value={"none"} selected>
                    {"قناع خفيف"}
                  </option>
                  {"\n                  "}
                  <option value={"circle"}>
                    {"دائري"}
                  </option>
                  {"\n                  "}
                  <option value={"linear"}>
                    {"تدرج خافت"}
                  </option>
                  {"\n                "}
                </select>
                {"\n              "}
              </div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"وحدات · دوال · متغيرات"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              \n              "}
              {"\n              "}
              <div className={"css-prop-row"}>
                {"\n                "}
                <span className={"css-prop-label"}>
                  {"الوحدة"}
                </span>
                {"\n                "}
                <div className={"segmented-control"} id={"units-segmented"} style={{"display":"flex","flexWrap":"wrap","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-md)","gap":"2px"}}>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"clamp"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"clamp()"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"calc"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"calc()"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"vw"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"vw"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"percent"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"%"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"em"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"em"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"rem"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"rem"}
                  </button>
                  {"\n                  "}
                  <button className={"segment-btn"} data-val={"px"} style={{"height":"18px","fontSize":"8px","padding":"0 4px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"px"}
                  </button>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n              "}
              {"\n              "}
              <div style={{"borderTop":"1px solid var(--border-color)","paddingTop":"8px","marginTop":"8px"}}>
                {"\n                "}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"6px"}}>
                  {"\n                  "}
                  <span style={{"fontSize":"10px","color":"var(--text-muted)"}}>
                    {"متغيرات"}
                  </span>
                  {"\n                  "}
                  <div style={{"display":"flex","gap":"4px"}}>
                    {"\n                    "}
                    <button className={"btn btn-outline"} style={{"height":"18px","fontSize":"8px","padding":"0 4px"}}>
                      {"@property"}
                    </button>
                    {"\n                    "}
                    <button className={"btn btn-outline"} style={{"height":"18px","fontSize":"8px","padding":"0 4px"}}>
                      {"+ متغير"}
                    </button>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n                \n                "}
                <div style={{"display":"flex","flexDirection":"column","gap":"4px"}}>
                  {"\n                  "}
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-sm)","padding":"4px 8px","fontSize":"9px","fontFamily":"monospace"}}>
                    {"\n                    "}
                    <span style={{"color":"var(--text-muted)"}}>
                      {"--gap: 12px"}
                    </span>
                    {"\n                    "}
                    <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#ccc"}}></span>
                    {"\n                  "}
                  </div>
                  {"\n                  "}
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-sm)","padding":"4px 8px","fontSize":"9px","fontFamily":"monospace"}}>
                    {"\n                    "}
                    <span style={{"color":"var(--accent-orange)"}}>
                      {"--primary: #f59e0b"}
                    </span>
                    {"\n                    "}
                    <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#f59e0b"}}></span>
                    {"\n                  "}
                  </div>
                  {"\n                "}
                </div>
                {"\n              "}
              </div>
              {"\n\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n\n          "}
          {"\n          "}
          <div className={"accordion open"}>
            {"\n            "}
            <div className={"accordion-summary"}>
              {"التجاوب – Media Queries"}
            </div>
            {"\n            "}
            <div className={"accordion-details"}>
              {"\n              "}
              <div className={"css-scope-guide responsive-guide"}>
                <i className={"fas fa-mobile-screen-button"}></i>
                <span>
                  {"اختر النطاق أولاً؛ كل خاصية تعدّلها بعد ذلك تُحفظ داخل media query المختارة فقط."}
                </span>
              </div>
              {"\n              "}
              <div className={"segmented-control breakpoint-segments"} id={"breakpoints-segmented"} style={{"display":"flex","flexWrap":"wrap","gap":"4px","padding":"4px","background":"var(--bg-primary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)"}}>
                {"\n                "}
                {"\n              "}
              </div>
              {"\n              "}
              <div style={{"marginTop":"8px"}}>
                {"\n                "}
                <button type={"button"} className={"btn btn-outline"} id={"add-media-query-btn"} style={{"width":"100%","height":"26px","fontSize":"10px","display":"flex","alignItems":"center","justifyContent":"center","gap":"6px","padding":"0"}}>
                  {"\n                  "}
                  <i className={"fas fa-plus"}></i>
                  {" إضافة ميديا كويري مخصصة\n                "}
                </button>
                {"\n              "}
              </div>
              {"\n              "}
              <div className={"responsive-editing-status"} id={"responsive-editing-status"} aria-live={"polite"}></div>
              {"\n            "}
            </div>
            {"\n          "}
          </div>
          {"\n          "}
        </div>
        {" "}
        {"\n          \n          "}
        {"\n          "}
        <div id={"js-logic-blocks-container-sidebar"} style={{"display":"none","flexDirection":"column","gap":"8px","height":"100%"}}>
          {"\n\n            "}
          {"\n            "}
          <div id={"js-interaction-hub"} className={"interaction-hub"} aria-label={"مركز التفاعلات وJS"}></div>
          {"\n\n            "}
          {"\n            "}
          <div className={"js-region js-region-linker"} id={"js-interaction-advanced-host"} hidden>
            {"\n              "}
            <div className={"js-region-caption"}>
              <i className={"fas fa-screwdriver-wrench"}></i>
              {" أدوات JavaScript المتقدمة والقديمة"}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div id={"js-interactive-linker-panel"} className={"js-linker-section"}>
              {"\n                "}
              {"\n              "}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div id={"js-components-management"} className={"js-dashboard-container"}>
              {"\n                "}
              {"\n              "}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div id={"js-visual-links-dashboard"} className={"js-dashboard-container"}>
              {"\n                "}
              {"\n              "}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div id={"js-blocks-dashboard"} className={"js-dashboard-container"}>
              {"\n                "}
              {"\n              "}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div style={{"backgroundColor":"var(--bg-tertiary)","border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)","padding":"8px","display":"flex","flexDirection":"column"}} id={"linked-variables-box"}>
              {"\n                "}
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","cursor":"pointer"}} id={"toggle-variables-list"}>
                {"\n                  "}
                <span style={{"fontSize":"10px","fontWeight":"bold","color":"var(--accent-orange)"}}>
                  <i className={"fas fa-link"} style={{"marginLeft":"4px"}}></i>
                  {"المتغيرات المرتبطة بالعناصر"}
                </span>
                {"\n                  "}
                <span id={"linked-variables-count"} style={{"fontSize":"9px","fontFamily":"monospace","background":"var(--bg-primary)","padding":"2px 6px","borderRadius":"99px","color":"var(--text-muted)"}}>
                  {"0"}
                </span>
                {"\n                "}
              </div>
              {"\n                "}
              <div id={"linked-variables-list"} style={{"maxHeight":"90px","overflowY":"auto","display":"flex","flexDirection":"column","gap":"4px","borderTop":"1px solid var(--border-color)","paddingTop":"6px","marginTop":"6px","transition":"max-height 0.2s"}}>
                {"\n                  "}
                <span style={{"fontSize":"9px","color":"var(--text-muted)","textAlign":"center","padding":"4px 0"}}>
                  {"اضغط على أي عنصر في المعاينة لتوليد متغيره هنا."}
                </span>
                {"\n                "}
              </div>
              {"\n              "}
            </div>
            {"\n            "}
          </div>
          {"\n\n            "}
          {"\n            "}
          <div className={"js-region js-region-blocks"}>
            {"\n\n              "}
            {"\n              "}
            <div className={"js-blocks-sticky"}>
              {"\n                "}
              <div className={"js-region-caption"}>
                <i className={"fas fa-cubes"}></i>
                {" مكتبة كتل JavaScript"}
              </div>
              {"\n\n                "}
              <div className={"search-box"} style={{"marginBottom":"0"}}>
                {"\n                  "}
                <input type={"text"} className={"search-input"} id={"logic-blocks-search"} placeholder={"ابحث عن كتلة..."} style={{"height":"28px","fontSize":"11px","padding":"0 10px 0 24px"}} />
                {"\n                  "}
                <i className={"fas fa-search search-icon"} style={{"fontSize":"10px","left":"8px"}}></i>
                {"\n                "}
              </div>
              {"\n\n                "}
              {"\n                "}
              <div style={{"display":"flex","gap":"4px","overflowX":"auto","padding":"2px 0","direction":"rtl"}} id={"js-categories-filter-row"}>
                {"\n                  "}
                <button className={"filter-tab active"} data-js-cat={"all"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"الكل"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"events"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#f59e0b","color":"#f59e0b","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"الأحداث"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"actions"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#3b82f6","color":"#3b82f6","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"الأفعال"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"logic"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#a78bfa","color":"#a78bfa","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"المنطق"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"variables"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#ec4899","color":"#ec4899","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"المتغيرات"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"strings"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#f472b6","color":"#f472b6","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"النصوص"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"math"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#eab308","color":"#eab308","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"الأرقام"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"storage"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#22c55e","color":"#22c55e","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"التخزين"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"browser"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#06b6d4","color":"#06b6d4","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"المتصفح"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"timers"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#8b5cf6","color":"#8b5cf6","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"الوقت"}
                </button>
                {"\n                  "}
                <button className={"filter-tab"} data-js-cat={"arrays"} style={{"fontSize":"9px","padding":"2px 6px","height":"20px","borderColor":"#14b8a6","color":"#14b8a6","whiteSpace":"nowrap","flexShrink":"0"}}>
                  {"المصفوفات"}
                </button>
                {"\n                "}
              </div>
              {"\n\n                "}
              {"\n                "}
              <div id={"js-block-config-panel"} style={{"display":"none"}}></div>
              {"\n              "}
            </div>
            {"\n\n              "}
            {"\n              "}
            <div id={"logic-blocks-container"} style={{"padding":"4px 0 8px","display":"flex","flexDirection":"column","gap":"6px"}}>
              {"\n                "}
              {"\n              "}
            </div>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n\n          "}
        {"\n          "}
        <div id={"interaction-demo-panel"} className={"interaction-demo-panel"} style={{"display":"none"}} aria-label={"قواعد التفاعل — لو / إذن / وإلا"}>
          {"\n            "}
          <div className={"interaction-demo-launcher-card"}>
            {"\n              "}
            <span className={"interaction-demo-launcher__eyebrow"}>
              {"لو / إذن / وإلا"}
            </span>
            {"\n              "}
            <h2>
              {"قواعد التفاعل"}
            </h2>
            {"\n              "}
            <p>
              {"ابنِ القاعدة كجملة عربية: لو تحقق الشرط ← نفّذ خطوات، وإلا ← نفّذ غيرها."}
            </p>
            {"\n              "}
            <button type={"button"} className={"btn btn-primary"} id={"interaction-demo-open"}>
              {"\n                "}
              <i className={"fas fa-play"}></i>
              {"\n                افتح قواعد التفاعل\n              "}
            </button>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div id={"settings-panel-container"} style={{"display":"none","flexDirection":"column","gap":"12px","padding":"12px","height":"100%","overflowY":"auto"}}>
          {"\n\n            "}
          <div className={"accordion open"}>
            {"\n              "}
            <div className={"accordion-summary"}>
              {"اتجاه الصفحة واللغة"}
            </div>
            {"\n              "}
            <div className={"accordion-details"}>
              {"\n                "}
              <div className={"css-scope-guide neutral-guide"}>
                <i className={"fas fa-language"}></i>
                <span>
                  {"يُطبَّق على وسم "}
                  <code>
                    {"<html>"}
                  </code>
                  {" ويُحفظ مع المشروع ويُصدَّر معه."}
                </span>
              </div>
              {"\n\n                "}
              <div className={"css-prop-row"}>
                {"\n                  "}
                <span className={"css-prop-label"} data-css-property={"direction"}>
                  {"الاتجاه (dir)"}
                </span>
                {"\n                  "}
                <div className={"segmented-control"} id={"page-dir-segmented"} style={{"display":"flex","background":"var(--bg-primary)","border":"1px solid var(--border-color)","padding":"2px","borderRadius":"var(--radius-md)","width":"170px"}}>
                  {"\n                    "}
                  <button className={"segment-btn active"} data-val={"rtl"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"RTL · عربي"}
                  </button>
                  {"\n                    "}
                  <button className={"segment-btn"} data-val={"ltr"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"LTR · English"}
                  </button>
                  {"\n                    "}
                  <button className={"segment-btn"} data-val={"auto"} style={{"flex":"1","height":"22px","fontSize":"9px","borderRadius":"var(--radius-sm)","border":"none","background":"transparent","color":"var(--text-muted)","cursor":"pointer"}}>
                    {"auto"}
                  </button>
                  {"\n                  "}
                </div>
                {"\n                "}
              </div>
              {"\n\n                "}
              <div className={"css-prop-row"}>
                {"\n                  "}
                <span className={"css-prop-label"}>
                  {"اللغة (lang)"}
                </span>
                {"\n                  "}
                <select className={"css-prop-field"} id={"page-lang-select"} style={{"width":"170px","height":"22px","fontSize":"10px"}}>
                  {"\n                    "}
                  <option value={"ar"} selected>
                    {"العربية (ar)"}
                  </option>
                  {"\n                    "}
                  <option value={"ar-EG"}>
                    {"العربية — مصر (ar-EG)"}
                  </option>
                  {"\n                    "}
                  <option value={"ar-SA"}>
                    {"العربية — السعودية (ar-SA)"}
                  </option>
                  {"\n                    "}
                  <option value={"ar-AE"}>
                    {"العربية — الإمارات (ar-AE)"}
                  </option>
                  {"\n                    "}
                  <option value={"en"}>
                    {"الإنجليزية (en)"}
                  </option>
                  {"\n                    "}
                  <option value={"fr"}>
                    {"الفرنسية (fr)"}
                  </option>
                  {"\n                    "}
                  <option value={"de"}>
                    {"الألمانية (de)"}
                  </option>
                  {"\n                    "}
                  <option value={"tr"}>
                    {"التركية (tr)"}
                  </option>
                  {"\n                    "}
                  <option value={"ur"}>
                    {"الأردية (ur)"}
                  </option>
                  {"\n                    "}
                  <option value={"fa"}>
                    {"الفارسية (fa)"}
                  </option>
                  {"\n                  "}
                </select>
                {"\n                "}
              </div>
              {"\n\n                "}
              <div className={"page-dir-preview"} id={"page-dir-preview"}>
                {"\n                  "}
                <span className={"page-dir-preview-label"}>
                  {"معاينة الاتجاه"}
                </span>
                {"\n                  "}
                <div className={"page-dir-preview-box"} id={"page-dir-preview-box"}>
                  {"\n                    "}
                  <span className={"page-dir-chip"}>
                    {"1"}
                  </span>
                  <span className={"page-dir-chip"}>
                    {"2"}
                  </span>
                  <span className={"page-dir-chip"}>
                    {"3"}
                  </span>
                  {"\n                    "}
                  <p>
                    {"النص يبدأ من هنا — This is the start."}
                  </p>
                  {"\n                  "}
                </div>
                {"\n                "}
              </div>
              {"\n\n                "}
              <div className={"css-scope-guide neutral-guide"} style={{"marginTop":"8px"}}>
                {"\n                  "}
                <i className={"fas fa-lightbulb"}></i>
                {"\n                  "}
                <span>
                  {"RTL يقلب اتجاه القراءة وترتيب عناصر flex والهوامش المنطقية ("}
                  <code>
                    {"margin-inline-start"}
                  </code>
                  {") تلقائياً — استخدمها بدل left/right ليعمل تصميمك في الاتجاهين."}
                </span>
                {"\n                "}
              </div>
              {"\n              "}
            </div>
            {"\n            "}
          </div>
          {"\n\n            "}
          <div className={"accordion open"}>
            {"\n              "}
            <div className={"accordion-summary"}>
              {"هوية الصفحة"}
            </div>
            {"\n              "}
            <div className={"accordion-details"}>
              {"\n                "}
              <label className={"css-inline-field css-inline-field-stacked"}>
                {"\n                  "}
                <span>
                  {"عنوان الصفحة (title)"}
                </span>
                {"\n                  "}
                <input type={"text"} className={"css-prop-field"} id={"page-title-input"} placeholder={"موقعي الجديد"} defaultValue={"الموقع المصمم بواسطة منشئ البرمجة التفاعلية"} />
                {"\n                "}
              </label>
              {"\n                "}
              <label className={"css-inline-field css-inline-field-stacked"}>
                {"\n                  "}
                <span>
                  {"وصف الصفحة (meta description)"}
                </span>
                {"\n                  "}
                <input type={"text"} className={"css-prop-field"} id={"page-desc-input"} placeholder={"وصف مختصر يظهر في نتائج البحث"} />
                {"\n                "}
              </label>
              {"\n              "}
            </div>
            {"\n            "}
          </div>
          {"\n\n          "}
        </div>
        {"\n\n          "}
        {"\n          "}
        <div id={"history-panel-container"} style={{"display":"none","flexDirection":"column","gap":"12px","padding":"12px","height":"100%"}}>
          {"\n            "}
          <div className={"development-notice"}>
            {"\n              "}
            <i className={"fas fa-history notice-icon"}></i>
            {"\n              "}
            <span className={"notice-title"}>
              {"الميزة قيد التطوير"}
            </span>
            {"\n              "}
            <span className={"notice-desc"}>
              {"نحن نعمل بجد لإعداد لوحة تاريخ التغييرات للموقع. ستكون متاحة قريباً!"}
            </span>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n          \n        "}
      </div>
      {"\n      "}
    </section>
  );
}
