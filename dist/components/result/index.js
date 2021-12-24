"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const result_controller_1 = __importDefault(require("./result.controller"));
exports.default = [
    {
        path: "/score",
        method: "post",
        handler: [result_controller_1.default.create],
        adminOnly: true
    },
];
//# sourceMappingURL=index.js.map