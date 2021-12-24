"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const quiz_controller_1 = __importDefault(require("./quiz.controller"));
const result_controller_1 = __importDefault(require("../result/result.controller"));
const user_controller_1 = __importDefault(require("../user/user.controller"));
const s3_1 = require("../../lib/services/s3");
exports.default = [
    {
        path: "/quiz/create",
        method: "post",
        handler: [quiz_controller_1.default.create]
    },
    {
        path: '/quiz/AddCategory',
        method: 'post',
        adminOnly: true,
        handler: [quiz_controller_1.default.addCategory]
    },
    {
        path: '/quiz/fetchAllCategories',
        method: "get",
        escapeAuth: true,
        handler: [quiz_controller_1.default.findAllActiveCategories]
    },
    {
        path: '/quiz/fetchActiveQuiz',
        escapeAuth: true,
        method: "get",
        handler: [quiz_controller_1.default.fetchAllActiveQuiz]
    },
    {
        path: '/quiz/fetchCreatedQuiz',
        escapeAuth: true,
        method: "get",
        handler: [quiz_controller_1.default.fetchCreatedQuiz]
    },
    {
        path: '/quiz/fetchPlayedQuiz',
        escapeAuth: false,
        method: "get",
        handler: [quiz_controller_1.default.fetchPlayedQuiz]
    },
    {
        path: "/quiz/code",
        method: "get",
        handler: [quiz_controller_1.default.getQuizByCode]
    },
    {
        path: '/quiz/start',
        method: 'get',
        handler: [user_controller_1.default.isVerified, quiz_controller_1.default.isUserRegistered, quiz_controller_1.default.checkTimesUserPlayed, quiz_controller_1.default.start]
    },
    {
        path: '/quiz/submitAnswer',
        method: 'get',
        handler: [result_controller_1.default.submitAnswer]
    },
    {
        path: '/quiz/:id/fetch',
        escapeAuth: true,
        method: 'get',
        handler: [quiz_controller_1.default.fetchById]
    },
    {
        path: '/quiz/timedOut',
        method: 'get',
        handler: [result_controller_1.default.timedOut]
    },
    {
        path: '/quiz/end',
        method: 'get',
        handler: [result_controller_1.default.end]
    },
    {
        path: '/quiz/ruleBook',
        method: 'get',
        escapeAuth: true,
        handler: [quiz_controller_1.default.ruleBook]
    },
    {
        path: '/quiz/register',
        method: 'post',
        handler: [user_controller_1.default.isVerified, quiz_controller_1.default.checkQuizDetails, quiz_controller_1.default.checkQuiz, quiz_controller_1.default.registerForQuiz]
    },
    {
        path: '/quiz/live/register',
        method: "post",
        handler: [user_controller_1.default.isVerified, quiz_controller_1.default.checkQuizDetails, user_controller_1.default.isVerified, quiz_controller_1.default.checkQuiz, quiz_controller_1.default.registerForLiveQuiz]
    },
    {
        path: '/quiz/live/start',
        method: "get",
        handler: [user_controller_1.default.isVerified, quiz_controller_1.default.isUserRegistered, quiz_controller_1.default.checkTimesUserPlayed, quiz_controller_1.default.startLiveQuiz]
    },
    {
        path: '/quiz/:id/participants',
        method: 'get',
        handler: [quiz_controller_1.default.getParticipants]
    },
    {
        path: '/quiz/:id/leaderboard',
        escapeAuth: true,
        method: 'get',
        handler: [quiz_controller_1.default.getLeaderboard]
    },
    {
        path: '/quiz/:id/prize',
        adminOnly: true,
        method: 'get',
        handler: [quiz_controller_1.default.getPrize]
    },
    {
        path: '/quiz/fetch',
        escapeAuth: true,
        method: 'get',
        handler: [quiz_controller_1.default.fetchAllQuiz]
    },
    {
        path: "/quiz/upload/:id",
        method: "post",
        handler: [s3_1.s3UploadMulter.single('file'), quiz_controller_1.default.uploadFile]
    },
    {
        path: "/quiz/fetchPrivateQuiz",
        method: "get",
        handler: [quiz_controller_1.default.fetchPrivateQuiz]
    },
    {
        path: "/quiz/:id/update",
        method: "post",
        handler: [quiz_controller_1.default.update]
    },
    {
        path: '/quiz/paymentWithPaytm',
        method: 'post',
        handler: [quiz_controller_1.default.payWithPaytm]
    },
    {
        path: '/wallet/ikc/response',
        escapeAuth: true,
        method: "post",
        handler: [quiz_controller_1.default.walletIKCresponse]
    }
];
//# sourceMappingURL=index.js.map