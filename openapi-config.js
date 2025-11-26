// openapi-config.js
module.exports = {
  input: 'http://140.245.42.78:5050/swagger/v1/swagger.json',
  output: './lib/api/generated',
  httpClient: 'fetch',
  exportSchemas: true,
  baseUrl: "/api/proxy",
};