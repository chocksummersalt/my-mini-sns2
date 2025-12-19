// 빌드 전 환경 변수 확인 스크립트
// Vercel에서만 환경 변수를 체크하고, 로컬에서는 .env 파일을 사용합니다
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

// Vercel에서만 환경 변수 체크 (로컬에서는 .env 파일 사용)
if (isVercel || isProduction) {
  const missingVars = [];
  const presentVars = [];

  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
      console.log(`✅ ${varName}: 설정됨`);
    } else {
      missingVars.push(varName);
      console.error(`❌ ${varName}: 없음`);
    }
  });

  if (missingVars.length > 0) {
    console.error('\n❌ 필수 환경 변수가 누락되었습니다!');
    console.error('누락된 변수:', missingVars.join(', '));
    console.error('\nVercel 환경 변수 설정 방법:');
    console.error('1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables');
    console.error('2. 다음 변수들을 추가하세요:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('3. 각 변수에 Production, Preview, Development 모두 체크');
    console.error('4. 환경 변수 추가 후 반드시 Redeploy 필요!');
    console.error('\n⚠️  빌드가 실패합니다. 환경 변수를 설정한 후 다시 시도하세요.');
    process.exit(1);
  } else {
    console.log('\n✅ 모든 환경 변수가 설정되었습니다!');
    console.log('빌드를 계속합니다...');
  }
} else {
  console.log('로컬 환경: .env 파일을 사용합니다.');
  console.log('빌드를 계속합니다...');
}

