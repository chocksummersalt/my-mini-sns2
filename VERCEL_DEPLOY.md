# Vercel 배포 가이드

## 환경 변수 설정 방법

Vercel에서 환경 변수를 설정하려면:

1. Vercel 대시보드 접속
2. 프로젝트 선택 > Settings > Environment Variables
3. 다음 환경 변수들을 추가:

```
REACT_APP_API_KEY=AIzaSyCJy_KNwAia5wXeWfIDYuig7xkbK7x9JWE
REACT_APP_AUTH_DOMAIN=my-mini-sns.firebaseapp.com
REACT_APP_PROJECT_ID=my-mini-sns
REACT_APP_STORAGE_BUCKET=my-mini-sns2.firebasestorage.app
REACT_APP_MESSAGING_SENDER_ID=19426165188
REACT_APP_APP_ID=1:19426165188:web:b15ad9f2bc1dec83ffa491
REACT_APP_MEASUREMENT_ID=G-31ZCKNXMLJ
```

4. **중요**: 각 환경 변수에 대해 다음 환경을 선택:
   - Production
   - Preview
   - Development

5. 환경 변수 추가 후 **Redeploy** 필수!

## 문제 해결

### 환경 변수가 적용되지 않는 경우:

1. **빌드 캐시 삭제**: Vercel 대시보드 > Settings > General > Clear Build Cache
2. **강제 재배포**: Deployments > 최신 배포 > ... > Redeploy
3. **환경 변수 이름 확인**: `REACT_APP_` 접두사 필수!
4. **빌드 로그 확인**: Deployments > 빌드 로그에서 환경 변수 주입 확인

## Storage 오류 해결

Firebase Storage 보안 규칙 설정:

1. Firebase 콘솔 > Storage > Rules
2. 다음 규칙 적용:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

