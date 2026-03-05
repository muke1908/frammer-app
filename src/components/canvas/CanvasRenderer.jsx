import { useCanvas } from './useCanvas';
import '../../styles/components/CanvasRenderer.css';

export default function CanvasRenderer({ image, crop, frameConfig, caption }) {
  const canvasRef = useCanvas(image, crop, frameConfig, caption);

  return (
    <div className="canvas-renderer">
      <canvas ref={canvasRef} className="canvas-renderer__canvas" />
    </div>
  );
}
