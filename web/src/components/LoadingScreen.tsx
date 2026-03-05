import { useNavigate } from 'react-router-dom';
import '@styles/LoadingScreen.css';
import logo from '@assets/transparent-default-logo.png';

const LoadingScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img src={logo} alt="Company-logo" />

                {/* Temporary button */}
                <div className="dashboard-btn">
                    <button
                        className="view-inventory"
                        onClick={() => navigate('/dashboard')}
                    >
                        View Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
