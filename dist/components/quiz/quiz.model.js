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
exports.QuizModel = void 0;
const index_1 = require("./../../lib/utils/index");
const quiz_schema_1 = require("./quiz.schema");
const mongoose_1 = __importDefault(require("mongoose"));
const leaderboard_model_1 = __importDefault(require("../leaderboard/leaderboard.model"));
const helpers_1 = require("../../lib/helpers");
const httpErrors_1 = require("../../lib/utils/httpErrors");
const bson_1 = require("bson");
const utils_1 = require("../../lib/utils");
const result_model_1 = __importDefault(require("../result/result.model"));
const ikcPool_model_1 = __importDefault(require("../IKCPool/ikcPool.model"));
const lodash_1 = __importDefault(require("lodash"));
const question_model_1 = __importDefault(require("../question/question.model"));
const ikcPool_schema_1 = require("../IKCPool/ikcPool.schema");
const ikcPool_interface_1 = require("../IKCPool/ikcPool.interface");
const transaction_schema_1 = require("../transactions/transaction.schema");
const axios_1 = __importDefault(require("axios"));
const transaction_model_1 = __importDefault(require("../transactions/transaction.model"));
const user_schema_1 = require("../user/user.schema");
class QuizModel {
    constructor() {
        this.default = "title maxScore timeAlloted level category coverImage metadata visibility poolAmount startDate endDate isFreebie liveQuiz numberOfTimes lastDateToRegister";
        this.quizPlayedSelect = "title maxScore timeAlloted level category coverImage  visibility poolAmount startDate endDate isFreebie liveQuiz numberOfTimes lastDateToRegister";
        this.fieldsOfUser = "firstName lastName avatar userName createdAt email _id";
        this.pruningFields = "_id creator createdAt updatedAt __v";
        this.questionFields = "_id content level categoryId options points answer";
        this.rulePdf = "https://drive.google.com/uc?export=view&id=1864Oc6WPcYQLq7wXyw4ZWIcN885_NVhU";
    }
    create(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const temp = Object.assign({}, body);
                temp.creator = userId;
                temp.lastDateToRegister = new Date(temp.lastDateToRegister);
                temp.startDate = new Date(temp.startDate);
                // console.log(new Date(temp.startDate.getTime() - 5*60000));
                temp.endDate = new Date(temp.endDate);
                if (temp.lastDateToRegister >= temp.startDate ||
                    temp.lastDateToRegister >= temp.endDate) {
                    throw new httpErrors_1.HTTP400Error("Last Date to Registered is invalid");
                }
                if (temp.startDate > temp.endDate) {
                    throw new httpErrors_1.HTTP400Error("Invalid Start Date");
                }
                temp.visibility = body.visibility;
                temp.hidden = body.hidden;
                temp.questions = body.questions;
                temp.metadata = body.metadata;
                temp.prizes = [];
                temp.totalRegistrations = 0;
                const q = new quiz_schema_1.Quiz(temp);
                const data = yield q.add();
                return data.populate("creator", this.fieldsOfUser).execPopulate();
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    registerForQuiz(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helpers_1.isValidMongoId(userId.toString()) &&
                    helpers_1.isValidMongoId(roomId.toString())) {
                    let exist = yield ikcPool_schema_1.ikcPool.findOne({
                        $and: [{ userId: userId }, { roomId: roomId }],
                    });
                    console.log(exist, userId);
                    if (!exist) {
                        let quiz = yield quiz_schema_1.Quiz.findById(roomId);
                        let body = {
                            userId: userId,
                            amount: quiz.poolAmount,
                            roomId: roomId,
                            status: ikcPool_interface_1.PoolStatus.DEDUCTED,
                        };
                        let pool = new ikcPool_schema_1.ikcPool(body);
                        yield quiz_schema_1.Quiz.findByIdAndUpdate(roomId, {
                            $inc: { totalRegistrations: 1 },
                        });
                        //  await this.deductIKC(userId,quiz.poolAmount);
                        // const transaction = await this.paidQuizTransaction(userId, roomId);
                        console.log("ikc deducted success.......");
                        const data = yield pool.save();
                        const user = yield user_schema_1.User.findById({ _id: userId });
                        return { data, quiz, user };
                    }
                    else {
                        return { alreadyRegistered: true };
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Not a valid mongoDB Id");
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    registerForLiveQuiz(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helpers_1.isValidMongoId(userId.toString()) &&
                    helpers_1.isValidMongoId(roomId.toString())) {
                    let exist = yield ikcPool_schema_1.ikcPool.findOne({
                        $and: [{ userId: userId }, { roomId: roomId }],
                    });
                    const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                    console.log(exist, userId);
                    if (!exist && !quiz.isFreebie) {
                        let quiz = yield quiz_schema_1.Quiz.findById(roomId);
                        let body = {
                            userId: userId,
                            amount: quiz.poolAmount,
                            roomId: roomId,
                            status: ikcPool_interface_1.PoolStatus.DEDUCTED,
                        };
                        let pool = new ikcPool_schema_1.ikcPool(body);
                        yield quiz_schema_1.Quiz.findByIdAndUpdate(roomId, {
                            $inc: { totalRegistrations: 1 },
                        });
                        // await this.deductIKC(userId,quiz.poolAmount);
                        const data = yield pool.save();
                        const user = yield user_schema_1.User.findById({ _id: userId });
                        return { data, quiz, user };
                    }
                    else {
                        return { registered: true };
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Not a valid mongoDB Id");
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    fetchPrivateQuiz(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const privateQuiz = yield quiz_schema_1.Quiz.find({
                    $and: [{ creator: userId }, { visibility: "private" }],
                });
                return privateQuiz;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    fetchQuizByCondition(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            return quiz_schema_1.Quiz.aggregate([
                {
                    $match: condition,
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "creator",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $unwind: { path: "$user" },
                },
                {
                    $project: Object.assign(Object.assign({}, utils_1.mongoDBProjectFields(this.fieldsOfUser, "user")), utils_1.mongoDBProjectFields(this.default)),
                },
            ]);
        });
    }
    fetchQuiz(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {};
            if (query.level) {
                condition.level = Number(query.level);
            }
            if (query.categoryId) {
                condition.categoryId = new bson_1.ObjectID(query.categoryId);
            }
            if (query.creator) {
                condition.cretaor = query.creator;
            }
            let data = yield this.fetchQuizByCondition(condition);
            return {
                payload: data,
            };
        });
    }
    fetchByActiveQuiz(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let today = new Date();
            let condition;
            if (body.type == "classic") {
                condition = {
                    $and: [{ startDate: { $gte: today } }, { isFreebie: false }],
                };
            }
            else {
                condition = {
                    $and: [{ startDate: { $gte: today } }, { isFreebie: true }],
                };
            }
            let quizzes = yield this.fetchQuizByCondition(condition);
            return { quizzes: quizzes };
        });
    }
    fetchCreatedQuiz(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let { skip, limit } = index_1.getPaginationInfo(Number(body.pageNo || 1));
            let today = new Date();
            let condition;
            if (body.type == "classic") {
                condition = {
                    $and: [{ userId: userId }, { isFreebie: false }],
                };
            }
            else if (body.type == "free") {
                condition = {
                    $and: [{ userId: userId }, { isFreebie: true }],
                };
            }
            else {
                condition = {
                    userId: userId,
                };
            }
            let quizzes = yield quiz_schema_1.Quiz.find(condition, this.quizPlayedSelect).lean();
            if (!quizzes || !quizzes.length)
                return new httpErrors_1.HTTP400Error("NO QUIZZES FOUND");
            // .skip(skip).limit(limit);
            const totalQuizes = quizzes.length;
            const dataToSend = quizzes.splice(skip, limit);
            const totalPages = Math.ceil(totalQuizes / limit);
            if (!dataToSend || !dataToSend.length)
                return new httpErrors_1.HTTP400Error("NO QUIZZES FOUND");
            return {
                quizzes: dataToSend,
                pagination: {
                    totalQuizzes: totalQuizes,
                    totalPages,
                    currentPage: Number(body.pageNo),
                },
            };
        });
    }
    fetchPlayedQuiz(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { skip, limit } = index_1.getPaginationInfo(Number(body.pageNo || 1));
                let rooms = yield result_model_1.default.fetchResultsByUserId(userId, body.pageNo);
                console.log("total rooms found ", rooms.length);
                let quizRooms = [];
                for (let i = 0; i < rooms.length; i++) {
                    let quizRoom = (yield quiz_schema_1.Quiz.findOne({ _id: rooms[i]._id }, this.default).lean());
                    const timesPlayed = rooms[i].plays; //await this.checkTimesUserPlayed(rooms[i], userId);
                    if (!quizRoom)
                        continue;
                    const maxPlay = quizRoom.metadata.maxAttempts;
                    quizRoom.playsLeft = maxPlay - timesPlayed;
                    quizRooms.push(quizRoom);
                }
                const dataToSend = quizRooms.splice(skip, limit);
                const totalPages = Math.ceil(rooms.length / limit);
                if (!dataToSend || !dataToSend.length)
                    return new httpErrors_1.HTTP400Error("NO QUIZZES FOUND");
                return {
                    quizzes: dataToSend,
                    pagination: {
                        totalQuizzes: rooms.length,
                        totalPages,
                        currentPage: Number(body.pageNo),
                    },
                };
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    fetchQuizes(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let today = new Date();
            let condition;
            console.log(body);
            if (body && body.type == "classic") {
                condition = {
                    $and: [
                        { endDate: { $gte: today } },
                        { isFreebie: false },
                        { liveQuiz: false },
                        { visibility: "public" },
                    ],
                };
            }
            else if (body && body.type == "live") {
                condition = {
                    $and: [
                        { endDate: { $gte: today } },
                        { liveQuiz: true },
                        { visibility: "public" },
                    ],
                };
            }
            else {
                condition = {
                    $and: [
                        { endDate: { $gte: today } },
                        { isFreebie: true },
                        { liveQuiz: false },
                        { visibility: "public" },
                    ],
                };
            }
            let quizzes = yield this.fetchQuizByCondition(condition);
            return { quizzes: quizzes };
        });
    }
    verifyCode(quizId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield quiz_schema_1.Quiz.findById(quizId);
            if (quiz) {
                if ((quiz.visibility == "private" && quiz.code == code) ||
                    quiz.visibility == "public") {
                    return { proceed: true };
                }
                else {
                    return { proceed: false };
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error("Invalid Quiz Id");
            }
        });
    }
    fetchById(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!helpers_1.isValidMongoId(id)) {
                throw new Error("Not Valid MongoDB ID");
            }
            const data = yield this.fetchQuizByCondition({ _id: new bson_1.ObjectID(id) });
            if (data && data.length === 1) {
                return {
                    payload: data,
                };
            }
            throw new httpErrors_1.HTTP400Error("Document Not Found");
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(id)) {
                console.log(id);
                const data = yield quiz_schema_1.Quiz.findByIdAndDelete(id);
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
            if (helpers_1.isValidMongoId(id)) {
                helpers_1.pruneFields(body, this.pruningFields);
                console.log(body);
                const data = yield quiz_schema_1.Quiz.findByIdAndUpdate(id, body, {
                    new: true,
                    runValidators: true,
                });
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
    // Under Development || current error: $sample requires number (Optimized Query for future use)
    fetchRandomQuestions(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield quiz_schema_1.Quiz.aggregate([
                {
                    $match: { _id: new bson_1.ObjectID(quizId) },
                },
                {
                    $unwind: { path: "$questions" },
                },
                {
                    $lookup: {
                        from: "questions",
                        let: {
                            categoryId: "$questions.category",
                            level: "$questions.level",
                            questionCount: 5,
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$categoryId", "$$categoryId"] },
                                            { $eq: ["$level", "$$level"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $sample: { size: "$$questionCount" },
                            },
                            {
                                $sort: { points: 1 },
                            },
                        ],
                        as: "question",
                    },
                },
                {
                    $unwind: { path: "$question" },
                },
                {
                    $project: Object.assign(Object.assign({}, utils_1.mongoDBProjectFields(this.questionFields, "question")), { _id: 0 }),
                },
            ]);
        });
    }
    // End of optimized query
    // && codeVerification.proceed
    start(userId, quizId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(userId.toString()) &&
                helpers_1.isValidMongoId(quizId.toString())) {
                // let codeVerification = await this.verifyCode(quizId, code)
                let quiz = yield quiz_schema_1.Quiz.findById(quizId);
                if (quiz) {
                    let questionsArray = [];
                    for (let condition of quiz.questions) {
                        let data = yield question_model_1.default.fetchRandomQuestions(condition);
                        questionsArray = lodash_1.default.concat(questionsArray, lodash_1.default.cloneDeep(data));
                    }
                    let newScore = {
                        userId: userId,
                        roomId: quizId,
                        score: 0,
                        questionsAnswered: [],
                        countCorrect: 0,
                    };
                    let result = yield result_model_1.default.create(newScore);
                    questionsArray = lodash_1.default.shuffle(questionsArray);
                    return {
                        resultId: result._id,
                        questions: questionsArray,
                        length: questionsArray.length,
                    };
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Not a valid Quiz ID");
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not a valid mongoDB ID");
            }
        });
    }
    deductIKC(userId, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("deducting ikc..");
                yield ikcPool_model_1.default.deductIKC(userId, cost);
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    fetchUsersToNotify(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield quiz_schema_1.Quiz.updateMany({ $expr: { $gte: ["totalRegisterations", "metadata.minPlayers"] } }, { $set: { status: "active" } });
                return quiz_schema_1.Quiz.aggregate([
                    {
                        $match: condition,
                    },
                    {
                        $lookup: {
                            from: "ikcpools",
                            let: {
                                roomId: "$_id",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$roomId", "$$roomId"] },
                                                { $eq: ["$notify", true] },
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: "ikcPools",
                        },
                    },
                    {
                        $unwind: { path: "ikcPools" },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "$ikcPools.userId",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $unwind: { path: "user" },
                    },
                    {
                        $project: Object.assign(Object.assign({}, utils_1.mongoDBProjectFields("user", this.fieldsOfUser)), utils_1.mongoDBProjectFields(this.default)),
                    },
                ]);
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    sendQuizStartNotification(body) {
        return __awaiter(this, void 0, void 0, function* () {
            body;
        });
    }
    getParticipants(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(new mongoose_1.default.Types.ObjectId(quizId));
            try {
                console.log("participants");
                // await Quiz.updateMany({ $expr: { $gte: ['totalRegisterations', 'metadata.minPlayers'] } }, { $set: { status: 'active' } });
                const data = yield ikcPool_schema_1.ikcPool.aggregate([
                    {
                        $match: { roomId: new mongoose_1.default.Types.ObjectId(quizId) },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "userId",
                        },
                    },
                ]);
                return data;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    getLeaderboard(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield leaderboard_model_1.default.getAwardResults(roomId);
            return data;
        });
    }
    getPrize(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prizeArray = yield leaderboard_model_1.default.leaderboardAlgorithm(roomId);
                const leaderboard = yield this.getLeaderboard(roomId);
                const result = leaderboard.result;
                // console.log(prizeArray, result);
                if (result && result.length > 0) {
                    let index = 0;
                    const prize = [];
                    while (index < prizeArray.length) {
                        try {
                            const prizeBody = {
                                prize: prizeArray[index],
                                userId: result[index].userId[0]._id,
                            };
                            prize.push(prizeBody);
                            index++;
                            console.log(prize);
                        }
                        catch (e) {
                            throw new httpErrors_1.HTTP400Error("Error filling prize array");
                        }
                    }
                    console.log(prize);
                    if (prize.length != prizeArray.length) {
                        throw new httpErrors_1.HTTP400Error("prize length not equal to prizeArray length");
                    }
                    return prize;
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    pushPrize(roomId, prizeBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findOneAndUpdate({ _id: roomId }, {
                    $push: { prizes: prizeBody },
                }, { new: true });
                return quiz;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    updateQuiz() {
        return __awaiter(this, void 0, void 0, function* () {
            // let session = await mongoose.connection.startSession();
            try {
                const data = yield quiz_schema_1.Quiz.find({
                    $and: [
                        { endDate: { $lt: Date.now() } },
                        { status: { $ne: "active" } },
                        { status: { $ne: "dropped" } },
                        { prizes: { $size: 0 } },
                    ],
                });
                // console.log(...data);
                // db.cards.aggregate([{$unwind: "$cards"}, {$match:{"cards._id" : "5a52f3a66f112b42b7439a20"}}] )
                data.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                    console.log(element._id);
                    yield this.updateQuizStatus(element._id);
                    // await this.updateQuizWinners(element._id);
                    // await this.updateIKCPool(element._id);
                }));
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
            finally {
                // await session.endSession();
            }
        });
    }
    updateQuizStatus(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield quiz_schema_1.Quiz.findById(quizId);
            // const IKCPlayers = await ikcPool.find({ $and: [{ roomId: quizId },{status:"deducted"}] });
            if (quiz.totalRegistrations >= quiz.metadata.minPlayers) {
                const prize = yield this.getPrize(quizId);
                if (prize && prize.length > 0) {
                    yield quiz_schema_1.Quiz.findByIdAndUpdate(quizId, {
                        $set: { status: "active", prizes: prize },
                    });
                }
            }
            else {
                yield quiz_schema_1.Quiz.findByIdAndUpdate(quizId, {
                    $set: { status: "dropped" },
                });
                console.log(`Dropping quiz ${quizId}`);
                yield this.giveIKCBack(quizId);
            }
            console.log(quizId);
        });
    }
    // private async updateQuizWinners(quizId: string) {
    //   const quiz = await Quiz.findById(quizId);
    //   if (quiz.prizes.length > 0) {
    //     const leaderboard = await LeaderBoard.getAwardResults(quizId);
    //   }
    // }
    // private async updateIKCPool(quizId:string){
    //   const quiz = await Quiz.findById(quizId);
    //   if(quiz.status == 'active'){
    //     const IKCPoolPlayer = await ikcPool.updateMany({ roomId: quizId },
    //       {
    //         $set: { "status": PoolStatus.PENDING }
    //       });
    //       console.log(IKCPoolPlayer);
    //   }
    // };
    checkQuiz(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield quiz_schema_1.Quiz.findById(quizId);
            if (!quiz.isFreebie) {
                return { poolAmount: quiz.poolAmount, isFreebie: false };
            }
            return { isFreebie: true };
        });
    }
    payment(paymentBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                console.log("Making payment from wallet");
                const res = yield axios_1.default({
                    method: "POST",
                    url: `${url}/wallet/addToMasterWallet?apiKey=${apiKey}`,
                    data: Object.assign({}, paymentBody),
                });
                console.log(res.data.status);
                if (res.data.status) {
                    console.log("Status transaction change");
                    console.log(paymentBody.transactionId);
                    const transaction = yield transaction_schema_1.Transaction.findOneAndUpdate({ _id: paymentBody.transactionId }, {
                        $set: { status: "TXN_SUCCESS" },
                    }, {
                        new: true,
                    });
                    console.log(transaction);
                    if (transaction.status != "TXN_SUCCESS") {
                        yield transaction_schema_1.Transaction.findOneAndUpdate({ _id: paymentBody.transactionId }, {
                            $set: { status: "TXN_FAILURE" },
                        }, {
                            new: true,
                        });
                        throw new httpErrors_1.HTTP400Error(`Transaction status not updated for user ${paymentBody.userId}`);
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error(`Making payment from wallet failed for user ${paymentBody.userId}`);
                }
                return res;
            }
            catch (e) {
                console.log("9error is ", e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    // public async fetchWalletTransaction(userId: string) {
    //   try {
    //     const apiKey = process.env.IKCPLAYAPIKEY;
    //     const url = process.env.IKC_MASTER_WALLET_URI;
    //    console.log(userId);
    //     const user = await User.findById(userId);
    //     const phone = Number(user.phone);
    //     if (!user || !user.phone) {
    //       throw new HTTP400Error("User phone number is not added");
    //     }
    //     const res = await axios({
    //       method: "GET",
    //       url: `${url}/wallet/fetchTrasactions?apiKey=${apiKey}&phone=${phone}`
    //     });
    //     console.log(res.data);
    //     if (res && res.data.status) {
    //       return res.data.payload;
    //     } else {
    //       throw new HTTP400Error("Error fetching Wallet Transactions");
    //     }
    //   } catch (e) {
    //     throw  new HTTP400Error(e.message);
    //   }
    // }
    initiateTransaction(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield transaction_model_1.default.create(body);
                yield transaction.save();
                console.log("transaction id", transaction._id);
                return transaction;
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    transactions(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let transactionBody;
                if (body.quizId) {
                    transactionBody = {
                        userId,
                        amount: body.amount,
                        type: body.type,
                        description: body.description,
                        metadata: {
                            type: body.metadataType,
                            description: body.description,
                            roomId: body.quizId,
                        },
                        status: "PENDING",
                    };
                }
                else {
                    transactionBody = {
                        userId,
                        amount: body.amount,
                        type: body.type,
                        description: body.description,
                        metadata: {
                            type: body.metadataType,
                            description: body.description,
                        },
                        status: "PENDING",
                    };
                }
                console.log("Saving transaction...");
                console.log(transactionBody);
                const res = yield this.initiateTransaction(transactionBody);
                console.log("initiated transaction");
                return res;
            }
            catch (e) {
                console.log("1error is ", e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    masterToWalletTransaction(paymentBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                console.log("Making payment from masterWallet");
                const res = yield axios_1.default({
                    method: "POST",
                    url: `${url}/wallet/addToWallet?apiKey=${apiKey}`,
                    data: Object.assign({}, paymentBody),
                });
                if (res.data.status) {
                    console.log("Status transaction change");
                    const transaction = yield transaction_schema_1.Transaction.findOneAndUpdate({ _id: paymentBody.transactionId }, {
                        $set: { status: "TXN_SUCCESS" },
                    }, {
                        new: true,
                    });
                    console.log(transaction);
                    if (transaction.status != "TXN_SUCCESS") {
                        yield transaction_schema_1.Transaction.findOneAndUpdate({ _id: paymentBody.transactionId }, {
                            $set: { status: "TXN_FAILURE" },
                        }, {
                            new: true,
                        });
                        throw new httpErrors_1.HTTP400Error(`Transaction status not updated for user ${paymentBody.userId}`);
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error(`Making payment from masterWallet failed for user ${paymentBody.userId}`);
                }
                return res;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    getMasterWalletTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                const res = yield axios_1.default({
                    method: "GET",
                    url: `${url}/masterWallet?apiKey=${apiKey}`,
                });
                if (res.data.status) {
                    console.log("master wallet balance");
                    console.log(res.data.payload.balance);
                    return res.data.payload.balance;
                }
                else {
                    return 0;
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    getWalletTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                const res = yield axios_1.default({
                    method: "GET",
                    url: `${url}/masterWallet?apiKey=${apiKey}`,
                });
                if (res.data.status) {
                    console.log(res);
                    console.log("wallet balance");
                    console.log(res.data.payload);
                    return res.data.payload.balance;
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    sum(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let sum = 0;
            for (let i = 0; i < value.length - 1; i++) {
                let min = i;
                for (let j = i + 1; j < value.length - 1; j++) {
                    if (value[j].prize > value[min].prize) {
                        min = j;
                    }
                }
                let temp = value[min];
                value[min] = value[i];
                value[i] = temp;
                sum += value[i].prize;
            }
            sum += value[value.length - 1].prize;
            return { sum, value };
        });
    }
    changeIsPrizeDistributed(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                console.log("logo", quiz.prizes);
                for (let i = 0; i < quiz.prizes.length; i++) {
                    const curr_prize = quiz.prizes[i];
                    console.log(curr_prize.prizeDistributed);
                    if (!curr_prize.prizeDistributed) {
                        throw new httpErrors_1.HTTP400Error(`Prize distribution failed for user ${curr_prize.userId}`);
                    }
                }
                console.log("Changing prizeDistributed");
                const data = yield quiz_schema_1.Quiz.findOneAndUpdate({ _id: roomId }, {
                    $set: { isPrizeDistributed: true },
                }, { new: true });
                if (data.isPrizeDistributed) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    updateUserIsPrizeDistributed(roomId, userId, prizeId, prize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                const prizes = quiz.prizes;
                console.log(roomId, userId, prizeId, prize);
                for (let i = 0; i < prizes.length; i++) {
                    const _id = prizes[i]._id;
                    const user = prizes[i].userId;
                    const prizeAmount = prizes[i].prize;
                    console.log(_id, user, prizeAmount);
                    console.log(_id.equals(prizeId));
                    console.log(user == userId);
                    console.log(prizeAmount == prize);
                    console.log(typeof _id, typeof prizeId);
                    console.log(typeof user, typeof userId);
                    console.log(typeof prize, typeof prizeAmount);
                    console.log(_id == prizeId && user == userId && prizeAmount == prize);
                    if (_id.equals(prizeId) && user == userId && prizeAmount == prize) {
                        prizes[i].prizeDistributed = true;
                        console.log("Hello prizeDistribute");
                        yield quiz.save();
                        break;
                    }
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    changeStatusForUserPrize(roomId, userId, prizeId, prize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(roomId, userId, prize);
                // const quiz = await Quiz.findOneAndUpdate([{ $and: [{ _id: roomId }, { prizes: { $elemMatch: { userId: userId, prize: prize } } }] }], {
                //   $set: { 'prizes.$.prizeDistributed': true }
                // }, { new: true });
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                // console.log(curr_prizeArray.userId, userId, curr_prizeArray.prize, prize);
                // console.log(curr_prizeArray && curr_prizeArray.userId == userId && curr_prizeArray.prize == prize);
                yield this.updateUserIsPrizeDistributed(roomId, userId, prizeId, prize);
                if (!quiz) {
                    throw new httpErrors_1.HTTP400Error(`Error while changing prize stat of user ${userId} in roomId ${roomId}`);
                }
                return quiz;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    distributePriceMoney() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.find({
                    $and: [
                        { endDate: { $lte: Date.now() } },
                        { isPrizeDistributed: { $eq: false } },
                        { status: { $eq: "active" } },
                    ],
                });
                console.log(quiz);
                quiz.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                    const roomId = yield element._id;
                    if (element.status === "active" && element.prizes.length > 0) {
                        element.prizes.sort(function (a, b) {
                            return b > a;
                        });
                        // console.log(element.prizes);
                        const { sum, value } = yield this.sum(element.prizes);
                        console.log(sum, value);
                        const masterWalletTotal = yield this.getMasterWalletTotal();
                        // console.log(masterWalletTotal >= sum);
                        // console.log(sum);
                        console.log("here comes", sum);
                        console.log(masterWalletTotal >= sum);
                        if (masterWalletTotal >= sum) {
                            const curr_quiz = yield quiz_schema_1.Quiz.findById(roomId);
                            const leaderboard = yield leaderboard_model_1.default.getAwardResults(element._id);
                            for (let i = 0; i < curr_quiz.prizes.length; i++) {
                                // console.log(element.prizes[i]);
                                let curr_user_prize = curr_quiz.prizes[i];
                                // console.log(curr_user_prize);
                                if (!curr_user_prize.prizeDistributed) {
                                    const result = leaderboard.result[i];
                                    console.log(result.userId);
                                    const transactionBody = {
                                        type: "Others",
                                        amount: curr_user_prize.prize,
                                        metadataType: "Debit",
                                        quizId: roomId,
                                        userId: result.userId[0]._id,
                                        description: `Rewarding ${result.userId[0]._id} for coming ${i + 1} in quiz ${roomId}`,
                                    };
                                    // console.log(transactionBody);
                                    try {
                                        const transaction = yield this.transactions(result.userId[0]._id, transactionBody);
                                        if (transaction) {
                                            const user = yield user_schema_1.User.findOne({
                                                _id: result.userId[0]._id,
                                            });
                                            const paymentBody = {
                                                phone: user.phone,
                                                amount: curr_user_prize.prize,
                                                transactionId: transaction._id,
                                                isFreebie: false,
                                                description: transaction.metadata.description,
                                                userId: transaction.userId,
                                            };
                                            const masterTransaction = yield this.masterToWalletTransaction(paymentBody);
                                            if (!masterTransaction) {
                                                throw new httpErrors_1.HTTP400Error("Master Transaction Failed");
                                            }
                                            console.log(element.prizes[i].prize);
                                            const data = yield this.changeStatusForUserPrize(roomId, paymentBody.userId, curr_user_prize._id, curr_user_prize.prize);
                                            console.log(data);
                                        }
                                        else {
                                            throw new httpErrors_1.HTTP400Error("Saving Transaction failed");
                                        }
                                    }
                                    catch (e) {
                                        throw new httpErrors_1.HTTP400Error(e.message);
                                    }
                                }
                            }
                            console.log("Changing prize status for roomId", roomId);
                            yield this.changeIsPrizeDistributed(roomId);
                        }
                    }
                }));
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    paidQuizTransaction(userId, quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("paidQuizTransaction....");
                const quiz = yield quiz_schema_1.Quiz.findById(quizId);
                const transactionBody = {
                    amount: quiz.poolAmount,
                    quizId: quiz._id,
                    type: "Payment",
                    description: `Registering for Quiz ${quiz._id}`,
                    metadataType: "Debit",
                };
                const user = yield user_schema_1.User.findById(userId);
                const transactiondetails = yield this.transactions(userId, transactionBody);
                if (transactiondetails._id) {
                    const paymentBody = {
                        phone: user.phone,
                        amount: transactiondetails.amount,
                        userId: transactiondetails.userId,
                        isFreebie: false,
                        isPlatform: true,
                        description: transactiondetails.metadata.description,
                        transactionId: transactiondetails._id,
                    };
                    const walletBalance = yield this.fetchWalletBalance(paymentBody.phone);
                    if (walletBalance < paymentBody.amount) {
                        throw new httpErrors_1.HTTP400Error("BALANCENOTENOUGH");
                    }
                    console.log("before making payement");
                    const walletTransaction = yield this.payment(paymentBody);
                    console.log(walletTransaction.data.status);
                    if (!walletTransaction || !walletTransaction.data.status) {
                        throw new httpErrors_1.HTTP400Error("Wallet transaction failed");
                    }
                    return walletTransaction;
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Transaction failed");
                }
            }
            catch (e) {
                console.log("11error is", e);
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    fetchOneRandomQuestions(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield quiz_schema_1.Quiz.aggregate([
                {
                    $match: { _id: new bson_1.ObjectID(quizId) },
                },
                {
                    $unwind: { path: "$questions" },
                },
                {
                    $lookup: {
                        from: "questions",
                        let: {
                            categoryId: "$questions.category",
                            questionCount: 1,
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$categoryId", "$$categoryId"],
                                    },
                                },
                            },
                            {
                                $sample: { size: 1 },
                            },
                            {
                                $sort: { points: 1 },
                            },
                        ],
                        as: "question",
                    },
                },
                {
                    $unwind: { path: "$question" },
                },
                {
                    $project: Object.assign(Object.assign({}, utils_1.mongoDBProjectFields(this.questionFields, "question")), { _id: 0 }),
                },
            ]);
        });
    }
    guestStart(quizId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (helpers_1.isValidMongoId(quizId.toString())) {
                // let codeVerification = await this.verifyCode(quizId, code)
                let quiz = yield quiz_schema_1.Quiz.findById(quizId);
                if (!quiz.isFreebie) {
                    throw new httpErrors_1.HTTP400Error("Quiz is not free to play");
                }
                if (quiz) {
                    let questionsArray = [];
                    for (let condition of quiz.questions) {
                        let data = yield question_model_1.default.fetchRandomQuestions(condition);
                        questionsArray = lodash_1.default.concat(questionsArray, lodash_1.default.cloneDeep(data));
                    }
                    let newScore = {
                        userId: userId,
                        roomId: quizId,
                        score: 0,
                        questionsAnswered: [],
                        countCorrect: 0,
                    };
                    console.log(newScore);
                    let result = yield result_model_1.default.create(newScore);
                    questionsArray = lodash_1.default.shuffle(questionsArray);
                    return {
                        resultId: result._id,
                        questions: questionsArray,
                        length: questionsArray.length,
                    };
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Not a valid Quiz ID");
                }
            }
            else {
                throw new httpErrors_1.HTTP400Error("Not a valid mongoDB ID");
            }
        });
    }
    checkTimesUserPlayed(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield result_model_1.default.checkTimesUserPlayed(roomId, userId);
                return data;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    isUserRegistered(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let exist = yield ikcPool_schema_1.ikcPool.findOne({
                    $and: [{ userId: userId }, { roomId: roomId }],
                });
                return exist;
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    fetchWalletBalance(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                console.log("fetching wallet balance", phone);
                const wallet = yield axios_1.default({
                    method: "GET",
                    url: `${url}/wallet?apiKey=${apiKey}&phone=${phone}`,
                });
                console.log("wallet balance is ", wallet);
                if (wallet && wallet.data.status) {
                    console.log(wallet);
                    return wallet.data.payload.balance;
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Error fetching wallet balance");
                }
            }
            catch (e) {
                console.log("error in fetching wallet balance ", e.message);
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    payWithPaytm(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = process.env.IKCPLAYAPIKEY;
                const url = process.env.IKC_MASTER_WALLET_URI;
                // const quiz = await Quiz.findById(quizId);
                const user = yield user_schema_1.User.findById(userId);
                const transactionBody = {
                    phone: user.phone,
                    amount: amount,
                    type: "Payment",
                    description: "Buying IKC",
                    metadataType: "Debit",
                };
                const transactionData = yield this.transactions(userId, transactionBody);
                if (transactionData) {
                    transactionBody.transactionId = transactionData._id;
                    console.log(transactionBody.transactionId);
                    const res = yield axios_1.default({
                        method: "POST",
                        url: `${url}/paytm?apiKey=${apiKey}`,
                        data: Object.assign({}, transactionBody),
                    });
                    if (res) {
                        console.log(res);
                        return res.data;
                    }
                }
                else {
                    throw new httpErrors_1.HTTP400Error("Error while doing transaction for paytm");
                }
            }
            catch (e) {
                console.log(e);
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    checkQuizDates(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                if (quiz.startDate > Date.now()) {
                    throw new httpErrors_1.HTTP400Error(`Quiz is going to start on ${quiz.startDate}`);
                }
                if (quiz.endDate < Date.now()) {
                    throw new httpErrors_1.HTTP400Error(`Quiz has already ended`);
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    checkRegistrationDates(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                if (quiz.lastDateToRegister < Date.now()) {
                    throw new httpErrors_1.HTTP400Error("MISSEDREGISTRATIONDATE");
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    checkCurrentQuizDetails(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.checkRegistrationDates(roomId);
                const exist = yield this.isUserRegistered(roomId, userId);
                if (exist) {
                    throw new httpErrors_1.HTTP400Error("ALREADYREGISTERED");
                }
                // await this.checkQuizDates(roomId);
                return { proceed: true };
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    changeIcon(roomId, locationUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield quiz_schema_1.Quiz.findOneAndUpdate({ _id: roomId }, {
                    $set: { coverImage: locationUrl },
                }, { new: true });
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
    giveIKCBack(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                const transactions = yield transaction_model_1.default.fetchTransactionByQuizId(quiz);
                for (let i = 0; i < transactions.length; i++) {
                    const transaction = transactions[i];
                    const user = yield user_schema_1.User.findById(transaction.userId);
                    const IKCPlayer = yield ikcPool_schema_1.ikcPool.findOne({
                        $and: [{ roomId: roomId }, { userId: transaction.userId }],
                    });
                    if (IKCPlayer && IKCPlayer.status == "RETURNED") {
                        console.log(`Skipping IKC return for user ${transaction.userId}. Already returned`);
                        continue;
                    }
                    const transactionBody = {
                        phone: user.phone,
                        amount: quiz.poolAmount,
                        quizId: quiz._id,
                        type: "IKC",
                        description: `Giving Back IKC After dropping quiz ${quiz._id}`,
                        metadataType: "Credit",
                        userId: transaction.userId,
                    };
                    const transactionData = yield this.transactions(user._id, transactionBody);
                    // console.log(transactionData);
                    try {
                        const paymentBody = {
                            phone: user.phone,
                            amount: transactionData.amount,
                            userId: transactionData.userId,
                            isFreebie: false,
                            isPlatform: true,
                            description: transactionData.metadata.description,
                            transactionId: transactionData._id,
                        };
                        const masterTransaction = yield this.masterToWalletTransaction(paymentBody);
                        // console.log(masterTransaction);
                        if (!masterTransaction) {
                            throw new httpErrors_1.HTTP400Error("Master transaction failed");
                        }
                        yield this.updateIkcPoolStatus(roomId, transaction.userId);
                    }
                    catch (e) {
                        throw new httpErrors_1.HTTP400Error(e);
                    }
                }
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    updateIkcPoolStatus(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Updating pool status for user ", userId);
            let updated = yield ikcPool_schema_1.ikcPool.findOneAndUpdate({ $and: [{ userId: userId }, { roomId: roomId }] }, { status: "RETURNED" }, { new: true });
            if (!updated) {
                throw new httpErrors_1.HTTP400Error("Pool Update Failed");
            }
        });
    }
    getQuizByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findOne({ code: code }).select(this.default);
                console.log("quiz is ", quiz);
                if (!quiz)
                    throw new Error("Quiz not found");
                return quiz;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e.message);
            }
        });
    }
    changeTransactionStatus(transactionId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield transaction_model_1.default.changeStatusOfTransaction(transactionId, status);
                return data;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
}
exports.QuizModel = QuizModel;
exports.default = new QuizModel();
//# sourceMappingURL=quiz.model.js.map