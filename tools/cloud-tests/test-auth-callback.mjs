import assert from 'node:assert/strict';
import {authFailure} from '../../eclipse/auth-callback.mjs';

const root='https://wcy.hk/meow-revelation/';
for(const suffix of ['', '?v=preview', '?code=valid-pkce-code', '#access_token=successful-token&refresh_token=refresh']){
  assert.equal(authFailure(root+suffix),null,'Successful callbacks must remain available to the auth SDK');
}
const failure=authFailure(root+'?v=preview&error=server_error&error_code=unexpected_failure&error_description=private-detail#shape=front&error=server_error&error_description=private-detail&sb=');
assert.match(failure.message,/未能完成/);
assert.equal(failure.url,root+'?v=preview#shape=front');
assert.ok(!JSON.stringify(failure).includes('private-detail'));
assert.match(authFailure(root+'?error=access_denied').message,/取消/);
assert.match(authFailure(root+'#error=access_denied').message,/取消/);
assert.equal(authFailure(root+'?v=preview#error=server_error&code=private-code&access_token=private-token').url,root+'?v=preview');
console.log('Auth failure handling: query/fragment errors are explained, private callback details removed, and successful PKCE callbacks preserved.');
