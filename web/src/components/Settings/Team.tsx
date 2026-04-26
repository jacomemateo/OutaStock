import { useState, type ChangeEvent, type FormEvent } from 'react';
import '@styles/Settings/Profile.css';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { useAuth } from '@contexts/AuthContext';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useUsers,
} from '@/hooks/useUsers';
import {
    getPasswordValidationMessage,
    isPasswordComplexEnough,
} from '@/utils/passwordValidation';
import type { UserRecord } from '@/services/types';

const Team = () => {
    const { session } = useAuth();
    const { showAlert } = useAlert();
    const usersQuery = useUsers();
    const createUserMutation = useCreateUserMutation();
    const updateRoleMutation = useUpdateUserRoleMutation();
    const deleteUserMutation = useDeleteUserMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'worker'>('worker');
    const [busyUserId, setBusyUserId] = useState<string | null>(null);
    const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRecord | null>(null);
    const passwordValidationMessage = getPasswordValidationMessage(password);
    const users = usersQuery.data ?? [];
    const isLoading = usersQuery.isPending || usersQuery.isFetching;

    if (!session) {
        return null;
    }

    const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await createUserMutation.mutateAsync({
                email: email.trim(),
                password,
                role,
            });
            setEmail('');
            setPassword('');
            setRole('worker');
            showAlert('User created successfully.', 'success');
        } catch (error) {
            showAlert(
                error instanceof Error ? error.message : 'Failed to create user.',
                'error',
            );
        }
    };

    const handleRoleChange = async (
        userId: string,
        event: ChangeEvent<HTMLSelectElement>,
    ) => {
        const nextRole = event.target.value as 'admin' | 'worker';
        setBusyUserId(userId);

        try {
            await updateRoleMutation.mutateAsync({
                userId,
                role: nextRole,
            });
            showAlert('Role updated successfully.', 'success');
        } catch {
            showAlert('Failed to update role.', 'error');
        } finally {
            setBusyUserId(null);
        }
    };

    const handleDelete = async () => {
        if (!pendingDeleteUser) {
            return;
        }

        const deletedUser = pendingDeleteUser;
        setBusyUserId(deletedUser.userId);

        try {
            await deleteUserMutation.mutateAsync(deletedUser.userId);
            showAlert('User deleted.', 'success');
        } catch (error) {
            showAlert(
                error instanceof Error ? error.message : 'Failed to delete user.',
                'error',
            );
        } finally {
            setBusyUserId(null);
            setPendingDeleteUser(null);
        }
    };

    const openDeleteConfirmation = (user: UserRecord) => {
        setPendingDeleteUser(user);
    };

    const handleDeleteModalClose = () => {
        if (busyUserId) {
            return;
        }

        setPendingDeleteUser(null);
    };

    const handleDeleteConfirmation = async (confirmed: boolean) => {
        if (!confirmed) {
            handleDeleteModalClose();
            return;
        }

        await handleDelete();
    };

    const handleRoleLabel = (currentRole: UserRecord['role']) =>
        currentRole === 'admin' ? 'Admin' : 'Worker';

    const handleDeleteButtonCopy = (isBusy: boolean) =>
        isBusy ? 'Deleting...' : 'Delete';

    const handleCurrentAccountCopy = (isCurrentUser: boolean) =>
        isCurrentUser ? 'Current account' : 'No actions';

    const handleVisibleRowCount = () =>
        `${users.length} user${users.length === 1 ? '' : 's'} found.`;

    const handleEmptyTableColSpan = () => 3;

    const handleRowBusyState = (userId: string) => busyUserId === userId;

    const handleCanEditRole = (isCurrentUser: boolean) => !isCurrentUser;

    const handleCanDelete = (isCurrentUser: boolean) => !isCurrentUser;

    return (
        <div className="profile-container">
            <section className="profile-card">
                <h2>Team access</h2>
                <p>
                    Invite workers and admins, adjust roles, and delete accounts when
                    access should be removed.
                </p>
            </section>

            <section className="profile-card settings-panel">
                <h3>Add User</h3>
                <form
                    className="settings-form-stack"
                    onSubmit={(event) => void handleCreateUser(event)}
                >
                    <div className="settings-form-row">
                        <label className="settings-field">
                            <span>Email</span>
                            <input
                                autoComplete="email"
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                type="email"
                                value={email}
                            />
                        </label>
                        <label className="settings-field">
                            <span>Password</span>
                            <input
                                autoComplete="new-password"
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                type="password"
                                value={password}
                            />
                            {passwordValidationMessage ? (
                                <span className="settings-field-note settings-field-note-error">
                                    {passwordValidationMessage}
                                </span>
                            ) : null}
                        </label>
                        <label className="settings-field">
                            <span>Role</span>
                            <select
                                onChange={(event) =>
                                    setRole(event.target.value as 'admin' | 'worker')
                                }
                                value={role}
                            >
                                <option value="worker">Worker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                    </div>
                    <div className="settings-inline-actions">
                        <button
                            className="table-control-btn"
                            disabled={
                                createUserMutation.isPending ||
                                !email.trim() ||
                                !isPasswordComplexEnough(password)
                            }
                            type="submit"
                        >
                            {createUserMutation.isPending ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="profile-card settings-panel settings-table-panel">
                <div className="table-toolbar">
                    <p className="table-status">
                        {isLoading ? 'Loading team members.' : handleVisibleRowCount()}
                    </p>
                </div>

                <div className={`table-list ${isLoading ? 'loading-opacity' : ''}`}>
                    <table className="table data-table settings-team-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        className="settings-empty-state"
                                        colSpan={handleEmptyTableColSpan()}
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const isCurrentUser =
                                        user.userId === session.user.userId;
                                    const isBusy = handleRowBusyState(user.userId);

                                    return (
                                        <tr key={user.userId}>
                                            <td>{user.email}</td>
                                            <td>
                                                {!handleCanEditRole(isCurrentUser) ? (
                                                    handleRoleLabel(user.role)
                                                ) : (
                                                    <select
                                                        className="settings-role-select"
                                                        disabled={isBusy}
                                                        onChange={(event) =>
                                                            void handleRoleChange(
                                                                user.userId,
                                                                event,
                                                            )
                                                        }
                                                        value={user.role}
                                                    >
                                                        <option value="worker">
                                                            Worker
                                                        </option>
                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                    </select>
                                                )}
                                            </td>
                                            <td>
                                                <div className="settings-actions-cell">
                                                    {handleCanDelete(isCurrentUser) ? (
                                                        <button
                                                            className="table-control-btn-secondary table-control-btn-danger"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                openDeleteConfirmation(
                                                                    user,
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            {handleDeleteButtonCopy(
                                                                isBusy,
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="table-status">
                                                            {handleCurrentAccountCopy(
                                                                isCurrentUser,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <ConfirmationModal
                isOpen={pendingDeleteUser !== null}
                message={`Are you sure you want to delete ${
                    pendingDeleteUser?.email ?? 'this user'
                }? This action is irreversible.`}
                onClose={handleDeleteModalClose}
                onConfirm={(confirmed) => void handleDeleteConfirmation(confirmed)}
                title="Delete user?"
            />
        </div>
    );
};

export default Team;
