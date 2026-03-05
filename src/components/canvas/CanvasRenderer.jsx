import { useCanvas } from './useCanvas';
import '../../styles/components/CanvasRenderer.css';

export default function CanvasRenderer({ image, crop, frameConfig }) {
  const canvasRef = useCanvas(image, crop, frameConfig);

  return (
    <div className="canvas-renderer">
      <canvas ref={canvasRef} className="canvas-renderer__canvas" />
    </div>
  );
}
