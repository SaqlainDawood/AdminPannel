// Add to your existing Header component
import { MDBIcon } from "mdb-react-ui-kit";

export default function Header({ title, subtitle, onMenuToggle }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <MDBIcon fas icon="bars" />
        </button>
        <div className="header-title">
          <h1>{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="header-right">
        {/* Your existing header content */}
      </div>
    </header>
  );
}