// testSearch.js
const fetch = require('node-fetch');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTE4OTE1MzlmMWQ0YTM2NWNhZTk4ZDgiLCJ1aWQiOjU1LCJlbWFpbCI6InRldHJpc2NsdWIxMTlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJnYWdlMTE5Iiwicm9sZSI6ImRldiIsImlhdCI6MTc2MzMwNjg5NSwiZXhwIjoxNzYzMzkzMjk1fQ.JWy3Wog8Y0y40nC-PO-_5ekwmgEnM9KXFW3U_ihh2KI';
const QUERY = 'Satisfaction';

async function testSearch() {
  try {
    const res = await fetch(`http://localhost:8080/api/globalgames/search?q=${encodeURIComponent(QUERY)}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching search:', err);
  }
}

testSearch();

