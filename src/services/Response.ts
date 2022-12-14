import { Response } from 'express';
import {
    ResponseStatus,
    TErrorResponse,
    TPage,
    TPaginatedSuccessResponse,
    TSuccessResponse,
} from '../types/response';

class ResponseBuilder<O> {
    private pResponse: Response;
    private pStatus: ResponseStatus = ResponseStatus.SUCCESS;
    private pObject: TSuccessResponse<O>;
    private pPaginatedObject: TPaginatedSuccessResponse<O>;
    private pError: string;
    private pIsPaginated: boolean = false;
    private pMessage: string;

    constructor(response: Response) {
        this.pResponse = response;
    }

    public message(message: string) {
        this.pMessage = message;
        return this;
    }

    public statusCode(status: ResponseStatus) {
        this.pStatus = status;
        return this;
    }

    public object(object: O | null) {
        if (!object) {
            this.statusCode(ResponseStatus.NOT_FOUND);
            this.error('Resource You Look For Is Not Found');
            return this;
        }
        this.pObject = {
            message: this.pMessage,
            data: object,
        };
        return this;
    }

    public paginate(data: O[], page: TPage) {
        this.pIsPaginated = true;
        this.pPaginatedObject = {
            ...page,
            data,
            message: this.pMessage,
        };

        return this;
    }

    public error(error: string) {
        this.pError = error;
        return this;
    }

    public done() {
        this.pResponse.status(this.pStatus);
        if (this.pError) {
            let error: TErrorResponse = {
                error: this.pError,
            };
            this.pResponse.json(error);
        } else if (this.pIsPaginated) {
            this.pResponse.json(this.pPaginatedObject);
        } else {
            this.pResponse.json(this.pObject);
        }
    }

    public exclude<Key extends keyof O>(keys: Key[]) {
        if (this.pIsPaginated) {
            for (const item of this.pPaginatedObject.data) {
                for (const key of keys) {
                    delete item[key];
                }
            }
        } else {
            for (let key of keys) {
                delete this.pObject.data[key];
            }
        }
        return this;
    }
}
export default ResponseBuilder;
