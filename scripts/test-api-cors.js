#!/usr/bin/env node

const https = require('https');

console.log('🔍 Testing API CORS configuration...');

// 测试API状态
function testAPI(url, description) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing ${description}: ${url}`);
        
        const req = https.request(url, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://zhitoujianli.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        }, (res) => {
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   CORS Headers:`);
            console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
            console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
            console.log(`   - Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
            console.log(`   - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NOT SET'}`);
            resolve(res.statusCode === 200);
        });

        req.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🎯 Target Origin: https://zhitoujianli.com');
    
    const tests = [
        ['https://zhitoujianli.com/api/status', 'API Status Endpoint'],
        ['https://zhitoujianli.com/api/auth/login/email', 'Login Endpoint']
    ];

    let allPassed = true;
    
    for (const [url, description] of tests) {
        const passed = await testAPI(url, description);
        if (!passed) allPassed = false;
    }

    console.log('\n📊 Test Summary:');
    console.log(allPassed ? '✅ All CORS tests passed!' : '❌ Some CORS tests failed!');
    
    if (!allPassed) {
        console.log('\n🔧 Recommended fixes:');
        console.log('1. Ensure backend server is running');
        console.log('2. Update CORS configuration to include production domains');
        console.log('3. Restart backend server after configuration changes');
    }
}

runTests();