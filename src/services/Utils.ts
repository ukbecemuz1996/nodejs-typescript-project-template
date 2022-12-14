class Utils {
    public static exclude<T>(model: T, keys: (keyof T)[]) {
        for (let key of keys) {
            delete model[key];
        }
        return model;
    }

    public static apiPath(endpoint: string, parents: string[]) {
        const parent = '/api';
        const version = '/' + (process.env.API_VERSION || 'v1');
        let path = parent + version;

        for (const parent of parents) {
            path += '/' + parent;
        } 

        path += endpoint;

        console.log(path);
        
        return path;
    }
}
export default Utils;
