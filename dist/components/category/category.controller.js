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
const category_model_1 = __importDefault(require("./category.model"));
const customMessage_1 = require("../../lib/helpers/customMessage");
const responseHandler_1 = __importDefault(require("../../lib/helpers/responseHandler"));
class CategoryController {
    constructor() {
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.ques.CREATED, yield category_model_1.default.create(req.body, req.userId)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        // public fetch = async (req: Request, res: Response, next: NextFunction) => {
        //     const responseHandler = new ResponseHandler();
        //     try {
        //         responseHandler.reqRes(req, res).onCreate(msg.CREATED, await Ques.fetchById(req.params.id), msg.CREATED_DEC).send();
        //     } catch (e) {
        //         next(responseHandler.sendError(e));
        //     }
        // };
        this.fetchAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield category_model_1.default.fetchAll();
                responseHandler.reqRes(req, res).onFetch(customMessage_1.ques.FETCH_ALL, data).send();
            }
            catch (e) {
                // send error with next function.
                next(responseHandler.sendError(e));
            }
        });
        // public update = async (req: Request, res: Response, next: NextFunction) => {
        //     const responseHandler = new ResponseHandler();
        //     try {
        //         req.body.creator = req.userId;
        //         responseHandler.reqRes(req, res).onCreate(msg.UPDATED, await Ques.update(req.params.id, req.body)).send();
        //     } catch (e) {
        //         next(responseHandler.sendError(e));
        //     }
        // };
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield category_model_1.default.delete(req.params.id);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.ques.UPDATED, data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
    }
}
exports.default = new CategoryController;
//# sourceMappingURL=category.controller.js.map