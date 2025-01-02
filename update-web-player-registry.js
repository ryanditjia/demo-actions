// const fs = require('fs')

// const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const urlPrefix = process.env.URL_PREFIX
const compression = process.env.COMPRESSION
const gameName = process.env.GAME_NAME

// // Update only if values are provided
// Object.entries(updates).forEach(([key, value]) => {
//   if (value !== undefined) {
//     content[key] = value
//   }
// })

// fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2))

console.log({ urlPrefix, compression, gameName })
