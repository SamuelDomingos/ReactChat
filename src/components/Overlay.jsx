import "./Overlay.css";

const Overlay = ({ onClose, children }) => {
  const handleOverlayClick = (e) => {
    // Verifica se o clique foi diretamente no background-overlay e não em um filho
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="background-overlay" onClick={handleOverlayClick}>
        {children}
    </div>
  );
};

export default Overlay;
