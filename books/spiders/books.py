# -*- coding: utf-8 -*-
import os

import scrapy


class BooksSpider(scrapy.Spider):
    name = "books"
    allowed_domains = ["books.toscrape.com"]

    def __init__(self, use_zyte=False, zyte_browser=False, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.use_zyte = str(use_zyte).lower() in {"1", "true", "yes", "on"}
        self.zyte_browser = str(zyte_browser).lower() in {"1", "true", "yes", "on"}

    async def start(self):
        if self.use_zyte and not os.environ.get("ZYTE_API_KEY"):
            self.logger.error("ZYTE_API_KEY must be set before running with use_zyte=1")
            return

        yield self.build_request("http://books.toscrape.com/", callback=self.parse)

    def build_request(self, url, callback):
        meta = {}
        if self.use_zyte:
            meta["zyte_api_automap"] = {"browserHtml": True} if self.zyte_browser else True

        return scrapy.Request(url, callback=callback, meta=meta)

    def parse(self, response):
        for book_url in response.css("article.product_pod > h3 > a ::attr(href)").extract():
            yield self.build_request(response.urljoin(book_url), callback=self.parse_book_page)
        next_page = response.css("li.next > a ::attr(href)").extract_first()
        if next_page:
            yield self.build_request(response.urljoin(next_page), callback=self.parse)

    def parse_book_page(self, response):
        item = {}
        product = response.css("div.product_main")
        item["title"] = product.css("h1 ::text").extract_first()
        item['category'] = response.xpath(
            "//ul[@class='breadcrumb']/li[@class='active']/preceding-sibling::li[1]/a/text()"
        ).extract_first()
        item['description'] = response.xpath(
            "//div[@id='product_description']/following-sibling::p/text()"
        ).extract_first()
        item['price'] = response.css('p.price_color ::text').extract_first()
        yield item
