// src/utils/timeWindow.ts - 30-MINUTE VERIFICATION WINDOW LOGIC

export class VerificationTimeWindow {
  /**
   * Check if verification window is open (30 mins before to 15 mins after kickoff)
   */
  static isWindowOpen(kickoffTime: number): boolean {
    const now = Date.now();
    const thirtyMinsBefore = kickoffTime - (30 * 60 * 1000);
    const fifteenMinsAfter = kickoffTime + (15 * 60 * 1000); // Grace period
    
    return now >= thirtyMinsBefore && now <= fifteenMinsAfter;
  }

  /**
   * Get time until window opens
   */
  static getTimeUntilOpen(kickoffTime: number): number {
    const now = Date.now();
    const thirtyMinsBefore = kickoffTime - (30 * 60 * 1000);
    return Math.max(0, thirtyMinsBefore - now);
  }

  /**
   * Get time until window closes
   */
  static getTimeUntilClose(kickoffTime: number): number {
    const now = Date.now();
    const fifteenMinsAfter = kickoffTime + (15 * 60 * 1000);
    return Math.max(0, fifteenMinsAfter - now);
  }

  /**
   * Format time remaining in human-readable format
   */
  static formatTimeRemaining(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  }

  /**
   * Should trigger 30-min notification?
   */
  static shouldTriggerThirtyMinAlert(kickoffTime: number, alreadySent: boolean): boolean {
    if (alreadySent) return false;
    
    const now = Date.now();
    const thirtyMinsBefore = kickoffTime - (30 * 60 * 1000);
    const oneMinBuffer = 60 * 1000; // 1 minute buffer
    
    // Trigger if we're within 1 minute of the 30-min mark
    return now >= thirtyMinsBefore - oneMinBuffer && now <= thirtyMinsBefore + oneMinBuffer;
  }

  /**
   * Should trigger 15-min notification?
   */
  static shouldTriggerFifteenMinAlert(kickoffTime: number, alreadySent: boolean): boolean {
    if (alreadySent) return false;
    
    const now = Date.now();
    const fifteenMinsBefore = kickoffTime - (15 * 60 * 1000);
    const oneMinBuffer = 60 * 1000;
    
    return now >= fifteenMinsBefore - oneMinBuffer && now <= fifteenMinsBefore + oneMinBuffer;
  }

  /**
   * Should trigger game starting notification?
   */
  static shouldTriggerGameStarting(kickoffTime: number, alreadySent: boolean): boolean {
    if (alreadySent) return false;
    
    const now = Date.now();
    const oneMinBuffer = 60 * 1000;
    
    return now >= kickoffTime - oneMinBuffer && now <= kickoffTime + oneMinBuffer;
  }

  /**
   * Get window status message
   */
  static getWindowStatusMessage(kickoffTime: number): {
    status: 'NOT_OPEN' | 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
    message: string;
    color: string;
  } {
    const now = Date.now();
    const thirtyMinsBefore = kickoffTime - (30 * 60 * 1000);
    const fifteenMinsAfter = kickoffTime + (15 * 60 * 1000);

    if (now < thirtyMinsBefore) {
      const timeUntil = this.formatTimeRemaining(thirtyMinsBefore - now);
      return {
        status: 'NOT_OPEN',
        message: `Opens in ${timeUntil}`,
        color: '#9FB3C8',
      };
    }

    if (now >= thirtyMinsBefore && now < kickoffTime) {
      const timeUntil = this.formatTimeRemaining(kickoffTime - now);
      return {
        status: 'OPEN',
        message: `Open - Game starts in ${timeUntil}`,
        color: '#34C759',
      };
    }

    if (now >= kickoffTime && now < fifteenMinsAfter) {
      const timeRemaining = this.formatTimeRemaining(fifteenMinsAfter - now);
      return {
        status: 'CLOSING_SOON',
        message: `Grace period - Closes in ${timeRemaining}`,
        color: '#FF9500',
      };
    }

    return {
      status: 'CLOSED',
      message: 'Check-in closed',
      color: '#FF3B30',
    };
  }
}