'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

type WWavePathProps = React.ComponentProps<'div'>;

export function WavePath({ className, ...props }: WWavePathProps) {
    const path = useRef<SVGPathElement>(null);
    const progressRef = useRef(0);
    const xRef = useRef(0.2);
    const timeRef = useRef(Math.PI / 2);
    const reqIdRef = useRef<number | null>(null);

    function setPath(progress: number) {
        const width = window.innerWidth * 0.7;
        if (path.current) {
            path.current.setAttributeNS(
                null,
                'd',
                `M0 100 Q${width * xRef.current} ${100 + progress * 0.6}, ${width} 100`,
            );
        }
    }

    useEffect(() => {
        setPath(progressRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

    function resetAnimation() {
        timeRef.current = Math.PI / 2;
        progressRef.current = 0;
    }

    function animateOut() {
        const newProgress = progressRef.current * Math.sin(timeRef.current);
        progressRef.current = lerp(progressRef.current, 0, 0.025);
        timeRef.current += 0.2;
        setPath(newProgress);
        if (Math.abs(progressRef.current) > 0.75) {
            reqIdRef.current = requestAnimationFrame(animateOut);
        } else {
            resetAnimation();
        }
    }

    const manageMouseEnter = () => {
        if (reqIdRef.current) {
            cancelAnimationFrame(reqIdRef.current);
            resetAnimation();
        }
    };

    const manageMouseMove = (e: React.MouseEvent) => {
        const { movementY, clientX } = e;
        if (path.current) {
            const pathBound = path.current.getBoundingClientRect();
            xRef.current = (clientX - pathBound.left) / pathBound.width;
            progressRef.current += movementY;
            setPath(progressRef.current);
        }
    };

    const manageMouseLeave = () => {
        animateOut();
    };

    return (
        <div className={cn('relative h-px w-[70vw]', className)} {...props}>
            <div
                onMouseEnter={manageMouseEnter}
                onMouseMove={manageMouseMove}
                onMouseLeave={manageMouseLeave}
                className="relative -top-5 z-10 h-10 w-full hover:-top-[150px] hover:h-[300px]"
            />
            <svg className="absolute -top-[100px] h-[300px] w-full">
                <path ref={path} className="fill-none stroke-current" strokeWidth={2} />
            </svg>
        </div>
    );
}
