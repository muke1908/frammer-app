import { useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useToast } from '../../contexts/ToastContext';
import UploadZone from './UploadZone';

export default function FileUpload({ onFileLoad }) {
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { isDragging, isLoading, error, handlers } = useFileUpload(onFileLoad, toast);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlers.onChange}
        style={{ display: 'none' }}
        aria-label="Upload photo"
      />
      <div
        onDragEnter={handlers.onDragEnter}
        onDragLeave={handlers.onDragLeave}
        onDragOver={handlers.onDragOver}
        onDrop={handlers.onDrop}
      >
        <UploadZone
          isDragging={isDragging}
          isLoading={isLoading}
          error={error}
          onClick={handleClick}
        />
      </div>
    </>
  );
}
