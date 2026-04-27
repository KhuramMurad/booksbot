# -*- coding: utf-8 -*-
import os

BOT_NAME = 'books'

SPIDER_MODULES = ['books.spiders']
NEWSPIDER_MODULE = 'books.spiders'

ROBOTSTXT_OBEY = True
HTTPCACHE_ENABLED = True

ADDONS = {"scrapy_zyte_api.Addon": 500} if os.environ.get("ZYTE_API_KEY") else {}

ZYTE_API_TRANSPARENT_MODE = False
