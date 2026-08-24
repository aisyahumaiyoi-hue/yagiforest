import { Search, Bell } from "lucide-react";
import { Wordmark } from "./Wordmark";

export const AppHeader = () => {
    return (
        <header className="flex items-center gap-2.5">
            <Wordmark className="pr-1" />

            {/* Search */}
            <label className="glass-control flex items-center gap-2 h-11 flex-1 rounded-[17px] px-3.5 focus-within:shadow-glass-sm">
                <Search className="h-[18px] w-[18px] text-muted-foreground shrink-0" strokeWidth={1.9} />
                <input
                    type="text"
                    aria-label="Search YAGI"
                    placeholder="Search YAGI"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 outline-none min-w-0"
                />
            </label>

            {/* Bell */}
            <button
                aria-label="Notifications"
                className="glass-control focus-ring relative grid h-11 w-11 place-items-center rounded-[16px] shrink-0"
            >
                <Bell className="h-[19px] w-[19px] text-primary" strokeWidth={1.9} />
                <span className="absolute right-[11px] top-[11px] h-[7px] w-[7px] rounded-full bg-[hsl(112_46%_50%)] ring-2 ring-white" />
            </button>

            {/* Avatar */}
            <button
                aria-label="Your profile"
                className="focus-ring h-[38px] w-[38px] shrink-0 overflow-hidden rounded-full border border-white/70 shadow-glass-sm"
            >
                <img
                    alt="Your profile"
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces"
                    className="h-full w-full object-cover"
                />
            </button>
        </header>
    );
};
