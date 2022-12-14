import Joi from 'joi';

class AuthSchema {
    public login(): Joi.ObjectSchema {
        return Joi.object({
            email: Joi.string().max(100).required(),
            password: Joi.string().min(6).max(20).required(),
        });
    }

    public signup() {
        return Joi.object({
            email: Joi.string().email().required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            username: Joi.string().min(8).max(20).required(),
            password: Joi.string().min(8).max(20).required(),
        });
    }
}
export default AuthSchema;
