import { useRef, useEffect } from 'react';

export const useRenderCount = (componentName: string) => {
    const count = useRef(0);

    useEffect(() => {
        count.current++;
        console.log(`[Performance] ${componentName} rendered ${count.current} times`);
    });
};

export class PerformanceMonitor {
    private static marks: Record<string, number> = {};

    static start(label: string) {
        if (__DEV__) {
            this.marks[label] = performance.now();
        }
    }

    static end(label: string) {
        if (__DEV__ && this.marks[label]) {
            const duration = performance.now() - this.marks[label];
            console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
            delete this.marks[label];
        }
    }
}
