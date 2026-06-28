// using built-in fetch

async function test() {
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Test User',
      no_wa: '08123456789',
      alamat: 'Test Alamat',
      pin: '123456'
    })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test();
