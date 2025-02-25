package com.geocell.team.exception;

public class TeamManagementException extends RuntimeException {
    public TeamManagementException() {
        super();
    }

    public TeamManagementException(String message) {
        super(message);
    }

    public TeamManagementException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamManagementException(Throwable cause) {
        super(cause);
    }

    protected TeamManagementException(String message, Throwable cause, 
                                      boolean enableSuppression, 
                                      boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    // Specific subclasses for more granular error handling
    public static class TeamAlreadyExistsException extends TeamManagementException {
        public TeamAlreadyExistsException(String teamName) {
            super("Team with name '" + teamName + "' already exists");
        }
    }

    public static class TeamNotFoundException extends TeamManagementException {
        public TeamNotFoundException(Long teamId) {
            super("Team with ID " + teamId + " not found");
        }
    }

    public static class MemberAlreadyInTeamException extends TeamManagementException {
        public MemberAlreadyInTeamException(String userId, Long teamId) {
            super("User " + userId + " is already a member of team " + teamId);
        }
    }

    public static class MaxTeamMemberLimitException extends TeamManagementException {
        public MaxTeamMemberLimitException(Long teamId, int maxLimit) {
            super("Team " + teamId + " has reached its maximum member limit of " + maxLimit);
        }
    }

    public static class InvalidTeamOperationException extends TeamManagementException {
        public InvalidTeamOperationException(String message) {
            super(message);
        }
    }
}
