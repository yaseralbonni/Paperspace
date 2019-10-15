"use strict";

module.exports = {
    /**
     * register subroute with base route
     * @param {Route} baseRoute - the route object which will register the sub-route
     * @param {string} urlPath - the mapped url relative to the route object provided
     * @param {string} routePath - location of js router file that will handle sub-routes
     * @param {Function} middleWare - optional middleWare  to register with the route, for example: authentication
     * @example registerRoute(app, "/accounts", "./routes/some-folder.js"); 
     */
    registerRoute: (baseRoute, urlPath, routePath, middleWare = undefined) => {
        if (middleWare)
            baseRoute.use(urlPath, middleWare, require(`${global.__basedir}/${routePath}`));
        else
            baseRoute.use(urlPath, require(`${global.__basedir}/${routePath}`));
    }
};