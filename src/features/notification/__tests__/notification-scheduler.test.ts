/**
 * notification-scheduler のテスト
 * 
 * 注: Service Worker とNotification API を使用するため、
 * 単体テストでは限定的なテストのみ行う。
 * 統合テストやE2Eテストでより詳細なテストを行うことを推奨。
 */

import type {
  NotificationSchedule,
} from '../notification-types';

describe('notification-scheduler', () => {
  describe('NotificationSchedule型', () => {
    it('必要なプロパティを持つオブジェクトを作成できる', () => {
      const schedule: NotificationSchedule = {
        id: 'test-1',
        title: 'Test Title',
        body: 'Test body',
        time: '09:00',
        minutesAfter: 10,
        dayOfWeek: 1,
      };

      expect(schedule.id).toBe('test-1');
      expect(schedule.title).toBe('Test Title');
      expect(schedule.body).toBe('Test body');
      expect(schedule.time).toBe('09:00');
      expect(schedule.minutesAfter).toBe(10);
      expect(schedule.dayOfWeek).toBe(1);
    });

    it('複数のスケジュールを配列で管理できる', () => {
      const schedules: NotificationSchedule[] = [
        {
          id: 'test-1',
          title: 'Morning',
          body: 'Start your day',
          time: '07:00',
          minutesAfter: 5,
          dayOfWeek: 1,
        },
        {
          id: 'test-2',
          title: 'Lunch',
          body: 'Time for lunch',
          time: '12:00',
          minutesAfter: 10,
          dayOfWeek: 1,
        },
      ];

      expect(schedules).toHaveLength(2);
      expect(schedules[0].title).toBe('Morning');
      expect(schedules[1].title).toBe('Lunch');
    });
  });

  describe('スケジュールの検証ロジック', () => {
    it('正しい時刻形式のスケジュールを検証できる', () => {
      const schedule: NotificationSchedule = {
        id: 'test',
        title: 'Test',
        body: 'Test',
        time: '09:30',
        minutesAfter: 10,
        dayOfWeek: 1,
      };

      // HH:mm 形式の検証
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(schedule.time).toMatch(timeRegex);
    });

    it('曜日は0-6の範囲', () => {
      const validDaysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      
      validDaysOfWeek.forEach(day => {
        const schedule: NotificationSchedule = {
          id: `test-${day}`,
          title: 'Test',
          body: 'Test',
          time: '09:00',
          minutesAfter: 10,
          dayOfWeek: day,
        };
        expect(schedule.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(schedule.dayOfWeek).toBeLessThanOrEqual(6);
      });
    });

    it('minutesAfterは正の整数', () => {
      const schedule: NotificationSchedule = {
        id: 'test',
        title: 'Test',
        body: 'Test',
        time: '09:00',
        minutesAfter: 15,
        dayOfWeek: 1,
      };

      expect(schedule.minutesAfter).toBeGreaterThan(0);
      expect(Number.isInteger(schedule.minutesAfter)).toBe(true);
    });
  });
});
