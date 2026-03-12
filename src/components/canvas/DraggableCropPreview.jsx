import { useRef, useState, useEffect } from 'react';
import { calculateCrop } from '../../utils/canvas/cropCalculations';
import '../../styles/components/DraggableCropPreview.css';

export default function DraggableCropPreview({
  image,
  imageWidth,
  imageHeight,
  cropPreset,
  cropOffset,
  onOffsetChange,
}) {
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetAtStartRef = useRef({ x: 0, y: 0 });
  const latestOffsetRef = useRef({ x: cropOffset.x, y: cropOffset.y });

  const [isDragging, setIsDragging] = useState(false); // for CSS cursor only
  const [currentOffset, setCurrentOffset] = useState({ x: cropOffset.x, y: cropOffset.y });

  // Sync when parent resets the offset (e.g. new crop preset)
  useEffect(() => {
    const next = { x: cropOffset.x, y: cropOffset.y };
    latestOffsetRef.current = next;
    setCurrentOffset(next);
  }, [cropOffset.x, cropOffset.y]);

  // Draw preview whenever offset or image changes
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const previewSize = 300;

    canvas.width = previewSize;
    canvas.height = previewSize;

    ctx.clearRect(0, 0, previewSize, previewSize);

    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const drawOffsetX = (previewSize - scaledWidth) / 2;
    const drawOffsetY = (previewSize - scaledHeight) / 2;

    ctx.globalAlpha = 0.5;
    ctx.drawImage(image, drawOffsetX, drawOffsetY, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1;

    const finalCrop = calculateCrop(imageWidth, imageHeight, cropPreset, currentOffset.x, currentOffset.y);
    const cropX = drawOffsetX + finalCrop.x * scale;
    const cropY = drawOffsetY + finalCrop.y * scale;
    const cropW = finalCrop.width * scale;
    const cropH = finalCrop.height * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, previewSize, cropY);
    ctx.fillRect(0, cropY, cropX, cropH);
    ctx.fillRect(cropX + cropW, cropY, previewSize - (cropX + cropW), cropH);
    ctx.fillRect(0, cropY + cropH, previewSize, previewSize - (cropY + cropH));

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    [[cropX, cropY], [cropX + cropW, cropY], [cropX, cropY + cropH], [cropX + cropW, cropY + cropH]]
      .forEach(([x, y]) => ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize));
  }, [image, imageWidth, imageHeight, cropPreset, currentOffset]);

  // These refs hold the latest drag implementations — updated on every render
  // so they always see current props (imageWidth, imageHeight, onOffsetChange).
  const moveDragFnRef = useRef(null);
  const endDragFnRef = useRef(null);

  moveDragFnRef.current = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const rect = canvas.getBoundingClientRect();
    const previewSize = 300;
    const cssToCanvas = previewSize / rect.width;
    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);
    const next = {
      x: offsetAtStartRef.current.x + (dx * cssToCanvas) / scale,
      y: offsetAtStartRef.current.y + (dy * cssToCanvas) / scale,
    };
    latestOffsetRef.current = next;
    setCurrentOffset(next);
  };

  endDragFnRef.current = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', stableMouseMove);
    document.removeEventListener('mouseup', stableMouseUp);
    setIsDragging(false);
    onOffsetChange(latestOffsetRef.current);
  };

  // Stable wrappers — same function reference for the lifetime of the component.
  // They delegate to the latest implementation stored in the refs above.
  const stableMouseMove = useRef((e) => moveDragFnRef.current(e.clientX, e.clientY)).current;
  const stableMouseUp = useRef(() => endDragFnRef.current()).current;

  // Remove listeners on unmount (guard against component being removed mid-drag)
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', stableMouseMove);
      document.removeEventListener('mouseup', stableMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrag = (clientX, clientY) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY };
    offsetAtStartRef.current = { ...latestOffsetRef.current };
    // Add listeners synchronously so no mouse events are missed
    document.addEventListener('mousemove', stableMouseMove);
    document.addEventListener('mouseup', stableMouseUp);
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    moveDragFnRef.current(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => endDragFnRef.current();

  if (cropPreset === 'none') return null;

  return (
    <div className="draggable-crop-preview">
      <p className="draggable-crop-preview__label">Drag to reposition crop</p>
      <canvas
        ref={canvasRef}
        className={`draggable-crop-preview__canvas ${isDragging ? 'draggable-crop-preview__canvas--dragging' : ''}`}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
