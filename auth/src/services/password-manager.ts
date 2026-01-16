import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordManager {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buff.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buff = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buff.toString('hex') === hashedPassword;
  }
}

// we will use cookies to transport our JWTs
// this is important in a SSR setup because we need to know
// auth information from the 1st request (in order to build the appropiate html page in the server with all the relevant info)
// and that is simply not possible to include
// with either a json body payload or an auth header during the initial request
// (in a SPA we would send that info in following requests, not the first one -
// - this usually happens after some JS has been fetched and it has been used to instruct the browser to include/append the JWT in headers/json body)

// remember cookies are stored in the browser and are sent with every request
// if you stored a JWT in say localStorage, you would need some javascript to retrieve it from there
// and then instruct the browser put it in an auth header -
// - and importantly, the javascript required to do this is not available before the first request)

// "what if the user is already logged in and tries to access the login route? if you send the token in the first request, nextJS would prevent you to access the login route before the page even loads and redirect you to a home page or wtv."
