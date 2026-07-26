/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

export function BottomDock() {
  return (
    <div className={"bottom-panel"}>
      {"\n          \n          "}
      {"\n          "}
      {"\n          "}
      <div className={"code-editor-section"} style={{"display":"flex","flexDirection":"column","overflow":"hidden","flex":"1"}}>
        {"\n            "}
        <div className={"editor-tabs"}>
          {"\n              "}
          <div className={"tabs-right"}>
            {"\n                "}
            <button className={"editor-tab active"} data-lang={"html"}>
              {"HTML"}
            </button>
            {"\n                "}
            <button className={"editor-tab"} data-lang={"css"}>
              {"CSS"}
            </button>
            {"\n                "}
            <button className={"editor-tab"} data-lang={"js"}>
              {"JS"}
            </button>
            {"\n              "}
          </div>
          {"\n              "}
          <div className={"editor-sync-indicator"} style={{"display":"flex","alignItems":"center","gap":"12px"}}>
            {"\n                "}
            <button className={"btn btn-outline"} id={"format-code-btn"} style={{"height":"22px","fontSize":"9px","padding":"0 8px","color":"var(--text-muted)","borderColor":"var(--border-color)","background":"transparent","cursor":"pointer"}} title={"تنسيق الكود وترتيب الفراغات"}>
              <i className={"fas fa-magic"}></i>
              {" تنسيق الكود"}
            </button>
            {"\n                "}
            <div style={{"display":"flex","alignItems":"center","gap":"6px"}}>
              {"\n                  "}
              <i className={"fas fa-sync-alt"}></i>
              {"\n                  "}
              <span>
                {"مزامنة ثنائية لحظية"}
              </span>
              {"\n                "}
            </div>
            {"\n              "}
          </div>
          {"\n            "}
        </div>
        {"\n            \n            "}
        {"\n            "}
        <div className={"code-editor-shell"}>
          {"\n              "}
          <div className={"editor-gutter"} id={"editor-line-numbers"} aria-hidden={"true"}>
            {"1"}
          </div>
          {"\n              "}
          <textarea id={"code-textarea"} spellCheck={"false"} wrap={"off"}></textarea>
          {"\n            "}
        </div>
        {"\n          "}
      </div>
      {"\n          \n          "}
      {"\n          "}
      <div className={"dom-tree-section"}>
        {"\n            "}
        <div className={"panel-header"}>
          {"\n              "}
          <span>
            {"شجرة DOM - اسحب للترتيب"}
          </span>
          {"\n            "}
        </div>
        {"\n            "}
        <div className={"panel-content"} style={{"backgroundColor":"var(--bg-secondary)","padding":"8px"}}>
          {"\n              "}
          <ul className={"dom-tree-list"} id={"dom-tree-root"}>
            {"\n                "}
            {"\n              "}
          </ul>
          {"\n            "}
        </div>
        {"\n          "}
      </div>
      {"\n          \n        "}
    </div>
  );
}
