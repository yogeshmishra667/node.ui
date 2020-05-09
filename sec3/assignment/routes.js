const handler = (request, response) => {
  const url = request.url

  if (url === '/') {
    response.setHeader('Content-type', 'text/html')
    response.write('<html>')
    response.write('<head><title>Index</title></head>')
    response.write('<body>')
    response.write('<h1>NodeJs Assignment 1</h1>')
    response.write('<form action="/create-user" method="POST"><input name="username" type="text" placeholder="username"/><button type="submit">Add User</button></form>')
    response.write('</body>')
    response.write('</html>')
    return response.end()
  } else if (url === '/users') {
    response.setHeader('Content-type', 'text/html')
    response.write('<html>')
    response.write('<head><title>Users</title></head>')
    response.write('<body>')
    response.write('<h1>Users List</h1>')
    response.write('<ul><li>User 1</li><li>User 2</li><li>User 3</li><li>User 4</li></ul>')
    response.write('</body>')
    response.write('</html>')
    return response.end()
  } else if (url === '/create-user' && request.method === 'POST') {
    const body = []
    request.on('data', (chunk) => {
      body.push(chunk)
    })

    request.on('end', () => {
      const parsedBody = Buffer.concat(body).toString()
      console.log(parsedBody.split('=')[1])
    })

    response.writeHead(302, { Location: '/users' })
    return response.end()
  }
}

module.exports = handler