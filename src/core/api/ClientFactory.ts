import {AxiosInstance} from 'axios';
import {ApiResponse, IApiClientFactory} from './types';
import {AbstractAuthProvider} from './AbstractAuthProvider';
import axios from 'axios';
import {decorate, inject, injectable, optional} from 'inversify';
import {TYPES} from '../../iocTypes';

@injectable()
export class ApiClientFactory implements IApiClientFactory {

    constructor(
        public baseUrl: string,
        public defaultAuthProvider?: AbstractAuthProvider
    ) {
    }

    createClient(): AxiosInstance {
        const client = axios.create({
            baseURL: this.baseUrl
        });

        client.interceptors.response.use(
            (response: ApiResponse) => {
                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                return response;
            }
        );

        return client;
    }

    createClientWithAuth(authProvider?: AbstractAuthProvider): AxiosInstance {
        const client = this.createClient();
        const provider = this.getAuthProvider(authProvider);

        client.interceptors.request.use(
            config => provider.injectAuthData(config)
        );
        client.interceptors.response.use(
            undefined,
            error => {
                if (error) {
                    if (error.response.status === 401) {
                        provider.onFail();
                    }
                }
                return Promise.reject(error);
            }
        );

        return client;
    }

    private getAuthProvider(authProvider?: AbstractAuthProvider): AbstractAuthProvider {
        if (authProvider) {
            return authProvider;
        }

        if (this.defaultAuthProvider) {
            return this.defaultAuthProvider;
        }

        throw new Error('Auth provider not found');
    }
}

decorate(inject(TYPES.config.shikimoriHost) as ParameterDecorator, ApiClientFactory, 0);
decorate(inject(TYPES.ApiDefaultAuthProvider) as ParameterDecorator, ApiClientFactory, 1);
decorate(optional() as ParameterDecorator, ApiClientFactory, 1);
