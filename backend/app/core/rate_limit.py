from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings

# Limiteur en mémoire pour le développement. En production à volume plus
# important, brancher un backend partagé (ex. Redis) via `storage_uri`.
# Désactivé pendant les tests (RATE_LIMITING_ENABLED=false) pour éviter que
# des tests indépendants ne s'épuisent mutuellement le même quota.
limiter = Limiter(key_func=get_remote_address, enabled=get_settings().rate_limiting_enabled)
