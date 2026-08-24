import { BottomNavigation } from "./BottomNavigation";

/**
 * MobileShell — the phone viewport. Renders a scrollable content area and an
 * optional floating bottom element (nav or sticky purchase bar).
 */
export const MobileShell = ({ children, nav = true, footer = null, scrollRef }) => {
    return (
        <div className="device-frame">
            <div className="scroll-area" ref={scrollRef}>
                {children}
            </div>
            {footer}
            {nav && <BottomNavigation />}
        </div>
    );
};
