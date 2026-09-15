"""Small environment guardrails shared by runtime and destructive tests."""

from urllib.parse import urlparse


def validate_test_database_target(mongo_url: str, db_name: str, app_env: str = "test") -> None:
    """Refuse destructive test work when configuration resembles production.

    Test suites call this before starting a server and again before dropping the
    database. A production-like environment must never be made safe by a name
    convention alone.
    """
    environment = (app_env or "").strip().lower()
    database = (db_name or "").strip().lower()
    if environment in {"production", "prod"}:
        raise RuntimeError("Destructive tests cannot run with APP_ENV=production.")
    if not database or "test" not in database:
        raise RuntimeError("Destructive tests require a database name containing 'test'.")
    host = (urlparse(mongo_url or "").hostname or "").lower()
    if host and host not in {"localhost", "127.0.0.1", "::1"} and "test" not in database:
        raise RuntimeError("Destructive tests require an explicitly test-named database.")
