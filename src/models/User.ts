import { User, UserProfile, UserPreferences, StreamingSubscription } from 'flixsync-shared-library';

export class UserModel implements User {
  public id: string;
  public email: string;
  public username: string;
  public passwordHash: string;
  public profile: UserProfile;
  public preferences: UserPreferences;
  public streamingSubscriptions: StreamingSubscription[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: any) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.username = data.username || '';
    this.passwordHash = data.passwordHash || '';

    const defaultProfile: UserProfile = {
      favoriteGenres: [],
    };
    this.profile = data.profile ? { ...defaultProfile, ...data.profile } : defaultProfile;

    const defaultPreferences: UserPreferences = {
      language: 'en',
      region: 'US',
      adultContent: false,
      notifications: {
        newRecommendations: true,
        groupInvites: true,
        movieUpdates: true,
        email: true,
        push: false,
      },
      privacy: {
        profileVisibility: 'public',
        ratingsVisibility: 'public',
        allowGroupInvites: true,
      },
    };
    this.preferences = data.preferences ? {
      ...defaultPreferences,
      ...data.preferences,
      notifications: { ...defaultPreferences.notifications, ...data.preferences.notifications },
      privacy: { ...defaultPreferences.privacy, ...data.preferences.privacy }
    } : defaultPreferences;

    this.streamingSubscriptions = data.streamingSubscriptions || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public toJSON(): User {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      passwordHash: this.passwordHash,
      profile: this.profile,
      preferences: this.preferences,
      streamingSubscriptions: this.streamingSubscriptions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public toPublicJSON(): Omit<User, 'passwordHash'> {
    const { passwordHash, ...publicUser } = this.toJSON();
    return publicUser;
  }
}