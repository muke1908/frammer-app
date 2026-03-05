import Button from '../ui/Button';

export default function ExportButton({ onClick, isExporting, disabled }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isExporting}
      variant="primary"
      size="medium"
      aria-label="Download framed photo"
      style={{ padding: '8px 12px', minWidth: 0 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          display: 'block',
          animation: isExporting ? 'spin 0.8s linear infinite' : 'none',
        }}
      >
        {isExporting ? (
          <circle cx="12" cy="12" r="9" strokeDasharray="28 56" />
        ) : (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </>
        )}
      </svg>
    </Button>
  );
}
