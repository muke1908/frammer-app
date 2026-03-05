import '../../styles/components/ControlPanel.css';

export default function ControlPanel({ children }) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className="control-panel">
      <div className="control-panel__group">
        {childrenArray[0]} {/* CropControls */}
      </div>
      <div className="control-panel__divider" aria-hidden="true" />
      <div className="control-panel__group">
        {childrenArray[1]} {/* AspectRatioToggle */}
      </div>
      <div className="control-panel__divider" aria-hidden="true" />
      <div className="control-panel__group">
        {childrenArray[2]} {/* BackgroundToggle */}
      </div>
    </div>
  );
}
