import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

/**
 * BottomSheet — reusable glass sheet anchored to the bottom of the phone shell.
 * Rendered as a fixed overlay constrained to the phone max-width.
 */
export const BottomSheet = ({ open, onClose, title, children, footer, maxH = "86%" }) => {
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[70] flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        aria-label="Close"
                        onClick={onClose}
                        className="absolute inset-0 bg-[hsl(150_30%_18%/0.32)] backdrop-blur-[2px]"
                    />
                    <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[440px] px-0">
                        <motion.div
                            className="sheet-glass relative overflow-hidden rounded-t-[28px]"
                            style={{ maxHeight: maxH }}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 34 }}
                        >
                            <div className="flex justify-center pt-3">
                                <span className="h-1.5 w-11 rounded-full bg-[hsl(140_18%_70%/0.7)]" />
                            </div>
                            {title && (
                                <div className="px-5 pb-2 pt-3">
                                    <h3 className="font-serif-display text-[20px] text-foreground">{title}</h3>
                                </div>
                            )}
                            <div
                                className="no-scrollbar overflow-y-auto px-5 pb-4"
                                style={{ maxHeight: "calc(86vh - 120px)" }}
                            >
                                {children}
                            </div>
                            {footer && (
                                <div
                                    className="sticky-purchase-bar px-5 pt-3"
                                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
                                >
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
