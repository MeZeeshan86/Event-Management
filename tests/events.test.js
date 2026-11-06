const { Builder, By, until } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const assert = require("node:assert/strict");

(async function eventTests() {
  const chromeOptions = new Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
  const base = process.env.APP_URL || "http://localhost:8080";
  const email = `student${Date.now()}@example.test`;
  try {
    await driver.get(base);
    await driver.wait(until.titleContains("CampusConnect"), 10000);
    assert.ok((await driver.getTitle()).includes("CampusConnect"));
    console.log("TC01 PASS - event registration page opened");

    await driver.findElement(By.id("regName")).sendKeys("Test Student");
    await driver.findElement(By.id("regEmail")).clear();
    await driver.findElement(By.id("regEmail")).sendKeys(email);
    await driver.findElement(By.id("regPassword")).sendKeys("student123");
    await driver.findElement(By.css("#registerForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /registration successful/i);
    console.log("TC02 PASS - valid student registration");

    // Browser-native validation: empty fields and malformed email are rejected.
    const emptyFormInvalid = await driver.executeScript("return !document.getElementById('regName').checkValidity()");
    assert.equal(emptyFormInvalid, true);
    await driver.findElement(By.id("regEmail")).sendKeys("not-an-email");
    const invalidEmailRejected = await driver.executeScript("return !document.getElementById('regEmail').checkValidity()");
    assert.equal(invalidEmailRejected, true);
    console.log("TC03 PASS - empty form validation");
    console.log("TC04 PASS - invalid email rejected");

    await driver.findElement(By.id("regName")).sendKeys("Test Student");
    await driver.findElement(By.id("regEmail")).clear();
    await driver.findElement(By.id("regEmail")).sendKeys(email);
    await driver.findElement(By.id("regPassword")).sendKeys("student123");
    await driver.findElement(By.css("#registerForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /already registered/i);
    console.log("TC05 PASS - duplicate email registration prevented");

    await driver.findElement(By.id("loginEmail")).sendKeys(email);
    await driver.findElement(By.id("loginPassword")).sendKeys("student123");
    await driver.findElement(By.css("#loginForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("studentApp"))), 5000);
    assert.ok((await driver.findElement(By.id("eventList")).getText()).includes("AI & Innovation Summit"));
    console.log("TC06 PASS - valid student login");

    await driver.findElement(By.id("categoryFilter")).sendKeys("Technology");
    assert.ok((await driver.findElement(By.id("eventList")).getText()).includes("Technology"));
    await driver.findElement(By.id("categoryFilter")).sendKeys("All categories");
    await driver.findElement(By.css("[data-register='EVT101']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /registration confirmed/i);
    console.log("Event registration confirmation displayed");

    await driver.findElement(By.css("[data-tab='mine']")).click();
    assert.ok((await driver.findElement(By.id("myRegistrations")).getText()).includes("AI & Innovation Summit"));
    console.log("TC07 PASS - student views registered events");

    await driver.findElement(By.id("logoutBtn")).click();
    await driver.findElement(By.id("loginEmail")).clear();
    await driver.findElement(By.id("loginPassword")).clear();
    await driver.findElement(By.id("loginEmail")).sendKeys("admin@events.test");
    await driver.findElement(By.id("loginPassword")).sendKeys("admin123");
    await driver.findElement(By.css("#loginForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("adminApp"))), 5000);
    assert.ok((await driver.findElement(By.id("adminRegistrations")).getText()).includes(email));
    console.log("TC08 PASS - admin dashboard displays participant");
  } catch (err) {
    console.error("EVENT TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
})();
