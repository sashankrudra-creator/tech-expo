"""Errors that the API turns into clean JSON responses."""


class ApiError(Exception):
    status = 400

    def __init__(self, message, status=None, **extra):
        super().__init__(message)
        self.message = message
        if status:
            self.status = status
        self.extra = extra


class ValidationError(ApiError):
    def __init__(self, fields):
        super().__init__("Please fix the highlighted fields.", 400, fields=fields)


class NotFound(ApiError):
    status = 404


class Conflict(ApiError):
    status = 409


class ServiceUnavailable(ApiError):
    status = 503
