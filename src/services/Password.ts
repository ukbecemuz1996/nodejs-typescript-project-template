import bcrypt from 'bcrypt';
class Password {
    private salt: string = '';
    private plainPassword: string = '';
    private hashedPassword: string = '';

    constructor(plainPassword: string) {
        this.plainPassword = plainPassword;
    }

    private async generateSalt() {
        this.salt = await bcrypt.genSalt(10);
    }

    public async hashPassword() {
        await this.generateSalt();
        this.hashedPassword = await bcrypt.hash(this.plainPassword, this.salt);
        return this.hashedPassword;
    }

    public getHashedPassword() {
        return this.hashedPassword;
    }

    public static async checkPassword(
        plainPassword: string,
        hashed: string
    ): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashed);
    }
}

export default Password;
