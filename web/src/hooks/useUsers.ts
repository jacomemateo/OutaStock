import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    changeMyPassword,
    createUser,
    deleteUser,
    listUsers,
    updateUserRole,
} from '@/services/usersApi';
import type { AuthSession } from '@/services/auth';
import type { UserRecord, UserRole } from '@/services/types';

export const usersQueryOptions = queryOptions({
    queryKey: queryKeys.users.all,
    queryFn: listUsers,
});

export function useUsers() {
    return useQuery(usersQueryOptions);
}

export function useCreateUserMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUserRoleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
            updateUserRole(userId, role),
        onMutate: async ({ userId, role }) => {
            await Promise.all([
                queryClient.cancelQueries({ queryKey: queryKeys.users.all }),
                queryClient.cancelQueries({ queryKey: queryKeys.session.all }),
            ]);

            const previousUsers = queryClient.getQueryData<UserRecord[]>(
                queryKeys.users.all,
            );
            const previousSession = queryClient.getQueryData<AuthSession | null>(
                queryKeys.session.all,
            );

            if (previousUsers) {
                queryClient.setQueryData(
                    queryKeys.users.all,
                    previousUsers.map((user) =>
                        user.userId === userId
                            ? {
                                  ...user,
                                  role,
                              }
                            : user,
                    ),
                );
            }

            if (previousSession && previousSession.user.userId === userId) {
                queryClient.setQueryData(queryKeys.session.all, {
                    ...previousSession,
                    role,
                    user: {
                        ...previousSession.user,
                        role,
                    },
                });
            }

            return { previousSession, previousUsers };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(queryKeys.users.all, context.previousUsers);
            }

            if (context?.previousSession) {
                queryClient.setQueryData(
                    queryKeys.session.all,
                    context.previousSession,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.session.all }),
            ]);
        },
    });
}

export function useDeleteUserMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onMutate: async (userId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
            const previousUsers = queryClient.getQueryData<UserRecord[]>(
                queryKeys.users.all,
            );

            if (previousUsers) {
                queryClient.setQueryData(
                    queryKeys.users.all,
                    previousUsers.filter((user) => user.userId !== userId),
                );
            }

            return { previousUsers };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(queryKeys.users.all, context.previousUsers);
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.session.all }),
            ]);
        },
    });
}

export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: changeMyPassword,
    });
}
