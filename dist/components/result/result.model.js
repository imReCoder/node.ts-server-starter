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
exports.ScoreModel = void 0;
const index_1 = require("./../../lib/utils/index");
const result_schema_1 = require("./result.schema");
const question_model_1 = __importDefault(require("../question/question.model"));
const bson_1 = require("bson");
const httpErrors_1 = require("../../lib/utils/httpErrors");
const helpers_1 = require("../../lib/helpers");
const quiz_schema_1 = require("../quiz/quiz.schema");
const mongoose_1 = __importDefault(require("mongoose"));
const resultSelect = "countCorrect questionsAnswered score roomId";
class ScoreModel {
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = new result_schema_1.Result(body);
            return yield p.add();
        });
    }
    update(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(body.resultId.toString()) && helpers_1.isValidMongoId(userId.toString())) {
                let score = yield question_model_1.default.pointsScored(body.quesId, body.answer);
                console.log(score);
                let result = yield result_schema_1.Result.findById(new bson_1.ObjectID(body.resultId));
                let attempts = yield result_schema_1.Result.find({ userId: userId, roomId: result.roomId }).count();
                let quiz = yield quiz_schema_1.Quiz.findById(result.roomId);
                if (result && attempts != null && attempts != undefined && quiz) {
                    let pointsScored = Number(body.score);
                    let currScore = result.score | 0;
                    if (score.isCorrect) {
                        result.countCorrect += 1;
                        result.score = currScore + pointsScored;
                    }
                    result.questionsAnswered.push({ quesId: body.quesId, answerMarked: body.answer, isCorrect: score.isCorrect, pointScored: pointsScored });
                    yield result.save();
                    score.points = pointsScored;
                    score.total = result.score;
                    return score;
                }
                else {
                    throw new httpErrors_1.HTTP400Error('No such Score ID');
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error('No such MongoDB ID');
            }
        });
    }
    timedOut(body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(body.quesId.toString())) {
                let result = yield result_schema_1.Result.findById(new bson_1.ObjectID(body.resultId));
                result.questionsAnswered.push({ quesId: body.quesId, answerMarked: 'TIMED OUT', isCorrect: false, pointScored: 0 });
                yield result.save();
                let question = yield question_model_1.default.fetchAnswer(body.quesId);
                return { quesId: question._id, answer: question.answer };
            }
            else {
                throw new httpErrors_1.HTTP400Error('Not valid MongoDB ID');
            }
        });
    }
    end(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helpers_1.isValidMongoId(body.resultId.toString())) {
                    let result = yield result_schema_1.Result.findById(body.resultId);
                    if (result) {
                        let quiz = yield quiz_schema_1.Quiz.findById(result.roomId);
                        let accuracyData = yield result_schema_1.Result.aggregate([{
                                $match: {
                                    $and: [{ roomId: result.roomId }, { userId: result.userId }]
                                },
                            }, {
                                $group: {
                                    _id: '$roomId',
                                    totalCorrect: { $sum: '$countCorrect' },
                                    totalAttempted: { $sum: { $size: '$questionsAnswered' } }
                                }
                            }]);
                        if (quiz) {
                            if (accuracyData[0].totalAttempted != 0) {
                                result.accuracy = Math.ceil((accuracyData[0].totalCorrect / accuracyData[0].totalAttempted) * 100);
                            }
                            else {
                                result.accuracy = 0;
                            }
                            yield result.save();
                            return { score: result.score, countCorrect: result.countCorrect, maxQuestions: quiz.metadata.maxQuestions };
                        }
                        else {
                            throw new httpErrors_1.HTTP400Error('Not valid MongoDB Quiz ID');
                        }
                    }
                    else {
                        throw new httpErrors_1.HTTP400Error('Not valid MongoDB ID');
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error('Not valid MongoDB ID');
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    ;
    guestResult(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("hii");
            if (helpers_1.isValidMongoId(body.resultId.toString()) && helpers_1.isValidMongoId(userId.toString())) {
                let score = yield question_model_1.default.pointsScored(body.quesId, body.answer);
                console.log(score);
                let result = yield result_schema_1.Result.findById(new bson_1.ObjectID(body.resultId));
                let attempts = yield result_schema_1.Result.find({ userId: userId, roomId: result.roomId }).count();
                let quiz = yield quiz_schema_1.Quiz.findById(result.roomId);
                if (result && attempts != null && attempts != undefined && quiz) {
                    let pointsScored = Number(body.score);
                    let currScore = result.score | 0;
                    if (score.isCorrect) {
                        result.countCorrect += 1;
                        result.score = currScore + pointsScored;
                    }
                    result.questionsAnswered.push({ quesId: body.quesId, answerMarked: body.answer, isCorrect: score.isCorrect, pointScored: pointsScored });
                    yield result.save();
                    score.points = pointsScored;
                    score.total = result.score;
                    return score;
                }
                else {
                    throw new httpErrors_1.HTTP400Error('No such Score ID');
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error('No such MongoDB ID');
            }
        });
    }
    ;
    guestEnd(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helpers_1.isValidMongoId(body.resultId.toString())) {
                    let result = yield result_schema_1.Result.findById(body.resultId);
                    if (result) {
                        let quiz = yield quiz_schema_1.Quiz.findById(result.roomId);
                        let accuracyData = yield result_schema_1.Result.aggregate([{
                                $match: {
                                    $or: [{ roomId: result.roomId }, { userId: result.userId }]
                                },
                            }, {
                                $group: {
                                    _id: '$roomId',
                                    totalCorrect: { $sum: '$countCorrect' },
                                    totalAttempted: { $sum: { $size: '$questionsAnswered' } }
                                }
                            }]);
                        if (quiz) {
                            result.accuracy = Math.ceil((accuracyData[0].totalCorrect / accuracyData[0].totalAttempted) * 100);
                            if (accuracyData[0].totalAttempted != 0) {
                                result.accuracy = Math.ceil((accuracyData[0].totalCorrect / accuracyData[0].totalAttempted) * 100);
                            }
                            else {
                                result.accuracy = 0;
                            }
                            yield result.save();
                            return { score: result.score, countCorrect: result.countCorrect, maxQuestions: quiz.metadata.maxQuestions };
                        }
                        else {
                            throw new httpErrors_1.HTTP400Error('Not valid MongoDB Quiz ID');
                        }
                    }
                    else {
                        throw new httpErrors_1.HTTP400Error('Not valid MongoDB ID');
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error('Not valid MongoDB ID');
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    ;
    fetchResultsByUserId(userId, pageNo = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let { skip, limit } = index_1.getPaginationInfo(Number(pageNo || 1));
            const results = yield result_schema_1.Result.aggregate([
                {
                    $match: { userId: new mongoose_1.default.Types.ObjectId(userId) },
                },
                {
                    $group: {
                        _id: "$roomId",
                        plays: { $sum: 1 },
                        score: { $max: "$score" },
                    },
                },
            ]);
            return results;
        });
    }
    checkTimesUserPlayed(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield result_schema_1.Result.find({ $and: [{ roomId }, { userId }] });
                if (results == null)
                    return 0;
                return results.length;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    ;
}
exports.ScoreModel = ScoreModel;
exports.default = new ScoreModel();
//# sourceMappingURL=result.model.js.map