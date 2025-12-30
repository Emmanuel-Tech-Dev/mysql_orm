const AppError = require("../../shared/helpers/AppError");
const Model = require("../model/model");

const authorization = async (req, res, next) => {
  try {
    // 1. Get user
    const user = req.user;
    if (!user) {
      throw new AppError("ERR_AUTHENTICATION_REQUIRED", null, {
        message: "Failed to authorize user, token missing or invalid",
        level: "access",
      });
    }

    // 2. Check for user roles
    const userRoles = await new Model()
      .select(["user_id", "role_id"], "admin_user_roles")
      .where("user_id", "=", user?.sub)
      .execute();

    if (!userRoles || userRoles.length === 0) {
      throw new AppError("ERR_NO_RESOURCES", null, {
        message: "User has no roles assigned",
        level: "access",
      });
    }

    //  console.log("User roles:", userRoles);

    // Extract role IDs
    const roleIds = userRoles.map((r) => r.role_id);

    // 3. Get permissions for these roles
    const perms = await new Model()
      .select(["permission"], "admin_role_permissions")
      .whereIn("role_id", roleIds) //  Use extracted role IDs
      .execute();

    if (!perms || perms.length === 0) {
      throw new AppError("ERR_NO_RESOURCES", null, {
        message: "User roles have no permissions assigned",
        level: "access",
      });
    }

    //console.log("User permissions:", perms);

    //  Extract permission values
    const permissionNames = perms.map((p) => p.permission);
    // console.log("Permission names:", permissionNames); // ['create:user', 'read:user']

    // 4. Get resources these permissions can access
    const resrcs = await new Model()
      .select(["resource"], "admin_permission_resources")
      .whereIn("permission", permissionNames) //  Use extracted permission names
      .execute();

    if (!resrcs || resrcs.length === 0) {
      throw new AppError("ERR_NO_RESOURCES", null, {
        message: "User permissions have no resources assigned",
        level: "access",
      });
    }

    //console.log("User resources:", resrcs);

    const resourceNames = resrcs.map((r) => r.resource);
    console.log("Resource names:", resourceNames); // ['Get Users']

    // 5. Get full resource details
    const resources = await new Model()
      .select(["*"], "admin_resources")
      .where("resource_type", "=", "API_ENDPOINT")
      .whereIn("resource", resourceNames)
      .execute();

    console.log("Accessible resources:", resources);

    // 6. Check if user can access the current endpoint
    const requestedPath = req.path;
    const requestedMethod = req.method;

    const canAccess = resources.some((r) => {
      const pathMatches = r.resource_path === requestedPath;
      const methodMatches =
        r.http_method === requestedMethod ||
        r.http_method === "*" ||
        r.http_method === "ALL";

      // console.log(
      //   "Resource:",
      //   r.resource_path,
      //   "Requested:",
      //   requestedPath,
      //   "Match:",
      //   pathMatches && methodMatches
      // );

      return pathMatches && methodMatches;
    });

    console.log("Can Access:", canAccess);

    if (!canAccess) {
      throw new AppError("ERR_ACCESS_DENIED", null, {
        message: `Access denied to ${requestedMethod} ${requestedPath} , not enough permission to access this resources`,
        level: "access",
        userId: user.sub,
        requestedPath,
        requestedMethod,
      });
    }

    // 7. Attach user context to request
    req.userRoles = userRoles;
    req.userPermissions = permissionNames;
    req.userResources = resources;

    console.log(" Authorization successful");
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authorization;
