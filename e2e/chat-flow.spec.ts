import { test, expect } from '@playwright/test';

test.describe('Chat Interface End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/chat');
  });

  test('complete chat flow: create chat, send messages, and manage chats', async ({ page }) => {
    // Wait for the chat interface to load
    await expect(page.getByText('Chats')).toBeVisible();
    await expect(page.getByText('Select a chat')).toBeVisible();

    // Should show empty state initially
    await expect(page.getByText('No chats yet')).toBeVisible();
    await expect(page.getByText('Create your first chat')).toBeVisible();

    // Create a new chat using the "Create your first chat" button
    await page.getByText('Create your first chat').click();

    // Fill in the new chat modal
    await expect(page.getByText('Create New Chat')).toBeVisible();
    await page.getByPlaceholder('Enter chat title...').fill('Test Chat E2E');
    await page.getByText('Create Chat').click();

    // Verify chat was created and is now selected
    await expect(page.getByText('Test Chat E2E')).toBeVisible();
    await expect(page.getByText('Production demo - backend integration in progress')).toBeVisible();

    // Send a message
    const messageInput = page.getByPlaceholder('Type your message...');
    await messageInput.fill('Hello from E2E test!');
    await page.getByText('Send').click();

    // Verify message appears in chat
    await expect(page.getByText('Hello from E2E test!')).toBeVisible();

    // Wait for AI response
    await expect(page.getByText('I received: "Hello from E2E test!". This is a production demo response.')).toBeVisible();

    // Verify message appears in sidebar
    await expect(page.getByText('Hello from E2E test!')).toBeVisible();

    // Create another chat using the + button
    await page.getByTitle('New Chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Second Chat E2E');
    await page.getByText('Create Chat').click();

    // Verify second chat is created and selected
    await expect(page.getByText('Second Chat E2E')).toBeVisible();
    await expect(page.getByText('Start the conversation by typing a message below!')).toBeVisible();

    // Send message in second chat
    await messageInput.fill('Second chat message');
    await page.getByText('Send').click();
    await expect(page.getByText('Second chat message')).toBeVisible();

    // Switch back to first chat
    await page.getByText('Test Chat E2E').click();

    // Verify first chat messages are still there
    await expect(page.getByText('Hello from E2E test!')).toBeVisible();
    await expect(page.getByText('I received: "Hello from E2E test!". This is a production demo response.')).toBeVisible();

    // Test chat deletion
    await page.getByText('Second Chat E2E').hover();
    await page.getByTitle('Delete chat').click();
    
    // Confirm deletion
    page.once('dialog', dialog => dialog.accept());
    
    // Verify chat is deleted
    await expect(page.getByText('Second Chat E2E')).not.toBeVisible();
    await expect(page.getByText('Test Chat E2E')).toBeVisible();
  });

  test('search functionality works correctly', async ({ page }) => {
    // Create multiple chats first
    await page.getByText('Create your first chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('JavaScript Help');
    await page.getByText('Create Chat').click();

    await page.getByTitle('New Chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Python Tutorial');
    await page.getByText('Create Chat').click();

    await page.getByTitle('New Chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('React Components');
    await page.getByText('Create Chat').click();

    // Test search functionality
    const searchInput = page.getByPlaceholder('Search chats...');
    await searchInput.fill('Java');

    // Should only show JavaScript Help chat
    await expect(page.getByText('JavaScript Help')).toBeVisible();
    await expect(page.getByText('Python Tutorial')).not.toBeVisible();
    await expect(page.getByText('React Components')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    
    // All chats should be visible again
    await expect(page.getByText('JavaScript Help')).toBeVisible();
    await expect(page.getByText('Python Tutorial')).toBeVisible();
    await expect(page.getByText('React Components')).toBeVisible();
  });

  test('responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Create a chat
    await page.getByText('Create your first chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Mobile Test');
    await page.getByText('Create Chat').click();

    // Verify layout is responsive
    const sidebar = page.locator('.w-80');
    await expect(sidebar).toBeVisible();

    const chatInterface = page.locator('.flex-1');
    await expect(chatInterface).toBeVisible();

    // Send a message on mobile
    await page.getByPlaceholder('Type your message...').fill('Mobile message');
    await page.getByText('Send').click();

    await expect(page.getByText('Mobile message')).toBeVisible();
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    // Create a chat
    await page.getByText('Create your first chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Keyboard Test');
    
    // Test Enter key in modal
    await page.getByPlaceholder('Enter chat title...').press('Enter');

    // Verify chat was created
    await expect(page.getByText('Keyboard Test')).toBeVisible();

    // Test Enter key in message input
    const messageInput = page.getByPlaceholder('Type your message...');
    await messageInput.fill('Keyboard message');
    await messageInput.press('Enter');

    await expect(page.getByText('Keyboard message')).toBeVisible();
  });

  test('error handling displays correctly', async ({ page }) => {
    // Create a chat
    await page.getByText('Create your first chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Error Test');
    await page.getByText('Create Chat').click();

    // Send a message
    await page.getByPlaceholder('Type your message...').fill('Test message');
    await page.getByText('Send').click();

    // Message should appear
    await expect(page.getByText('Test message')).toBeVisible();

    // Loading indicator should appear then disappear
    await expect(page.locator('.animate-bounce')).toBeVisible();
    await expect(page.locator('.animate-bounce')).not.toBeVisible({ timeout: 10000 });
  });

  test('modal interactions work correctly', async ({ page }) => {
    // Test opening and closing modal with + button
    await page.getByTitle('New Chat').click();
    await expect(page.getByText('Create New Chat')).toBeVisible();

    // Test canceling modal
    await page.getByText('Cancel').click();
    await expect(page.getByText('Create New Chat')).not.toBeVisible();

    // Test closing modal with escape key
    await page.getByTitle('New Chat').click();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Create New Chat')).not.toBeVisible();
  });

  test('chat persistence across page refreshes', async ({ page }) => {
    // Create a chat and send a message
    await page.getByText('Create your first chat').click();
    await page.getByPlaceholder('Enter chat title...').fill('Persistence Test');
    await page.getByText('Create Chat').click();

    await page.getByPlaceholder('Type your message...').fill('Persistent message');
    await page.getByText('Send').click();

    await expect(page.getByText('Persistent message')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Note: In the current demo implementation, chats don't persist across refreshes
    // This test documents the current behavior and can be updated when real persistence is added
    await expect(page.getByText('No chats yet')).toBeVisible();
  });
});