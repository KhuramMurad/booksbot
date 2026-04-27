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
├── requirements.txt         # Local development dependencies
├── requirements-cloud.txt   # Extra Scrapy Cloud dependencies
├── scrapinghub.yml          # Scrapy Cloud deployment config
└── scrapy.cfg               # Scrapy project config
```

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install project dependencies:

```bash
python -m pip install -r requirements.txt
```

## Run The Spider

From the project root:

```bash
scrapy crawl books -O books_output.json
```

This overwrites `books_output.json` with a fresh JSON export.

## Use Zyte API

This project includes optional Zyte API support through `scrapy-zyte-api`.
Keep your API key outside the repository:

```bash
export ZYTE_API_KEY="your_zyte_api_key_here"
```

Run the spider through Zyte API:

```bash
scrapy crawl books -a use_zyte=1 -O books_output.json
```

For pages that require JavaScript rendering, ask Zyte for browser-rendered HTML:

```bash
scrapy crawl books -a use_zyte=1 -a zyte_browser=1 -O books_output.json
```

The default crawl still uses direct Scrapy requests:

```bash
scrapy crawl books -O books_output.json
```

Zyte is opt-in here because `books.toscrape.com` is static HTML and does not need anti-ban or browser rendering. For protected or JavaScript-heavy sites, use the `use_zyte` arguments above.

## Deploy To Scrapy Cloud

Your GitHub Student Developer Pack benefit gives you 1 free Scrapy Cloud unit. Use it to run this spider in Zyte's hosted Scrapy environment, inspect jobs, review logs, and export items from the dashboard.

Install the Scrapy Cloud CLI:

```bash
source .venv/bin/activate
python -m pip install --upgrade shub
```

Create a Scrapy Cloud project in the Zyte dashboard, then copy:

- Your Scrapy Cloud API key, not your Zyte API key
- Your Scrapy Cloud project ID from a URL like `https://app.zyte.com/p/000000/jobs`

Log in:

```bash
shub login
```

Deploy this project:

```bash
shub deploy
```

This project is configured for Scrapy Cloud project `859516` in `scrapinghub.yml`.
To deploy to another project, run `shub deploy PROJECT_ID` or update `scrapinghub.yml`.

After deployment, run the spider from the Zyte dashboard or from the CLI:

```bash
shub schedule books
```

For a Zyte API-backed cloud run, pass spider arguments:

```bash
shub schedule books -a use_zyte=1
```

If you want to use Zyte API inside Scrapy Cloud, add `ZYTE_API_KEY` as a project environment variable or secret in Zyte instead of committing it to this repository.

The cloud deployment config is in `scrapinghub.yml`. Cloud-only extra dependencies are in `requirements-cloud.txt`.

## Learning Path

Use the free Scrapy Cloud unit in this order:

1. Deploy the current spider to Scrapy Cloud.
2. Run `books` from the Zyte dashboard and inspect logs, stats, and items.
3. Export results as CSV or JSON from the job page.
4. Schedule repeat runs and compare item counts.
5. Try `-a use_zyte=1` after adding `ZYTE_API_KEY` in Zyte.
6. Add a second spider for a harder website and compare direct Scrapy vs Zyte API.

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

Run the crawler with Zyte API:

```bash
source .venv/bin/activate
export ZYTE_API_KEY="your_zyte_api_key_here"
scrapy crawl books -a use_zyte=1 -O books_output.json
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
- Zyte API is configured in non-transparent mode, so requests only use Zyte when the spider is run with `-a use_zyte=1`.
- The web interface is static and does not require a build step.
