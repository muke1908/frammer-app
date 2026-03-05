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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentOffset, setCurrentOffset] = useState({ x: 0, y: 0 });

  // Calculate crop dimensions
  const cropDimensions = calculateCrop(imageWidth, imageHeight, cropPreset, 0, 0);

  // Update current offset when prop changes
  useEffect(() => {
    setCurrentOffset({ x: cropOffset.x, y: cropOffset.y });
  }, [cropOffset.x, cropOffset.y]);

  // Draw preview
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const previewSize = 300;

    canvas.width = previewSize;
    canvas.height = previewSize;

    // Clear canvas
    ctx.clearRect(0, 0, previewSize, previewSize);

    // Calculate scale to fit image in preview
    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);

    // Draw full image
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const offsetX = (previewSize - scaledWidth) / 2;
    const offsetY = (previewSize - scaledHeight) / 2;

    ctx.globalAlpha = 0.5;
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw crop overlay
    ctx.globalAlpha = 1;

    // Calculate crop position with offset
    const finalCrop = calculateCrop(
      imageWidth,
      imageHeight,
      cropPreset,
      currentOffset.x,
      currentOffset.y
    );

    const cropX = offsetX + finalCrop.x * scale;
    const cropY = offsetY + finalCrop.y * scale;
    const cropW = finalCrop.width * scale;
    const cropH = finalCrop.height * scale;

    // Darken outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, previewSize, cropY); // Top
    ctx.fillRect(0, cropY, cropX, cropH); // Left
    ctx.fillRect(cropX + cropW, cropY, previewSize - (cropX + cropW), cropH); // Right
    ctx.fillRect(0, cropY + cropH, previewSize, previewSize - (cropY + cropH)); // Bottom

    // Draw crop frame
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    const corners = [
      [cropX, cropY],
      [cropX + cropW, cropY],
      [cropX, cropY + cropH],
      [cropX + cropW, cropY + cropH],
    ];
    corners.forEach(([x, y]) => {
      ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    });
  }, [image, imageWidth, imageHeight, cropPreset, currentOffset, cropDimensions]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const previewSize = 300;
    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = (currentX - dragStart.x) / scale;
    const deltaY = (currentY - dragStart.y) / scale;

    const newOffset = {
      x: cropOffset.x + deltaX,
      y: cropOffset.y + deltaY,
    };

    setCurrentOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onOffsetChange(currentOffset);
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !canvasRef.current) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const previewSize = 300;
    const scale = Math.min(previewSize / imageWidth, previewSize / imageHeight);

    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const deltaX = (currentX - dragStart.x) / scale;
    const deltaY = (currentY - dragStart.y) / scale;

    const newOffset = {
      x: cropOffset.x + deltaX,
      y: cropOffset.y + deltaY,
    };

    setCurrentOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      onOffsetChange(currentOffset);
      setIsDragging(false);
    }
  };

  if (cropPreset === 'none') {
    return null; // No dragging for "none" preset
  }

  return (
    <div className="draggable-crop-preview">
      <p className="draggable-crop-preview__label">Drag to reposition crop</p>
      <canvas
        ref={canvasRef}
        className={`draggable-crop-preview__canvas ${
          isDragging ? 'draggable-crop-preview__canvas--dragging' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
