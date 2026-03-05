import { useMemo } from 'react';
import CanvasRenderer from './CanvasRenderer';
import { calculateCrop } from '../../utils/canvas/cropCalculations';
import '../../styles/components/CanvasEditor.css';

export default function CanvasEditor({ imageState, cropState, frameConfig, caption, children }) {
  // Calculate crop dimensions based on preset and offset
  const crop = useMemo(() => {
    if (!imageState.original) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return calculateCrop(
      imageState.naturalWidth,
      imageState.naturalHeight,
      cropState.preset,
      cropState.offsetX || 0,
      cropState.offsetY || 0
    );
  }, [
    imageState.naturalWidth,
    imageState.naturalHeight,
    cropState.preset,
    cropState.offsetX,
    cropState.offsetY,
  ]);

  if (!imageState.original) {
    return null;
  }

  return (
    <div className="canvas-editor">
      <CanvasRenderer image={imageState.original} crop={crop} frameConfig={frameConfig} caption={caption} />
      {children}
    </div>
  );
}
