import jwtDecode from "jwt-decode";

export function checkTokenExpiration(token) {
    if (!token) return null;
    const decoded = jwtDecode(token);
    const {exp} = decoded; // type: seconds
    const now = new Date().getTime(); // type: milliseconds
    const expMilliseconds = exp * 1000; // seconds => milliseconds
    return expMilliseconds - now <= 86400; // <= 1 day return true
}
