import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('https://demo.playwright.dev/todomvc');
});

const TODO_ITEMS = [
	'buy some cheese',
	'feed the cat',
	'book a doctors appointment',
];

test.describe('New Todo', () => {
	test('should allow me to add todo items', async ({ page }) => {
		/* this description style usually used with 'it' */

		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		// Create 1st todo.
		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		// Make sure the list only has one todo item.
		await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);

		/*
		The suggested locator will depend on the following factors:

    Accessibility Priority:
        Playwright typically prefers accessible attributes like label text, as these provide clear context for testing (they reflect what a user would see and interact with on the screen).
        If 'but some cheese' is the accessible label (e.g., set with an <label for="id">), then getByLabelText('but some cheese') would likely be suggested.

    data-testid Attribute:
        If the label is not accessible (for instance, it’s not linked to the element via standard HTML for attributes), then getByTestId('todo-title') may be suggested instead. The data-testid attribute is often used as a reliable selector for testing purposes, especially when accessibility attributes aren’t available.

		So, if the label text is accessible, Playwright will likely suggest page.getByLabelText('but some cheese'). If not, it will fall back to page.getByTestId('todo-title'), as data-testid provides a stable and unique identifier for the element. */

		// Create 2nd todo.
		await newTodo.fill(TODO_ITEMS[1]);
		await newTodo.press('Enter');

		// Make sure the list now has two todo items.
		await expect(page.getByTestId('todo-title')).toHaveText([
			TODO_ITEMS[0],
			TODO_ITEMS[1],
		]); // NB

		await checkNumberOfTodosInLocalStorage(page, 2);
	});

	test('should clear text input field when an item is added', async ({
		page,
	}) => {
		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		// Create one todo item.
		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		// Check that input is empty.
		await expect(newTodo).toBeEmpty();
		await checkNumberOfTodosInLocalStorage(page, 1);
	});

	test('should append new items to the bottom of the list', async ({
		page,
	}) => {
		// Create 3 items.
		await createDefaultTodos(page);

		// create a todo count locator
		const todoCount = page.getByTestId('todo-count');

		// Check test using different methods.
		await expect(page.getByText('3 items left')).toBeVisible();
		await expect(todoCount).toHaveText('3 items left');
		await expect(todoCount).toContainText('3');
		await expect(todoCount).toHaveText(/3/);

		// Check all items in one call.
		await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
		/* we will have 3 elements each todo has data-testid="todo-count" */

		await checkNumberOfTodosInLocalStorage(page, 3);
	});
});

test.describe('Mark all as completed', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test.afterEach(async ({ page }) => {
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should allow me to mark all items as completed', async ({ page }) => {
		// Complete all todos.
		await page.getByLabel('Mark all as complete').check();

		// Ensure all todos have 'completed' class.
		await expect(page.getByTestId('todo-item')).toHaveClass([
			'completed',
			'completed',
			'completed',
		]);
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);
	});

	test('should allow me to clear the complete state of all items', async ({
		page,
	}) => {
		const toggleAll = page.getByLabel('Mark all as complete'); // $toggleAllBtn
		// Check and then immediately uncheck.
		await toggleAll.check();
		await toggleAll.uncheck();

		// Should be no completed classes.
		await expect(page.getByTestId('todo-item')).toHaveClass(['', '', '']);
		// better solution ?
	});

	test('complete all checkbox should update state when items are completed / cleared', async ({
		page,
	}) => {
		const toggleAll = page.getByLabel('Mark all as complete');
		await toggleAll.check();
		await expect(toggleAll).toBeChecked();
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);

		// Uncheck first todo.
		const firstTodo = page.getByTestId('todo-item').nth(0);
		await firstTodo.getByRole('checkbox').uncheck(); // drill down to the checkbox and uncheck it

		// NB locators work in a scoped way, like document.querySelector, if we call locator method on existing locator, it will search onl the children

		// Reuse toggleAll locator and make sure its not checked.
		await expect(toggleAll).not.toBeChecked();

		await firstTodo.getByRole('checkbox').check();
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);

		// Assert the toggle all is checked again.
		await expect(toggleAll).toBeChecked();
	});
});

test.describe('Item', () => {
	test('should allow me to mark items as complete', async ({ page }) => {
		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		// Create two items.
		for (const item of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(item);
			await newTodo.press('Enter');
		}

		// Check first item.
		const firstTodo = page.getByTestId('todo-item').nth(0);
		await firstTodo.getByRole('checkbox').check();
		await expect(firstTodo).toHaveClass('completed');

		// Check second item.
		const secondTodo = page.getByTestId('todo-item').nth(1);
		await expect(secondTodo).not.toHaveClass('completed');
		await secondTodo.getByRole('checkbox').check();

		// Assert completed class.
		await expect(firstTodo).toHaveClass('completed');
		await expect(secondTodo).toHaveClass('completed');
	});

	test('should allow me to un-mark items as complete', async ({ page }) => {
		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		// Create two items.
		for (const item of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(item);
			await newTodo.press('Enter');
		}

		const firstTodo = page.getByTestId('todo-item').nth(0);
		const secondTodo = page.getByTestId('todo-item').nth(1);
		const firstTodoCheckbox = firstTodo.getByRole('checkbox');

		await firstTodoCheckbox.check();
		await expect(firstTodo).toHaveClass('completed');
		await expect(secondTodo).not.toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		await firstTodoCheckbox.uncheck();
		await expect(firstTodo).not.toHaveClass('completed');
		await expect(secondTodo).not.toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 0);
	});

	test('should allow me to edit an item', async ({ page }) => {
		await createDefaultTodos(page);

		const todoItems = page.getByTestId('todo-item');
		const secondTodo = todoItems.nth(1);
		await secondTodo.dblclick();

		// NB
		const textBox = secondTodo.getByRole('textbox', { name: 'Edit' });

		await expect(textBox).toHaveValue(TODO_ITEMS[1]);
		await textBox.fill('buy some sausages');
		await textBox.press('Enter');

		// Explicitly assert the new text value.
		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			'buy some sausages',
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, 'buy some sausages');
	});
});

test.describe('Editing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should hide other controls when editing', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item').nth(1);
		await todoItem.dblclick();
		await expect(todoItem.getByRole('checkbox')).not.toBeVisible();
		await expect(
			todoItem.locator('label', {
				hasText: TODO_ITEMS[1],
			})
		).not.toBeVisible();
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should save edits on blur', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.fill('buy some sausages');
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.dispatchEvent('blur'); // NB

		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			'buy some sausages',
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, 'buy some sausages');
	});

	test('should trim entered text', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.fill('    buy some sausages    ');
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.press('Enter');

		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			'buy some sausages',
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, 'buy some sausages');
	});

	test('should remove the item if an empty text string was entered', async ({
		page,
	}) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('');
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.press('Enter');

		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
	});

	test('should cancel edits on escape', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.fill('buy some sausages');
		await todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' })
			.press('Escape');
		await expect(todoItems).toHaveText(TODO_ITEMS);
	});
});

test.describe('Counter', () => {
	test('should display the current number of todo items', async ({ page }) => {
		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		// create a todo count locator
		const todoCount = page.getByTestId('todo-count');

		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		await expect(todoCount).toContainText('1');

		await newTodo.fill(TODO_ITEMS[1]);
		await newTodo.press('Enter');
		await expect(todoCount).toContainText('2');

		await checkNumberOfTodosInLocalStorage(page, 2);
	});
});

test.describe('Clear completed button', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
	});

	test('should display the correct text', async ({ page }) => {
		await page.locator('.todo-list li .toggle').first().check();
		await expect(
			page.getByRole('button', { name: 'Clear completed' })
		).toBeVisible();
	});

	test('should remove completed items when clicked', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).getByRole('checkbox').check();
		await page.getByRole('button', { name: 'Clear completed' }).click();
		await expect(todoItems).toHaveCount(2);
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
	});

	test('should be hidden when there are no items that are completed', async ({
		page,
	}) => {
		await page.locator('.todo-list li .toggle').first().check();
		await page.getByRole('button', { name: 'Clear completed' }).click();
		await expect(
			page.getByRole('button', { name: 'Clear completed' })
		).toBeHidden();
	});
});

test.describe('Persistence', () => {
	test('should persist its data', async ({ page }) => {
		// create a new todo locator
		const newTodo = page.getByPlaceholder('What needs to be done?');

		for (const item of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(item);
			await newTodo.press('Enter');
		}

		const todoItems = page.getByTestId('todo-item');
		const firstTodoCheck = todoItems.nth(0).getByRole('checkbox');
		await firstTodoCheck.check();
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);

		// Ensure there is 1 completed item.
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		// Now reload.
		await page.reload();
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);
	});
});

test.describe('Routing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		// make sure the app had a chance to save updated todos in storage
		// before navigating to a new view, otherwise the items can get lost :(
		// in some frameworks like Durandal
		await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
	});

	test('should allow me to display active items', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item');
		await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Active' }).click();
		await expect(todoItem).toHaveCount(2);
		await expect(todoItem).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
	});

	test('should respect the back button', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item');
		await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		/* good article about test.step usage https://timdeschryver.dev/blog/keep-your-playwright-tests-structured-with-steps#code-comments */
		await test.step('Showing all items', async () => {
			await page.getByRole('link', { name: 'All' }).click();
			await expect(todoItem).toHaveCount(3);
		});

		await test.step('Showing active items', async () => {
			await page.getByRole('link', { name: 'Active' }).click();
		});

		await test.step('Showing completed items', async () => {
			await page.getByRole('link', { name: 'Completed' }).click();
		});

		await expect(todoItem).toHaveCount(1);
		await page.goBack();
		await expect(todoItem).toHaveCount(2);
		await page.goBack();
		await expect(todoItem).toHaveCount(3);
	});

	test('should allow me to display completed items', async ({ page }) => {
		await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Completed' }).click();
		await expect(page.getByTestId('todo-item')).toHaveCount(1);
	});

	test('should allow me to display all items', async ({ page }) => {
		await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Active' }).click();
		await page.getByRole('link', { name: 'Completed' }).click();
		await page.getByRole('link', { name: 'All' }).click();
		await expect(page.getByTestId('todo-item')).toHaveCount(3);
	});

	test('should highlight the currently applied filter', async ({ page }) => {
		await expect(page.getByRole('link', { name: 'All' })).toHaveClass(
			'selected'
		);

		//create locators for active and completed links
		const activeLink = page.getByRole('link', { name: 'Active' });
		const completedLink = page.getByRole('link', { name: 'Completed' });
		await activeLink.click();

		// Page change - active items.
		await expect(activeLink).toHaveClass('selected');
		await completedLink.click();

		// Page change - completed items.
		await expect(completedLink).toHaveClass('selected');
	});
});

async function createDefaultTodos(page: Page) {
	// create a new todo locator
	const newTodo = page.getByPlaceholder('What needs to be done?');

	for (const item of TODO_ITEMS) {
		await newTodo.fill(item);
		await newTodo.press('Enter');
	}
}

/* In Playwright, the waitForFunction method has a default timeout of 30 seconds (30,000 milliseconds). This timeout represents the maximum amount of time that Playwright will wait for the function to return a truthy value. */
// goof article about waitForFunction usgae and handling asyncronisity:  https://medium.com/@mikestopcontinues/manage-delays-and-async-in-playwright-616663f62043
async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
	return await page.waitForFunction((e) => {
		return JSON.parse(localStorage['react-todos']).length === e;
	}, expected /* { timeout: 5000 } */);
}

async function checkNumberOfCompletedTodosInLocalStorage(
	page: Page,
	expected: number
) {
	return await page.waitForFunction((e) => {
		return (
			JSON.parse(localStorage['react-todos']).filter(
				(todo: any) => todo.completed
			).length === e
		);
	}, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
	return await page.waitForFunction((t) => {
		return JSON.parse(localStorage['react-todos'])
			.map((todo: any) => todo.title)
			.includes(t);
	}, title);
}
