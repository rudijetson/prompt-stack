"""
Environment variable utilities

Provides safe parsing of environment variables with proper
type conversion and validation.
"""

from typing import Optional


def env_bool(value: Optional[str]) -> bool:
    """
    Safely parse boolean environment variables.
    
    Handles common boolean representations and avoids the 
    Python footgun where bool("false") == True.
    
    Args:
        value: Environment variable value to parse
        
    Returns:
        bool: True if value represents true, False otherwise
        
    Examples:
        >>> env_bool("true")
        True
        >>> env_bool("TRUE")
        True
        >>> env_bool("1")
        True
        >>> env_bool("yes")
        True
        >>> env_bool("false")
        False
        >>> env_bool("FALSE")
        False
        >>> env_bool("0")
        False
        >>> env_bool("no")
        False
        >>> env_bool("")
        False
        >>> env_bool(None)
        False
    """
    if not value:
        return False
        
    return value.strip().lower() in {"true", "1", "yes", "y", "on", "t"}


def env_str(value: Optional[str], default: str = "") -> str:
    """
    Safely parse string environment variables.
    
    Args:
        value: Environment variable value
        default: Default value if None or empty
        
    Returns:
        str: Parsed string value
    """
    if not value:
        return default
    return value.strip()


def env_int(value: Optional[str], default: int = 0) -> int:
    """
    Safely parse integer environment variables.
    
    Args:
        value: Environment variable value
        default: Default value if None or invalid
        
    Returns:
        int: Parsed integer value
    """
    if not value:
        return default
        
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return default


def is_placeholder(value: Optional[str]) -> bool:
    """
    Check if an environment variable is a placeholder value.
    
    Common placeholders that indicate the value hasn't been properly set.
    
    Args:
        value: Environment variable value to check
        
    Returns:
        bool: True if value is a placeholder
    """
    if not value:
        return True
        
    value_lower = value.strip().lower()
    
    # Common placeholder patterns
    placeholders = [
        'your_', 'your-', 'xxx', 'test_', 'sk_test_',
        'placeholder', 'example', '<your', 'change_me',
        'todo', 'fixme', 'replaceme', 'your_key_here',
        'add_your_', 'insert_', 'dummy', 'sample'
    ]
    
    # Check if value starts with or contains common placeholders
    for placeholder in placeholders:
        if placeholder in value_lower:
            return True
            
    # Check for specific known placeholder values
    exact_placeholders = {
        'sk_test_1234567890',
        'eyJhbGciOi...',
        'https://example.supabase.co',
        'your-api-key-here',
        'your_api_key_here'
    }
    
    return value in exact_placeholders