const path = require('path')
const fs = require('fs')

exports.clearImage = file => {
  filePath = path.join(__dirname, '..', file)
  fs.unlink(filePath, error => console.log(error));
}