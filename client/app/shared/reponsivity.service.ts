/*****************************************************************************
 * Copyright (C) [2018 - PRESENT] LiquidShare
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of LiquidShare.
 *
 * The intellectual and technical concepts contained herein are proprietary
 *  to LiquidShare and are protected by trade secret or copyright law.
 *
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from LiquidShare.
 *****************************************************************************/
import { Injectable } from '@angular/core';
import { BehaviorSubject ,  fromEvent } from 'rxjs';

export enum Breakpoint {
	xs = 'xs',
	sm = 'sm',
	md = 'md',
	lg = 'lg',
	xl = 'xl'
}

export enum BreakpointRange {
	ltSm = 'lt-sm',
	ltMd = 'lt-md',
	ltLg = 'lt-lg',
	ltXl = 'lt-xl',
	gtXs = 'gt-xs',
	gtSm = 'gt-sm',
	gtMd = 'gt-md',
	gtLg = 'gt-lg',
}

export const BreakpointRangeToBreakpoints: Record<BreakpointRange, Breakpoint[]> = {
	[BreakpointRange.ltSm]: [Breakpoint.xs],
	[BreakpointRange.ltMd]: [Breakpoint.xs, Breakpoint.sm],
	[BreakpointRange.ltLg]: [Breakpoint.xs, Breakpoint.sm, Breakpoint.md],
	[BreakpointRange.ltXl]: [Breakpoint.xs, Breakpoint.sm, Breakpoint.md, Breakpoint.lg],
	[BreakpointRange.gtXs]: [Breakpoint.sm, Breakpoint.md, Breakpoint.lg, Breakpoint.xl],
	[BreakpointRange.gtSm]: [Breakpoint.md, Breakpoint.lg, Breakpoint.xl],
	[BreakpointRange.gtMd]: [Breakpoint.lg, Breakpoint.xl],
	[BreakpointRange.gtLg]: [Breakpoint.xl]
};

export type BreakpointDescriptor = (Breakpoint | BreakpointRange)[] | Breakpoint | BreakpointRange;

const smMin = 576;
const mdMin = 768;
const lgMin = 992;
const xlMin = 1200;

@Injectable()
export class ResponsivityService {
    isLtSm = new BehaviorSubject<boolean>(this.getLtSm());
    isLtMd = new BehaviorSubject<boolean>(this.getLtMd());
    isLtLg = new BehaviorSubject<boolean>(this.getLtLg());
    isLtXl = new BehaviorSubject<boolean>(this.getLtXl());
    isXl = new BehaviorSubject<boolean>(this.getXl());

    activeBreakpoint: Breakpoint;

    constructor(
    ) {
        this.updateBreakpoints();
        fromEvent(window, 'resize').subscribe( evt => {
            this.updateBreakpoints();
        });
    }

    private static handleBreakpoints(currentBreakpointDescriptor: Record<Breakpoint, boolean>, breakpoints: BreakpointDescriptor) {
        if (Object.values(Breakpoint).includes(breakpoints as Breakpoint)) {
            const b = breakpoints as Breakpoint;
            if (!currentBreakpointDescriptor[b]) {
                currentBreakpointDescriptor[b] = true;
            }
        } else {
            BreakpointRangeToBreakpoints[breakpoints as BreakpointRange].forEach(b => {
                if (!currentBreakpointDescriptor[b]) {
                    currentBreakpointDescriptor[b] = true;
                }
            });
        }
    }

    getLtSm() {
        return window.innerWidth < smMin;
    }

    getLtMd() {
        return window.innerWidth < mdMin;
    }

    getLtLg() {
        return window.innerWidth < lgMin;
    }

    getLtXl() {
        return window.innerWidth < xlMin;
    }

    getXl() {
        return window.innerWidth >= xlMin;
    }

    private updateBreakpoints() {
        this.activeBreakpoint = Breakpoint.xl;
        if (this.getLtXl()) {
            this.activeBreakpoint = Breakpoint.lg;
        } else if (this.getLtLg()) {
            this.activeBreakpoint = Breakpoint.md;
        } else if (this.getLtMd()) {
            this.activeBreakpoint = Breakpoint.sm;
        } else if (this.getLtSm()) {
            this.activeBreakpoint = Breakpoint.xs;
        }

        this.isLtSm.next(this.getLtSm());
        this.isLtMd.next(this.getLtMd());
        this.isLtLg.next(this.getLtLg());
        this.isLtXl.next(this.getLtXl());
        this.isXl.next(this.getXl());
    }

}
