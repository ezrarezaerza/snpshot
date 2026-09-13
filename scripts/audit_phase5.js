// scripts/audit_phase5.js
import http from 'http';

const BASE_URL = 'http://127.0.0.1:3000';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runAudit() {
  console.log('==================================================');
  console.log('   SNPSHOT STUDIO // PHASE 5 SYSTEM AUDIT SUITE    ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
      failed++;
    }
  };

  // Test 1: Postgres Database Status
  await test('Postgres DB Connectivity (/api/db/status)', async () => {
    const res = await request('GET', '/api/db/status');
    if (res.status !== 200 || !res.body.connected) {
      throw new Error(`Expected status 200 and connected=true, got status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.tables) || res.body.tables.length < 4) {
      throw new Error(`Expected at least 4 tables verified, got: ${JSON.stringify(res.body.tables)}`);
    }
    console.log(`   -> Connected to DB "${res.body.database}", verified tables: ${res.body.tables.join(', ')}`);
  });

  // Test 2: Vercel Blob Cloud Storage Status
  await test('Vercel Blob Storage Status (/api/blob/status)', async () => {
    const res = await request('GET', '/api/blob/status');
    if (res.status !== 200 || !res.body.provider) {
      throw new Error(`Expected status 200 with provider info, got ${res.status}`);
    }
    console.log(`   -> Provider: ${res.body.provider}, Blob Configured: ${res.body.isBlobConfigured}, Mode: ${res.body.storageMode}`);
  });

  // Test 3: Admin Authentication - Successful Login
  let authToken = '';
  await test('Admin Authentication - Valid Credentials (/api/admin/auth/login)', async () => {
    const res = await request('POST', '/api/admin/auth/login', {
      email: 'admin@snpshot.studio',
      password: 'admin123'
    });
    if (res.status !== 200 || !res.body.success || !res.body.token) {
      throw new Error(`Expected status 200 and valid token, got ${res.status}: ${JSON.stringify(res.body)}`);
    }
    authToken = res.body.token;
    console.log(`   -> Received valid token for user: ${res.body.user.email} (${res.body.user.role})`);
  });

  // Test 4: Admin Authentication - Failed Login
  await test('Admin Authentication - Invalid Password Rejected (/api/admin/auth/login)', async () => {
    const res = await request('POST', '/api/admin/auth/login', {
      email: 'admin@snpshot.studio',
      password: 'wrongpassword'
    });
    if (res.status !== 401 || res.body.success) {
      throw new Error(`Expected status 401 with failure, got ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  // Test 5: Admin Token Verification
  await test('Admin Session Verification (/api/admin/auth/verify)', async () => {
    const res = await request('GET', '/api/admin/auth/verify', null, {
      Authorization: `Bearer ${authToken}`
    });
    if (res.status !== 200 || !res.body.success || res.body.user.email !== 'admin@snpshot.studio') {
      throw new Error(`Expected status 200 with verified user, got ${res.status}`);
    }
  });

  // Test 6: Studio Aggregated OS Data
  await test('Studio Aggregated Data (/api/studio/data)', async () => {
    const res = await request('GET', '/api/studio/data');
    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const data = res.body;
    if (!data.frames || !data.artists || !data.stickers || !data.galleryItems) {
      throw new Error('Missing core studio collections in response');
    }
    console.log(`   -> Frames: ${data.frames.length}, Artists: ${data.artists.length}, Stickers: ${data.stickers.length}, Gallery: ${data.galleryItems.length}`);
  });

  // Test 7: Individual OS Module Endpoints
  await test('Studio Frames Endpoint (/api/frames)', async () => {
    const res = await request('GET', '/api/frames');
    const frames = res.body.frames || res.body;
    if (res.status !== 200 || !Array.isArray(frames) || frames.length === 0) {
      throw new Error(`Expected array of frames, got status ${res.status}`);
    }
    console.log(`   -> Retrieved ${frames.length} studio frames`);
  });

  await test('Studio Artists Endpoint (/api/artists)', async () => {
    const res = await request('GET', '/api/artists');
    const artists = res.body.artists || res.body;
    if (res.status !== 200 || !Array.isArray(artists) || artists.length === 0) {
      throw new Error(`Expected array of artists, got status ${res.status}`);
    }
    console.log(`   -> Retrieved ${artists.length} artist campaigns`);
  });

  await test('Community Gallery Endpoint (/api/gallery)', async () => {
    const res = await request('GET', '/api/gallery');
    const items = res.body.galleryItems || res.body;
    if (res.status !== 200 || !Array.isArray(items) || items.length === 0) {
      throw new Error(`Expected array of gallery items, got status ${res.status}`);
    }
    console.log(`   -> Retrieved ${items.length} community gallery entries`);
  });

  await test('Inquiries Endpoint (/api/inquiries)', async () => {
    const res = await request('GET', '/api/inquiries');
    const inquiries = res.body.inquiries || res.body;
    if (res.status !== 200 || !Array.isArray(inquiries)) {
      throw new Error(`Expected array of inquiries, got status ${res.status}`);
    }
    console.log(`   -> Retrieved ${inquiries.length} studio inquiries`);
  });

  // Test 8: Saved Emails endpoint
  await test('Saved Emails Endpoint (/api/saved-emails)', async () => {
    const res = await request('GET', '/api/saved-emails');
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error(`Expected array of saved emails, got status ${res.status}`);
    }
  });

  // Test 9: Vercel Serverless Function Simulation
  await test('Vercel Serverless Function Handler (api/index.js)', async () => {
    const { default: serverlessHandler } = await import('../api/index.js');
    if (typeof serverlessHandler !== 'function') {
      throw new Error('Serverless handler is not an exportable function');
    }

    // Mock request and response to verify serverless invocation
    let resData = '';
    let resCode = 200;
    const mockReq = {
      method: 'GET',
      url: '/db/status',
      headers: { host: 'localhost' }
    };
    const mockRes = {
      statusCode: 200,
      headersSent: false,
      setHeader: () => {},
      getHeader: () => null,
      status: (code) => { resCode = code; return mockRes; },
      json: (data) => { resData = JSON.stringify(data); return mockRes; },
      send: (data) => { resData = data; return mockRes; },
      end: () => {}
    };

    await serverlessHandler(mockReq, mockRes);
    console.log(`   -> Simulated Vercel handler execution returned status: ${resCode}`);
  });

  console.log('\n==================================================');
  console.log(`AUDIT FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
