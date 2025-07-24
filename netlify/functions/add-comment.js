// netlify/functions/add-comment.js
const { Client } = require('pg');

exports.handler = async (event) => {
  const { post_id, user_id, text } = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.NETLIFY_DB_CONNECTION_STRING });
  await client.connect();

  await client.query(
    'INSERT INTO comments(post_id, user_id, text, created_at) VALUES($1, $2, $3, NOW())',
    [post_id, user_id, text]
  );
  await client.end();

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
