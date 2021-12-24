import { NextFunction, Request, Response } from "express";
import userModel  from "./user.model";
import ResponseHandler from "../../lib/helpers/responseHandler";
import { user as msg } from "../../lib/helpers/customMessage";
import jwt from 'jsonwebtoken';
import { commonConfig } from "../../config";
import { IUser } from "./user.interface";
import { IUserModel } from "./user.schema";
import { HTTP400Error } from "../../lib/utils/httpErrors";

class UserController {
  public fetchAll = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      responseHandler.reqRes(req, res).onFetch(msg.FETCH_ALL, await userModel.fetchAll()).send();
    } catch (e) {
      // send error with next function.
      next(responseHandler.sendError(e));
    }
  };



  public create = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      // const data =  await userModel.add(req.body);
      console.log(req.body);
      // res.set("X-Auth")
      responseHandler
        .reqRes(req, res)
        .onCreate(msg.CREATED, await userModel.add(req.body), msg.CREATED_DEC)
        .send();
    } catch (e) {
      console.log(e);
      next(responseHandler.sendError(e));
    }
  };

  public fetch = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      responseHandler.reqRes(req, res).onCreate(msg.CREATED, await userModel.fetch(req.params.id), msg.CREATED_DEC).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      responseHandler.reqRes(req, res).onCreate(msg.UPDATED, await userModel.update(req.params.id, req.body)).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public delete = async (req:Request,res:Response,next:NextFunction)=>{
    const responseHandler = new ResponseHandler();

    try {
      await userModel.delete(req.params.id);
      responseHandler.reqRes(req, res).onCreate(msg.UPDATED).send();
    }catch(e){
      next(responseHandler.sendError(e));
    }
  }

  

  

  //   public adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    
  //     try {
  //       responseHandler
  //         .reqRes(req, res)
  //         .onFetch("The otp has been sent to your phone. Please verify", await userModel.login(req.body.phone, true))
  //         .send();
  //     } catch (e) {
  //       next(responseHandler.sendError(e));
  //     }
  //   };
  
  
  //   public searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    
  //     try {
  //       responseHandler.reqRes(req, res).onFetch(`Here are users`, await userModel.searchUsers(req.query)).send();
  //     } catch (e) {
  //       next(responseHandler.sendError(e));
  //     }
  //   };


  public loginViaSocialAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      let data = await userModel.loginViaSocialAccessToken(req.query);

      // if user never existed then make user and save it to database
      responseHandler.reqRes(req, res).onCreate("Sign up Complete", data).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public socialAuthAddPhone = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      responseHandler.reqRes(req, res).onFetch(`Phone Number added`, await userModel.addPhone(req.query)).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      const data = await userModel.verifyOtp(req.params.id, +req.query.otp);
      // res.set('X-Auth', data.token);
      responseHandler
        .reqRes(req, res)
        .onFetch("otp has been verified", data.token , "otp verified now you can go forward.")
        .send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public getLoggedUser = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      const user = await userModel.fetch(req.userId);

      responseHandler.reqRes(req, res).onFetch("User Data", user).send();
    } catch (e) {
      responseHandler.sendError(e);
    }
  };

  public addFollower = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      const data = await userModel.addFollower(req.params.id, req.body.user.id);

      responseHandler.reqRes(req, res).onCreate(msg.UPDATED, data).send();
    } catch (e) {
      responseHandler.sendError(e);
    }
  };

  public addFollowing = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      req.body.userId = req.userId;
      console.log(req.userId);
      const data = await userModel.addFollowing(req.params.id, req.body.userId);

      responseHandler.reqRes(req, res).onCreate(msg.UPDATED, data).send();
    } catch (e) {
      responseHandler.sendError(e);
    }
  };

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();

    try {
      const data = await userModel.signUp(req.body);

      responseHandler.reqRes(req, res).onCreate("Phone Number Added",data).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  // private createSendToken = async (req: Request, res: Response, next: NextFunction, user: any) => {
  //   const responseHandler = new ResponseHandler();
  //   let ikcbalance = await userModel.fetchWalletBalance(user._id);
  //   const token = this.signToken(user._id);
  //   // console.log(ikcbalance);
  //   // user.ikcbalance = ikcbalance;
  //   console.log(user);
  //   const data = {
  //     token,
  //     user,
  //     ikcbalance
  //   };
  //   responseHandler.reqRes(req, res).onCreate(msg.CREATED, data).send();
  // };

  // private signToken = (id: string) => {
  //   return jwt.sign({ id }, commonConfig.jwtSecretKey, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  // };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
   const responseHandler = new ResponseHandler();
    try {
      const user = await userModel.login(req.body);
        responseHandler.reqRes(req, res).onCreate('Login Successfully', user).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public addFolowRequest = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {

      if (req.userId) {
        const data = await userModel.addFollowRequest(req.params.id, req.userId);

        responseHandler.reqRes(req, res).onCreate(msg.UPDATED, data).send();
      }
    } catch (e) {
      responseHandler.sendError(e);
    }
  };

  public acceptFollowRequest = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      if (req.userId) {
        const data = await userModel.acceptFollowRequest(req.params.id, req.userId);

        responseHandler.reqRes(req, res).onCreate(msg.UPDATED, data).send();
      }
    } catch (e) {
      responseHandler.sendError(e);
    }
  };

  public isVerified = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      const data = await userModel.isUserVerified(req.userId);
      
      if (!data.proceed) {
        throw new HTTP400Error("NOTVERIFIED");
      } 
      next();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  };

  public generateOTP = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();

    try {
      const otp = await userModel.genrateOTP(req.body.phone);

      responseHandler.reqRes(req, res).onCreate("OTP sent", otp).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  }

  public addPhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
    const responseHandler = new ResponseHandler();
    try {
      const data = await userModel.addPhoneNumber(req.userId, req.query.phone);

      responseHandler.reqRes(req, res).onCreate("OTP Updated", data).send();
    } catch (e) {
      next(responseHandler.sendError(e));
    }
  }

  // public verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const responseHandler = new ResponseHandler();
  //   try {

  //     if (req.body.otp) {
  //       const result = await userModel.verifyUser(req.body.otp.otp.toString(), req.userId);

  //       if (result.proceed) {
  //         responseHandler.reqRes(req, res).onCreate("User Verified", res).send();
  //       } else {
  //         throw Error("User Not Verified");
  //       }
  //     } else {
  //       throw new Error("OTP not found");
  //     }
  //   } catch (e) {
  //     next(responseHandler.sendError(e));
  //   }
  // };
}

export default new UserController();

