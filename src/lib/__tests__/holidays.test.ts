import { isHoliday } from '../holidays';

describe('holidays', () => {
  describe('isHoliday', () => {
    it('元日（1月1日）を祝日として認識', () => {
      const date = new Date('2024-01-01');
      expect(isHoliday(date)).toBe(true);
    });

    it('建国記念の日（2月11日）を祝日として認識', () => {
      const date = new Date('2024-02-11');
      expect(isHoliday(date)).toBe(true);
    });

    it('天皇誕生日（2月23日）を祝日として認識', () => {
      const date = new Date('2024-02-23');
      expect(isHoliday(date)).toBe(true);
    });

    it('昭和の日（4月29日）を祝日として認識', () => {
      const date = new Date('2024-04-29');
      expect(isHoliday(date)).toBe(true);
    });

    it('憲法記念日（5月3日）を祝日として認識', () => {
      const date = new Date('2024-05-03');
      expect(isHoliday(date)).toBe(true);
    });

    it('みどりの日（5月4日）を祝日として認識', () => {
      const date = new Date('2024-05-04');
      expect(isHoliday(date)).toBe(true);
    });

    it('こどもの日（5月5日）を祝日として認識', () => {
      const date = new Date('2024-05-05');
      expect(isHoliday(date)).toBe(true);
    });

    it('山の日（8月11日）を祝日として認識', () => {
      const date = new Date('2024-08-11');
      expect(isHoliday(date)).toBe(true);
    });

    it('文化の日（11月3日）を祝日として認識', () => {
      const date = new Date('2024-11-03');
      expect(isHoliday(date)).toBe(true);
    });

    it('勤労感謝の日（11月23日）を祝日として認識', () => {
      const date = new Date('2024-11-23');
      expect(isHoliday(date)).toBe(true);
    });

    it('通常の平日を祝日として認識しない', () => {
      const date = new Date('2024-01-10'); // 水曜日
      expect(isHoliday(date)).toBe(false);
    });

    it('通常の土曜日を祝日として認識しない', () => {
      const date = new Date('2024-01-06'); // 土曜日
      expect(isHoliday(date)).toBe(false);
    });

    it('通常の日曜日を祝日として認識しない', () => {
      const date = new Date('2024-01-07'); // 日曜日
      expect(isHoliday(date)).toBe(false);
    });
  });
});
