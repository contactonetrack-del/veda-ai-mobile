import { PerformanceMonitor } from '../utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Mock performance.now
        global.performance.now = jest.fn(() => 1000);
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        jest.clearAllMocks();
    });

    it('should log duration when end is called', () => {
        // Set dev mode to true (it's true in test env usually)
        (global as any).__DEV__ = true;

        PerformanceMonitor.start('test-op');

        // Mock next call to performance.now to simulate 50ms passage
        (global.performance.now as jest.Mock).mockReturnValueOnce(1050);

        PerformanceMonitor.end('test-op');

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Performance] test-op: 50.00ms'));
    });

    it('should NOT log anything if __DEV__ is false', () => {
        (global as any).__DEV__ = false;

        PerformanceMonitor.start('test-op');
        PerformanceMonitor.end('test-op');

        expect(consoleSpy).not.toHaveBeenCalled();
    });
});
