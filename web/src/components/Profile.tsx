import '@styles/Profile.css';
import { useAuth } from '@contexts/AuthContext';

const Profile = () => {
    const { config, signOut, user } = useAuth();

    const profileFields = [
        { label: 'Display Name', value: user?.name },
        { label: 'Email', value: user?.email },
        { label: 'Username', value: user?.preferred_username },
        { label: 'User ID', value: user?.sub },
        { label: 'Organization ID', value: config?.organizationId },
        { label: 'Issuer', value: config?.issuer },
    ];

    return (
        <div className="profile-container">
            <section className="profile-card">
                <h2>{user?.name ?? 'ZITADEL User'}</h2>
                <p>
                    This profile comes from your local ZITADEL session and confirms the
                    app is using the OIDC client managed in Terraform.
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

            <div className="profile-actions">
                <button className="profile-button" onClick={() => void signOut()}>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
