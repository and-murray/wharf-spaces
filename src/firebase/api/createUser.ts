import {Endpoints} from '@customTypes/Endpoints';
import {LogLevel, logMessage} from '@utils/Logging/Logging';
import User from '@customTypes/user';
import {getAppCheckToken} from '@firebase/api/functions';
import {getAccessTokens, signInSilently, getTokenID} from '@firebase/authentication/FirebaseGoogleAuthentication';

export async function createUser(
    endpoints: Endpoints): Promise<User> {
    const url = `${endpoints.genericAPIURL}/v1/user`;
    try {
        await signInSilently();
        const appCheckToken = await getAppCheckToken();
        const googleAccessToken = (await getAccessTokens()).accessToken;
        const bearerToken = await getTokenID();
        const options = {
            method: 'POST',
            headers: {
                'Firebase-AppCheck': appCheckToken,
                'Google-Access-Token': googleAccessToken,
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + bearerToken,
            },
        };
        const response = await fetch(url, options);
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
            return await response.json() as User;
        }
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
}
