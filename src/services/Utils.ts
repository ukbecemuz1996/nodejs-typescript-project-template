class Utils {
    public static exclude<T>(model: T, keys: (keyof T)[]) {
        for (let key of keys) {
            delete model[key];
        }
        return model;
    }
}
export default Utils;
