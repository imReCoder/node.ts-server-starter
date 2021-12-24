"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_controller_1 = __importDefault(require("./category.controller"));
exports.default = [
    {
        path: "/category/fetchAll",
        method: "get",
        handler: [category_controller_1.default.fetchAll]
    },
    {
        path: "/category/create",
        method: "post",
        handler: [category_controller_1.default.create]
    },
    {
        path: "/category/:id/delete",
        method: "post",
        handler: [category_controller_1.default.delete]
    }
];
//# sourceMappingURL=index.js.map