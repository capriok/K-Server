const cors = require('cors')

const corsOptions = (whitelist) => {
  return {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  }
}

module.exports = { cors, corsOptions }

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
