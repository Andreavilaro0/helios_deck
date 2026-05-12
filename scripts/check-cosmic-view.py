from playwright.sync_api import sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1080}, device_scale_factor=1)
    page.goto("http://127.0.0.1:4173/cosmic-view", wait_until="networkidle")
    page.screenshot(path="/private/tmp/cosmic-view-check.png", full_page=True)
    print(page.title())
    browser.close()
