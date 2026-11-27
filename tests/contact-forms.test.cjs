// The enquiry endpoint behind the contact page form and the "Get a quote" pop-up
// (src/app/api/contact/route.ts). The database, mailer, rate limiter and bot check are faked.
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

function endpoint({ human = { ok: true } } = {}) {
  const leads = [];
  const sent = [];
  const route = load('src/app/api/contact/route.ts', {
    'next/server': { NextResponse: { json: (body, init = {}) => ({ status: init.status ?? 200, body }) } },
    '@/lib/firebase/admin': { isFirebaseConfigured: true },
    '@/lib/leads': { createLead: async lead => { leads.push(lead); return 'lead1'; }, setMailStatus: async () => {} },
    '@/lib/visits': { describeRequest: () => ({}), findVisitForRequest: async () => null },
    '@/lib/mailer': { getMailer: () => ({ name: 'smtp', defaultFrom: 'site@mim.archi', send: async m => void sent.push(m) }) },
    '@/lib/rate-limit': { checkRateLimit: async () => ({ allowed: true }) },
    '@/lib/recaptcha': { checkHuman: async () => human },
  });
  const post = body => route.POST({ headers: { get: () => null }, json: async () => body });
  return { leads, sent, post };
}

const quote = {
  formType: 'quote',
  name: 'Sara Al Harbi',
  email: 'sara@example.com',
  organisation: 'Harbi Developments',
  services: ['3D Visualization', 'Cinematics', 'Not a real service'],
  message: 'Twelve villas in Riyadh.',
  consent: true,
  lang: 'en',
};

const contactForm = { firstName: 'Noor', lastName: 'Khan', email: 'noor@example.com', service: 'Branding', message: 'Hello', consent: true };

test('a quote request is saved with its services and company, and emailed as a quote request', async () => {
  const { leads, sent, post } = endpoint();
  assert.equal((await post(quote)).status, 200);
  const [lead] = leads;
  assert.equal(lead.formType, 'quote');
  assert.equal(lead.firstName, 'Sara');
  assert.equal(lead.lastName, 'Al Harbi');
  assert.equal(lead.organisation, 'Harbi Developments');
  assert.deepEqual([...lead.services], ['3D Visualization', 'Cinematics']);
  assert.equal(lead.service, '3D Visualization, Cinematics');
  assert.equal(lead.consent, true);
  assert.match(sent[0].subject, /^New website quote request from Sara Al Harbi - 3D Visualization, Cinematics/);
  assert.ok(sent[0].text.includes('Company: Harbi Developments'));
  assert.equal(sent[1].to, 'sara@example.com');
});

test('a quote request may give a single name; the contact page form still needs both', async () => {
  const one = endpoint();
  assert.equal((await one.post({ ...quote, name: 'Sara' })).status, 200);
  assert.equal(one.leads[0].lastName, '');
  const two = endpoint();
  assert.equal((await two.post({ ...contactForm, lastName: '' })).status, 422);
  assert.equal(two.leads.length, 0);
});

test('the contact page form keeps its single service and enquiry subject', async () => {
  const { leads, sent, post } = endpoint();
  assert.equal((await post(contactForm)).status, 200);
  assert.equal(leads[0].formType, 'contact');
  assert.equal(leads[0].service, 'Branding');
  assert.equal(leads[0].services, undefined);
  assert.match(sent[0].subject, /^New website enquiry from Noor Khan - Branding/);
});

test('nothing is saved or sent without consent or when the bot check fails', async () => {
  const unticked = endpoint();
  const noConsent = { ...quote, consent: undefined };
  assert.equal((await unticked.post(noConsent)).status, 422);
  const bot = endpoint({ human: { ok: false, status: 403, error: 'no' } });
  assert.equal((await bot.post(quote)).status, 403);
  for (const run of [unticked, bot]) {
    assert.equal(run.leads.length, 0);
    assert.equal(run.sent.length, 0);
  }
});
