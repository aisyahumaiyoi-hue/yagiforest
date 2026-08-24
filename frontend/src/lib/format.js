/* Currency + small formatting helpers */
export const formatIDR = (value) =>
    "Rp" + Math.round(value).toLocaleString("id-ID");
