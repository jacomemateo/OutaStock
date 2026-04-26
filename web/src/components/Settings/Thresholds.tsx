import { useEffect, useState } from 'react';
import '@styles/Settings/Profile.css';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { useAuth } from '@contexts/AuthContext';
import { fetchSettings, updateLowStockThreshold } from '@/services/settingsApi';

const Thresholds = () => {
    const { session } = useAuth();
    const { showAlert } = useAlert();
    const [currentThreshold, setCurrentThreshold] = useState<number | null>(null);
    const [draftThreshold, setDraftThreshold] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!session) {
            return;
        }

        let isActive = true;

        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const settings = await fetchSettings(session.accessToken);
                if (!isActive) {
                    return;
                }
                setCurrentThreshold(settings.lowStockThreshold);
                setDraftThreshold(String(settings.lowStockThreshold));
            } catch {
                if (isActive) {
                    showAlert('Failed to load settings.', 'error');
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void loadSettings();

        return () => {
            isActive = false;
        };
    }, [session, showAlert]);

    if (!session) {
        return null;
    }

    const parsedThreshold = Number(draftThreshold);
    const isThresholdValid =
        draftThreshold !== '' &&
        Number.isInteger(parsedThreshold) &&
        parsedThreshold >= 0;
    const isUnchanged = currentThreshold !== null && parsedThreshold === currentThreshold;

    const handleSave = async () => {
        if (!isThresholdValid) {
            showAlert('Enter a valid threshold of 0 or higher.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const nextSettings = await updateLowStockThreshold(
                session.accessToken,
                parsedThreshold,
            );
            setCurrentThreshold(nextSettings.lowStockThreshold);
            setDraftThreshold(String(nextSettings.lowStockThreshold));
            showAlert('Low-stock threshold updated.', 'success');
        } catch {
            showAlert('Failed to update the threshold.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-container">
            <section className="profile-card">
                <h2>Low-stock alerts</h2>
                <p>
                    Choose the quantity at which inventory slots should be treated as low
                    stock across the app.
                </p>
            </section>

            <section className="profile-card settings-panel">
                <div className="settings-form-row">
                    <label className="settings-field">
                        <span>Low-stock threshold</span>
                        <input
                            min="0"
                            onChange={(event) => setDraftThreshold(event.target.value)}
                            type="number"
                            value={draftThreshold}
                        />
                    </label>
                </div>

                <p className="settings-status-copy">
                    {isLoading
                        ? 'Loading the saved threshold.'
                        : `Current saved threshold: ${currentThreshold ?? 0}`}
                </p>

                <div className="settings-inline-actions">
                    <button
                        className="table-control-btn"
                        disabled={
                            isLoading || isSaving || !isThresholdValid || isUnchanged
                        }
                        onClick={() => void handleSave()}
                        type="button"
                    >
                        {isSaving ? 'Saving...' : 'Save Threshold'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Thresholds;
