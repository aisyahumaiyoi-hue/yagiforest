import pytest

from backend.safety import validate_test_database_target


def test_destructive_tests_refuse_production_like_targets():
    with pytest.raises(RuntimeError, match="production"):
        validate_test_database_target("mongodb://db.example", "yagi_test", "production")
    with pytest.raises(RuntimeError, match="test"):
        validate_test_database_target("mongodb://127.0.0.1:27017", "yagi", "development")


def test_destructive_tests_allow_explicit_local_test_database():
    validate_test_database_target("mongodb://127.0.0.1:27017", "yagi_phase6_test", "development")
