/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */

import { CanvasWorkspace } from './CanvasWorkspace.jsx';
import { ElementsPanel } from './ElementsPanel.jsx';
import { InspectorPanel } from './InspectorPanel.jsx';
import { NavigationRail } from './NavigationRail.jsx';

export function WorkspaceShell() {
  return (
    <div className={"app-workspace"}>
      {"\n      \n      "}
      {"\n      "}
      <NavigationRail />
      {"\n      \n      "}
      {"\n      "}
      <InspectorPanel />
      {"\n      \n      "}
      {"\n      "}
      <CanvasWorkspace />
      {"\n      \n      "}
      {"\n      "}
      <ElementsPanel />
      {"\n      \n      "}
      {"\n      "}
      <div className={"resize-handle left-handle"} id={"left-resize-handle"} title={"اسحب لتغيير حجم القائمة اليسرى"}></div>
      {"\n      "}
      <div className={"resize-handle right-handle"} id={"right-resize-handle"} title={"اسحب لتغيير حجم القائمة اليمنى"}></div>
      {"\n      \n      "}
      {"\n      "}
      <button type={"button"} id={"expand-right-btn"} title={"عرض قائمة العناصر"} style={{"display":"none","position":"absolute","right":"0","top":"50%","transform":"translateY(-50%)","zIndex":"1002","width":"20px","height":"60px","background":"var(--bg-secondary)","border":"1px solid var(--border-color)","borderRight":"none","borderRadius":"var(--radius-md) 0 0 var(--radius-md)","color":"var(--accent-orange)","cursor":"pointer","alignItems":"center","justifyContent":"center","boxShadow":"var(--shadow-md)"}}>
        {"\n        "}
        <i className={"fas fa-chevron-left"}></i>
        {"\n      "}
      </button>
      {"\n\n    "}
    </div>
  );
}
