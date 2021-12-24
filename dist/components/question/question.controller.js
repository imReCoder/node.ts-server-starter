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
const question_model_1 = __importDefault(require("./question.model"));
const customMessage_1 = require("../../lib/helpers/customMessage");
const responseHandler_1 = __importDefault(require("../../lib/helpers/responseHandler"));
class QuesController {
    constructor() {
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.ques.CREATED, yield question_model_1.default.create(req.body, req.userId), customMessage_1.ques.CREATED_DEC).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetch = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.ques.CREATED, yield question_model_1.default.fetchById(req.params.id), customMessage_1.ques.CREATED_DEC).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield question_model_1.default.fetchAllQuestions(req.query);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.ques.FETCH_ALL, data).send();
            }
            catch (e) {
                // send error with next function.
                next(responseHandler.sendError(e));
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                req.body.creator = req.userId;
                responseHandler.reqRes(req, res).onCreate(customMessage_1.ques.UPDATED, yield question_model_1.default.update(req.params.id, req.body)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield question_model_1.default.delete(req.params.id);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.ques.UPDATED, data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchAnswer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield question_model_1.default.delete(req.params.id);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.ques.UPDATED, data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
    }
}
exports.default = new QuesController;
//# sourceMappingURL=question.controller.js.map