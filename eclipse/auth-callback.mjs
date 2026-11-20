// Handle failed redirects without showing provider details or disturbing a
// successful PKCE callback, which must still be consumed by the auth SDK.
export function authFailure(value){
  const url=new URL(value),fragment=new URLSearchParams(url.hash.slice(1));
  const error=url.searchParams.get('error')||fragment.get('error');
  const code=url.searchParams.get('error_code')||fragment.get('error_code');
  if(!error&&!code)return null;
  for(const params of [url.searchParams,fragment])for(const key of ['error','error_code','error_description','code','access_token','refresh_token','token','state','sb'])params.delete(key);
  url.hash=fragment.toString();
  return {url:url.href,message:error==='access_denied'?'已取消登入，訪客紀錄仍然保留。':'登入未能完成，訪客紀錄仍然保留。請稍後重新登入。'};
}
