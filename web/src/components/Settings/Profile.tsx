import '@styles/Settings/Profile.css';
import { useAuth } from '@contexts/AuthContext';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { useState, type FormEvent } from 'react';
import { changeMyPassword } from '@/services/usersApi';
import {
    getPasswordValidationMessage,
    isPasswordComplexEnough,
} from '@/utils/passwordValidation';

const Profile = () => {
    const { session, signOut } = useAuth();
    const { showAlert } = useAlert();
    const roleLabel = session?.role === 'admin' ? 'Admin' : 'Worker';
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const profileFields = [
        { label: 'Email', value: session?.user.email },
        { label: 'Role', value: roleLabel },
        { label: 'User ID', value: session?.user.userId },
        {
            label: 'Session Expires',
            value: session ? new Date(session.expiresAt).toLocaleString() : null,
        },
    ];
    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    const passwordsMatch = confirmPassword === '' || newPassword === confirmPassword;

    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!session) {
            return;
        }
        if (!isPasswordComplexEnough(newPassword)) {
            showAlert(passwordValidationMessage, 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert('New password and confirmation must match.', 'error');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await changeMyPassword(session.accessToken, {
                currentPassword,
                newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showAlert('Password updated successfully.', 'success');
        } catch (error) {
            showAlert(
                error instanceof Error ? error.message : 'Failed to change password.',
                'error',
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="profile-container">
            <section className="profile-card">
                <h2>{session?.user.email ?? 'OutaStock User'}</h2>
                <p>
                    This profile reflects the active OutaStock session for your account.
                </p>
            </section>

            <section className="profile-grid">
                {profileFields.map((field) => (
                    <article className="profile-field" key={field.label}>
                        <span className="profile-field-label">{field.label}</span>
                        <span className="profile-field-value">
                            {field.value ?? 'Not available'}
                        </span>
                    </article>
                ))}
            </section>

            <section className="profile-card settings-panel">
                <h2>Change Password</h2>
                <p>Update your password for future OutaStock sign-ins.</p>
                <form
                    className="settings-form-stack"
                    onSubmit={(event) => void handleChangePassword(event)}
                >
                    <div className="settings-form-row">
                        <label className="settings-field">
                            <span>Current Password</span>
                            <input
                                autoComplete="current-password"
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                required
                                type="password"
                                value={currentPassword}
                            />
                        </label>
                        <label className="settings-field">
                            <span>New Password</span>
                            <input
                                autoComplete="new-password"
                                onChange={(event) => setNewPassword(event.target.value)}
                                required
                                type="password"
                                value={newPassword}
                            />
                            {passwordValidationMessage ? (
                                <span className="settings-field-note settings-field-note-error">
                                    {passwordValidationMessage}
                                </span>
                            ) : null}
                        </label>
                        <label className="settings-field">
                            <span>Confirm New Password</span>
                            <input
                                autoComplete="new-password"
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                                type="password"
                                value={confirmPassword}
                            />
                            {!passwordsMatch ? (
                                <span className="settings-field-note settings-field-note-error">
                                    Passwords do not match.
                                </span>
                            ) : null}
                        </label>
                    </div>
                    <div className="settings-inline-actions">
                        <button
                            className="table-control-btn"
                            disabled={
                                isUpdatingPassword ||
                                !currentPassword ||
                                !newPassword ||
                                !confirmPassword ||
                                !isPasswordComplexEnough(newPassword) ||
                                !passwordsMatch
                            }
                            type="submit"
                        >
                            {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </section>

            <div className="profile-actions">
                <button className="profile-button" onClick={signOut}>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
