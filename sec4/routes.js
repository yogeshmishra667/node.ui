const fs = require('fs')

const requestHandler = (request, response) => {
  const url = request.url
  const method = request.method

  if (url === '/') {
    response.write('<html>')
    response.write('<head><title>Enter Message</title></head')
    response.write('<body><form action="/message" method="POST"><input name="message" type="text"/><button type="submit">Send</button></form></body>')
    response.write('</html>')
    return response.end()
  }
  
  if (url === '/message' && method === 'POST') {
    const body = []
    request.on('data', (chunk) => {
      body.push(chunk)
    })
  
    request.on('end', () => {
      const parsedBody = Buffer.concat(body).toString()
      const message = parsedBody.split('=')[0]
      fs.writeFile('message.txt', message, err => {
        response.writeHead(302, { Location: '/' })
        return response.end()
      })
    })
  }
}

module.exports = requestHandler
