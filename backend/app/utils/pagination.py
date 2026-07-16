from dataclasses import dataclass

from app.core.config import get_settings

settings = get_settings()


@dataclass
class PageParams:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_page_params(page: int = 1, page_size: int | None = None) -> PageParams:
    page = max(page, 1)
    size = page_size or settings.default_page_size
    size = min(max(size, 1), settings.max_page_size)
    return PageParams(page=page, page_size=size)


def build_meta(*, page: int, page_size: int, total: int) -> dict:
    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size if page_size else 0,
    }
