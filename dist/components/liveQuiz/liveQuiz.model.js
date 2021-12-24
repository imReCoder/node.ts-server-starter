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
exports.LiveQuizModel = void 0;
const quiz_schema_1 = require("./../quiz/quiz.schema");
const httpErrors_1 = require("../../lib/utils/httpErrors");
const question_model_1 = __importDefault(require("../question/question.model"));
const liveQuiz_schema_1 = require("./liveQuiz.schema");
const quiz_model_1 = __importDefault(require("../quiz/quiz.model"));
const liveQuizLeaderboard_model_1 = __importDefault(require("../liveQuizLeaderboard/liveQuizLeaderboard.model"));
const user_schema_1 = require("../user/user.schema");
class LiveQuizModel {
    // private questionFields: string = "_id content level categoryId options points";
    add(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(quizId);
                // just for testing
                console.log("quiz is" + quiz);
                if (quiz.startDate > Date.now()) {
                    const body = {
                        roomId: quizId,
                        users: [],
                        status: 'pending',
                        activeUserCount: 0,
                        questionCount: 0
                    };
                    const liveQuizBody = new liveQuiz_schema_1.LiveQuiz(body);
                    yield liveQuizBody.add();
                }
                else {
                    return { proceed: false };
                }
                return { proceed: true };
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    ;
    joinRoom(socketId, userId, quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield this.isQuizExist(quizId);
            console.log("do quiz exist" + quiz.alreadyExist);
            if (!quiz.alreadyExist) {
                const quiz = yield this.add(quizId);
                console.log(quiz);
                if (quiz.proceed) {
                    yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: quizId }, {
                        $push: { "users": { userId: userId, socketId: socketId } }
                    }, {
                        new: true
                    });
                }
            }
            else {
                const isUser = yield this.isUserExist(userId, quizId);
                console.log("IsUser = " + isUser.alreadyExist);
                if (isUser.alreadyExist) {
                    yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ $and: [{ roomId: quizId }, { users: { $elemMatch: { userId: userId } } }] }, {
                        $set: { "users.$.socketId": socketId }
                    }, {
                        new: true
                    });
                }
                else {
                    yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: quizId }, {
                        $push: { "users": { userId: userId, socketId: socketId } }
                    }, {
                        new: true
                    });
                }
                ;
            }
            return { proceed: true, roomId: quizId };
        });
    }
    ;
    getQuestionCount(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield quiz_model_1.default.fetchById(roomId, userId);
            return quiz.payload[0].metadata.maxQuestions;
        });
    }
    isUserExist(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuiz_schema_1.LiveQuiz.findOne({ $and: [{ roomId: roomId }, { users: { $elemMatch: { userId: userId } } }] });
            console.log("Isquiz = " + quiz);
            if (quiz == null) {
                return { alreadyExist: false };
            }
            return { alreadyExist: true };
        });
    }
    getQuestions(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield quiz_model_1.default.fetchOneRandomQuestions(roomId);
                console.log(question);
                return question;
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    ;
    isQuizExist(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOne({ roomId: roomId });
            console.log(liveQuiz);
            if (!liveQuiz) {
                return { alreadyExist: false };
            }
            return { alreadyExist: true };
        });
    }
    resultCalc(questionId, answer, userId, roomId, points) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield question_model_1.default.LivepointsScored(questionId, answer, points);
            if (result) {
                const resultBody = {
                    roomId,
                    userId,
                    score: result.points
                };
                const leaderboard = yield liveQuizLeaderboard_model_1.default.updateleaderboard(resultBody);
                return result;
            }
            return null;
        });
    }
    ;
    endQuiz(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield liveQuizLeaderboard_model_1.default.getLeaderboard(roomId);
            return leaderboard;
        });
    }
    ;
    activeUsers(roomId, flag) {
        return __awaiter(this, void 0, void 0, function* () {
            let userCount = 0;
            let liveQuiz;
            if (flag == 1) {
                liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: roomId }, {
                    $inc: { "activeUserCount": 1 }
                }, { new: true });
            }
            else {
                liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: roomId }, {
                    $inc: { "activeUserCount": -1 }
                }, { new: true });
            }
            if (liveQuiz != null) {
                userCount = liveQuiz.activeUserCount;
            }
            return userCount;
        });
    }
    ;
    changeStatus(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: roomId }, {
                $set: { "status": "active" }
            }, { new: true });
            return liveQuiz;
        });
    }
    ;
    increaseQuestionCount(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOneAndUpdate({ roomId: roomId }, {
                $inc: { "questionCount": 1 }
            }, { new: true });
            return liveQuiz.questionCount;
        });
    }
    ;
    // public async addToMasterWallet(room)
    addToWallet(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield this.endQuiz(roomId);
            console.log(leaderboard[0].scores.userId[0]._id);
            const userId = leaderboard[0].scores.userId[0]._id;
            const quiz = yield quiz_schema_1.Quiz.findOne({ _id: roomId });
            const user = yield user_schema_1.User.findOne({ _id: userId });
            let body = {};
            const totalAmount = Number(quiz.totalRegistrations) * quiz.poolAmount;
            body.amount = Math.floor(totalAmount - (0.05 * totalAmount));
            body.quizId = roomId;
            body.type = "PollReward";
            body.description = `Quiz Winner Reward of Quiz ${roomId}`;
            body.metadataType = "Credit";
            const transactiondetails = yield quiz_model_1.default.transactions(userId, body);
            console.log(transactiondetails);
            if (transactiondetails._id) {
                const paymentBody = {
                    phone: user.phone,
                    amount: transactiondetails.amount,
                    userId: transactiondetails.userId,
                    isFreebie: false,
                    description: transactiondetails.metadata.description,
                    transactionId: transactiondetails._id
                };
                const walletTransaction = yield quiz_model_1.default.masterToWalletTransaction(paymentBody);
                const liveQuiz = yield quiz_model_1.default.pushPrize(roomId, { userId: userId, prize: body.amount, prizeDistributed: true });
                console.log(liveQuiz.prizes, liveQuiz.prizes.length);
                if (liveQuiz.prizes.length != 1) {
                    throw new httpErrors_1.HTTP400Error(`Failed Filling prize for user ${userId} in quiz ${roomId}`);
                }
                const isPrizeDistributed = yield quiz_model_1.default.changeIsPrizeDistributed(roomId);
                if (!isPrizeDistributed) {
                    throw new httpErrors_1.HTTP400Error('Failed changing quiz isPrizeDistributed status');
                }
                return { walletTransaction, user, quiz };
            }
        });
    }
    ;
    getUser(socketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield liveQuiz_schema_1.LiveQuiz.findOne({ users: { $elemMatch: { socketId: socketId } } });
            console.log("left user" + user);
            return user;
        });
    }
    getLiveQuiz(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const liveQuiz = yield liveQuiz_schema_1.LiveQuiz.findOne({ roomId: roomId });
            return liveQuiz;
        });
    }
}
exports.LiveQuizModel = LiveQuizModel;
exports.default = new LiveQuizModel();
//# sourceMappingURL=liveQuiz.model.js.map