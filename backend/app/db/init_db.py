"""Script d'initialisation contrôlé : crée le tout premier compte
administrateur. Ne crée jamais de compte propriétaire (celui-ci est
exclusivement créé par un administrateur depuis son interface).

Usage :
    python -m app.db.init_db

Le script refuse de s'exécuter si un administrateur existe déjà.
"""

import getpass
import re
import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _prompt_email() -> str:
    while True:
        email = input("Email du premier administrateur : ").strip()
        if EMAIL_RE.match(email):
            return email
        print("Adresse email invalide, réessayez.")


def _prompt_password() -> str:
    while True:
        password = getpass.getpass("Mot de passe (min. 12 caractères) : ")
        confirm = getpass.getpass("Confirmez le mot de passe : ")
        if password != confirm:
            print("Les mots de passe ne correspondent pas, réessayez.")
            continue
        if len(password) < 12:
            print("Le mot de passe doit contenir au moins 12 caractères.")
            continue
        return password


def main() -> None:
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
        if existing_admin is not None:
            print("Un compte administrateur existe déjà. Initialisation annulée.")
            sys.exit(1)

        print("== Création du premier compte administrateur New Generation ==")
        full_name = input("Nom complet : ").strip()
        email = _prompt_email()
        password = _prompt_password()

        admin = User(
            role=UserRole.admin,
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Compte administrateur créé avec succès pour {email}.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
