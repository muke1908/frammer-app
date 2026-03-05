import '../../styles/components/CaptionInput.css';

export default function CaptionInput({ value, onChange }) {
  return (
    <div className="caption-input">
      <svg className="caption-input__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
      <input
        className="caption-input__field"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Add a caption…"
        maxLength={120}
        spellCheck={false}
      />
      {value && (
        <button className="caption-input__clear" onClick={() => onChange('')} type="button" aria-label="Clear caption">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
