interface TimerState {
  endTime: number;
  orderId: string;
}

export const timerStorage = {
  setTimer: (orderId: string, durationInSeconds: number) => {
    const endTime = Date.now() + (durationInSeconds * 1000);
    localStorage.setItem(`payment_timer_${orderId}`, JSON.stringify({
      endTime,
      orderId
    }));
    return endTime;
  },

  getTimer: (orderId: string): TimerState | null => {
    const stored = localStorage.getItem(`payment_timer_${orderId}`);
    if (!stored) return null;

    const timer = JSON.parse(stored) as TimerState;
    return timer;
  },

  clearTimer: (orderId: string) => {
    localStorage.removeItem(`payment_timer_${orderId}`);
  },

  getRemainingTime: (orderId: string): { minutes: number; seconds: number } | null => {
    const timer = timerStorage.getTimer(orderId);
    if (!timer) return null;

    const now = Date.now();
    const remaining = Math.max(0, timer.endTime - now);
    
    if (remaining <= 0) {
      timerStorage.clearTimer(orderId);
      return { minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(remaining / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    };
  }
};
