"""Copy application data from Aiven MySQL into the empty Render MySQL database.

Run only after the Render API has applied its Alembic migrations. The script
refuses to run if any application table in the target already contains rows.
Set SOURCE_DATABASE_URL in the environment; never pass credentials as a CLI arg.
"""

import os

from sqlalchemy import create_engine, inspect, select
from sqlalchemy.engine import make_url

from app.core.config import get_settings
from app.db.base import Base
import app.models  # noqa: F401 - register all mapped tables


BATCH_SIZE = 500


def _source_engine(url_text: str):
    url = make_url(url_text.strip())
    if url.drivername == "mysql":
        url = url.set(drivername="mysql+pymysql")

    query = dict(url.query)
    ssl_mode = query.pop("ssl-mode", query.pop("sslmode", None))
    url = url.set(query=query)

    connect_args = {}
    if ssl_mode and str(ssl_mode).upper() not in {"DISABLED", "DISABLE"}:
        # Aiven's Service URI uses ssl-mode=REQUIRED. PyMySQL enables TLS via
        # the ssl argument; REQUIRED encrypts without CA verification.
        connect_args["ssl"] = {}
        if str(ssl_mode).upper() in {"VERIFY_CA", "VERIFY_IDENTITY"}:
            connect_args["ssl_verify_cert"] = True
        if str(ssl_mode).upper() == "VERIFY_IDENTITY":
            connect_args["ssl_verify_identity"] = True

    return create_engine(url, pool_pre_ping=True, connect_args=connect_args)


def migrate() -> None:
    source_url = os.environ.get("SOURCE_DATABASE_URL")
    if not source_url:
        raise SystemExit("Set SOURCE_DATABASE_URL in the environment before running this command.")

    source_engine = _source_engine(source_url)
    target_engine = create_engine(get_settings().database_url, pool_pre_ping=True)
    tables = [table for table in Base.metadata.sorted_tables if table.name != "alembic_version"]

    try:
        source_inspector = inspect(source_engine)
        source_tables = set(source_inspector.get_table_names())
        missing_tables = [table.name for table in tables if table.name not in source_tables]
        if missing_tables:
            raise RuntimeError(
                "Aiven is missing expected application tables: " + ", ".join(missing_tables)
            )

        with target_engine.connect() as target_connection:
            occupied = []
            for table in tables:
                if target_connection.execute(select(1).select_from(table).limit(1)).first():
                    occupied.append(table.name)
            if occupied:
                raise RuntimeError(
                    "Target is not empty; no rows were copied. Non-empty tables: "
                    + ", ".join(occupied)
                )

        with source_engine.connect() as source_connection, target_engine.connect() as target_connection:
            target_connection.exec_driver_sql("SET FOREIGN_KEY_CHECKS=0")
            target_connection.commit()
            transaction = target_connection.begin()
            try:
                for table in tables:
                    source_columns = {
                        column["name"] for column in source_inspector.get_columns(table.name)
                    }
                    missing_columns = [
                        column.name for column in table.columns if column.name not in source_columns
                    ]
                    if missing_columns:
                        raise RuntimeError(
                            f"Aiven table {table.name} is missing columns: "
                            + ", ".join(missing_columns)
                        )

                    statement = select(table).order_by(*table.primary_key.columns)
                    result = source_connection.execution_options(stream_results=True).execute(statement)
                    copied = 0
                    while batch := result.fetchmany(BATCH_SIZE):
                        target_connection.execute(
                            table.insert(), [dict(row._mapping) for row in batch]
                        )
                        copied += len(batch)
                    print(f"{table.name}: {copied} ligne(s) copiÃ©e(s)")

                transaction.commit()
            except Exception:
                transaction.rollback()
                raise
            finally:
                target_connection.exec_driver_sql("SET FOREIGN_KEY_CHECKS=1")
                target_connection.commit()

        print("Migration terminÃ©e. La table alembic_version du Render reste intacte.")
    finally:
        source_engine.dispose()
        target_engine.dispose()


if __name__ == "__main__":
    migrate()