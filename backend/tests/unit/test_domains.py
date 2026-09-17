from app.core import domains as domains_module


def test_is_research_email_known_domain() -> None:
    domains_module.research_domains = {"mit.edu", "iitk.ac.in"}
    domains_module.domains_loaded = True
    from app.core.domains import is_research_email

    assert is_research_email("user@mit.edu") is True


def test_is_research_email_unknown_domain() -> None:
    domains_module.research_domains = {"mit.edu"}
    domains_module.domains_loaded = True
    from app.core.domains import is_research_email

    assert is_research_email("user@gmail.com") is False


def test_is_research_email_case_insensitive() -> None:
    domains_module.research_domains = {"mit.edu"}
    domains_module.domains_loaded = True
    from app.core.domains import is_research_email

    assert is_research_email("USER@MIT.EDU") is True
