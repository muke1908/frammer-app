import '../../styles/components/UploadZone.css';

export default function UploadZone({ isDragging, isLoading, error, onClick }) {
  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${
        error ? 'upload-zone--error' : ''
      }`}
      onClick={onClick}
    >
      <div className="upload-zone__content">
        {isLoading ? (
          <>
            <div className="upload-zone__spinner" />
            <p className="upload-zone__text">Loading image...</p>
          </>
        ) : (
          <>
            <svg
              className="upload-zone__icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h2 className="upload-zone__title">
              {isDragging ? 'Drop image here' : 'Upload your photo'}
            </h2>
            <p className="upload-zone__text">
              {isDragging
                ? 'Release to upload'
                : 'Drag and drop or click to browse'}
            </p>
            <p className="upload-zone__hint">
              Supports JPG, PNG, HEIC, WebP (max 50MB)
            </p>
          </>
        )}
        {error && <p className="upload-zone__error">{error}</p>}
      </div>
    </div>
  );
}
