import { useState } from 'react';
import '@styles/Settings/Profile.css';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { useSettings, useUpdateLowStockThresholdMutation } from '@/hooks/useSettings';

const Thresholds = () => {
    const { showAlert } = useAlert();
    const settingsQuery = useSettings();
    const updateThresholdMutation = useUpdateLowStockThresholdMutation();
    const [draftThresholdOverride, setDraftThresholdOverride] = useState<string | null>(
        null,
    );

    const currentThreshold = settingsQuery.data?.lowStockThreshold ?? null;
    const isLoading = settingsQuery.isPending;
    const draftThreshold =
        draftThresholdOverride ?? (currentThreshold === null ? '' : String(currentThreshold));

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

        try {
            await updateThresholdMutation.mutateAsync(parsedThreshold);
            setDraftThresholdOverride(null);
            showAlert('Low-stock threshold updated.', 'success');
        } catch {
            showAlert('Failed to update the threshold.', 'error');
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
                            onChange={(event) =>
                                setDraftThresholdOverride(event.target.value)
                            }
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
                            isLoading ||
                            updateThresholdMutation.isPending ||
                            !isThresholdValid ||
                            isUnchanged
                        }
                        onClick={() => void handleSave()}
                        type="button"
                    >
                        {updateThresholdMutation.isPending
                            ? 'Saving...'
                            : 'Save Threshold'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Thresholds;
