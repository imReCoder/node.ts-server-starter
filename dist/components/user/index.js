"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("./user.controller"));
exports.default = [
    {
        path: "/user",
        method: "get",
        handler: [user_controller_1.default.fetchAll]
    },
    {
        path: "/user",
        method: "post",
        handler: [user_controller_1.default.create]
    },
    {
        path: "/user/loggeduser",
        method: "get",
        handler: [user_controller_1.default.getLoggedUser]
    },
    {
        path: "/login",
        method: "post",
        escapeAuth: true,
        handler: [user_controller_1.default.logIn]
    },
    // {
    //   path: "/logout",
    //   method: "post",
    //   escapeAuth: true,
    //   handler: [userController.logIn]
    // },
    {
        path: "/signup",
        method: "post",
        escapeAuth: true,
        handler: [user_controller_1.default.signUp]
    },
    {
        path: "/follower/:id",
        method: "post",
        handler: [user_controller_1.default.addFollower]
    },
    {
        path: "/following/:id",
        method: "post",
        handler: [user_controller_1.default.addFollowing]
    },
    {
        path: "/followrequest/:id",
        method: "post",
        handler: [user_controller_1.default.addFolowRequest]
    },
    {
        path: "/auth",
        method: "post",
        escapeAuth: true,
        handler: [user_controller_1.default.loginViaSocialAccessToken]
    },
    {
        path: "/user/:id",
        method: "get",
        handler: [user_controller_1.default.fetch]
    },
    {
        path: "/user/:id",
        method: "patch",
        handler: [user_controller_1.default.update]
    },
    // {
    //   path: "/user/verifyUser",
    //   escapeAuth: true,
    //   method: "post",
    //   handler:[userController.verifyUser]
    // },
    {
        path: "/user/addPhoneNumber",
        method: "post",
        handler: [user_controller_1.default.addPhoneNumber]
    },
    {
        path: "/user/:id/verify-otp",
        method: "get",
        escapeAuth: true,
        handler: [user_controller_1.default.verifyOtp]
    },
    {
        path: "/user/generateOTP",
        escapeAuth: true,
        method: "post",
        handler: [user_controller_1.default.generateOTP]
    },
    {
        path: "/user/login/socialAuth/addphone",
        method: "get",
        escapeAuth: true,
        handler: [user_controller_1.default.socialAuthAddPhone]
    },
];
//# sourceMappingURL=index.js.map