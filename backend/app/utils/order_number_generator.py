import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order


def generate_order_number(db: Session) -> str:
    """Numéro public de suivi au format NG-<année>-<compteur sur 6 chiffres>.

    Le compteur repart de 1 chaque année civile. En cas de collision rare due
    à des commandes concurrentes, l'appelant (order_service) retente l'insertion
    avec un nouveau numéro : voir la boucle de retry dans create_order().
    """
    year = datetime.datetime.now(datetime.timezone.utc).year
    prefix = f"NG-{year}-"

    count = db.scalar(
        select(func.count()).select_from(Order).where(Order.order_number.like(f"{prefix}%"))
    )
    next_seq = (count or 0) + 1
    return f"{prefix}{next_seq:06d}"
