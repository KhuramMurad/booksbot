# Booksbot

Booksbot is a small Scrapy project that crawls [books.toscrape.com](https://books.toscrape.com/) and exports a catalogue of books. It also includes a static web dashboard for browsing the scraped results.

## What It Scrapes

The spider visits every catalogue page, opens each book detail page, and extracts:

- `title`
- `category`
- `description`
- `price`

The current generated dataset is stored in `books_output.json` and contains 1,000 books.

## Project Structure

```text
booksbot/
├── books/
│   ├── spiders/books.py     # Scrapy spider
│   ├── settings.py          # Scrapy settings
│   ├── items.py             # Scrapy item placeholder
│   └── pipelines.py         # Scrapy pipeline placeholder
├── web/
│   ├── index.html           # Static dashboard
│   ├── styles.css           # Dashboard styling
│   └── app.js               # Search, filters, sorting, and charts
├── books_output.json        # Scraped output data
└── scrapy.cfg               # Scrapy project config
```

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install Scrapy:

```bash
python -m pip install Scrapy
```

## Run The Spider

From the project root:

```bash
scrapy crawl books -O books_output.json
```

This overwrites `books_output.json` with a fresh JSON export.

## Open The Web Interface

Start a static server from the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/web/index.html
```

The dashboard loads `books_output.json` directly and provides:

- Catalogue totals
- Average price
- Category distribution
- Spotlight book
- Search by title, category, or description
- Category filtering
- Sorting by title, price, or category
- Responsive book cards

## Useful Commands

Run the crawler:

```bash
source .venv/bin/activate
scrapy crawl books -O books_output.json
```

Serve the dashboard:

```bash
python -m http.server 8000
```

Check the dashboard JavaScript:

```bash
node --check web/app.js
```

Check the JSON item count:

```bash
python - <<'PY'
import json
from pathlib import Path

items = json.loads(Path("books_output.json").read_text())
print(len(items))
PY
```

## Notes

- `ROBOTSTXT_OBEY` is enabled in `books/settings.py`.
- Scrapy HTTP caching is enabled, so crawl responses are stored under `.scrapy/httpcache`.
- The web interface is static and does not require a build step.
