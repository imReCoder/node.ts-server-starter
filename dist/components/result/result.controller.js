"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customMessage_1 = require("../../lib/helpers/customMessage");
const responseHandler_1 = __importDefault(require("../../lib/helpers/responseHandler"));
const result_model_1 = __importDefault(require("./result.model"));
class ResultController {
    constructor() {
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                req.body.Result = 0;
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.CREATED, yield result_model_1.default.create(req.body), customMessage_1.score.CREATED_DEC).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.submitAnswer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.SUBMIT_ANSWER, yield result_model_1.default.update(req.query, req.userId)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.guestsubmitAnswer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.SUBMIT_ANSWER, yield result_model_1.default.guestResult(req.query, req.userId)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.timedOut = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.SUBMIT_ANSWER, yield result_model_1.default.timedOut(req.query)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.end = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.SUBMIT_ANSWER, yield result_model_1.default.end(req.query)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.guestEnd = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.score.SUBMIT_ANSWER, yield result_model_1.default.guestEnd(req.query)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
    }
}
exports.default = new ResultController;
//# sourceMappingURL=result.controller.js.map