import { useState, useRef, useEffect } from 'react';
import '../../styles/components/Tooltip.css';

function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 0;

        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - 8;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - tooltipWidth - 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          default:
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - 8;
        }

        // Keep tooltip within viewport bounds
        const padding = 8;
        x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
        y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip--${position}`}
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
}

export default Tooltip;
