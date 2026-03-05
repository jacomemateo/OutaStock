import { title } from "process";
import "@styles/ConfirmationModal.css";
import WarningIcon from "@mui/icons-material/Warning";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmed: boolean) => void;
  title: string;
  message: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div
        className="confirmation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-modal-header">
          <div className="warning-icon-container">
            <WarningIcon
              sx={{ fontSize: 40, color: "#ffcc00", marginRight: "0.5rem" }}
            />
            <h2>{title}</h2>
          </div>
        </div>
        <p className="confirmation-modal-message">{message}</p>
        <div className="confirmation-modal-actions">
          <button className="confirmation-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="confirmation-modal-confirm"
            onClick={() => onConfirm(true)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
