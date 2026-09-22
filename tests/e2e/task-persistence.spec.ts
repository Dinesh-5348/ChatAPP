import { expect, test } from "@playwright/test";

const email = `e2e-${Date.now()}@example.com`;
const password = "correct-horse-battery-staple";

test("user can sign in, add a task, reload, and still see it", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeVisible();

  const taskTitle = `Persisted task ${Date.now()}`;
  await page.getByLabel("Task title").fill(taskTitle);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText(taskTitle)).toBeVisible();
  await expect(page.getByRole("button", { name: /Inbox\s+1/ })).toBeVisible();

  await page.reload();
  await expect(page.getByText(taskTitle)).toBeVisible();
});
