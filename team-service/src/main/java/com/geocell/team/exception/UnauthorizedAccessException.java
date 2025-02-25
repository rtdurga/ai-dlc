package com.geocell.team.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException() {
        super();
    }

    public UnauthorizedAccessException(String message) {
        super(message);
    }

    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }

    public UnauthorizedAccessException(Throwable cause) {
        super(cause);
    }

    protected UnauthorizedAccessException(String message, Throwable cause, 
                                          boolean enableSuppression, 
                                          boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    // Specific subclasses for more granular error handling
    public static class InsufficientRoleException extends UnauthorizedAccessException {
        public InsufficientRoleException(String userId, String requiredRole) {
            super("User " + userId + " does not have the required role: " + requiredRole);
        }
    }

    public static class InsufficientPermissionException extends UnauthorizedAccessException {
        public InsufficientPermissionException(String userId, String requiredPermission) {
            super("User " + userId + " does not have the required permission: " + requiredPermission);
        }
    }

    public static class NotTeamMemberException extends UnauthorizedAccessException {
        public NotTeamMemberException(String userId, Long teamId) {
            super("User " + userId + " is not a member of team " + teamId);
        }
    }

    public static class NotTeamAdminException extends UnauthorizedAccessException {
        public NotTeamAdminException(String userId, Long teamId) {
            super("User " + userId + " is not an admin of team " + teamId);
        }
    }

    public static class NotTeamOwnerException extends UnauthorizedAccessException {
        public NotTeamOwnerException(String userId, Long teamId) {
            super("User " + userId + " is not the owner of team " + teamId);
        }
    }

    public static class InactiveUserException extends UnauthorizedAccessException {
        public InactiveUserException(String userId) {
            super("User " + userId + " is currently inactive");
        }
    }
}
