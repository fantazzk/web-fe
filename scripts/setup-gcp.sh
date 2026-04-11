#!/usr/bin/env bash
# GCP Cloud Run 배포를 위한 초기 설정 스크립트
# 사용법: GCP_PROJECT_ID=<프로젝트ID> GITHUB_REPO=<owner/repo> bash scripts/setup-gcp.sh

set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID 환경변수를 설정하세요}"
: "${GITHUB_REPO:?GITHUB_REPO 환경변수를 설정하세요 (예: fantazzk/web-fe)}"

REGION="asia-northeast3"
SA_NAME="github-deploy"
SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"

echo "=== 1. 필요한 API 활성화 ==="
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project="$GCP_PROJECT_ID"

echo "=== 2. Artifact Registry 저장소 생성 ==="
gcloud artifacts repositories create web-fe \
  --repository-format=docker \
  --location="$REGION" \
  --description="fantazzk frontend images" \
  --project="$GCP_PROJECT_ID" \
  2>/dev/null || echo "  (이미 존재)"

echo "=== 3. 서비스 계정 생성 ==="
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions Deploy" \
  --project="$GCP_PROJECT_ID" \
  2>/dev/null || echo "  (이미 존재)"

echo "=== 4. 서비스 계정에 권한 부여 ==="
for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --quiet
done

echo "=== 5. Workload Identity Federation 설정 ==="
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location="global" \
  --project="$GCP_PROJECT_ID" \
  2>/dev/null || echo "  (이미 존재)"

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'" \
  --project="$GCP_PROJECT_ID" \
  2>/dev/null || echo "  (이미 존재)"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO}" \
  --project="$GCP_PROJECT_ID" \
  --quiet

echo ""
echo "=== 설정 완료 ==="
echo ""
echo "GitHub Secrets에 다음 값을 등록하세요:"
echo ""
echo "  GCP_PROJECT_ID: ${GCP_PROJECT_ID}"
echo ""
PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')
echo "  WIF_PROVIDER: projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
echo ""
echo "  WIF_SERVICE_ACCOUNT: ${SA_EMAIL}"
echo ""
