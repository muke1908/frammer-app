import { Children } from 'react';
import '../../styles/components/ControlPanel.css';

export default function ControlPanel({ children, panel }) {
  return (
    <div className="control-panel">
      {panel}
      <div className="control-panel__bar">
        {Children.map(children, (child, i) =>
          child ? (
            <div key={i} className="control-panel__section">
              {child}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
