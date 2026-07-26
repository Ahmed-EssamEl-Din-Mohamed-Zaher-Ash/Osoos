/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

export function ElementsPanel() {
  return (
    <section className={"side-panel panel-right"}>
      {"\n        "}
      <div className={"panel-header"}>
        {"\n          "}
        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
          {"\n            "}
          <span>
            {"البناء – كل عناصر HTML"}
          </span>
          {"\n            "}
          <span style={{"fontSize":"11px","color":"var(--text-muted)"}} id={"elements-count"}>
            {"84"}
          </span>
          {"\n          "}
        </div>
        {"\n          "}
        <button className={"panel-toggle-btn"} id={"collapse-right-btn"} title={"طوي القائمة"}>
          {"\n            "}
          <i className={"fas fa-chevron-left"}></i>
          {"\n          "}
        </button>
        {"\n        "}
      </div>
      {"\n        \n        "}
      <div className={"panel-content"}>
        {"\n          "}
        {"\n          "}
        <div className={"search-box"}>
          {"\n            "}
          <input type={"text"} className={"search-input"} id={"elements-search"} placeholder={"ابحث بالوسم أو بالعربية..."} />
          {"\n            "}
          <i className={"fas fa-search search-icon"}></i>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div className={"filter-tabs"} id={"category-filters"}>
          {"\n            "}
          <button className={"filter-tab active"} data-cat={"all"}>
            {"الكل"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"structure"}>
            {"بنية"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"text"}>
            {"نصوص"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"lists-tables"}>
            {"قوائم وجداول"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"media"}>
            {"وسائط"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"forms"}>
            {"نماذج"}
          </button>
          {"\n            "}
          <button className={"filter-tab"} data-cat={"other"}>
            {"روابط ودلالية"}
          </button>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div style={{"fontSize":"10px","color":"var(--text-muted)","marginBottom":"12px","display":"flex","gap":"8px"}}>
          {"\n            "}
          <span>
            {"تصفية:"}
          </span>
          {"\n            "}
          <span style={{"color":"var(--accent-blue)","cursor":"pointer"}} className={"display-filter-btn"} data-type={"block"}>
            {"● Block"}
          </span>
          {"\n            "}
          <span style={{"color":"var(--accent-green)","cursor":"pointer"}} className={"display-filter-btn"} data-type={"inline"}>
            {"● Inline"}
          </span>
          {"\n            "}
          <span style={{"color":"var(--accent-grey)","cursor":"pointer"}} className={"display-filter-btn"} data-type={"void"}>
            {"● Void"}
          </span>
          {"\n            "}
          <span style={{"color":"var(--accent-orange)","cursor":"pointer"}} className={"display-filter-btn"} data-type={"restricted"}>
            {"● مقيد"}
          </span>
          {"\n          "}
        </div>
        {"\n          \n          "}
        {"\n          "}
        <div className={"element-categories-container"} id={"elements-list-container"}>
          {"\n            "}
          {"\n          "}
        </div>
        {"\n        "}
      </div>
      {"\n      "}
    </section>
  );
}
