import { createAvatarIllustration } from '@/assets/fashion-illustrations';
import { CREDIT_RULES } from '@/config/brand.config';
import { delay, mockDb } from '@/mocks/mock-db';
import { ApiError, httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { AiJob, AvatarProfile } from '@/types';

export const avatarService = {
  async getAvatar(): Promise<AvatarProfile | null> {
    if (!USE_MOCK_API) {
      return httpRequest<AvatarProfile>('/api/avatar');
    }
    await delay(180);
    return mockDb.avatar ? { ...mockDb.avatar, versions: [...mockDb.avatar.versions] } : null;
  },

  async uploadReferences(payload: {
    faceReferenceUrl?: string;
    bodyReferenceUrl?: string;
  }): Promise<AvatarProfile> {
    if (!USE_MOCK_API) {
      return httpRequest<AvatarProfile>('/api/avatar/upload-references', {
        method: 'POST',
        body: payload,
      });
    }
    await delay(300);
    const current: AvatarProfile = mockDb.avatar ?? {
      id: `avt_${Date.now()}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      status: 'NOT_STARTED',
      versions: [],
    };
    const nextFace = payload.faceReferenceUrl ?? current.faceReferenceUrl;
    const nextBody = payload.bodyReferenceUrl ?? current.bodyReferenceUrl;
    const updated: AvatarProfile = {
      ...current,
      faceReferenceUrl: nextFace,
      bodyReferenceUrl: nextBody,
      status: current.avatarImageUrl ? current.status : nextFace || nextBody ? 'UPLOADED' : 'NOT_STARTED',
      updatedAt: new Date().toISOString(),
    };
    mockDb.avatar = updated;
    return { ...updated };
  },

  async generateAvatar(options?: { simulateFailure?: boolean }): Promise<{
    job: AiJob;
    avatar: AvatarProfile;
  }> {
    if (!USE_MOCK_API) {
      return httpRequest<{ job: AiJob; avatar: AvatarProfile }>('/api/avatar/generate', {
        method: 'POST',
      });
    }

    if (mockDb.subscription.creditsRemaining < CREDIT_RULES.avatarGenerationCost) {
      throw new ApiError({
        status: 422,
        code: 'INSUFFICIENT_CREDITS',
        message: `You need ${CREDIT_RULES.avatarGenerationCost} AI credits to generate an avatar.`,
      });
    }

    await delay(900);

    if (options?.simulateFailure) {
      throw new ApiError({
        status: 500,
        code: 'AVATAR_GENERATION_FAILED',
        message: 'Simulated demo failure while synthesizing avatar proportions. Please retry.',
      });
    }

    const versionCount = (mockDb.avatar?.versions.length ?? 0) + 1;
    const palettes = [
      { topColor: '#EAE4DC', bottomColor: '#344154', footwearColor: '#FAF8F5' },
      { topColor: '#D9CFC1', bottomColor: '#3B3936', footwearColor: '#EDE8DF' },
      { topColor: '#E8DFD3', bottomColor: '#4A5748', footwearColor: '#FAF8F5' },
    ];
    const palette = palettes[(versionCount - 1) % palettes.length];
    const generatedUrl = createAvatarIllustration({
      ...palette,
      label: `Studio Avatar v${versionCount} (Demo)`,
    });

    const newVersion = {
      id: `avt_ver_${Date.now()}`,
      imageUrl: generatedUrl,
      createdAt: new Date().toISOString(),
      label: `Studio v${versionCount} (Demo)`,
    };

    const current = mockDb.avatar ?? {
      id: `avt_${Date.now()}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      status: 'READY' as const,
      versions: [],
    };

    const updatedAvatar: AvatarProfile = {
      ...current,
      avatarImageUrl: generatedUrl,
      status: 'READY',
      activeVersionId: newVersion.id,
      versions: [newVersion, ...current.versions],
      createdAt: current.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.avatar = updatedAvatar;

    mockDb.subscription.creditsRemaining -= CREDIT_RULES.avatarGenerationCost;
    mockDb.creditHistory.unshift({
      id: `crd_${Date.now()}`,
      action: 'Avatar studio generation (Demo)',
      creditsDelta: -CREDIT_RULES.avatarGenerationCost,
      balanceAfter: mockDb.subscription.creditsRemaining,
      createdAt: new Date().toISOString(),
      referenceLabel: newVersion.label,
    });

    const job: AiJob = {
      id: `job_avt_${Date.now()}`,
      type: 'AVATAR',
      status: 'COMPLETED',
      progressMessage: 'Demo avatar rendered',
      resultUrl: generatedUrl,
      createdAt: new Date().toISOString(),
    };

    return { job, avatar: { ...updatedAvatar, versions: [...updatedAvatar.versions] } };
  },

  async setActiveVersion(versionId: string): Promise<AvatarProfile> {
    if (!USE_MOCK_API) {
      return httpRequest<AvatarProfile>('/api/avatar/active-version', {
        method: 'PATCH',
        body: { versionId },
      });
    }
    await delay(180);
    if (!mockDb.avatar) throw new Error('Avatar not found');
    const found = mockDb.avatar.versions.find((v) => v.id === versionId);
    if (!found) throw new Error('Version not found');
    mockDb.avatar = {
      ...mockDb.avatar,
      activeVersionId: found.id,
      avatarImageUrl: found.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockDb.avatar };
  },

  async deleteAvatar(scope: 'avatar_only' | 'avatar_and_sources' = 'avatar_and_sources'): Promise<AvatarProfile> {
    if (!USE_MOCK_API) {
      return httpRequest<AvatarProfile>(`/api/avatar?scope=${scope}`, { method: 'DELETE' });
    }
    await delay(280);
    const base: AvatarProfile = {
      id: mockDb.avatar?.id ?? `avt_${Date.now()}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      faceReferenceUrl: scope === 'avatar_only' ? mockDb.avatar?.faceReferenceUrl : undefined,
      bodyReferenceUrl: scope === 'avatar_only' ? mockDb.avatar?.bodyReferenceUrl : undefined,
      avatarImageUrl: undefined,
      status:
        scope === 'avatar_only' && (mockDb.avatar?.faceReferenceUrl || mockDb.avatar?.bodyReferenceUrl)
          ? 'UPLOADED'
          : 'NOT_STARTED',
      versions: [],
      activeVersionId: undefined,
      updatedAt: new Date().toISOString(),
    };
    mockDb.avatar = base;
    return { ...base };
  },
};
