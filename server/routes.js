//v7 imports
import userV1 from "./api/v1/controllers/user/routes";
import marketV1 from "./api/v1/controllers/market/routes";
import adminV1 from "./api/v1/controllers/admin/routes";
import subAdminV1 from "./api/v1/controllers/subAdmin/routes";
import staticV1 from "./api/v1/controllers/static/routes";
import setting from "./api/v1/controllers/settings/routes";


/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {
	var unless = function (middleware, ...paths) {
		return function (req, res, next) {
			const pathCheck = paths.some((path) => path === req.path);
			pathCheck ? next() : middleware(req, res, next);
		};
	};

	/*------------v1 routes--------------------*/

	app.use("/api/v1/user", userV1)
	app.use("/api/v1/market", marketV1)
	app.use("/api/v1/admin", adminV1)
	app.use("/api/v1/admin", subAdminV1)
	app.use("/api/v1/static", staticV1)
	app.use("/api/v1/setting", setting)



	return app;
}
