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
const leaderboard_schema_1 = require("./leaderboard.schema");
const result_schema_1 = require("../result/result.schema");
const quiz_schema_1 = require("../quiz/quiz.schema");
const mongoose_1 = __importDefault(require("mongoose"));
const httpErrors_1 = require("../../lib/utils/httpErrors");
class LeaderBoardModel {
    constructor() {
        this.default = "roomId last_count result";
        this.FieldsofQuizRoom = "title maxScore timeAlloted level category icon metadata visibility poolamount startDate endDate isFreebie";
        this.leaderboardFields = {
            "result.score": 1,
            resultId: 1,
            clientId: 1,
            roomId: 1,
        };
        this.fieldsOfUser = "firstName lastName avatar userName createdAt email _id";
    }
    buildResultTemplate(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                roomId: roomId,
                result: [
                    {
                        avatar: "",
                        userName: "",
                        score: 0,
                        time: new Date(),
                        prize: 0,
                    },
                ],
                last_count: new Date(),
            };
        });
    }
    countResult(results, startingPoint) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsArray = [];
            for (let result of results) {
            }
            startingPoint.result = resultsArray;
            return startingPoint;
        });
    }
    fetchResults(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield result_schema_1.Result.aggregate([
                {
                    $match: { roomId: new mongoose_1.default.Types.ObjectId(roomId) },
                },
                {
                    $group: {
                        _id: "$userId",
                        plays: { $sum: 1 },
                        score: { $max: "$score" },
                    },
                },
                {
                    $sort: { score: -1 },
                },
                // {
                //   $unwind: {
                //     path: "$rows",
                //     includeArrayIndex: "position"
                //   },
                // },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$userDetails",
                    },
                },
                {
                    $project: {
                        playerName: {
                            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
                        },
                        playerPic: "$userDetails.avatar",
                        country: "$userDetails.country",
                        plays: 1,
                        points: '$score',
                        position: '$position',
                    },
                },
            ]);
            console.log("result is ", results);
            results.forEach((result, index) => {
                results[index].position = index + 1;
            });
            console.log("result userId ", results);
            return results;
        });
    }
    getAwardResults(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield leaderboard_schema_1.LeaderBoard.findOne({
                roomId: roomId,
            });
            // .populate("roomId", this.FieldsofQuizRoom);
            console.log("room id is ", roomId);
            console.log("async section complete " + data);
            let update = false;
            if (0) { //!to do important
                console.log("data was found already existing");
                let timeDelta = new Date().getTime() - data.last_count;
                timeDelta = timeDelta / 1000;
                console.log(timeDelta);
                if (timeDelta < 300) {
                    console.log("Returning Cached Results");
                    return data;
                }
                // else count votes
                console.log("Re-Calc Award Poll Results");
                update = true;
            }
            const timeNow = new Date().getTime();
            // const results = await Result.find({
            //     roomId: roomId
            // }).sort({ score: -1 }).lean();
            const results = yield this.fetchResults(roomId);
            const quizData = (yield quiz_schema_1.Quiz.findById(roomId));
            const startingPoint = yield this.buildResultTemplate(quizData._id);
            const board = yield this.countResult(results, startingPoint);
            board.last_count = timeNow;
            board.roomId = roomId;
            board.result = results;
            console.log("board is ", board);
            let newBoard;
            if (update) {
                const leaderBoardId = data._id;
                newBoard = (yield leaderboard_schema_1.LeaderBoard.findOneAndUpdate({ _id: leaderBoardId }, board, { new: true }));
            }
            else {
                console.log("Adding Document");
                const newResult = new leaderboard_schema_1.LeaderBoard(board);
                newBoard = yield newResult.save();
                const roomDetails = yield quiz_schema_1.Quiz.findOne({ _id: roomId }, this.FieldsofQuizRoom);
                // newBoard.roomDetails = roomDetails;
            }
            console.log("new board", newBoard);
            newBoard = newBoard.toJSON();
            return Object.assign({}, newBoard);
        });
    }
    // public async MasterTransaction(userId: string, body: any) {
    //     try {
    //         const transactionBody = {
    //             amount: body.amount,
    //             quizId: body.quizId,
    //             type: "Payment",
    //             description: `50% of Quiz ${body.quizId}`,
    //             metadataType: "Credit",
    //         }
    //         console.log(transactionBody);
    //         const user = await User.findById(userId);
    //         console.log(user);
    //         const transactiondetails = await quizModel.transactions(userId, transactionBody);
    //         if (transactiondetails._id) {
    //             const paymentBody = {
    //                 phone: user.phone,
    //                 amount: transactiondetails.amount,
    //                 // userId: transactiondetails.userId,
    //                 isPlatform: true,
    //                 isFreebie: false,
    //                 description: transactiondetails.metadata.description,
    //                 transactionId: transactiondetails._id
    //             }
    //             const walletTransaction = await quizModel.payment(paymentBody);
    //             console.log(walletTransaction.data.status);
    //             if (!walletTransaction || !walletTransaction.data.status) {
    //                 throw new HTTP400Error("Wallet transaction failed");
    //             }
    //         } else {
    //             throw new HTTP400Error("Transaction failed");
    //         }
    //     } catch (e) {
    //         throw new HTTP400Error(e.message);
    //     }
    // }
    leaderboardAlgorithm(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz = yield quiz_schema_1.Quiz.findById(roomId);
                const numberofplayer = quiz.totalRegistrations;
                const numberofwinner = quiz.metadata.maxWinner;
                const entryamount = quiz.poolAmount;
                const totalMoney = numberofplayer * entryamount;
                const masterWalletMoney = 0.05 * totalMoney;
                const pollAmount = Math.floor(totalMoney - 0.05 * totalMoney);
                const minPrize = entryamount;
                console.log(numberofplayer, numberofwinner, entryamount);
                const a = 1.2;
                let maxPrize = pollAmount - numberofwinner * minPrize;
                console.log("maxPrice" + maxPrize);
                let totalDist = 0;
                let prizes = [];
                for (let i = numberofwinner; i > 0; i--) {
                    const priceOfIthPlayer = Math.floor((maxPrize - minPrize) / Math.pow(i, a));
                    totalDist += priceOfIthPlayer + minPrize;
                    prizes[i - 1] = priceOfIthPlayer + minPrize;
                    maxPrize -= priceOfIthPlayer;
                }
                let remain = pollAmount - totalDist;
                totalDist = 0;
                let equilizer = 1;
                for (let i = 1; i <= numberofwinner; i++) {
                    equilizer *= 2;
                    prizes[i - 1] += Math.floor(remain / equilizer);
                    totalDist += prizes[i - 1];
                }
                prizes[0] += pollAmount - totalDist;
                console.log(roomId + " " + prizes);
                prizes.sort(function (a, b) {
                    return b - a;
                });
                return prizes;
            }
            catch (e) {
                throw new httpErrors_1.HTTP400Error(e);
            }
        });
    }
}
exports.default = new LeaderBoardModel();
//# sourceMappingURL=leaderboard.model.js.map