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
  // Use refs for all drag state so event handlers always see current values
  // without depending on React re-render timing.
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });       // client coords at drag start
  const offsetAtStartRef = useRef({ x: 0, y: 0 });   // cropOffset at drag start
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

  // Convert a client-space delta to image-pixel delta
  const clientDeltaToImageDelta = (dx, dy) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const previewSize = 300;
    // Account for CSS scaling: canvas may display smaller than its 300×300 internal size
    const cssToCanvas = previewSize / rect.width;
    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);
    return { x: (dx * cssToCanvas) / scale, y: (dy * cssToCanvas) / scale };
  };

  const startDrag = (clientX, clientY) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY };
    offsetAtStartRef.current = { ...latestOffsetRef.current };
    setIsDragging(true);
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const imgDelta = clientDeltaToImageDelta(dx, dy);
    const next = {
      x: offsetAtStartRef.current.x + imgDelta.x,
      y: offsetAtStartRef.current.y + imgDelta.y,
    };
    latestOffsetRef.current = next;
    setCurrentOffset(next);
  };

  const endDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    onOffsetChange(latestOffsetRef.current);
  };

  // Attach mouse events to document so fast drags that leave the canvas still work
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => moveDrag(e.clientX, e.clientY);
    const onUp = () => endDrag();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => endDrag();

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
