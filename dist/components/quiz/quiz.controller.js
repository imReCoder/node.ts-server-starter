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
const httpErrors_1 = require("../../lib/utils/httpErrors");
const customMessage_1 = require("../../lib/helpers/customMessage");
const responseHandler_1 = __importDefault(require("../../lib/helpers/responseHandler"));
const category_model_1 = __importDefault(require("../category/category.model"));
const quiz_model_1 = __importDefault(require("./quiz.model"));
class QuizController {
    constructor() {
        this.fetchAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.fetchQuiz(req.query);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.FETCH_ALL, data).send();
            }
            catch (e) {
                // send error with next function.
                next(responseHandler.sendError(e));
            }
        });
        this.addCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield category_model_1.default.create(req.body, req.userId);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.CATEGORY, data).send();
            }
            catch (e) {
                // send error with next function.
                next(responseHandler.sendError(e));
            }
        });
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.quiz.CREATED, yield quiz_model_1.default.create(req.body, req.userId), customMessage_1.quiz.CREATED_DEC).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchAllActiveQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.FETCH_ALL, yield quiz_model_1.default.fetchByActiveQuiz(req.query)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchCreatedQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.FETCH_ALL, yield quiz_model_1.default.fetchCreatedQuiz(req.userId, req.query)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchPlayedQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.fetchPlayedQuiz(req.query, req.userId);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.FETCH_PLAYED, data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.CREATED, yield (yield quiz_model_1.default.fetchById(req.params.id, req.userId)).payload, customMessage_1.quiz.CREATED_DEC).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate(customMessage_1.quiz.UPDATED, yield quiz_model_1.default.update(req.params.id, req.body)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.delete(req.params.id);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.UPDATED, data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.uploadFile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                // @ts-ignore
                req.body.locationUrl = req.file.location;
                const result = yield quiz_model_1.default.changeIcon(req.params.id, req.body.locationUrl);
                console.log(result);
                // s3UploadMulter.single('video')
                responseHandler.reqRes(req, res).onCreate("File uploaded", result).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.start = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.start(req.userId, req.query.quizId, req.query.code);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.START, { data, timesUserHasPlayed: req.body.timesUserHasPlayed }).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.guestStart = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.guestStart(req.query.quizId, req.userId);
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.START, { data }).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.ruleBook = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch('Here is our quiz rule book', { pdf: quiz_model_1.default.rulePdf }).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.fetchAllQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch("Here are all  quiz", yield quiz_model_1.default.fetchQuizes(req.query)).send();
            }
            catch (e) {
                responseHandler.sendError(e);
            }
        });
        this.findAllActiveCategories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch(customMessage_1.quiz.CATEGORY_INFO, yield category_model_1.default.fetchAllActive()).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.registerForQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate('Registeration Of Quiz Completed', yield quiz_model_1.default.registerForQuiz(req.userId, req.query.quizId)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.isUserRegistered = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const quiz = yield quiz_model_1.default.fetchById(req.query.quizId, req.userId);
                if (!quiz.payload[0].isFreebie) {
                    console.log("hello");
                    const exist = yield quiz_model_1.default.isUserRegistered(req.query.quizId, req.userId);
                    if (!exist) {
                        throw new httpErrors_1.HTTP400Error("NOTREGISTERED");
                    }
                    yield quiz_model_1.default.checkQuizDates(req.query.quizId);
                    console.log(exist);
                    next();
                }
                else {
                    next();
                }
            }
            catch (e) {
                console.log(e);
                next(responseHandler.sendError(e));
            }
        });
        this.isUserAlreadyRegistered = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const exist = yield quiz_model_1.default.isUserRegistered(req.query.quizId, req.userId);
                console.log(exist);
                if (!exist) {
                    next();
                }
                else {
                    throw new httpErrors_1.HTTP400Error("ALREADYREGISTERED");
                }
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.getParticipants = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch('Here are the participants', yield quiz_model_1.default.getParticipants(req.params.id)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.getLeaderboard = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.getLeaderboard(req.params.id);
                responseHandler.reqRes(req, res).onFetch("Leaderboard for the quiz", data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.updateQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.updateQuiz();
                console.log(data);
                responseHandler.reqRes(req, res).onFetch("Updating the quiz", data).send();
                // return data;
            }
            catch (e) {
                responseHandler.sendError(e);
            }
        });
        this.checkQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.checkQuiz(req.query.quizId);
                console.log(data, req.body);
                if (!data.isFreebie) {
                    try {
                        const transactiondetails = yield quiz_model_1.default.paidQuizTransaction(req.userId, req.query.quizId);
                        console.log(transactiondetails);
                        if (transactiondetails) {
                            next();
                        }
                    }
                    catch (e) {
                        next(responseHandler.sendError(e));
                    }
                }
                else {
                    next();
                }
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.transaction = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                console.log("In here");
                const transactionBody = yield quiz_model_1.default.initiateTransaction(req.body);
                req.body.transactionBody = transactionBody;
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.checkTimesUserPlayed = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.checkTimesUserPlayed(req.query.quizId, req.userId);
                console.log(data);
                const quiz = yield quiz_model_1.default.fetchById(req.query.quizId, req.userId);
                if (data < quiz.payload[0].numberOfTimes) {
                    req.body.timesUserHasPlayed = data;
                    next();
                }
                else {
                    throw new httpErrors_1.HTTP400Error("LIMITEXCEEDED");
                }
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.startLiveQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onFetch("You can start Quiz", { proceed: true }).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.getPrize = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const prizes = yield quiz_model_1.default.getPrize(req.params.id);
                responseHandler.reqRes(req, res).onFetch("Here the prize array", prizes).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.registerForLiveQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                responseHandler.reqRes(req, res).onCreate("Registeration Of Quiz Completed", yield quiz_model_1.default.registerForLiveQuiz(req.userId, req.query.quizId)).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.checkQuizDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.checkCurrentQuizDetails(req.query.quizId, req.userId);
                if (data && data.proceed) {
                    next();
                }
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        // public fetchWalletTransaction = async (req: Request, res: Response, next: NextFunction) => {
        //   const responseHandler = new ResponseHandler();
        //   try {
        //     const data = await Quiz.fetchWalletTransaction(req.userId);
        //     responseHandler.reqRes(req, res).onFetch('Wallet Transaction Fetched Successfully', data).send();
        //   } catch (e) {
        //     next(responseHandler.sendError(e));
        //   }
        // }
        this.fetchPrivateQuiz = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.fetchPrivateQuiz(req.userId);
                responseHandler.reqRes(req, res).onFetch('Private Quiz Fetched Sucessfully', data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.getQuizByCode = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                const data = yield quiz_model_1.default.getQuizByCode(req.query.code);
                responseHandler.reqRes(req, res).onFetch("Quiz Fetched", data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.payWithPaytm = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                if (!req.query.amount)
                    throw new httpErrors_1.HTTP400Error("amount is required");
                const data = yield quiz_model_1.default.payWithPaytm(req.userId, req.query.amount);
                responseHandler.reqRes(req, res).onFetch("HTML PAGE", data).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
        this.walletIKCresponse = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const responseHandler = new responseHandler_1.default();
            try {
                console.log(req.body);
                yield quiz_model_1.default.changeTransactionStatus(req.body.transactionId, 'TXN_SUCCESS');
                responseHandler.reqRes(req, res).onCreate("Succesfull", { success: true }).send();
            }
            catch (e) {
                next(responseHandler.sendError(e));
            }
        });
    }
}
;
exports.default = new QuizController;
//# sourceMappingURL=quiz.controller.js.map