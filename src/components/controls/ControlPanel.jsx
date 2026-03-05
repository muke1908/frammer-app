import '../../styles/components/ControlPanel.css';

export default function ControlPanel({ children }) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className="control-panel">
      <div className="control-panel__section control-panel__section--left">
        {childrenArray[0]} {/* CropControls */}
      </div>

      {childrenArray.length > 1 && (
        <>
          <div className="control-panel__section control-panel__section--center">
            {childrenArray[1]} {/* AspectRatioToggle */}
            <div className="control-panel__divider" aria-hidden="true" />
            {childrenArray[2]} {/* BackgroundToggle */}
          </div>

          <div className="control-panel__section control-panel__section--right">
            {childrenArray[3]} {/* ExportButton */}
          </div>
        </>
      )}
    </div>
  );
}
