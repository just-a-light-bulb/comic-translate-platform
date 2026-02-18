### **Quick start**

Securely integrate a new or existing application to the Kinde platform

**Technology[Change technology](https://alightbump.kinde.com/admin/cx/_:action&tab:existing&intent:edit_technology::_:nav&m:application_details::_:submenu&s:quick_start&id:<xxxx>)**

**SvelteKit**

1. [Starter kit](https://alightbump.kinde.com/admin/cx/_:action&tab:new::_:nav&m:application_details::_:submenu&s:quick_start&id:<xxxx>)
2. [**Existing codebase**](https://alightbump.kinde.com/admin/cx/_:action&tab:existing::_:nav&m:application_details::_:submenu&s:quick_start&id:<xxxx>)

## **Where is your project running?**

The URLs used in this guide are based on this value

http://localhost:5173 [**Edit**](https://alightbump.kinde.com/admin/cx/_:action&tab:existing&intent:edit_site_url::_:nav&m:application_details::_:submenu&s:quick_start&id:<xxxx>)

## **Add the Kinde SvelteKit SDK to your project**

Install the `@kinde-oss/kinde-auth-sveltekit` dependency

**`npx nypm add @kinde-oss/kinde-auth-sveltekit`**

## **Update environment vars**

Create a `.env` file in the root of your project and copy/paste the below values into it

```
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=https:/<xxx>.kinde.com
KINDE_REDIRECT_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=
KINDE_SCOPE="profile email offline openid"
```

## **Integrate with your app**

Implement `sessionHooks` in your hooks.

\*\*`// src/hooks.server.ts
import { sessionHooks, type Handler } from "@kinde-oss/kinde-auth-sveltekit";

export const handle: Handler = async ({ event, resolve }) => {
sessionHooks({ event });
const response = await resolve(event);
return response;
};`\*\*

Then implement the Kinde routes in your app by creating a server file.

\*\*`// src/routes/api/auth/[...kindeAuth]/+server.ts
import {handleAuth} from "@kinde-oss/kinde-auth-sveltekit";
import type {RequestEvent} from "@sveltejs/kit";

export function GET(requestEvents: RequestEvent) {
return handleAuth(requestEvents);
};`\*\*

This will handle Kinde Auth endpoints in your SvelteKit app.

## **Add sign up and sign in buttons**

The SDK ships with predefined API routes to generate the auth urls for sign up and sign in.

**`<a href="/api/auth/login">Sign in</a>
<a href="/api/auth/register">Sign up</a>`**

## **Open your project in a browser**

You should see sign in and registration buttons

## **Sign up your first user**

Register your first user and view their profile on the [**Users page**](https://alightbump.kinde.com/admin/cx/_:nav&m:users::_:submenu&s:list)

## **What’s next?**

Explore all of Kinde’s functions in the SDK docs

[**View SvelteKit docs**](https://kinde.com/docs/developer-tools/sveltekit-sdk/)

---

# **SvelteKit SDK**

Kinde SvelteKit SDK allows developers to integrate Kinde Authentication into their SvelteKit projects. This SDK implements the following OAuth 2.0 flows.

- Authorization Code - Intended for confidential clients for e.g. web-servers
- Authorization Code with PKCE extension - For public clients for e.g. single page web application and or mobile applications, and confidential clients for e.g. web-servers.
- Client Credentials Flow - Intended for confidential clients, where machine to machine communication is required.

For new project, you can find our [Svelte Starter Kit](https://github.com/kinde-starter-kits/sveltekit-starter-kit)

**Requirements**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#requirements)

- Node version 18.16.x or newer

**Register for Kinde**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#register-for-kinde)

If you haven’t already got a Kinde account, [register for free here](https://app.kinde.com/register) (no credit card required). Registering gives you a Kinde domain, which you need to get started, e.g. `yourapp.kinde.com`.

**Install**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#install)

- [**npm**](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#tab-panel-77)
- [yarn](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#tab-panel-78)
- [pnpm](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#tab-panel-79)

**Terminal window**

`npm i @kinde-oss/kinde-auth-sveltekit`

**Configure Kinde**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#configure-kinde)

**Set callback URLs**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#set-callback-urls)

1. In Kinde, go to **Settings > Applications** and then navigate to the relevant **frontend app** or **backend app**.
2. Add your callback URLs in the relevant fields. For example:
   - Allowed callback URLs (also known as redirect URIs): `https://<your_app_domain>/api/auth/kinde_callback`
     e.g: `http://localhost:5173/api/auth/kinde_callback`
   - Allowed logout redirect URLs:
     `https://<your_app_domain>`
     e.g:`http://localhost:5173`
3. Select **Save**.

**Add environments**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#add-environments)

Kinde comes with a production environment, but you can set up other environments if you want to. Each environment has a unique subdomain so be sure to use the correct one in the **Configure your app section** which follows.

**Configure your app**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#configure-your-app)

**Environment variables**

Put these variables in your `.env` file. You can find these variables on your **Settings > Applications > [Your app] > View details** page.

- `KINDE_ISSUER_URL` - your Kinde domain
- `KINDE_CLIENT_ID` - your Kinde Client ID
- `KINDE_CLIENT_SECRET` - your Kinde Client secret. Leave this field empty if you are using Authentication Code Flow with PKCE
- `KINDE_REDIRECT_URL` - this is the URL Kinde will redirect to after the authentication process. Note that the Kinde `api/auth/kinde_callback` path must be included in the URL (see example below). You also need to make sure this URL is included in your list of **Allowed callback URLs**.
- `KINDE_POST_LOGOUT_REDIRECT_URL` - Specify the destination where you want users to be redirected to after logging out. Make sure this URL is listed under your **Allowed logout redirect URLs**.
- `KINDE_POST_LOGIN_REDIRECT_URL`the URL users will be redirected to after signing in.
- `KINDE_AUTH_WITH_PKCE` - Set `true` if you want to use Authentication Code Flow with PKCE

Below is an example of a `.env` file

**Terminal window**

`KINDE_ISSUER_URL=https://<your_kinde_subdomain>.kinde.comKINDE_CLIENT_ID=<your_kinde_client_id>KINDE_CLIENT_SECRET=<your_kinde_client_secret>KINDE_REDIRECT_URL=http://localhost:5173/api/auth/kinde_callbackKINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:5173KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:5173/dashboardKINDE_AUTH_WITH_PKCE=true // Set `true` if you want to use Authentication Code Flow with PKCE`

**Integrate with your app**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#integrate-with-your-app)

Implement `sessionHooks` in your hooks.

src/hooks.server.ts

`import { sessionHooks, type Handler } from '@kinde-oss/kinde-auth-sveltekit';...
export const handle: Handler = async ({ event, resolve }) => {  ...  sessionHooks({ event });  const response = await resolve(event);  return response;};`

Then implement the Kinde routes in your app by creating a server file.

src/routes/api/auth/[...kindeAuth]/+server.ts

`import {handleAuth} from "@kinde-oss/kinde-auth-sveltekit";import type {RequestEvent} from "@sveltejs/kit";
export function GET(requestEvents: RequestEvent) {  return handleAuth(requestEvents);}`

This will handle Kinde Auth endpoints in your SvelteKit app.

- `/api/auth/login` - will redirect you to login at the KindeAuth server.
- `/api/auth/logout` - will log you out of the app.
- `/api/auth/register` - will redirect you to register at the KindeAuth server.
- `/api/auth/kinde_callback` - the endpoint to handle the redirect after logging in from Kinde
- `/api/auth/health` - See Health Below

**Sign in and sign up (login and register)**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#sign-in-and-sign-up-login-and-register)

The SDK ships with predefined API routes to generate the auth urls for sign up and sign in.

`<ul>  <li>    <a href="/api/auth/login">Sign in</a>  </li>  <li>    <a href="/api/auth/register">Sign up</a>  </li></ul>`

**Direct users post login / registration**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#direct-users-post-login--registration)

In addition to `KINDE_POST_LOGIN_REDIRECT_URL` which will direct your users to a single place, you direct the users more granularly.

Both login and register support passing a url param `post_login_redirect_url` which will direct the user once the flow is completed.

`<a class="btn btn-ghost sign-in-btn" href="/api/auth/login?post_login_redirect_url=/custom_url">  Sign in</a>`

**Support for custom sign in pages**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#support-for-custom-sign-in-pages)

To build a custom login screen, you need to pass in the `login_hint` and `connection_id` to the URL. You can use the following:

`<li>    <a href="/api/auth/login?login_hint=name@domain.com&connection_id=conn_01996ec8fe62d014cc093caf3e23xxxx">Sign in</a>  </li>`

**Log out**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#log-out)

This is implemented in much the same way as signing up or signing in. An API route is provided for you

`<a href="/api/auth/logout"> Sign out </a>`

**Check if the user is authenticated**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#check-if-the-user-is-authenticated)

We’ve provided a helper to get a boolean value that checks if a user is signed in by verifying that the access token is valid.

+layout.server.ts

`...import {kindeAuthClient, type SessionManager} from '@kinde-oss/kinde-auth-sveltekit';import type {RequestEvent} from '@sveltejs/kit';
export async function load({request}: RequestEvent) {  const isAuthenticated = await kindeAuthClient.isAuthenticated(    request as unknown as SessionManager  ); // Boolean: true or false  if (isAuthenticated) {    // Need to implement, e.g: call an api, etc...  } else {    // Need to implement, e.g: redirect user to sign in, etc..  }
  ...  return {    isAuthenticated  };}`

**View user profile**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#view-user-profile)

You need to have already authenticated before you call the API, otherwise an error will occur.

To access the user information, use the `getUser` helper function:

`await kindeAuthClient.getUser(request as unknown as SessionManager);// returns{  "given_name":"Dave",  "id":"kp_12345678910",  "family_name":"Smith",  "email":"dave@smith.com",  "picture": "https://link_to_avatar_url.kinde.com"}`

**Health check**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#health-check)

To check your configuration, the SDK exposes an endpoint with your settings.

`/api/auth/health`

**Note**: The client secret will indicate only if the secret is set or not set correctly.

To enable set the `KINDE_DEBUG` environment variable to `true`

`KINDE_DEBUG = true;`

`{  "authDomain": "https://danielkinde.kinde.com",  "clientId": "0eb39a3b1cd64e99b4461d9660f7b97c",  "logoutRedirectURL": "http://localhost:5173",  "redirectURL": "http://localhost:5173/api/auth/kinde_callback",  "audience": "",  "scope": "profile email openid",  "clientSecret": "Set correctly",  "loginRedirectURL": "http://localhost:5173",  "authUsePKCE": false,  "version": "1710935446027",  "framework": "sveltekit"}`

**View users in Kinde**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#view-users-in-kinde)

If you navigate to the “**Users**” page within Kinde you will see your newly registered user there.

**Audience**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#audience)

An `audience` is the intended recipient of an access token - for example the API for your application. The `audience` argument can be set against `KINDE_AUDIENCE` in your environment variables.

The audience of a token is the intended recipient of the token.

.env

`KINDE_AUDIENCE = your_audience;`

For details on how to connect, see [Register an API](https://docs.kinde.com/developer-tools/your-apis/register-manage-apis/)

**Overriding scope**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#overriding-scope)

By default the `KindeSDK` requests the following scopes:

- profile
- email
- offline
- openid

To override this, you can set the value against the `KINDE_SCOPE` in your environment variables.

.env

`KINDE_SCOPE=profile email offline openid`

**Organizations**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#organizations)

**Create an organization**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#create-an-organization)

To create a new organization within your application, set up the following route:

`<a href="/api/auth/create_org?org_name={<org_name>}">  Create org</a>`

**Sign up and sign in to organizations**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#sign-up-and-sign-in-to-organizations)

The Kinde client provides methods for you easily sign up and sign in users into organizations. You can add links in your HTML as follows:

`<a href="/api/auth/login?org_code={<your_org_code>}">Sign in</a><a href="/api/auth/register?org_code={<your_org_code>}">Sign up</a>`

Following authentication, Kinde provides a json web token (JWT) to your application. Along with the standard information we also include the `org_code` and the permissions for that organization (this is important as a user can belong to multiple organizations and have different permissions for each).

Example of a returned token:

`{  "aud": [],  "exp": 1658475930,  "iat": 1658472329,  "iss": "https://your_subdomain.kinde.com",  "jti": "123457890",  "org_code": "org_1234",  "permissions": ["read:todos", "create:todos"],  "scp": ["openid", "profile", "email", "offline"],  "sub": "kp:123457890"}`

The `id_token` will also contain an array of organizations that a user belongs to - this is useful if you wanted to build out an organization switcher for example.

`[    ...    "org_codes": ["org_1234", "org_4567"]    ...];`

There are two helper functions you can use to extract information:

`await kindeAuthClient.getOrganization(request as unknown as SessionManager);// { orgCode: 'org_1234' }
await kindeAuthClient.getUserOrganizations(request as unknown as SessionManager);// { orgCodes: ['org_1234', 'org_abcd'] }`

**User permissions**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#user-permissions)

Once a user has been verified, your product/application will return the JWT with an array of permissions for that user. You will need to configure your product/application to read permissions and unlock the respective functions.

[Set permissions](https://docs.kinde.com/manage-users/roles-and-permissions/user-permissions/) in your Kinde account. Here’s an example set of permissions.

`const permissions = [  "create:todos",  "update:todos",  "read:todos",  "delete:todos",  "create:tasks",  "update:tasks",  "read:tasks",  "delete:tasks];`

We provide helper functions to more easily access the permissions claim:

`await kindeAuthClient.getPermission(request as unknown as SessionManager, "create:todos");// { orgCode: 'org_1234', isGranted: true }
await kindeAuthClient.getPermissions(request as unknown as SessionManager);// { orgCode: 'org_1234', permissions: ['create:todos', 'update:todos', 'read:todos'] }`

**Getting claims**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getting-claims)

We have provided a helper to grab any claim from your id or access tokens. The helper defaults to access tokens:

`await kindeAuthClient.getClaim(request as unknown as SessionManager, "aud"); // { name: "aud", value: ["local-testing@kinde.com"] }
await kindeAuthClient.getClaimValue(request as unknown as SessionManager, "aud"); // ["local-testing@kinde.com"]
await kindeAuthClient.getClaim(request as unknown as SessionManager, "email", "id_token"); // { name: "email", value: "first.last@test.com" }
await kindeAuthClient.getClaimValue(request as unknown as SessionManager, "email", "id_token"); // "first.last@test.com`

**Feature flags**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#feature-flags)

We have provided a helper to grab any feature flag from `access_token`:

`await kindeAuthClient.getFlag(request as unknown as SessionManager, 'theme')// returns{  "is_default": false  "value": "pink",  "code": "theme",  "type": "string",}
await kindeAuthClient.getFeatureFlag(request as unknown as SessionManager, 'no-feature-flag')// returns// Error: "Flag no-feature-flag was not found, and no default value has been provided"
await kindeAuthClient.getFeatureFlag(request as unknown as SessionManager, 'no-feature-flag', 'default-value')// returns{  "is_default": true  "code": "no-feature-flag",  "value": "default-value",}
await kindeAuthClient.getFeatureFlag(request as unknown as SessionManager, 'theme', 'default-theme', 'b')// returns// Error: "Flag theme is of type string, expected type is boolean"`

We also require wrapper functions by type which should leverage `getFlag` above.

**Get boolean flags**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#get-boolean-flags)

`/** * Get a boolean flag from the feature_flags claim of the access_token. * @param {Object} request - Request object * @param {String} code - The name of the flag. * @param {Boolean} [defaultValue] - A fallback value if the flag isn't found. * @return {Boolean} */await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, code, defaultValue);
await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, "is_dark_mode");// true
await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, "is_dark_mode", false);// true
await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, "new_feature");// Error - flag does not exist and no default provided
await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, "new_feature", false);// false (flag does not exist so falls back to default)
await kindeAuthClient.getBooleanFlag(request as unknown as SessionManager, "theme", "blue");// Error - Flag "theme" is of type string not boolean`

**Get string flags**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#get-string-flags)

`/** * Get a string flag from the feature_flags claim of the access_token. * @param {Object} request - Request object * @param {String} code - The name of the flag. * @param {String} [defaultValue] - A fallback value if the flag isn't found. * @return {String} */await kindeAuthClient.getStringFlag(request as unknown as SessionManager, code, defaultValue);
/* Example usage */await kindeAuthClient.getStringFlag(request as unknown as SessionManager, "theme");// pink
await kindeAuthClient.getStringFlag(request as unknown as SessionManager, "theme", "black");// true
await kindeAuthClient.getStringFlag(request as unknown as SessionManager, "cta_color");// Error - flag does not exist and no default provided
await kindeAuthClient.getStringFlag(request as unknown as SessionManager, "cta_color", "blue");// blue (flag does not exist so falls back to default)
await kindeAuthClient.getStringFlag(request as unknown as SessionManager, "is_dark_mode", false);// Error - Flag "is_dark_mode" is of type boolean not string`

**Get integer flags**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#get-integer-flags)

`/** * Get an integer flag from the feature_flags claim of the access_token. * @param {Object} request - Request object * @param {String} code - The name of the flag. * @param {Integer} [defaultValue] - A fallback value if the flag isn't found. * @return {Integer} */await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, code, defaultValue);
await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, "competitions_limit");// 5
await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, "competitions_limit", 3);// 5
await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, "team_count");// Error - flag does not exist and no default provided
await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, "team_count", 2);// false (flag does not exist so falls back to default)
await kindeAuthClient.getIntegerFlag(request as unknown as SessionManager, "is_dark_mode", false);// Error - Flag "is_dark_mode" is of type boolean not integer`

**Token storage**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#token-storage)

After the user has successfully logged in, you will have a JSON Web Token (JWT) and a refresh token securely stored. You can retrieve an access token using the `getToken` method.

`const access_token = await kindeAuthClient.getToken(request as unknown as SessionManager);`

**Kinde Management API**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#kinde-management-api)

To use our management API please see [@kinde/management-api-js](https://github.com/kinde-oss/management-api-js)

**SDK API reference**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#sdk-api-reference)

**`login`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#login)

Constructs redirect url and sends user to Kinde to sign in.

**Usage:**

`sdk.login();`

**`register`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#register)

Constructs redirect url and sends user to Kinde to sign up.

**Usage:**

`sdk.register();`

**`logout`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#logout)

Logs the user out of Kinde.

**Usage:**

`sdk.logout();`

**`isAuthenticated`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#isauthenticated)

Checks if the user is authenticated.

**Usage:**

`sdk.isAuthenticated();`

**Sample output:**

`true or false`

**`createOrg`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#createorg)

Constructs redirect url and sends the user to Kinde to sign up and creates a new org for your business.

**Arguments:**

 `options?: CreateOrgURLOptions {   org_name?: "string";   org_code?: "string";   state?: "string";}`

**Usage:**

`sdk.createOrg(  org_name: "org_1234");`

**`getClaim`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getclaim)

Extracts the provided claim from the provided token type in the current session, the returned object includes the provided claim.

**Arguments:**

`claim: "string",tokenKey?: TokenType "access_token" | "id_token`

**Usage:**

`sdk.getClaim(claim:"given_name", tokenType: TokenType);`

**`getPermission`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getpermission)

Returns the state of a given permission.

**Arguments:**

 `key: "string`

**Usage:**

`sdk.getPermission("permission");`

**Sample output:**

`{ orgCode : 'org_1234', isGranted : true}`

**`getPermissions`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getpermissions)

Returns all permissions for the current user for the organization they are logged into.

**Usage:**

`sdk.getPermissions();`

**Sample output:**

`{ orgCode : 'org_1234', permissions : ['create:todos', 'update:todos', 'read:todos'] }`

**`getOrganization`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getorganization)

Get details for the organization your user is logged into.

**Usage:**

`sdk.getOrganization();`

**Sample output:**

`{ orgCode : 'org_1234' }`

**`getUserOrganizations`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getuserorganizations)

Gets an array of all organizations the user has access to.

**Usage:**

`sdk.getUserOrganizations();`

**Sample output:**

`{ orgCodes: ['org_7052552de68', 'org_5a5c29381327'] }`

**`getUser`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getuser)

Extracts the user details from the ID token obtained after authentication.

**Usage:**

`sdk.getUser();`

**Sample output:**

`{"id":"kp_12345678910","preferredEmail":"dave@smith.com","lastName":"smith","firstName":"dave",}`

**`getToken`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#gettoken)

Returns the access token obtained after authentication.

**Usage:**

`sdk.getToken();`

**Sample output:**

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    .eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ    .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c;`

---

**`getUserProfile`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getuserprofile)

Makes use of the `getToken` method above to fetch user details.

**Usage:**

`sdk.getUserProfile();`

**Sample output:**

`{ given_name: 'Dave', id: 'abcdef', family_name : 'Smith', email : 'mailto:dave@smith.com' }`

**`getFlag`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getflag)

Get a flag from the feature_flags claim of the `access_token`

**Arguments:**

`code : "string"defaultValue? :  FlagType[keyof FlagType]flagType? : [key of FlagType]
interface FlagType {    s: string;    b: boolean;    i: number;}interface GetFlagType {    type?: 'string' | 'boolean' | 'number';    value: FlagType[keyof FlagType];    is_default: boolean;    code: "string";}`

**Usage:**

`sdk.getFlag(code:"theme");`

**Sample output:**

`{ "code": "theme", "type": "string", "value": "pink", "is_default": false }`

**`getBooleanFlag`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getbooleanflag)

Get a boolean flag from the feature_flags claim of the `access_token`

**Arguments:**

`code : "string"defaultValue? :  boolean`

**Usage:**

`sdk.getBooleanFlag(code:"is_dark_mode");`

**Sample output:**

`true or false`

**`getStringFlag`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getstringflag)

Get a string flag from the feature_flags claim of the `access_token`

**Arguments:**

`code : "string"defaultValue? :  "string`

**Usage:**

`sdk.getStringFlag(code:"theme");`

**Sample output:**

`pink`

**`getIntegerFlag`**[Link to this section](https://docs.kinde.com/developer-tools/sdks/backend/sveltekit-sdk/#getintegerflag)

Get an integer flag from the feature_flags claim of the `access_token`

**Arguments:**

`code : "string"defaultValue? :  number`

**Usage:**

`sdk.getIntegerFlag(code:"team_count");`

**Sample output:**

`2`
