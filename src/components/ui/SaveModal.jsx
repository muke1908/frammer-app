import '../../styles/components/SaveModal.css';

export default function SaveModal({ imageURL, onClose }) {
  return (
    <div className="save-modal" onClick={onClose}>
      <div className="save-modal__inner" onClick={e => e.stopPropagation()}>
        <p className="save-modal__hint">
          Long press the image · tap <strong>Save to Photos</strong>
        </p>
        <img
          src={imageURL}
          alt="Long press to save"
          className="save-modal__img"
        />
        <button className="save-modal__close" onClick={onClose} type="button">
          Done
        </button>
      </div>
    </div>
  );
}
