const allowedOrigins = require("./allowedOrigin");

const corsOptions = {
	origin: (origin, callback) => {
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			// only accept access our backend api
			callback(null, true);
		} else {
			callback(new Error("Not allow by CORS"));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
};

module.exports = corsOptions;
