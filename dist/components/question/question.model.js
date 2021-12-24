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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = void 0;
const question_schema_1 = require("./question.schema");
const helpers_1 = require("../../lib/helpers");
const httpErrors_1 = require("../../lib/utils/httpErrors");
const bson_1 = require("bson");
const utils_1 = require("../../lib/utils");
class QuestionModel {
    constructor() {
        this.fieldsOfUser = "firstName lastName avatar userName";
        this.default = "content level categoryId options points";
        this.defaultWithAnswer = "content level categoryId options points answer";
        this.pruningFields = '_id creator createdAt updatedAt __v';
    }
    create(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let temp = Object.assign({}, body);
                temp.creator = userId;
                temp.content = {
                    isText: body.isText,
                    question: body.question
                };
                if (!body.isText) {
                    temp.content.answerImage = body.answerImage;
                }
                temp.options = body.options;
                const newQues = new question_schema_1.Question(temp);
                newQues.answer = newQues.options[Number(newQues.answer) - 1]._id;
                const data = yield newQues.add();
                return data.populate('creator', this.fieldsOfUser).execPopulate();
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    fetchQuestionByCondition(condition, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return question_schema_1.Question.aggregate([
                {
                    $match: condition
                },
                {
                    $sort: { 'createdAt': -1 }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creator',
                        foreignField: "_id",
                        as: "creator"
                    }
                },
                {
                    $limit: limit
                },
                {
                    $unwind: { path: '$creator' }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: 'categoryId',
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: { path: '$category' }
                },
                {
                    $project: Object.assign(Object.assign({}, utils_1.mongoDBProjectFields(this.fieldsOfUser, 'creator')), utils_1.mongoDBProjectFields(this.defaultWithAnswer))
                }
            ]).exec();
        });
    }
    randomQuestionsPicker(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            let category = condition.category;
            let questionsCount = condition.questionsCount;
            return yield question_schema_1.Question.aggregate([
                {
                    $match: {
                        categoryId: new bson_1.ObjectID(category)
                    }
                },
                {
                    $sample: { size: questionsCount }
                },
                {
                    $sort: { points: 1 }
                },
                {
                    $project: Object.assign({}, utils_1.mongoDBProjectFields(this.default))
                }
            ]).exec();
        });
    }
    fetchAllQuestions(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let condition = {};
            if (body.level) {
                condition.level = Number(body.level);
            }
            if (body.category) {
                condition.categoryId = new bson_1.ObjectID(body.category);
            }
            if (body.id) {
                condition._id = new bson_1.ObjectID(body.id);
            }
            if (body.title) {
                condition['content.question'] = { $regex: body.title, $options: 'i' };
            }
            let page;
            body.page ? page = body.page : page = 1;
            return yield this.fetchQuestionByCondition(condition, page * 50);
        });
    }
    fetchById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!helpers_1.isValidMongoId(id)) {
                throw new Error("Not Valid MongoDB ID");
            }
            const data = yield this.fetchQuestionByCondition({ _id: new bson_1.ObjectID(id) }, 1);
            if (data && data.length === 1) {
                return {
                    payload: data[0]
                };
            }
            throw new httpErrors_1.HTTP400Error("Document Not Found");
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(id)) {
                const data = yield question_schema_1.Question.findByIdAndDelete(id);
                if (data) {
                    return data;
                }
                throw new httpErrors_1.HTTP400Error("Document Not Found");
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not Valid MongoDB ID");
            }
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helpers_1.isValidMongoId(id)) {
                    helpers_1.pruneFields(body, this.pruningFields);
                    const data = yield question_schema_1.Question.findByIdAndUpdate(id, body, { new: true, runValidators: true });
                    if (data) {
                        return data;
                    }
                    else {
                        throw new httpErrors_1.HTTP400Error("Document Not Found");
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Not Valid MongoDB ID");
                }
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    pointsScored(id, answer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(id)) {
                const q = yield question_schema_1.Question.findById(id);
                if (q) {
                    return q.answer == answer ? { isCorrect: true, points: q.points, optionMarked: answer, correctOption: q.answer } : { isCorrect: false, points: 0, optionMarked: answer, correctOption: q.answer };
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Invalid Question ID");
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not Valid MongoDB ID");
            }
        });
    }
    LivepointsScored(id, answer, points) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(id)) {
                const q = yield question_schema_1.Question.findById(id);
                if (q) {
                    return q.answer == answer ? { isCorrect: true, points: points, optionMarked: answer, correctOption: q.answer } : { isCorrect: false, points: 0, optionMarked: answer, correctOption: q.answer };
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Invalid Question ID");
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not Valid MongoDB ID");
            }
        });
    }
    fetchRandomQuestions(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.randomQuestionsPicker(condition);
            return data;
        });
    }
    fetchAnswer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(id.toString())) {
                return yield question_schema_1.Question.findById(id).select('answer').lean();
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not Valid MongoDB ID");
            }
        });
    }
}
exports.QuestionModel = QuestionModel;
exports.default = new QuestionModel();
//# sourceMappingURL=question.model.js.map