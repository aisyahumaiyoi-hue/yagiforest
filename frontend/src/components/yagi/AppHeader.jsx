import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { useYagi } from "@/store/YagiContext";

/**
 * Home header.
 *
 * The previous version carried a non-functional search field, a notification
 * bell with a fake unread dot, and a hardcoded stock-photo avatar that was
 * presented as "your profile". All three are gone: search now goes to the real
 * Shop search, the cart goes to the real cart, and there is no fake avatar.
 */
export const AppHeader = () => {
    const navigate = useNavigate();
    const { cartCount } = useYagi();

    return (
        <header className="flex items-center gap-2.5">
            <Wordmark className="pr-1" />

            <button
                onClick={() => navigate("/shop")}
                className="glass-control focus-ring flex h-11 flex-1 items-center gap-2 rounded-[17px] px-3.5 text-left"
            >
                <span className="text-sm text-muted-foreground/80">Search YAGI</span>
            </button>

            <button
                aria-label="Your bag"
                onClick={() => navigate("/cart")}
                className="glass-control focus-ring relative grid h-11 w-11 shrink-0 place-items-center rounded-[16px]"
            >
                <ShoppingBag className="h-[19px] w-[19px] text-primary" strokeWidth={1.9} />
                {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[hsl(142_36%_38%)] px-1 text-[10px] font-bold text-white">
                        {cartCount}
                    </span>
                )}
            </button>
        </header>
    );
};
