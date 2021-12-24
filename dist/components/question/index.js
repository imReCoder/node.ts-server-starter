"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const question_controller_1 = __importDefault(require("./question.controller"));
exports.default = [
    {
        path: "/ques/create",
        method: "post",
        handler: [question_controller_1.default.create],
        adminOnly: true
    },
    {
        path: "/ques/fetchAll",
        method: "get",
        handler: [question_controller_1.default.fetchAll],
        adminOnly: true
    },
    {
        path: "/ques/update/:id",
        method: "patch",
        handler: [question_controller_1.default.update],
        adminOnly: true
    },
];
//# sourceMappingURL=index.js.map