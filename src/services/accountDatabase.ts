import { UserProfile, CefrLevel } from '../types';
import { CryptoStorage } from './cryptoStorage';

export const STORAGE_KEY_ACCOUNTS_DB = 'fluentic_registered_accounts_db_v2';

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
  totalPracticeMinutes: number;
  gems: number;
  streakDays: number;
  xp: number;
  activeLanguageCode: string;
  activeLanguageName: string;
  activeLanguageFlag: string;
  activeCefr: CefrLevel;
  profile: UserProfile;
}

export class AccountDatabase {
  /**
   * Retrieves all registered accounts from the persistent store.
   */
  public static getAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS_DB);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list;
    } catch (e) {
      console.warn('Failed to load accounts database:', e);
      return [];
    }
  }

  /**
   * Saves or updates a user profile in the persistent database.
   */
  public static saveAccount(profile: UserProfile): void {
    if (!profile || !profile.email) return;

    try {
      const accounts = this.getAccounts();
      const existingIndex = accounts.findIndex(
        (acc) => acc.id === profile.id || (acc.email.toLowerCase() === profile.email.toLowerCase() && profile.email !== 'explorer@fluentic.local')
      );

      const record: StoredAccount = {
        id: profile.id,
        name: profile.name || 'Gebruiker',
        email: profile.email,
        avatar: profile.avatar || (profile.name || 'TL').slice(0, 2).toUpperCase(),
        createdAt: profile.createdAt || (existingIndex >= 0 ? accounts[existingIndex].createdAt : new Date().toISOString()),
        lastLoginAt: new Date().toISOString(),
        totalPracticeMinutes: profile.totalPracticeMinutes || 0,
        gems: profile.gems || 0,
        streakDays: profile.streakDays || 0,
        xp: profile.xp || 0,
        activeLanguageCode: profile.activeLanguageCode || 'nl',
        activeLanguageName: profile.activeLanguage || 'Nederlands',
        activeLanguageFlag: '🌐',
        activeCefr: profile.activeCefr || 'A1',
        profile: {
          ...profile,
          lastLoginAt: new Date().toISOString(),
        },
      };

      if (existingIndex >= 0) {
        accounts[existingIndex] = record;
      } else {
        accounts.unshift(record);
      }

      localStorage.setItem(STORAGE_KEY_ACCOUNTS_DB, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save account to database:', e);
    }
  }

  /**
   * Removes an account by ID.
   */
  public static removeAccount(id: string): void {
    try {
      const accounts = this.getAccounts().filter((acc) => acc.id !== id);
      localStorage.setItem(STORAGE_KEY_ACCOUNTS_DB, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to remove account:', e);
    }
  }

  /**
   * Generates a pristine, 100% brand new UserProfile with all stats at 0.
   */
  public static createBrandNewProfile(name: string, email: string): UserProfile {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newProfile: UserProfile = {
      id,
      name: trimmedName,
      email: trimmedEmail,
      avatar: (trimmedName || 'TL').slice(0, 2).toUpperCase(),
      isGuest: false,
      isPro: false,
      hasCompletedOnboarding: false, // Clean onboarding to choose native and target languages
      nativeLanguageCode: 'nl',
      targetPace: 'dedicated',
      placementScore: 0,
      xp: 0,
      level: 1,
      gems: 0, // Brand new: 0 gems!
      streakDays: 0, // Brand new: 0 streak!
      totalPracticeMinutes: 0, // Brand new: 0 practice time!
      streakShields: 0,
      streakProtected: false,
      activeLanguageCode: '', // Fresh language choice
      activeCefr: 'A1',
      completedNodeIds: [],
      nodeCrowns: {},
      dailyGoalMinutes: 15,
      dailyGoalCompleted: false,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      unlockedAchievements: [],
      claimedAchievements: [],
      isSignedIn: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      dailyQuests: [],
    };

    // Also persist into the accounts database
    this.saveAccount(newProfile);
    return newProfile;
  }

  /**
   * Export database as JSON string
   */
  public static exportDatabaseJson(): string {
    return JSON.stringify(this.getAccounts(), null, 2);
  }

  /**
   * Clear all accounts from database
   */
  public static clearDatabase(): void {
    localStorage.removeItem(STORAGE_KEY_ACCOUNTS_DB);
  }
}
