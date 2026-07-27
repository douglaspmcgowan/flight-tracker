import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('combined cash application loads without the marketing sections', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Flight Finder' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Awards' })).toBeVisible();
  await expect(page.getByText('Why track flight prices?')).toHaveCount(0);
  await expect(page.locator('main')).toBeVisible();
  expect(errors).toEqual([]);
});

test('award workspace switches between Simple and Analyst modes', async ({ page }) => {
  const searchesResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/awards/searches'),
  );
  await page.goto('/awards');
  expect((await searchesResponse).status()).toBe(200);

  const mode = page.getByRole('group', { name: 'Award view mode' });
  await expect(mode.getByRole('button', { name: 'Simple' })).toBeVisible({ timeout: 20_000 });
  await mode.getByRole('button', { name: 'Analyst' }).click();
  await expect(mode.getByRole('button', { name: 'Analyst' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByText('New award search', { exact: true }).click();
  await expect(page.getByPlaceholder('ORF')).toBeVisible();
  await expect(page.getByPlaceholder('OAK')).toBeVisible();
});

test('cash and award surfaces have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/awards']) {
    await page.goto(path);
    if (path === '/awards') {
      await expect(page.getByRole('group', { name: 'Award view mode' })).toBeVisible({
        timeout: 20_000,
      });
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.filter((violation) =>
        violation.impact === 'critical' || violation.impact === 'serious'),
    ).toEqual([]);
  }
});

test('Berkeley search carries airport expansion, bags, benefit, dates, and stop limit into tracking', async ({ page }) => {
  let previewBody: Record<string, unknown> | null = null;
  let createBody: Record<string, unknown> | null = null;

  await page.route('**/api/admin/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          defaultSearchMethod: 'ai',
          defaultCurrency: 'USD',
          maxTrackedPerRoute: 10,
        },
      }),
    });
  });

  await page.route('**/api/airports?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: [{
          code: 'ORF',
          city: 'Norfolk',
          name: 'Norfolk International Airport',
          country: 'US',
        }],
      }),
    });
  });

  await page.route('**/api/preview', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    previewBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { previewRunId: 'e2e-berkeley' } }),
    });
  });

  await page.route('**/api/preview/e2e-berkeley', async (route) => {
    const flight = {
      travelDate: '2026-08-14',
      price: 459,
      currency: 'USD',
      airline: 'Delta Air Lines',
      bookingUrl: 'https://www.delta.com',
      stops: 1,
      duration: '9 hr',
      departureTime: '7:00 AM',
      arrivalTime: '1:00 PM',
      seatsLeft: null,
      flightNumber: 'DL 100',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          id: 'e2e-berkeley',
          status: 'completed',
          error: null,
          expiresAt: '2026-07-27T00:00:00Z',
          result: {
            routes: [
              {
                origin: 'ORF',
                originName: 'Norfolk (Norfolk International Airport)',
                destination: 'OAK',
                destinationName: 'Oakland International Airport',
                flights: [flight],
              },
              {
                origin: 'ORF',
                originName: 'Norfolk (Norfolk International Airport)',
                destination: 'SFO',
                destinationName: 'San Francisco International Airport',
                flights: [{ ...flight, price: 479, flightNumber: 'DL 200' }],
              },
            ],
          },
        },
      }),
    });
  });

  await page.route('**/api/queries', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    createBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          queries: [
            {
              id: 'oak-tracker',
              origin: 'ORF',
              originName: 'Norfolk',
              destination: 'OAK',
              destinationName: 'Oakland',
              deleteToken: 'oak-token',
              label: null,
            },
            {
              id: 'sfo-tracker',
              origin: 'ORF',
              originName: 'Norfolk',
              destination: 'SFO',
              destinationName: 'San Francisco',
              deleteToken: 'sfo-token',
              label: null,
            },
          ],
        },
      }),
    });
  });

  const configResponse = page.waitForResponse((response) => response.url().includes('/api/admin/config'));
  await page.goto('/');
  await configResponse;
  const manualButton = page.getByRole('button', { name: 'Enter flight details manually' });
  if (await manualButton.count()) await manualButton.click();

  const origin = page.getByRole('combobox', { name: 'Origin' });
  await origin.fill('ORF');
  await page.getByRole('option', { name: /ORF/ }).click();
  await page.getByRole('button', { name: /Berkeley area/ }).click();
  await page.getByLabel('Departure').fill('2026-08-14');
  await page.getByLabel('Return').fill('2026-08-17');
  await page.getByLabel('Travelers').fill('2');
  await page.getByLabel('Collective checked bags').fill('4');
  await page.getByLabel('Baggage benefit').selectOption('delta_platinum_amex');
  await page.getByRole('button', { name: 'Advanced options' }).click();
  await page.getByLabel('Max stops').selectOption('2');

  await page.getByRole('button', { name: 'Show available flights' }).click();
  await expect(page.getByText('OAK', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('SFO', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('2 travelers')).toBeVisible();
  await expect(page.getByText('4 checked bags')).toBeVisible();
  await page.getByRole('button', { name: 'Show available flights' }).click();

  await expect(page.getByRole('button', { name: 'Track 2 flights' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Track 2 flights' }).click();
  await expect(page.getByText('2 trackers created')).toBeVisible();

  expect(previewBody).toMatchObject({
    origins: [{ code: 'ORF' }],
    destinations: [{ code: 'OAK' }, { code: 'SFO' }],
    dateFrom: '2026-08-14',
    dateTo: '2026-08-17',
    maxStops: 2,
    travelerCount: 2,
    checkedBagCount: 4,
    baggageBenefit: 'delta_platinum_amex',
  });
  expect(createBody).toMatchObject({
    dateFrom: '2026-08-14',
    dateTo: '2026-08-17',
    maxStops: 2,
    travelerCount: 2,
    checkedBagCount: 4,
    baggageBenefit: 'delta_platinum_amex',
    routes: [
      { origin: 'ORF', destination: 'OAK' },
      { origin: 'ORF', destination: 'SFO' },
    ],
  });
});

test('persisted Berkeley trackers render, rank, update together, and expose booking actions', async ({ page, request }) => {
  const createResponse = await request.post('/api/queries', {
    data: {
      rawInput: 'ORF to Berkeley August 14-17 2026, two travelers, four bags',
      dateFrom: '2026-08-14',
      dateTo: '2026-08-17',
      flexibility: 0,
      maxStops: 2,
      preferredAirlines: [],
      timePreference: 'any',
      currency: 'USD',
      cabinClass: 'economy',
      tripType: 'round_trip',
      travelerCount: 2,
      checkedBagCount: 4,
      baggageBenefit: 'delta_platinum_amex',
      routes: [
        {
          origin: 'ORF',
          originName: 'Norfolk International Airport',
          destination: 'OAK',
          destinationName: 'Oakland International Airport',
          date: '2026-08-14',
          returnDate: '2026-08-17',
          selectedFlights: [
            {
              travelDate: '2026-08-14',
              price: 459,
              currency: 'USD',
              airline: 'Delta Air Lines',
              bookingUrl: 'https://www.delta.com',
              stops: 1,
              duration: '9 hr',
              departureTime: '7:00 AM',
              arrivalTime: '1:00 PM',
              seatsLeft: 3,
              flightNumber: 'DL 100',
            },
            {
              travelDate: '2026-08-14',
              price: 400,
              currency: 'USD',
              airline: 'JetBlue',
              bookingUrl: 'https://www.jetblue.com',
              stops: 1,
              duration: '9 hr 30m',
              departureTime: '6:30 AM',
              arrivalTime: '1:30 PM',
              seatsLeft: 4,
              flightNumber: 'B6 600',
            },
          ],
        },
        {
          origin: 'ORF',
          originName: 'Norfolk International Airport',
          destination: 'SFO',
          destinationName: 'San Francisco International Airport',
          date: '2026-08-14',
          returnDate: '2026-08-17',
          selectedFlights: [{
            travelDate: '2026-08-14',
            price: 479,
            currency: 'USD',
            airline: 'Delta Air Lines',
            bookingUrl: 'https://www.delta.com',
            stops: 2,
            duration: '10 hr',
            departureTime: '8:00 AM',
            arrivalTime: '3:00 PM',
            seatsLeft: 4,
            flightNumber: 'DL 200',
          }],
        },
      ],
    },
  });

  const createText = await createResponse.text();
  if (createResponse.status() !== 201) {
    throw new Error(`Tracker creation failed (${createResponse.status()}): ${createText}`);
  }
  const createJson = JSON.parse(createText) as {
    data: { queries: Array<{ id: string; deleteToken: string }> };
  };
  const [oak, sfo] = createJson.data.queries;
  expect(oak).toBeDefined();
  expect(sfo).toBeDefined();

  try {
    await page.goto(`/q/${oak!.id}`);
    await expect(page.getByText(/DL 100.*7:00 AM/).first()).toBeVisible();
    await expect(page.getByText(/USD.*1,028/)).toBeVisible();
    await expect(page.getByText('Best price found')).toHaveCount(0);
    const oakRows = page
      .getByRole('heading', { name: 'Total trip cost' })
      .first()
      .locator('xpath=ancestor::section')
      .locator('tbody tr');
    const oakRowText = await oakRows.allTextContents();
    expect(oakRowText.findIndex((text) => text.includes('DL 100')))
      .toBeLessThan(oakRowText.findIndex((text) => text.includes('B6 600')));
    await expect(page.getByRole('link', { name: 'Book this flight' }).first()).toHaveAttribute(
      'href',
      'https://www.delta.com',
    );

    const patchResponse = await request.patch(`/api/queries/${oak!.id}`, {
      data: {
        deleteToken: oak!.deleteToken,
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'delta_platinum_medallion',
      },
    });
    expect(patchResponse.status()).toBe(200);
    expect((await patchResponse.json()).data.updated).toBe(2);

    await page.reload();
    await expect(page.getByText('Delta Platinum Medallion')).toHaveCount(2);
    await expect(page.getByText(/USD.*918/).first()).toBeVisible();
  } finally {
    await expect.poll(async () => {
      const statuses = await Promise.all([oak!, sfo!].map(async (query) => {
        const response = await request.get(`/api/queries/${query.id}/prices`);
        if (!response.ok()) return null;
        const body = await response.json() as { data: { lastStatus: string | null } };
        return body.data.lastStatus;
      }));
      return statuses.every((status) => status !== null && status !== 'in_progress');
    }, { timeout: 30_000 }).toBe(true);
    await request.delete(`/api/queries/${oak!.id}`, {
      data: { deleteToken: oak!.deleteToken, groupDelete: true },
    });
  }
});
