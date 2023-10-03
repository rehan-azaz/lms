import { Request, Response, NextFunction } from "express";
import Users, { IUser } from "../models/user.model";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../utils/sendMail";

interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registerUser = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body;

            if (!name) {
                return next(new ErrorHandler("Name is required!", 400));
            }

            if (!email) {
                return next(new ErrorHandler("Email is required!", 400));
            }

            if (!password) {
                return next(new ErrorHandler("Password is required!", 400));
            }

            const isEmailExist = await Users.findOne({ email });

            if (isEmailExist) {
                return next(new ErrorHandler("Email already in use!", 400));
            }

            const user: IRegisterUser = {
                name,
                email,
                password,
            };

            const activationToken = createActivationToken(user);

            const activationCode = activationToken.activationCode;

            const data = { user: { name: user.name }, activationCode };

            const html = await ejs.renderFile(
                path.join(__dirname, "../templates/mails/activation-email.ejs"),
                data
            );

            try {
                await sendMail({
                    email: user.email,
                    subject: "Activate your LMS account",
                    template: "activation-email.ejs",
                    data,
                });

                res.status(201).json({
                    status: true,
                    message: `Please check your email: ${user.email} to activate your account.`,
                    activationToken: activationToken.token,
                });
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 400));
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

interface IActivationToken {
    token: string;
    activationCode: string;
}

const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9999).toString();

    const token = jwt.sign(
        {
            user,
            activationCode,
        },
        process.env.ACTIVATION_SECRET as Secret,
        {
            expiresIn: "5m",
        }
    );
    return { token, activationCode };
};

interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { activation_token, activation_code } =
                req.body as IActivationRequest;

            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET as string
            ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Invalid activation code!", 400));
            }

            const { name, email, password } = newUser.user;

            const isEmailExist = await Users.findOne({ email });

            if (isEmailExist) {
                return next(new ErrorHandler("Email already in use!", 400));
            }

            const user = await Users.create({ name, email, password });

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);
