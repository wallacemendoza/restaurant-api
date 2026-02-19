/**
 * Simple API key auth middleware.
 * Clients must send:  Authorization: Bearer <API_KEY>
 * Set API_KEY in your .env file (and in Render's environment variables).
 */
function requireApiKey(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid API key. Send: Authorization: Bearer <key>'
    });
  }

  next();
}

module.exports = { requireApiKey };
