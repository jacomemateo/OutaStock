import "../styles/LoadingScreen.css";
import logo from "../assets/transparent-logo.png";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <img src={logo} alt="Company-logo" />
      </div>
    </div>
  );
};

export default LoadingScreen;
