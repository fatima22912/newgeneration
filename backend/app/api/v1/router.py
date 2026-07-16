from fastapi import APIRouter

from app.api.v1 import (
    accounts,
    activity_log,
    auth,
    categories,
    contact,
    orders,
    products,
    stats,
    uploads,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(uploads.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(accounts.router)
api_router.include_router(stats.router)
api_router.include_router(contact.router)
api_router.include_router(activity_log.router)
