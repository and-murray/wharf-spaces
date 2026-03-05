import {Endpoints} from '@root/src/types/Endpoints';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
import User from '@customTypes/user';

export async function createUser(
    endpoints: Endpoints,
    appCheckToken: string,
    googleAccessToken: string,
    bearerToken: string): Promise<User> {
    const url = `${endpoints.genericAPIURL}/v1/user`;
    console.log(bearerToken);
    console.log(googleAccessToken);
    const options = {
        method: 'POST',
        headers: {
            'Firebase-AppCheck': appCheckToken,
            'Google-Access-Token': googleAccessToken,
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearerToken,
        },
    };
    console.log('Started Fetch');
    const response = await fetch(url, options);
    console.log('GOT RESULT');
    if (!response.ok) {
        let errorInfo;
        try {
            errorInfo = await response.json();
        } catch {
            errorInfo = response;
        }
        const error = new Error(`${response.status} ${JSON.stringify(errorInfo)}`);
        console.error(response);
        logMessage(LogLevel.error, error);
        return Promise.reject(error);
    } else {
        console.log('GOT RESULT SUCCESS');
        return await response.json() as User;
    }
}
