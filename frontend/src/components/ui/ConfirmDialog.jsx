import Modal from "./Modal";

/** Replacement for window.confirm — consistent, keyboard friendly. */
export default function ConfirmDialog({
  open, title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel",
  danger = false, busy = false, onConfirm, onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className={`btn ${danger ? "btn-danger" : ""}`} onClick={onConfirm} disabled={busy}>
            {busy ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
            {confirmLabel}
          </button>
        </>
      )}
    >
      <p style={{ margin: 0, color: "var(--muted)" }}>{message}</p>
    </Modal>
  );
}
