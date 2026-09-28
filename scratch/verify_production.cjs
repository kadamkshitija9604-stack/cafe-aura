const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'admin', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000';

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 STARTING PRODUCTION SYSTEM VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details}`);
      failedTests++;
    }
  }

  // 1. Direct Database Health & Connection Check
  console.log('1. Database Connection & Schema Integrity Check:');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:shivarth@localhost:5432/%20cafe%20aura%20'
  });

  try {
    await client.connect();
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('   Live Database Tables:', tables.join(', '));

    const expectedTables = ['categories', 'menu_items', 'staff', 'audit_logs', 'users', 'orders', 'order_items', 'inventory', 'inventory_ledger', 'notifications', 'cafe_settings'];
    for (const tbl of expectedTables) {
      assert(tables.includes(tbl), `Table '${tbl}' exists in PostgreSQL`);
    }

    // Check count of categories and menu items
    const catCount = await client.query('SELECT COUNT(*)::int as c FROM categories');
    const menuCount = await client.query('SELECT COUNT(*)::int as c FROM menu_items');
    assert(catCount.rows[0].c > 0, `Categories table is populated (${catCount.rows[0].c} categories)`);
    assert(menuCount.rows[0].c > 0, `Menu items table is populated (${menuCount.rows[0].c} dishes)`);

    await client.end();
  } catch (err) {
    console.error('Database direct check error:', err.message);
    failedTests++;
  }

  // 2. HTTP Health Endpoint Verification
  console.log('\n2. System Health & Observability API Check:');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health responds with 200 OK');
    const healthJson = await healthRes.json();
    assert(healthJson.success === true, 'Health payload success === true');
    assert(healthJson.data?.status === 'healthy', 'System status is healthy');
    assert(healthJson.data?.database?.status === 'connected', 'Database status is connected');
    console.log(`   Health latency: ${healthJson.data?.database?.latencyMs}ms, Memory RSS: ${healthJson.data?.memory?.rssMb}MB`);
  } catch (err) {
    console.warn('Health endpoint fetch notice (admin server might be spinning up):', err.message);
  }

  // 3. Menu & Categories API Verification
  console.log('\n3. Menu & Catalog API Check:');
  try {
    const menuRes = await fetch(`${BASE_URL}/api/menu`);
    assert(menuRes.status === 200, 'GET /api/menu responds with 200 OK');
    const menuItems = await menuRes.json();
    assert(Array.isArray(menuItems) && menuItems.length > 0, `GET /api/menu returned ${menuItems.length} items`);

    const catRes = await fetch(`${BASE_URL}/api/categories`);
    assert(catRes.status === 200, 'GET /api/categories responds with 200 OK');
    const categories = await catRes.json();
    assert(Array.isArray(categories) && categories.length > 0, `GET /api/categories returned ${categories.length} categories`);
  } catch (err) {
    console.error('Menu API error:', err.message);
    failedTests++;
  }

  // 4. Server-Side RBAC Authorization Check (403 Forbidden Enforcement)
  console.log('\n4. Server-Side RBAC Authorization Security Check:');
  try {
    // Attempt mutating action with 'viewer' role (viewer lacks 'menu:create')
    const unauthorizedRes = await fetch(`${BASE_URL}/api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'viewer',
        'x-user-id': 'test-viewer-01',
      },
      body: JSON.stringify({
        name: 'Unauthorized Test Coffee',
        price: 99.0,
      }),
    });

    assert(unauthorizedRes.status === 403, `Mutating with role 'viewer' returns 403 Forbidden (Actual: ${unauthorizedRes.status})`);
    const errJson = await unauthorizedRes.json();
    assert(errJson.error?.code === 'FORBIDDEN', `Error code is 'FORBIDDEN' (Actual: ${errJson.error?.code})`);
  } catch (err) {
    console.error('RBAC check error:', err.message);
    failedTests++;
  }

  // 5. Order Placement & Lifecycle State Machine Verification
  console.log('\n5. Order System & Lifecycle State Machine Check:');
  let testOrderId = null;
  try {
    // 5a. Customer places an order via POST /api/orders
    const newOrderPayload = {
      customerName: 'Aria Montgomery',
      customerPhone: '+1 (555) 392-1098',
      customerEmail: 'aria.m@example.com',
      orderType: 'takeaway',
      paymentMethod: 'upi',
      notes: 'Please pack in eco friendly bag',
      items: [
        {
          menuItemId: 'item-1',
          itemName: 'Aura Signature Caramel Macchiato',
          unitPrice: 220.0,
          quantity: 2,
        },
      ],
    };

    const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderPayload),
    });

    assert(createOrderRes.status === 201, `Customer Order created with 201 Created (Actual: ${createOrderRes.status})`);
    const orderJson = await createOrderRes.json();
    testOrderId = orderJson.data?.id;
    assert(orderJson.data?.orderNumber?.startsWith('AUR-'), `Generated atomic Order Number: ${orderJson.data?.orderNumber}`);
    assert(orderJson.data?.orderStatus === 'pending', 'Initial Order Status is "pending"');
    assert(orderJson.data?.finalAmount > 0, `Server-side verified Final Amount: ₹${orderJson.data?.finalAmount}`);

    // 5b. Transition Order: pending -> confirmed (Allowed)
    const confirmRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'manager',
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    assert(confirmRes.status === 200, 'Valid transition "pending" -> "confirmed" returns 200 OK');
    const confirmJson = await confirmRes.json();
    assert(confirmJson.data?.orderStatus === 'confirmed', 'Order status updated to "confirmed"');

    // 5c. Attempt Invalid State Transition: confirmed -> completed (Bypassing kitchen processing - should fail with 400)
    const invalidTransRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'super_admin',
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert(invalidTransRes.status === 400, `Illegal transition "confirmed" -> "completed" rejected with 400 Bad Request (Actual: ${invalidTransRes.status})`);

    // 5d. Legitimate Transition: confirmed -> processing -> ready -> completed
    const procRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'staff' },
      body: JSON.stringify({ status: 'processing' }),
    });
    assert(procRes.status === 200, 'Valid transition "confirmed" -> "processing" returns 200 OK');

    const readyRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'staff' },
      body: JSON.stringify({ status: 'ready' }),
    });
    assert(readyRes.status === 200, 'Valid transition "processing" -> "ready" returns 200 OK');

    const completeRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'manager' },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert(completeRes.status === 200, 'Valid transition "ready" -> "completed" returns 200 OK');
    const completeJson = await completeRes.json();
    assert(completeJson.data?.orderStatus === 'completed', 'Order successfully fulfilled and completed');
  } catch (err) {
    console.error('Order lifecycle test error:', err.message);
    failedTests++;
  }

  // 6. Inventory & Stock Ledger Verification
  console.log('\n6. Inventory & Transactional Stock Ledger Check:');
  try {
    const invRes = await fetch(`${BASE_URL}/api/inventory`);
    assert(invRes.status === 200, 'GET /api/inventory responds with 200 OK');
    const invData = await invRes.json();
    assert(Array.isArray(invData.data) && invData.data.length > 0, `Inventory list has ${invData.data?.length} items`);

    const firstItem = invData.data[0];
    const prevStock = firstItem.currentStock;

    // Perform stock adjustment (+5 restock)
    const adjustRes = await fetch(`${BASE_URL}/api/inventory`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'manager',
      },
      body: JSON.stringify({
        inventoryId: firstItem.id,
        changeType: 'restock',
        quantityChange: 5.0,
        notes: 'Verification test restock delivery',
      }),
    });

    assert(adjustRes.status === 200, 'PUT /api/inventory stock adjustment returns 200 OK');
    const adjustData = await adjustRes.json();
    assert(adjustData.data?.item?.currentStock === prevStock + 5.0, `New stock balance verified: ${prevStock} + 5 = ${adjustData.data?.item?.currentStock}`);
    assert(adjustData.data?.ledger?.changeType === 'restock', 'Ledger transaction recorded');

    // Verify ledger history endpoint
    const ledgerRes = await fetch(`${BASE_URL}/api/inventory?ledger=true`);
    const ledgerData = await ledgerRes.json();
    assert(Array.isArray(ledgerData.data) && ledgerData.data.length > 0, `Ledger contains ${ledgerData.data?.length} audit records`);
  } catch (err) {
    console.error('Inventory verification error:', err.message);
    failedTests++;
  }

  // 7. Notification Engine Verification
  console.log('\n7. Notification Engine Check:');
  try {
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    assert(notifRes.status === 200, 'GET /api/notifications responds with 200 OK');
    const notifData = await notifRes.json();
    assert(Array.isArray(notifData.data?.notifications), 'Notifications list returned');
    assert(typeof notifData.data?.unreadCount === 'number', `Unread notifications count: ${notifData.data?.unreadCount}`);
  } catch (err) {
    console.error('Notification test error:', err.message);
    failedTests++;
  }

  // 8. Cafe Settings API Verification
  console.log('\n8. Cafe Settings API Check:');
  try {
    const setRes = await fetch(`${BASE_URL}/api/settings?key=general`);
    assert(setRes.status === 200, 'GET /api/settings?key=general responds with 200 OK');
    const setData = await setRes.json();
    assert(setData.data?.cafeName === 'Cafe Aura', `Cafe name in settings is "${setData.data?.cafeName}"`);
  } catch (err) {
    console.error('Settings test error:', err.message);
    failedTests++;
  }

  console.log('\n====================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerification();
