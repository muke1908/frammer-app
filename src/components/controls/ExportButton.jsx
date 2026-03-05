import Button from '../ui/Button';

export default function ExportButton({ onClick, isExporting, disabled }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isExporting}
      variant="primary"
      size="large"
      aria-label="Download framed photo"
      tooltip="Download your framed photo as PNG"
    >
      {isExporting ? (
        <>
          <span className="export-button__spinner" />
          Exporting...
        </>
      ) : (
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </>
      )}
    </Button>
  );
}
