/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

import {
  AutosaveToggle,
  RedoButton,
  UndoButton,
  ViewportControls
} from '../components/header/HeaderControls.jsx';

export function AppHeader() {
  return (
    <header className={"app-header"}>
      {"\n      "}
      <div className={"header-right"} style={{"display":"flex","alignItems":"center","gap":"16px"}}>
        {"\n        "}
        <div className={"project-title"} style={{"display":"flex","flexDirection":"column","lineHeight":"1.2"}}>
          {"\n          "}
          <div style={{"display":"flex","alignItems":"center","gap":"6px"}}>
            {"\n            "}
            <span className={"project-status-dot"}></span>
            {"\n            "}
            <span style={{"fontWeight":"700","fontSize":"15px","color":"var(--accent-orange)"}}>
              {"أُسُس (Osoos)"}
            </span>
            {"\n            "}
            <span id={"header-active-file-label"} style={{"color":"var(--text-muted)","fontSize":"11px","fontFamily":"monospace"}}>
              {"- index.html"}
            </span>
            {"\n          "}
          </div>
          {"\n          "}
          <span style={{"fontSize":"9px","color":"var(--text-muted)","fontWeight":"normal","paddingRight":"14px"}}>
            {"تصميم وتنفيذ: المهندس أحمد عصام عاشور"}
          </span>
          {"\n        "}
        </div>
        {"\n        "}
        <div className={"breadcrumb-badge"}>
          {"\n          <Title - Favicon - head>\n        "}
        </div>
        {"\n      "}
      </div>
      {"\n      \n      "}
      <div className={"header-left"}>
        {"\n        "}
        {"\n        "}
        <ViewportControls />
        {"\n        \n        "}
        {"\n        "}
        <div className={"header-actions"}>
          {"\n          "}
          <button className={"btn btn-secondary"} id={"project-manager-btn"} title={"إنشاء وفتح وإدارة ملفات المشروع"}>
            {"\n            "}
            <i className={"fas fa-folder-tree"}></i>
            {"\n            "}
            <span id={"active-project-label"}>
              {"المشروع"}
            </span>
            {"\n          "}
          </button>
          {"\n          "}
          <AutosaveToggle />
          {"\n          "}
          <UndoButton />
          {"\n          "}
          <RedoButton />
          {"\n          "}
          <button className={"btn btn-secondary"} id={"export-btn"}>
            {"\n            "}
            <i className={"fas fa-download"}></i>
            {" تصدير\n          "}
          </button>
          {"\n          "}
          <button className={"btn btn-secondary"} id={"final-preview-btn"} title={"عرض الصفحة النهائية النظيفة بدون أدوات المحرر"}>
            {"\n            "}
            <i className={"fas fa-external-link-alt"}></i>
            {" معاينة نهائية\n          "}
          </button>
          {"\n          "}
          <button className={"btn btn-primary"} id={"preview-toggle-btn"}>
            {"\n            "}
            <i className={"fas fa-eye"}></i>
            {" معاينة\n          "}
          </button>
          {"\n        "}
        </div>
        {"\n      "}
      </div>
      {"\n    "}
    </header>
  );
}
