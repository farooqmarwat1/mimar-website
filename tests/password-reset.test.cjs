const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// The real auth module, with Next and Firebase stubbed out, so isAdminRole is the production rule.
const lib = () =>
  load('src/lib/admin/password-reset.ts', {
    '@/lib/firebase/admin': { adminAuth: () => ({}), isFirebaseConfigured: true },
    '@/lib/mailer': { getMailer: () => null },
    'next/headers': { cookies: async () => ({ get() {} }) },
    'next/navigation': { redirect() {} },
  });

const LINK = 'https://mim-archi.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC123&apiKey=KEY';

function fakeAuth(users) {
  const calls = { links: [] };
  return {
    calls,
    getUserByEmail: async email => {
      const user = users[email];
      if (!user) throw Object.assign(new Error('There is no user record'), { code: 'auth/user-not-found' });
      return user;
    },
    generatePasswordResetLink: async email => {
      calls.links.push(email);
      return LINK;
    },
  };
}

function fakeMailer({ fail = false } = {}) {
  const sent = [];
  return {
    sent,
    name: 'smtp',
    defaultFrom: 'Mimar Studios Website <contact@contact.mim.archi>',
    send: async message => {
      if (fail) throw new Error('smtp down');
      sent.push(message);
    },
  };
}

const staff = role => ({ disabled: false, customClaims: { role } });
const fetchOk = () => {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return { ok: true };
  };
  fn.calls = calls;
  return fn;
};

test('a staff account gets the reset link from the studio mailbox', async () => {
  const { sendStaffPasswordReset } = lib();
  const auth = fakeAuth({ 'hr@mim.archi': staff('hr') });
  const mailer = fakeMailer();
  assert.equal(await sendStaffPasswordReset('hr@mim.archi', { auth, mailer }), 'sent');
  assert.equal(mailer.sent.length, 1);
  const mail = mailer.sent[0];
  assert.equal(mail.to, 'hr@mim.archi');
  assert.equal(mail.from, 'Mimar Studios Website <contact@contact.mim.archi>');
  assert.equal(mail.replyTo, 'info@mim.archi');
  assert.match(mail.subject, /Reset your Mimar staff portal password/);
  assert.ok(mail.text.includes(LINK));
  assert.ok(mail.html.includes('oobCode=ABC123'));
  assert.match(mail.text, /expires in about an hour/);
  assert.match(mail.text, /ignore this email/);
});

test('every staff role can reset: admin, editor and hr', async () => {
  const { sendStaffPasswordReset } = lib();
  for (const role of ['admin', 'editor', 'hr']) {
    const mailer = fakeMailer();
    const result = await sendStaffPasswordReset('a@mim.archi', { auth: fakeAuth({ 'a@mim.archi': staff(role) }), mailer });
    assert.equal(result, 'sent', role);
  }
});

test('nothing is sent for an unknown address, a non-staff account (e.g. the CRM portal) or a disabled account', async () => {
  const { sendStaffPasswordReset } = lib();
  const users = {
    'crm@client.example': { disabled: false, customClaims: undefined },
    'noclaim@mim.archi': { disabled: false, customClaims: {} },
    'weird@mim.archi': { disabled: false, customClaims: { role: 'superuser' } },
    'gone@mim.archi': { disabled: true, customClaims: { role: 'admin' } },
  };
  for (const email of ['nobody@mim.archi', ...Object.keys(users)]) {
    const auth = fakeAuth(users);
    const mailer = fakeMailer();
    const fetchImpl = fetchOk();
    assert.equal(await sendStaffPasswordReset(email, { auth, mailer, fetchImpl, webApiKey: 'KEY' }), 'skipped', email);
    assert.equal(mailer.sent.length, 0, `${email}: no email`);
    assert.equal(auth.calls.links.length, 0, `${email}: no reset link was even generated`);
    assert.equal(fetchImpl.calls.length, 0, `${email}: Firebase's own email is not used either`);
  }
});

test('if the studio mailer fails, Firebase\'s own reset email is the fallback', async () => {
  const { sendStaffPasswordReset } = lib();
  const fetchImpl = fetchOk();
  const result = await sendStaffPasswordReset('hr@mim.archi', {
    auth: fakeAuth({ 'hr@mim.archi': staff('hr') }),
    mailer: fakeMailer({ fail: true }),
    fetchImpl,
    webApiKey: 'WEBKEY',
  });
  assert.equal(result, 'sent');
  assert.equal(fetchImpl.calls.length, 1);
  assert.match(fetchImpl.calls[0].url, /accounts:sendOobCode\?key=WEBKEY$/);
  assert.equal(fetchImpl.calls[0].body.requestType, 'PASSWORD_RESET');
  assert.equal(fetchImpl.calls[0].body.email, 'hr@mim.archi');
});

test('with no studio mailer configured, Firebase\'s email is used', async () => {
  const { sendStaffPasswordReset } = lib();
  const fetchImpl = fetchOk();
  const result = await sendStaffPasswordReset('hr@mim.archi', { auth: fakeAuth({ 'hr@mim.archi': staff('hr') }), mailer: null, fetchImpl, webApiKey: 'WEBKEY' });
  assert.equal(result, 'sent');
  assert.equal(fetchImpl.calls.length, 1);
});

test('when nothing can send, it gives up quietly instead of throwing', async () => {
  const { sendStaffPasswordReset } = lib();
  const auth = fakeAuth({ 'hr@mim.archi': staff('hr') });
  assert.equal(await sendStaffPasswordReset('hr@mim.archi', { auth, mailer: null, fetchImpl: fetchOk(), webApiKey: undefined }), 'skipped', 'no mailer and no web key');
  const failing = async () => { throw new Error('network'); };
  assert.equal(await sendStaffPasswordReset('hr@mim.archi', { auth, mailer: fakeMailer({ fail: true }), fetchImpl: failing, webApiKey: 'KEY' }), 'skipped', 'mailer and Firebase both down');
  const broken = { getUserByEmail: async () => { throw new Error('boom'); }, generatePasswordResetLink: async () => LINK };
  assert.equal(await sendStaffPasswordReset('hr@mim.archi', { auth: broken, mailer: fakeMailer() }), 'skipped');
  const noLink = { ...fakeAuth({ 'hr@mim.archi': staff('hr') }), generatePasswordResetLink: async () => { throw new Error('quota'); } };
  assert.equal(await sendStaffPasswordReset('hr@mim.archi', { auth: noLink, mailer: fakeMailer(), fetchImpl: fetchOk(), webApiKey: 'KEY' }), 'sent', 'a link failure still falls back to Firebase');
});

test('the email escapes the link in its HTML', () => {
  const { buildPasswordResetEmail } = lib();
  const mail = buildPasswordResetEmail('https://x.example/?a=1&b="2"><script>');
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(mail.html.includes('&amp;b=&quot;2&quot;&gt;&lt;script&gt;'));
});

// ---- The action ----

function actions({ configured = true, allowed = true } = {}) {
  const resets = [];
  const afterTasks = [];
  const mod = load('src/app/(site)/admin/actions.ts', {
    '@/lib/admin/auth': { authConfigured: () => configured, endSession: async () => {}, startSession: async () => true, verifyPassword: async () => null },
    '@/lib/admin/password-reset': { sendStaffPasswordReset: async email => { resets.push(email); return 'sent'; } },
    '@/lib/rate-limit': { checkRateLimit: async () => (allowed ? { allowed: true } : { allowed: false, retryAfterSec: 600 }) },
    'next/headers': { headers: async () => ({ get: name => (name === 'x-forwarded-for' ? '203.0.113.9' : null) }) },
    'next/navigation': { redirect() {} },
    'next/server': { after: fn => afterTasks.push(fn()) },
  });
  const form = email => ({ get: name => (name === 'email' ? email : null) });
  return { resets, afterTasks, run: email => mod.forgotPasswordAction({}, form(email)) };
}

test('forgot password answers identically for any well-formed address and sends after responding', async () => {
  const { resets, afterTasks, run } = actions();
  const known = await run('Hr@Mim.Archi');
  const unknown = await run('nobody@elsewhere.example');
  assert.equal(known.sent, true);
  assert.equal(unknown.sent, true);
  assert.equal(known.error, undefined);
  assert.equal(JSON.stringify(Object.keys(known)), JSON.stringify(Object.keys(unknown)), 'the two answers have the same shape');
  await Promise.all(afterTasks);
  assert.equal(resets.join(), 'hr@mim.archi,nobody@elsewhere.example', 'addresses are lowercased and the lookup runs after the answer');
});

test('forgot password rejects malformed input, respects the rate limit and a missing configuration', async () => {
  for (const bad of ['', 'not-an-email', null, 'a@b', 'x'.repeat(250) + '@mim.archi']) {
    const { resets, run } = actions();
    const result = await run(bad);
    assert.equal(result.sent, undefined, String(bad).slice(0, 20));
    assert.match(result.error, /valid email/);
    assert.equal(resets.length, 0);
  }
  const limited = actions({ allowed: false });
  const result = await limited.run('hr@mim.archi');
  assert.match(result.error, /Too many requests/);
  assert.equal(limited.resets.length, 0);

  const off = actions({ configured: false });
  assert.match((await off.run('hr@mim.archi')).error, /not configured/);
  assert.equal(off.resets.length, 0);
});
