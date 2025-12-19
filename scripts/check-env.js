// 빌드 전 환경 변수 확인 스크립트
// 환경 변수가 없어도 빌드는 계속하되 경고만 표시합니다
const requiredEnvVars = [
  'REACT_APP_API_KEY',
  'REACT_APP_AUTH_DOMAIN',
  'REACT_APP_PROJECT_ID',
  'REACT_APP_STORAGE_BUCKET',
  'REACT_APP_MESSAGING_SENDER_ID',
  'REACT_APP_APP_ID',
  'REACT_APP_MEASUREMENT_ID'
];

const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production';

console.log('🔍 환경 변수 확인 중...');
console.log('현재 환경:', process.env.NODE_ENV || 'development');
console.log('Vercel 환경:', isVercel ? '예' : '아니오');

const missingVars = [];
const presentVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName);
    console.log(`✅ ${varName}: 설정됨`);
  } else {
    missingVars.push(varName);
    console.warn(`⚠️  ${varName}: 없음`);
  }
});

if (missingVars.length > 0) {
  console.warn('\n⚠️  일부 환경 변수가 설정되지 않았습니다!');
  console.warn('누락된 변수:', missingVars.join(', '));
  console.warn('\nVercel 환경 변수 설정 방법:');
  console.warn('1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables');
  console.warn('2. 다음 변수들을 추가하세요:');
  missingVars.forEach(varName => {
    console.warn(`   - ${varName}`);
  });
  console.warn('3. 각 변수에 Production, Preview, Development 모두 체크');
  console.warn('4. 환경 변수 추가 후 반드시 Redeploy 필요!');
  console.warn('\n⚠️  환경 변수가 없으면 런타임에서 오류가 발생할 수 있습니다.');
  console.warn('빌드는 계속하지만, 환경 변수를 설정하는 것을 권장합니다.');
} else {
  console.log('\n✅ 모든 환경 변수가 설정되었습니다!');
}

console.log('빌드를 계속합니다...');

