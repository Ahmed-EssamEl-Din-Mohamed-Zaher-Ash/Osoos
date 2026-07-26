/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

import { BottomDock } from './BottomDock.jsx';

export function CanvasWorkspace() {
  return (
    <main className={"center-workspace"}>
      {"\n        \n        "}
      {"\n        "}
      <div className={"preview-canvas-container"}>
        {"\n          \n          "}
        {"\n          "}
        <div className={"preview-header-bar"}>
          {"\n            "}
          <div className={"preview-header-right"}>
            {"\n              "}
            <span id={"canvas-interaction-hint"}>
              {"اختر عنصرًا بالنقر — واسحب فقط لإعادة ترتيبه"}
            </span>
            {"\n            "}
          </div>
          {"\n            "}
          <div className={"preview-header-left"}>
            {"\n              "}
            <span className={"preview-breadcrumbs"} id={"canvas-breadcrumbs"}>
              {"body"}
            </span>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div className={"preview-canvas-wrapper"}>
          {"\n            "}
          <div className={"preview-canvas"} id={"builder-canvas"}>
            {"\n              "}
            {"\n              "}
            <section className={"hero"}>
              {"\n                "}
              <div className={"card"}>
                {"\n                  "}
                <h1 style={{"fontSize":"24px","marginBottom":"8px"}}>
                  {"موقع البرمجة التفاعلية"}
                </h1>
                {"\n                  "}
                <p style={{"color":"#6b7280","fontSize":"14px"}}>
                  {"ابدأ من لوحة العناصر: اختر مكونًا، عدّل محتواه، ثم عاينه واحفظه."}
                </p>
                {"\n                  "}
                <button>
                  {"ابدأ التصميم الآن"}
                </button>
                {"\n                "}
              </div>
              {"\n              "}
            </section>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div className={"canvas-element-overlay"} id={"element-highlighter"}>
          {"\n            "}
          <div className={"overlay-dot top-left"}></div>
          {"\n            "}
          <div className={"overlay-dot top-right"}></div>
          {"\n            "}
          <div className={"overlay-dot bottom-left"}></div>
          {"\n            "}
          <div className={"overlay-dot bottom-right"}></div>
          {"\n            "}
          <div className={"overlay-badge"} id={"highlighter-badge"}>
            {"div.card"}
          </div>
          {"\n            \n            "}
          {"\n            "}
          <div className={"spacing-handle margin-handle margin-top"} data-prop={"marginTop"} title={"margin-top (سحب للتعديل / نقر مزدوج للكتابة)"}></div>
          {"\n            "}
          <div className={"spacing-handle margin-handle margin-right"} data-prop={"marginRight"} title={"margin-right"}></div>
          {"\n            "}
          <div className={"spacing-handle margin-handle margin-bottom"} data-prop={"marginBottom"} title={"margin-bottom"}></div>
          {"\n            "}
          <div className={"spacing-handle margin-handle margin-left"} data-prop={"marginLeft"} title={"margin-left"}></div>
          {"\n            \n            "}
          <div className={"spacing-handle padding-handle padding-top"} data-prop={"paddingTop"} title={"padding-top (سحب للتعديل / نقر مزدوج للكتابة)"}></div>
          {"\n            "}
          <div className={"spacing-handle padding-handle padding-right"} data-prop={"paddingRight"} title={"padding-right"}></div>
          {"\n            "}
          <div className={"spacing-handle padding-handle padding-bottom"} data-prop={"paddingBottom"} title={"padding-bottom"}></div>
          {"\n            "}
          <div className={"spacing-handle padding-handle padding-left"} data-prop={"paddingLeft"} title={"padding-left"}></div>
          {"\n            \n            "}
          {"\n            "}
          <div id={"spacing-drag-tooltip"} className={"spacing-tooltip"} style={{"display":"none","position":"fixed","zIndex":"10000","background":"var(--bg-secondary)","border":"1px solid var(--accent-orange)","color":"var(--text-main)","fontSize":"10px","padding":"4px 8px","borderRadius":"var(--radius-sm)","pointerEvents":"none","boxShadow":"var(--shadow-md)","fontFamily":"monospace"}}></div>
          {"\n            \n            "}
          {"\n            "}
          <div className={"floating-action-bubble"} style={{"overflow":"visible"}}>
            {"\n              "}
            <span className={"bubble-el-name-badge"} id={"bubble-el-name"}>
              {"div"}
            </span>
            {"\n              \n              "}
            <button className={"bubble-btn"} id={"bubble-select-parent"} title={"اختيار الأب المباشر"}>
              {"\n                "}
              <i className={"fas fa-arrow-up"}></i>
              {" الأب\n              "}
            </button>
            {"\n              \n              "}
            {"\n              "}
            <div style={{"position":"relative","display":"inline-block"}}>
              {"\n                "}
              <button className={"bubble-btn"} id={"bubble-layers-btn"} title={"اختيار الطبقة"}>
                {"\n                  "}
                <i className={"fas fa-layer-group"}></i>
                {" الطبقات "}
                <i className={"fas fa-caret-down"} style={{"fontSize":"8px","marginRight":"2px"}}></i>
                {"\n                "}
              </button>
              {"\n                \n                "}
              {"\n                "}
              <div className={"highlighter-layers-dropdown"} id={"highlighter-layers-dropdown"} style={{"display":"none","position":"absolute","top":"calc(100% + 6px)","right":"0","zIndex":"1001","background":"var(--bg-secondary)","border":"1px solid var(--border-light)","borderRadius":"var(--radius-md)","boxShadow":"var(--shadow-lg)","minWidth":"150px","padding":"4px 0","direction":"rtl","textAlign":"right","pointerEvents":"auto"}}>
                {"\n                  "}
                {"\n                "}
              </div>
              {"\n              "}
            </div>
            {"\n              \n              "}
            <button className={"bubble-btn"} id={"bubble-move"} title={"تفعيل وضع التحريك الآمن"}>
              <i className={"fas fa-arrows-alt"}></i>
              {" تحريك"}
            </button>
            {"\n              "}
            <button className={"bubble-btn"} id={"bubble-snap"} title={"محاذاة العناصر للشبكة"}>
              <i className={"fas fa-th"}></i>
              {" محاذاة: لا"}
            </button>
            {"\n              "}
            <button className={"bubble-btn"} id={"bubble-reset-move"} style={{"color":"var(--accent-orange)","display":"none"}} title={"إعادة تعيين التحريك"}>
              <i className={"fas fa-undo"}></i>
              {" ريست"}
            </button>
            {"\n              \n              "}
            {"\n              "}
            <div id={"js-link-menu-dropdown"} hidden aria-hidden={"true"}></div>
            {"\n\n              "}
            <button className={"bubble-btn"} id={"bubble-demo"} style={{"color":"var(--accent-blue)"}} title={"قواعد التفاعل: لو / إذن / وإلا — للعنصر المحدد"} aria-label={"فتح قواعد التفاعل للعنصر المحدد"} aria-haspopup={"dialog"} aria-expanded={"false"}>
              {"\n                "}
              <i className={"fas fa-scale-balanced"} aria-hidden={"true"}></i>
              {" القواعد\n              "}
            </button>
            {"\n              \n              "}
            <button className={"bubble-btn"} id={"bubble-delete"} style={{"color":"var(--accent-red)"}} title={"حذف العنصر"}>
              {"\n                "}
              <i className={"fas fa-trash-alt"}></i>
              {" حذف\n              "}
            </button>
            {"\n            "}
          </div>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <svg id={"visual-links-overlay"} aria-hidden={"true"}>
          {"\n            "}
          <defs>
            {"\n              "}
            <marker id={"vl-arrowhead"} markerWidth={"8"} markerHeight={"8"} refX={"7"} refY={"4"} orient={"auto"} markerUnits={"userSpaceOnUse"}>
              {"\n                "}
              <path d={"M0,0 L8,4 L0,8 z"} fill={"#f59e0b"}></path>
              {"\n              "}
            </marker>
            {"\n            "}
          </defs>
          {"\n          "}
        </svg>
        {"\n\n          "}
        {"\n          "}
        <div className={"drag-insert-indicator"} id={"drag-indicator"}></div>
        {"\n\n        "}
      </div>
      {"\n        \n        "}
      {"\n        "}
      <BottomDock />
      {"\n      "}
    </main>
  );
}
