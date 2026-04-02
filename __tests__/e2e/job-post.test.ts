import { test, expect } from '@playwright/test';

test.describe('Job Post E2E Test', () => {
  test('should allow a user to post a job successfully', async ({ page }) => {
    // Navigate to the job post page
    await page.goto('/customer/post-job');

    // Fill out the job post form
    await page.fill('#job-title', 'Test Job Title');
    await page.fill('#job-description', 'This is a test job description.');
    await page.fill('#job-category', 'Software Development');
    await page.fill('#job-location', 'Remote');

    // Submit the form
    await page.click('#submit-job');

    // Verify the success message
    await expect(page.locator('#success-message')).toHaveText('Job posted successfully!');
  });
});